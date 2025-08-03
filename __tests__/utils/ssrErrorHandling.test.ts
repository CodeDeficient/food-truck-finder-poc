import {
  handleSSRError,
  withSSRErrorHandling,
  createSSRError,
  handleTruckFetch,
  handleAdminOperation,
  SSRErrorType,
  SSRError
} from '@/lib/utils/ssrErrorHandling';

// Mock Next.js navigation functions
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  redirect: jest.fn()
}));

// Mock logging utility
jest.mock('@/lib/logging', () => ({
  logError: jest.fn()
}));

import { notFound, redirect } from 'next/navigation';
import { logError } from '@/lib/logging';

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;

describe('SSRError', () => {
  it('should create SSR error with all properties', () => {
    const originalError = new Error('Original error');
    const ssrError = new SSRError(
      SSRErrorType.NOT_FOUND,
      404,
      'Truck not found',
      originalError
    );

    expect(ssrError.type).toBe(SSRErrorType.NOT_FOUND);
    expect(ssrError.statusCode).toBe(404);
    expect(ssrError.message).toBe('Truck not found');
    expect(ssrError.originalError).toBe(originalError);
    expect(ssrError.name).toBe('SSRError');
  });
});

describe('createSSRError', () => {
  it('should create SSR error with default status code', () => {
    const error = createSSRError(SSRErrorType.NOT_FOUND, 'Not found');
    
    expect(error.type).toBe(SSRErrorType.NOT_FOUND);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not found');
  });

  it('should create SSR error with custom status code', () => {
    const error = createSSRError(
      SSRErrorType.SERVER_ERROR,
      'Custom server error',
      503
    );
    
    expect(error.type).toBe(SSRErrorType.SERVER_ERROR);
    expect(error.statusCode).toBe(503);
    expect(error.message).toBe('Custom server error');
  });

  it('should include original error', () => {
    const originalError = new Error('Database connection failed');
    const error = createSSRError(
      SSRErrorType.SERVER_ERROR,
      'Server error',
      500,
      originalError
    );
    
    expect(error.originalError).toBe(originalError);
  });
});

describe('handleSSRError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock functions to throw to simulate Next.js behavior
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  describe('error type detection', () => {
    it('should detect NOT_FOUND from SSRError', () => {
      const error = createSSRError(SSRErrorType.NOT_FOUND, 'Not found');
      
      expect(() => handleSSRError(error)).toThrow('NEXT_NOT_FOUND');
      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should detect NOT_FOUND from HTTP status', () => {
      const error = { status: 404, message: 'Not found' };
      
      expect(() => handleSSRError(error)).toThrow('NEXT_NOT_FOUND');
      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should detect NOT_FOUND from error message', () => {
      const error = new Error('Resource not found');
      
      expect(() => handleSSRError(error)).toThrow('NEXT_NOT_FOUND');
      expect(mockNotFound).toHaveBeenCalled();
    });

    it('should detect UNAUTHORIZED from status code', () => {
      const error = { status: 401, message: 'Unauthorized' };
      
      expect(() => handleSSRError(error)).toThrow('NEXT_REDIRECT: /login?error=unauthorized');
      expect(mockRedirect).toHaveBeenCalledWith('/login?error=unauthorized');
    });

    it('should detect FORBIDDEN from status code', () => {
      const error = { status: 403, message: 'Forbidden' };
      
      expect(() => handleSSRError(error)).toThrow('NEXT_REDIRECT: /access-denied');
      expect(mockRedirect).toHaveBeenCalledWith('/access-denied');
    });

    it('should detect SERVER_ERROR from 500 status', () => {
      const error = { status: 500, message: 'Internal server error' };
      
      expect(() => handleSSRError(error)).toThrow('NEXT_REDIRECT: /error?type=server&message=Internal%20server%20error');
      expect(mockRedirect).toHaveBeenCalledWith('/error?type=server&message=Internal%20server%20error');
    });

    it('should detect VALIDATION_ERROR from 400 status', () => {
      const error = { status: 400, message: 'Bad request' };
      
      expect(() => handleSSRError(error)).toThrow('NEXT_REDIRECT: /error?type=validation&message=Bad%20request');
      expect(mockRedirect).toHaveBeenCalledWith('/error?type=validation&message=Bad%20request');
    });

    it('should detect TIMEOUT from error message', () => {
      const error = new Error('Request timed out');
      
      expect(() => handleSSRError(error)).toThrow('NEXT_REDIRECT: /error?type=network&message=Service%20temporarily%20unavailable');
      expect(mockRedirect).toHaveBeenCalledWith('/error?type=network&message=Service%20temporarily%20unavailable');
    });

    it('should default to SERVER_ERROR for unknown errors', () => {
      const error = new Error('Unknown error');
      
      expect(() => handleSSRError(error)).toThrow('NEXT_REDIRECT: /error?type=server&message=Internal%20server%20error');
      expect(mockRedirect).toHaveBeenCalledWith('/error?type=server&message=Internal%20server%20error');
    });
  });

  describe('configuration options', () => {
    it('should log error by default', () => {
      const error = new Error('Test error');
      
      try {
        handleSSRError(error);
      } catch {
        // Expected to throw
      }
      
      expect(mockLogError).toHaveBeenCalledWith(
        error,
        'Test error',
        expect.objectContaining({
          tags: expect.objectContaining({
            errorType: SSRErrorType.SERVER_ERROR,
            component: 'SSR'
          })
        })
      );
    });

    it('should not log error when disabled', () => {
      const error = new Error('Test error');
      
      try {
        handleSSRError(error, { logError: false });
      } catch {
        // Expected to throw
      }
      
      expect(mockLogError).not toHaveBeenCalled();
    });

    it('should use custom error message for logging', () => {
      const error = new Error('Original error');
      
      try {
        handleSSRError(error, { customMessage: 'Custom error message' });
      } catch {
        // Expected to throw
      }
      
      expect(mockLogError).toHaveBeenCalledWith(
        error,
        'Custom error message',
        expect.any(Object)
      );
    });

    it('should include custom error context', () => {
      const error = new Error('Test error');
      const errorContext = {
        tags: { customTag: 'customValue' },
        extra: { customData: 'data' }
      };
      
      try {
        handleSSRError(error, { errorContext });
      } catch {
        // Expected to throw
      }
      
      expect(mockLogError).toHaveBeenCalledWith(
        error,
        'Test error',
        expect.objectContaining({
          tags: expect.objectContaining({
            customTag: 'customValue',
            errorType: SSRErrorType.SERVER_ERROR,
            component: 'SSR'
          }),
          extra: expect.objectContaining({
            customData: 'data'
          })
        })
      );
    });

    it('should use fallback error page when configured', () => {
      const error = createSSRError(SSRErrorType.NOT_FOUND, 'Not found');
      
      expect(() => handleSSRError(error, { useFallback: true })).toThrow('NEXT_REDIRECT: /error?type=not_found');
      expect(mockRedirect).toHaveBeenCalledWith('/error?type=not_found');
      expect(mockNotFound).not.toHaveBeenCalled();
    });
  });
});

