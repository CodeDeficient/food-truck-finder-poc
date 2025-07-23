import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
describe('Supabase Fallback', () => {
    let supabaseFallback, useFoodTrucks;
    const mockTrucks = [{ id: '1', name: 'test truck' }];
    beforeEach(async () => {
        // Dynamically import the module to be tested
        const module = await import('./supabaseFallback');
        supabaseFallback = module.supabaseFallback;
        useFoodTrucks = module.useFoodTrucks;
        // Clear local storage before each test
        window.localStorage.clear();
    });
    function TestComponent() {
        const { trucks, loading, dataStatus } = useFoodTrucks();
        if (loading)
            return <div>Loading...</div>;
        return (<div>
        <div data-testid="status">{dataStatus.status}</div>
        {trucks.map((truck) => (<div key={truck.id}>{truck.name}</div>))}
      </div>);
    }
    it('should return fresh data when supabase is available', async () => {
        // Mock the supabase client to return fresh data
        supabaseFallback.supabase.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                abortSignal: jest.fn().mockResolvedValue({ data: mockTrucks, error: null }),
            }),
        });
        render(<TestComponent />);
        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('fresh');
            expect(screen.getByText('test truck')).toBeInTheDocument();
        });
    });
    it('should return cached data when supabase is unavailable', async () => {
        // Mock the supabase client to simulate an error
        supabaseFallback.supabase.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                abortSignal: jest.fn().mockRejectedValue(new Error('Supabase error')),
            }),
        });
        // Pre-populate the cache
        const cachedData = {
            trucks: mockTrucks,
            timestamp: Date.now(),
            lastSuccessfulUpdate: new Date().toLocaleString(),
        };
        window.localStorage.setItem('food-trucks-cache', JSON.stringify(cachedData));
        render(<TestComponent />);
        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('cached');
            expect(screen.getByText('test truck')).toBeInTheDocument();
        });
    });
    it('should return stale data when supabase is unavailable and cache is expired', async () => {
        // Mock the supabase client to simulate an error
        supabaseFallback.supabase.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                abortSignal: jest.fn().mockRejectedValue(new Error('Supabase error')),
            }),
        });
        // Pre-populate the cache with stale data
        const cachedData = {
            trucks: mockTrucks,
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
            lastSuccessfulUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString(),
        };
        window.localStorage.setItem('food-trucks-cache', JSON.stringify(cachedData));
        render(<TestComponent />);
        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('stale');
            expect(screen.getByText('test truck')).toBeInTheDocument();
        });
    });
    it('should return unavailable status when supabase is down and no cache is available', async () => {
        // Mock the supabase client to simulate an error
        supabaseFallback.supabase.from = jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                abortSignal: jest.fn().mockRejectedValue(new Error('Supabase error')),
            }),
        });
        function TestComponentUnavailable() {
            const { trucks, loading, dataStatus } = useFoodTrucks();
            if (loading)
                return <div>Loading...</div>;
            return (<div>
          <div data-testid="status">{dataStatus.status}</div>
          {trucks.length === 0 && <div>No trucks available</div>}
        </div>);
        }
        render(<TestComponentUnavailable />);
        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('unavailable');
            expect(screen.getByText('No trucks available')).toBeInTheDocument();
        });
    });
});
