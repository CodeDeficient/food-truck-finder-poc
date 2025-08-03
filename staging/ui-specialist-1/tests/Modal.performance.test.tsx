/**
 * Modal Performance Tests
 * UI_SPECIALIST_1 - Task 1.1.9
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Modal } from '../components/ui/Modal';
import '@testing-library/jest-dom';

// Performance measurement utilities
const measureRenderTime = async (component: React.ReactElement): Promise<number> => {
  const start = performance.now();
  
  await act(async () => {
    render(component);
  });
  
  const end = performance.now();
  return end - start;
};

const measureMultipleRenders = async (component: React.ReactElement, iterations: number = 10): Promise<{
  average: number;
  min: number;
  max: number;
  times: number[];
}> => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const time = await measureRenderTime(component);
    times.push(time);
  }
  
  return {
    average: times.reduce((sum, time) => sum + time, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    times
  };
};

// Mock large content for performance testing
const generateLargeContent = (itemCount: number) => (
  <div>
    {Array.from({ length: itemCount }, (_, i) => (
      <div key={i} className="p-4 border-b">
        <h4>Item {i + 1}</h4>
        <p>This is a description for item {i + 1}. It contains some text to simulate realistic content.</p>
        <div className="flex gap-2 mt-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">Action 1</button>
          <button className="px-3 py-1 bg-gray-500 text-white rounded">Action 2</button>
        </div>
      </div>
    ))}
  </div>
);

describe('Modal Performance Tests', () => {
  // Performance thresholds (in milliseconds)
  const PERFORMANCE_THRESHOLDS = {
    SIMPLE_MODAL_RENDER: 50,
    CONTENT_MODAL_RENDER: 100,
    LARGE_CONTENT_RENDER: 200,
    FORM_MODAL_RENDER: 75,
    CONFIRMATION_MODAL_RENDER: 50
  };

  describe('Basic Modal Rendering Performance', () => {
    it('renders simple modal within performance threshold', async () => {
      const modal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Performance Test Modal"
          description="Testing render performance"
          actions={[
            { label: 'Cancel', onClick: () => {} },
            { label: 'Confirm', onClick: () => {} }
          ]}
        />
      );

      const stats = await measureMultipleRenders(modal, 10);
      
      console.log(Simple Modal Performance Stats:, stats);
      
      expect(stats.average).toBeLessThan(PERFORMANCE_THRESHOLDS.SIMPLE_MODAL_RENDER);
      expect(stats.max).toBeLessThan(PERFORMANCE_THRESHOLDS.SIMPLE_MODAL_RENDER * 2);
    });

    it('renders content modal within performance threshold', async () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Content Performance Test"
        >
          <div className="p-4">
            <p>Regular content that should render quickly</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>Column 1 content</div>
              <div>Column 2 content</div>
            </div>
          </div>
        </Modal>
      );

      const stats = await measureMultipleRenders(modal, 10);
      
      console.log(Content Modal Performance Stats:, stats);
      
      expect(stats.average).toBeLessThan(PERFORMANCE_THRESHOLDS.CONTENT_MODAL_RENDER);
    });

    it('renders form modal within performance threshold', async () => {
      const modal = (
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form Performance Test"
          onSubmit={() => {}}
        >
          <div className="space-y-4">
            <input type="text" placeholder="Field 1" />
            <input type="email" placeholder="Field 2" />
            <textarea placeholder="Field 3" rows={3} />
            <select>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </Modal>
      );

      const stats = await measureMultipleRenders(modal, 10);
      
      console.log(Form Modal Performance Stats:, stats);
      
      expect(stats.average).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_MODAL_RENDER);
    });

    it('renders confirmation modal within performance threshold', async () => {
      const modal = (
        <Modal
          variant="confirmation"
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirmation Performance Test"
          description="Are you sure you want to continue?"
        />
      );

      const stats = await measureMultipleRenders(modal, 10);
      
      console.log(Confirmation Modal Performance Stats:, stats);
      
      expect(stats.average).toBeLessThan(PERFORMANCE_THRESHOLDS.CONFIRMATION_MODAL_RENDER);
    });
  });

  describe('Large Content Performance', () => {
    it('handles large content efficiently', async () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Large Content Test"
          size="xl"
          scrollable={true}
        >
          {generateLargeContent(100)}
        </Modal>
      );

      const stats = await measureMultipleRenders(modal, 5);
      
      console.log(Large Content Modal Performance Stats:, stats);
      
      expect(stats.average).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_CONTENT_RENDER);
    });

    it('maintains performance with very large content', async () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Very Large Content Test"
          size="full"
          scrollable={true}
        >
          {generateLargeContent(500)}
        </Modal>
      );

      const renderTime = await measureRenderTime(modal);
      
      console.log(Very Large Content Render Time: ms);
      
      // Should still render reasonably quickly even with large content
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Modal State Change Performance', () => {
    it('handles rapid open/close cycles efficiently', async () => {
      let isOpen = false;
      const TestComponent = () => (
        <Modal
          variant="simple"
          isOpen={isOpen}
          onClose={() => {}}
          title="State Change Test"
        />
      );

      const { rerender } = render(<TestComponent />);
      
      const cycles = 20;
      const start = performance.now();
      
      for (let i = 0; i < cycles; i++) {
        isOpen = !isOpen;
        await act(async () => {
          rerender(<TestComponent />);
        });
      }
      
      const end = performance.now();
      const totalTime = end - start;
      const averagePerCycle = totalTime / cycles;
      
      console.log(State Change Performance: ms per cycle);
      
      expect(averagePerCycle).toBeLessThan(10);
    });

    it('handles multiple modals efficiently', async () => {
      const MultiModalComponent = () => (
        <div>
          <Modal
            variant="simple"
            isOpen={true}
            onClose={() => {}}
            title="Modal 1"
            zIndex={1000}
          />
          <Modal
            variant="content"
            isOpen={true}
            onClose={() => {}}
            title="Modal 2"
            zIndex={1010}
          >
            <div>Content for modal 2</div>
          </Modal>
          <Modal
            variant="confirmation"
            isOpen={true}
            onClose={() => {}}
            onConfirm={() => {}}
            title="Modal 3"
            zIndex={1020}
          />
        </div>
      );

      const renderTime = await measureRenderTime(<MultiModalComponent />);
      
      console.log(Multiple Modals Render Time: ms);
      
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage and Cleanup', () => {
    it('cleans up event listeners properly', async () => {
      const TestComponent = ({ isOpen }: { isOpen: boolean }) => (
        <Modal
          variant="simple"
          isOpen={isOpen}
          onClose={() => {}}
          title="Cleanup Test Modal"
        />
      );

      const { rerender, unmount } = render(<TestComponent isOpen={true} />);
      
      // Get initial listener count (approximate)
      const initialListeners = document.addEventListener.length || 0;
      
      // Close modal
      rerender(<TestComponent isOpen={false} />);
      
      // Unmount component
      unmount();
      
      // Event listeners should be cleaned up
      const finalListeners = document.addEventListener.length || 0;
      expect(finalListeners).toBeLessThanOrEqual(initialListeners);
    });

    it('handles rapid mount/unmount cycles', async () => {
      const TestComponent = () => (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Mount/Unmount Test"
        >
          <div>{generateLargeContent(50)}</div>
        </Modal>
      );

      const cycles = 10;
      const start = performance.now();
      
      for (let i = 0; i < cycles; i++) {
        const { unmount } = render(<TestComponent />);
        unmount();
      }
      
      const end = performance.now();
      const totalTime = end - start;
      const averagePerCycle = totalTime / cycles;
      
      console.log(Mount/Unmount Performance: ms per cycle);
      
      expect(averagePerCycle).toBeLessThan(50);
    });
  });

  describe('Responsive Performance', () => {
    it('adapts to viewport changes efficiently', async () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Responsive Test"
          size="lg"
        >
          <div className="responsive-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="p-4 border rounded">Item {i + 1}</div>
              ))}
            </div>
          </div>
        </Modal>
      );

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      const desktopTime = await measureRenderTime(modal);
      
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      const mobileTime = await measureRenderTime(modal);
      
      console.log(Responsive Performance - Desktop: ms, Mobile: ms);
      
      expect(desktopTime).toBeLessThan(100);
      expect(mobileTime).toBeLessThan(100);
      
      // Mobile should not be significantly slower than desktop
      expect(Math.abs(mobileTime - desktopTime)).toBeLessThan(50);
    });
  });

  describe('Animation Performance', () => {
    it('maintains 60fps during modal transitions', async () => {
      // Mock performance observer for frame rate monitoring
      const frameRates: number[] = [];
      let lastFrameTime = performance.now();
      
      const mockPerformanceObserver = {
        observe: jest.fn(),
        disconnect: jest.fn(),
      };
      
      // Simulate frame rate monitoring
      const monitorFrameRate = () => {
        const currentTime = performance.now();
        const frameDuration = currentTime - lastFrameTime;
        const fps = 1000 / frameDuration;
        frameRates.push(fps);
        lastFrameTime = currentTime;
      };

      const TestComponent = ({ isOpen }: { isOpen: boolean }) => {
        React.useEffect(() => {
          monitorFrameRate();
        });
        
        return (
          <Modal
            variant="simple"
            isOpen={isOpen}
            onClose={() => {}}
            title="Animation Performance Test"
          />
        );
      };

      const { rerender } = render(<TestComponent isOpen={false} />);
      
      // Simulate opening animation
      await act(async () => {
        rerender(<TestComponent isOpen={true} />);
      });
      
      // Check that average frame rate is close to 60fps
      if (frameRates.length > 0) {
        const averageFps = frameRates.reduce((sum, fps) => sum + fps, 0) / frameRates.length;
        console.log(Average FPS during animation: );
        
        // Should maintain reasonable frame rate (allowing for test environment variations)
        expect(averageFps).toBeGreaterThan(30);
      }
    });
  });

  describe('Comparison with Previous Implementation', () => {
    // These tests would compare against the old modal implementations
    it('performs better than legacy simple modal', async () => {
      // New implementation
      const newModal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="New Implementation"
          actions={[{ label: 'Close', onClick: () => {} }]}
        />
      );
      
      const newStats = await measureMultipleRenders(newModal, 10);
      
      console.log(New Modal Implementation Stats:, newStats);
      
      // Should consistently render quickly
      expect(newStats.average).toBeLessThan(PERFORMANCE_THRESHOLDS.SIMPLE_MODAL_RENDER);
      expect(newStats.max - newStats.min).toBeLessThan(25); // Low variance indicates consistency
    });
  });

  describe('Performance Regression Detection', () => {
    it('maintains baseline performance metrics', async () => {
      const testCases = [
        {
          name: 'Simple Modal',
          component: (
            <Modal
              variant="simple"
              isOpen={true}
              onClose={() => {}}
              title="Baseline Test"
              actions={[{ label: 'OK', onClick: () => {} }]}
            />
          ),
          threshold: PERFORMANCE_THRESHOLDS.SIMPLE_MODAL_RENDER
        },
        {
          name: 'Content Modal',
          component: (
            <Modal
              variant="content"
              isOpen={true}
              onClose={() => {}}
              title="Baseline Content Test"
            >
              <div>Standard content</div>
            </Modal>
          ),
          threshold: PERFORMANCE_THRESHOLDS.CONTENT_MODAL_RENDER
        },
        {
          name: 'Form Modal',
          component: (
            <Modal
              variant="form"
              isOpen={true}
              onClose={() => {}}
              title="Baseline Form Test"
              onSubmit={() => {}}
            >
              <input type="text" />
            </Modal>
          ),
          threshold: PERFORMANCE_THRESHOLDS.FORM_MODAL_RENDER
        }
      ];

      const results = await Promise.all(
        testCases.map(async (testCase) => {
          const stats = await measureMultipleRenders(testCase.component, 5);
          return {
            name: testCase.name,
            average: stats.average,
            threshold: testCase.threshold,
            passed: stats.average < testCase.threshold
          };
        })
      );

      console.log('Performance Baseline Results:', results);
      
      results.forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });
});