describe('withSSRErrorHandling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  it('should return result for successful operations', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await withSSRErrorHandling(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Operation failed');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withSSRErrorHandling(operation)).rejects.toThrow('NEXT_REDIRECT');
    expect(operation).toHaveBeenCalled();
  });

  it('should pass configuration to error handler', async () => {
    const error = new Error('Operation failed');
    const operation = jest.fn().mockRejectedValue(error);
    const config = {
      errorContext: { tags: { operation: 'test' } }
    };
    
    try {
      await withSSRErrorHandling(operation, config);
    } catch {
      // Expected to throw
    }
    
    expect(mockLogError).toHaveBeenCalledWith(
      error,
      'Operation failed',
      expect.objectContaining({
        tags: expect.objectContaining({
          operation: 'test'
        })
      })
    );
  });
});

describe('handleTruckFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
  });

  it('should return truck data for successful fetch', async () => {
    const truckData = { id: '1', name: 'Test Truck' };
    const fetcher = jest.fn().mockResolvedValue(truckData);
    
    const result = await handleTruckFetch('1', fetcher);
    
    expect(result).toEqual(truckData);
    expect(fetcher).toHaveBeenCalledWith('1');
  });

  it('should handle null truck data as not found', async () => {
    const fetcher = jest.fn().mockResolvedValue(null);
    
    await expect(handleTruckFetch('1', fetcher)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('should handle undefined truck data as not found', async () => {
    const fetcher = jest.fn().mockResolvedValue(undefined);
    
    await expect(handleTruckFetch('1', fetcher)).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('should handle fetcher errors', async () => {
    const error = new Error('Database error');
    const fetcher = jest.fn().mockRejectedValue(error);
    
    await expect(handleTruckFetch('1', fetcher)).rejects.toThrow('NEXT_REDIRECT');
    expect(fetcher).toHaveBeenCalledWith('1');
  });

  it('should include truck ID in error context', async () => {
    const fetcher = jest.fn().mockResolvedValue(null);
    
    try {
      await handleTruckFetch('test-truck-id', fetcher);
    } catch {
      // Expected to throw
    }
    
    expect(mockLogError).toHaveBeenCalledWith(
      expect.any(SSRError),
      expect.stringContaining('test-truck-id'),
      expect.objectContaining({
        tags: expect.objectContaining({
          operation: 'handleTruckFetch',
          truckId: 'test-truck-id'
        })
      })
    );
  });
});

describe('handleAdminOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  it('should return operation result for successful operations', async () => {
    const operationResult = { data: 'admin data' };
    const operation = jest.fn().mockResolvedValue(operationResult);
    
    const result = await handleAdminOperation(operation, 'getAdminData');
    
    expect(result).toEqual(operationResult);
    expect(operation).toHaveBeenCalled();
  });

  it('should handle operation errors', async () => {
    const error = new Error('Admin operation failed');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(handleAdminOperation(operation, 'getAdminData')).rejects.toThrow('NEXT_REDIRECT');
    expect(operation).toHaveBeenCalled();
  });

  it('should include operation name in error context', async () => {
    const error = new Error('Admin error');
    const operation = jest.fn().mockRejectedValue(error);
    
    try {
      await handleAdminOperation(operation, 'testOperation');
    } catch {
      // Expected to throw
    }
    
    expect(mockLogError).toHaveBeenCalledWith(
      error,
      'Admin error',
      expect.objectContaining({
        tags: expect.objectContaining({
          operation: 'handleAdminOperation',
          operationName: 'testOperation',
          context: 'admin'
        })
      })
    );
  });
});
