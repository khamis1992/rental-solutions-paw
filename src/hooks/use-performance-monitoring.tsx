import { useRef, useEffect } from 'react';
import { performanceMetrics } from "@/services/performanceMonitoring";
import { toast } from "sonner";
import type { ExtendedPerformance } from "@/services/performance/types";
import { retryOperation } from "@/components/agreements/utils/retryUtils";

const MONITORING_INTERVALS = {
  CPU: 10000,    // 10 seconds
  MEMORY: 15000, // 15 seconds
  DISK: 60000    // 1 minute
} as const;

const PERFORMANCE_THRESHOLDS = {
  CPU: 80,    // 80% CPU usage
  MEMORY: 90, // 90% memory usage
  DISK: 90    // 90% disk usage
} as const;

export const usePerformanceMonitoring = () => {
  const intervals = useRef<Array<NodeJS.Timeout>>([]);

  const measureCPUUsage = async (): Promise<number> => {
    const performance = window.performance as ExtendedPerformance;
    if (!performance?.memory) return 0;

    const startTime = performance.now();
    const startUsage = performance.memory.usedJSHeapSize;
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const endUsage = performance.memory.usedJSHeapSize;
    
    const duration = endTime - startTime;
    const memoryDiff = endUsage - startUsage;
    const cpuUsage = (memoryDiff / duration) * 100;
    
    return Math.min(Math.max(cpuUsage, 0), 100);
  };

  const monitorPerformance = async () => {
    try {
      // Monitor CPU with retry
      const monitorCPU = async () => {
        try {
          const cpuUsage = await measureCPUUsage();
          if (cpuUsage > PERFORMANCE_THRESHOLDS.CPU) {
            toast.warning("High CPU Usage", {
              description: `Current CPU utilization is ${cpuUsage.toFixed(1)}%`
            });
          }
          await retryOperation(
            () => performanceMetrics.trackCPUUtilization(cpuUsage),
            3, // 3 retries
            1000 // 1 second delay between retries
          );
        } catch (error) {
          console.error('Failed to track CPU utilization:', error);
        }
      };

      // Monitor Memory with retry
      const monitorMemory = async () => {
        const performance = window.performance as ExtendedPerformance;
        if (performance?.memory) {
          try {
            const usedMemory = performance.memory.usedJSHeapSize;
            const totalMemory = performance.memory.totalJSHeapSize;
            const memoryUsage = (usedMemory / totalMemory) * 100;

            if (memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY) {
              toast.warning("High Memory Usage", {
                description: `Memory utilization is at ${memoryUsage.toFixed(1)}%`
              });
            }
            await retryOperation(
              () => performanceMetrics.trackMemoryUsage(),
              3,
              1000
            );
          } catch (error) {
            console.error('Failed to track memory usage:', error);
          }
        }
      };

      // Monitor Disk with retry
      const monitorDisk = async () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
          try {
            const { quota = 0, usage = 0 } = await navigator.storage.estimate();
            const usagePercentage = (usage / quota) * 100;

            if (usagePercentage > PERFORMANCE_THRESHOLDS.DISK) {
              toast.warning("High Disk Usage", {
                description: `Storage utilization is at ${usagePercentage.toFixed(1)}%`
              });
            }
            await retryOperation(
              () => performanceMetrics.trackDiskIO(),
              3,
              1000
            );
          } catch (error) {
            console.error('Failed to track disk I/O:', error);
          }
        }
      };

      // Set up monitoring intervals
      intervals.current.push(
        setInterval(monitorCPU, MONITORING_INTERVALS.CPU),
        setInterval(monitorMemory, MONITORING_INTERVALS.MEMORY),
        setInterval(monitorDisk, MONITORING_INTERVALS.DISK)
      );

    } catch (error) {
      console.error('Performance monitoring error:', error);
    }
  };

  useEffect(() => {
    monitorPerformance();
    return () => {
      intervals.current.forEach(clearInterval);
      intervals.current = [];
    };
  }, []);
};