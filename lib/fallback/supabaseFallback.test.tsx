import { render, screen, waitFor } from '@testing-library/react';
import { supabaseFallback, useFoodTrucks } from './supabaseFallback';

describe('Supabase Fallback', () => {
  it('should return fresh data when supabase is available', async () => {
    // Mock the supabase client
    const mockGet = jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'test truck' }], error: null });
    supabaseFallback.supabase.from = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ abortSignal: jest.fn().mockReturnValue({ data: [{ id: '1', name: 'test truck' }], error: null }) }) });

    const TestComponent = () => {
      const { trucks, loading, dataStatus } = useFoodTrucks();
      if (loading) return <div>Loading...</div>;
      return (
        <div>
          <div data-testid="status">{dataStatus.status}</div>
          {trucks.map(truck => <div key={truck.id}>{truck.name}</div>)}
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('fresh');
      expect(screen.getByText('test truck')).toBeInTheDocument();
    });
  });
});
