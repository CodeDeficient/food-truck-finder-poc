import { withRetry, withHttpRetry, HttpError, createRetryFetch } from '@/lib/utils/withRetry';

// Mock setTimeout for faster tests
jest.useFakeTimers();

describe('withRetry', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('successful operations', () => {
    it('should return success result for operations that succeed immediately', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should return success result with timing information', async () => {
      const operation = jest.fn().mockResolvedValue('data');
      
      const result = await withRetry(operation);
      
      expect(result.success).toBe(true);
      expect(result.totalTimeMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.totalTimeMs).toBe('number');
    });
  });

  describe('retry behavior', () => {
    it('should retry on network errors', async () => {
      let attempt = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 3) {
          throw new TypeError('fetch failed');
        }
        return Promise.resolve('success');
      });

      const promise = withRetry(operation, { maxAttempts: 5 });
      
      // Fast forward timers to complete retries
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should retry on HTTP 500 errors', async () => {
      let attempt = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 2) {
          const error = new Error('Server error') as any;
          error.status = 500;
          throw error;
        }
        return Promise.resolve('success');
      });

      const promise = withRetry(operation, { maxAttempts: 3 });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should retry on rate limit errors (429)', async () => {
      let attempt = 0;
      const operation = jest.fn().mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          const error = new Error('Rate limited') as any;
          error.status = 429;
          throw error;
        }
        return Promise.resolve('success');
      });

      const promise = withRetry(operation, { maxAttempts: 3 });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });

    it('should not retry on client errors (400)', async () => {
      const operation = jest.fn().mockImplementation(() => {
        const error = new Error('Bad request') as any;
        error.status = 400;
        throw error;
      });

      const promise = withRetry(operation, { maxAttempts: 3 });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry configuration', () => {
    it('should respect maxAttempts configuration', async () => {
      const operation = jest.fn().mockRejectedValue(new TypeError('network error'));

      const promise = withRetry(operation, { maxAttempts: 2 });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(2);
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should use custom shouldRetry function', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('custom error'));
      const shouldRetry = jest.fn().mockReturnValue(true);

      const promise = withRetry(operation, { 
        maxAttempts: 3,
        shouldRetry 
      });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(shouldRetry).toHaveBeenCalledTimes(2); // Called for attempts 1 and 2
    });

    it('should call onRetry callback', async () => {
      const operation = jest.fn().mockRejectedValue(new TypeError('network error'));
      const onRetry = jest.fn();

      const promise = withRetry(operation, { 
        maxAttempts: 3,
        onRetry 
      });
      jest.runAllTimers();
      
      await promise;
      
      expect(onRetry).toHaveBeenCalledTimes(2); // Called before retries 2 and 3
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(TypeError),
        expect.any(Number),
        expect.any(Number)
      );
    });
  });

  describe('exponential backoff', () => {
    it('should use exponential backoff delays', async () => {
      const operation = jest.fn().mockRejectedValue(new TypeError('network error'));
      const onRetry = jest.fn();

      const promise = withRetry(operation, { 
        maxAttempts: 3,
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        useJitter: false,
        onRetry 
      });
      
      jest.runAllTimers();
      await promise;
      
      // First retry should have 1000ms delay, second should have 2000ms
      expect(onRetry).toHaveBeenNthCalledWith(1, expect.any(Error), 1, 1000);
      expect(onRetry).toHaveBeenNthCalledWith(2, expect.any(Error), 2, 2000);
    });

    it('should respect maxDelayMs', async () => {
      const operation = jest.fn().mockRejectedValue(new TypeError('network error'));
      const onRetry = jest.fn();

      const promise = withRetry(operation, { 
        maxAttempts: 5,
        initialDelayMs: 1000,
        backoffMultiplier: 10,
        maxDelayMs: 3000,
        useJitter: false,
        onRetry 
      });
      
      jest.runAllTimers();
      await promise;
      
      // All delays should be capped at maxDelayMs
      const calls = onRetry.mock.calls;
      calls.forEach(call => {
        const delay = call[2];
        expect(delay).toBeLessThanOrEqual(3000);
      });
    });
  });

  describe('error handling', () => {
    it('should return error result when all attempts fail', async () => {
      const error = new TypeError('persistent network error');
      const operation = jest.fn().mockRejectedValue(error);

      const promise = withRetry(operation, { maxAttempts: 2 });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.attempts).toBe(2);
    });

    it('should handle non-Error objects', async () => {
      const operation = jest.fn().mockRejectedValue('string error');

      const promise = withRetry(operation, { maxAttempts: 1 });
      jest.runAllTimers();
      
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('string error');
    });
  });
});

describe('withHttpRetry', () => {
  it('should retry on HTTP server errors', async () => {
    let attempt = 0;
    const operation = jest.fn().mockImplementation(() => {
      attempt++;
      if (attempt === 1) {
        throw new HttpError(503, 'Service Unavailable');
      }
      return Promise.resolve('success');
    });

    const promise = withHttpRetry(operation);
    jest.runAllTimers();
    
    const result = await promise;
    
    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(2);
  });

  it('should not retry on client errors', async () => {
    const operation = jest.fn().mockImplementation(() => {
      throw new HttpError(404, 'Not Found');
    });

    const promise = withHttpRetry(operation);
    jest.runAllTimers();
    
    const result = await promise;
    
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
  });

  it('should respect custom retry statuses', async () => {
    const operation = jest.fn().mockImplementation(() => {
      throw new HttpError(404, 'Not Found');
    });

    const promise = withHttpRetry(operation, { 
      retryStatuses: [404, 500]
    });
    jest.runAllTimers();
    
    const result = await promise;
    
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(3); // Should retry 404 now
  });
});

describe('HttpError', () => {
  it('should create error with status and message', () => {
    const error = new HttpError(404, 'Not Found', 'Custom message');
    
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.message).toBe('Custom message');
    expect(error.name).toBe('HttpError');
  });

  it('should use default message when not provided', () => {
    const error = new HttpError(500, 'Internal Server Error');
    
    expect(error.message).toBe('HTTP 500: Internal Server Error');
  });
});

describe('createRetryFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should return response for successful requests', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const retryFetch = createRetryFetch();
    const response = await retryFetch('/api/test');
    
    expect(response).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith('/api/test', undefined);
  });

  it('should retry on HTTP errors', async () => {
    const failResponse = { ok: false, status: 500, statusText: 'Server Error' };
    const successResponse = { ok: true, json: () => Promise.resolve({ data: 'test' }) };
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(successResponse);

    const retryFetch = createRetryFetch();
    const promise = retryFetch('/api/test');
    
    jest.runAllTimers();
    const response = await promise;
    
    expect(response).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw error after all retries fail', async () => {
    const failResponse = { ok: false, status: 500, statusText: 'Server Error' };
    (global.fetch as jest.Mock).mockResolvedValue(failResponse);

    const retryFetch = createRetryFetch({ maxAttempts: 2 });
    const promise = retryFetch('/api/test');
    
    jest.runAllTimers();
    
    await expect(promise).rejects.toThrow('HTTP 500: Server Error');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
