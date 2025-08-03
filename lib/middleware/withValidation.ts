/**
 * Next.js API Validation Middleware
 * 
 * Provides request body validation using Zod schemas with structured error responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createValidationError, ValidationErrorCodes } from '../errors/validationError';

export interface ValidationErrorResponse {
  success: false;
  error: {
    type: 'validation_error';
    message: string;
    details: Array<{
      code: string;
      field?: string;
      message: string;
      value?: any;
    }>;
  };
}

export interface ValidationSuccessResponse<T = any> {
  success: true;
  data: T;
}

export type APIResponse<T = any> = ValidationSuccessResponse<T> | ValidationErrorResponse;

/**
 * API route handler with validation
 */
export type ValidatedHandler<T = any> = (
  request: NextRequest,
  validatedData: T,
  context?: { params?: any }
) => Promise<NextResponse>;

/**
 * Validation middleware wrapper for Next.js API routes
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: ValidatedHandler<T>
) {
  return async (request: NextRequest, context?: { params?: any }): Promise<NextResponse> => {
    try {
      // Parse request body
      let body: any;
      
      try {
        const contentType = request.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          body = await request.json();
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          body = Object.fromEntries(formData.entries());
        } else {
          // Try to parse as JSON by default
          body = await request.json();
        }
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: {
            type: 'validation_error',
            message: 'Invalid request body format',
            details: [{
              code: ValidationErrorCodes.INVALID_FORMAT,
              message: 'Request body must be valid JSON',
              value: undefined
            }]
          }
        } as ValidationErrorResponse, { status: 400 });
      }

      // Validate against schema
      const validation = schema.safeParse(body);
      
      if (!validation.success) {
        const validationErrors = validation.error.errors.map(error => {
          const field = error.path.join('.');
          let code: string = ValidationErrorCodes.SCHEMA_VALIDATION_FAILED;
          
          // Map Zod error types to our error codes
          switch (error.code) {
            case 'invalid_type':
              code = ValidationErrorCodes.INVALID_TYPE;
              break;
            case 'too_small':
            case 'too_big':
              code = ValidationErrorCodes.OUT_OF_RANGE;
              break;
            case 'invalid_string':
              code = ValidationErrorCodes.INVALID_FORMAT;
              break;
            case 'custom':
              code = ValidationErrorCodes.BUSINESS_RULE_VIOLATION;
              break;
            default:
              code = ValidationErrorCodes.SCHEMA_VALIDATION_FAILED;
          }
          
          return {
            code,
            field: field || undefined,
            message: error.message,
            value: error.code === 'invalid_type' ? undefined : (body as any)?.[field]
          };
        });

        return NextResponse.json({
          success: false,
          error: {
            type: 'validation_error',
            message: `Validation failed with ${validationErrors.length} error${validationErrors.length !== 1 ? 's' : ''}`,
            details: validationErrors
          }
        } as ValidationErrorResponse, { status: 400 });
      }

      // Call the handler with validated data
      return await handler(request, validation.data, context);
      
    } catch (error) {
      console.error('Validation middleware error:', error);
      
      return NextResponse.json({
        success: false,
        error: {
          type: 'validation_error',
          message: 'Internal validation error',
          details: [{
            code: ValidationErrorCodes.SYSTEM_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          }]
        }
      } as ValidationErrorResponse, { status: 500 });
    }
  };
}

/**
 * Response helper for successful API responses
 */
export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data
  } as ValidationSuccessResponse<T>, { status });
}

/**
 * Response helper for validation error responses
 */
export function createValidationErrorResponse(
  message: string,
  details: Array<{
    code: string;
    field?: string;
    message: string;
    value?: any;
  }>,
  status = 400
): NextResponse {
  return NextResponse.json({
    success: false,
    error: {
      type: 'validation_error',
      message,
      details
    }
  } as ValidationErrorResponse, { status });
}

/**
 * Query parameter validation helper
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: any[] } {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    const validation = schema.safeParse(params);
    
    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.errors
      };
    }
    
    return {
      success: true,
      data: validation.data
    };
  } catch (error) {
    return {
      success: false,
      errors: [{ message: 'Failed to parse query parameters' }]
    };
  }
}

export default withValidation;
