import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError, ZodSchema } from 'zod';

// Interface for validation error details
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  received?: unknown;
}

// Type for handler function that takes validated data
export type ValidatedHandler<T> = (
  request: NextRequest,
  params: { params?: Record<string, string> },
  validatedData: T
) => Promise<Response>;

// Type for GET handlers (no body validation)
export type GetHandler = (
  request: NextRequest,
  params: { params?: Record<string, string> }
) => Promise<Response>;

// Options for validation middleware
export interface ValidationOptions {
  // Whether to include the raw ZodError in the response (dev mode)
  includeRawError?: boolean;
  // Custom error transformer
  transformError?: (error: ZodError) => ValidationError[];
  // Skip validation for certain methods
  skipMethods?: string[];
}

/**
 * Transforms ZodError into structured validation errors
 */
function transformZodError(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
    code: err.code,
    received: 'received' in err ? err.received : undefined
  }));
}

/**
 * Higher-order function that wraps Next.js API route handlers with validation
 * 
 * @param schema - Zod schema to validate request body against
 * @param handler - The API route handler function
 * @param options - Validation options
 * @returns Wrapped handler function
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: ValidatedHandler<T>,
  options: ValidationOptions = {}
) {
  return async (
    request: NextRequest,
    params: { params?: Record<string, string> } = {}
  ): Promise<Response> => {
    const {
      includeRawError = process.env.NODE_ENV === 'development',
      transformError = transformZodError,
      skipMethods = ['GET', 'HEAD', 'OPTIONS']
    } = options;

    // Skip validation for certain HTTP methods
    if (skipMethods.includes(request.method)) {
      // For GET requests, pass through without validation
      if (request.method === 'GET') {
        return (handler as unknown as GetHandler)(request, params);
      }
      return NextResponse.json(
        { error: `Method ${request.method} not allowed` },
        { status: 405 }
      );
    }

    try {
      // Parse request body
      let body: unknown;
      const contentType = request.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        try {
          body = await request.json();
        } catch (parseError) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid JSON in request body',
              validationErrors: [{
                field: 'body',
                message: 'Request body must be valid JSON',
                code: 'invalid_json'
              }]
            },
            { status: 400 }
          );
        }
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        body = Object.fromEntries(formData.entries());
      } else {
        body = {};
      }

      // Validate the parsed body against the schema
      const validatedData = schema.parse(body);

      // Call the original handler with validated data
      return await handler(request, params, validatedData);

    } catch (error) {
      // Handle validation errors
      if (error instanceof ZodError) {
        const validationErrors = transformError(error);
        
        const response: any = {
          success: false,
          error: 'Validation failed',
          validationErrors
        };

        // Include raw error in development
        if (includeRawError) {
          response.rawError = error.errors;
        }

        return NextResponse.json(response, { status: 400 });
      }

      // Handle other errors
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          validationErrors: [{
            field: 'server',
            message: 'An unexpected error occurred during validation',
            code: 'internal_error'
          }]
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Wrapper for GET routes that don't need body validation
 */
export function withGetValidation(
  handler: GetHandler,
  options: Omit<ValidationOptions, 'skipMethods'> = {}
) {
  return async (
    request: NextRequest,
    params: { params?: Record<string, string> } = {}
  ): Promise<Response> => {
    try {
      return await handler(request, params);
    } catch (error) {
      console.error('GET handler error:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal server error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Utility to create a schema for query parameters validation
 */
export function createQuerySchema<T extends Record<string, ZodSchema>>(schemas: T) {
  return z.object(schemas);
}

/**
 * Validates query parameters from URL search params
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  try {
    const { searchParams } = new URL(request.url);
    const queryObject: Record<string, string | string[]> = {};
    
    // Convert URLSearchParams to plain object
    searchParams.forEach((value, key) => {
      if (queryObject[key]) {
        // Handle multiple values for same key
        if (Array.isArray(queryObject[key])) {
          (queryObject[key] as string[]).push(value);
        } else {
          queryObject[key] = [queryObject[key] as string, value];
        }
      } else {
        queryObject[key] = value;
      }
    });

    const validatedData = schema.parse(queryObject);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, errors: transformZodError(error) };
    }
    throw error;
  }
}
