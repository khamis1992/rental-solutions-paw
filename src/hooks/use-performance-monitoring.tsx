import { useRef, useEffect } from 'react';
import { performanceMetrics } from "@/services/performanceMonitoring";
import type { ExtendedPerformance } from "@/services/performance/types";

// Configuration constants
const MONITORING_INTERVALS = {
  CPU: 5000,    // 5 seconds
  MEMORY: 5000, // 5 seconds
  DISK: 60000   // 1 minute
};

export const usePerformanceMonitoring = () => {
  const cpuMonitoringInterval = useRef<NodeJS.Timeout>();
  const memoryMonitoringInterval = useRef<NodeJS.Timeout>();
  const diskMonitoringInterval = useRef<NodeJS.Timeout>();

  const monitorCPU = async () => {
    try {
      const cpuUsage = await measureCPUUsage();
      await performanceMetrics.trackCPUUtilization(cpuUsage);
    } catch (error) {
      console.error('Failed to monitor CPU:', error);
    }
  };

  const monitorMemory = async () => {
    try {
      await performanceMetrics.trackMemoryUsage();
    } catch (error) {
      console.error('Failed to monitor memory:', error);
    }
  };

  const monitorDiskIO = async () => {
    try {
      await performanceMetrics.trackDiskIO();
    } catch (error) {
      console.error('Failed to monitor disk I/O:', error);
    }
  };

  const measureCPUUsage = async (): Promise<number> => {
    const performance = window.performance as ExtendedPerformance;
    if (!performance || !performance.memory) {
      return 0;
    }

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

  useEffect(() => {
    // Start performance monitoring with optimized intervals
    cpuMonitoringInterval.current = setInterval(monitorCPU, MONITORING_INTERVALS.CPU);
    memoryMonitoringInterval.current = setInterval(monitorMemory, MONITORING_INTERVALS.MEMORY);
    diskMonitoringInterval.current = setInterval(monitorDiskIO, MONITORING_INTERVALS.DISK);

    return () => {
      if (cpuMonitoringInterval.current) {
        clearInterval(cpuMonitoringInterval.current);
      }
      if (memoryMonitoringInterval.current) {
        clearInterval(memoryMonitoringInterval.current);
      }
      if (diskMonitoringInterval.current) {
        clearInterval(diskMonitoringInterval.current);
      }
    };
  }, []);
};