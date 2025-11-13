/**
 * Performance monitoring utilities
 * Track and measure application performance metrics
 */

import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: string;
  context?: Record<string, string | number | boolean>;
}

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Start timing an operation
   */
  startTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, 'ms');
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms',
    context?: Record<string, string | number | boolean>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context,
    };

    // Log metric
    logger.debug(`Performance: ${name} = ${value}${unit}`, context);

    // Store for aggregation
    this.metrics.set(name, value);

    // Send to external service in production
    if (this.isProduction) {
      this.sendToExternalService(metric);
    }
  }

  /**
   * Measure async function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    _context?: Record<string, string | number | boolean>
  ): Promise<T> {
    const stopTimer = this.startTimer(name);
    try {
      const result = await fn();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      throw error;
    }
  }

  /**
   * Measure sync function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    _context?: Record<string, string | number | boolean>
  ): T {
    const stopTimer = this.startTimer(name);
    try {
      const result = fn();
      stopTimer();
      return result;
    } catch (error) {
      stopTimer();
      throw error;
    }
  }

  /**
   * Record database query performance
   */
  recordDatabaseQuery(query: string, duration: number): void {
    this.recordMetric('db_query', duration, 'ms', { query });

    // Warn on slow queries
    if (duration > 1000) {
      logger.warn(`Slow database query detected: ${duration}ms`, { query });
    }
  }

  /**
   * Record API response time
   */
  recordAPIResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    this.recordMetric('api_response', duration, 'ms', {
      method,
      path,
      statusCode,
    });

    // Warn on slow responses
    if (duration > 2000) {
      logger.warn(`Slow API response: ${method} ${path} - ${duration}ms`);
    }
  }

  /**
   * Record external API call performance
   */
  recordExternalAPI(service: string, endpoint: string, duration: number): void {
    this.recordMetric('external_api', duration, 'ms', { service, endpoint });

    // Warn on slow external calls
    if (duration > 5000) {
      logger.warn(
        `Slow external API call: ${service} ${endpoint} - ${duration}ms`
      );
    }
  }

  /**
   * Record embedding generation performance
   */
  recordEmbeddingGeneration(type: 'visual' | 'semantic', duration: number): void {
    this.recordMetric('embedding_generation', duration, 'ms', { type });

    // Warn on slow embedding generation
    const threshold = type === 'visual' ? 5000 : 3000;
    if (duration > threshold) {
      logger.warn(
        `Slow ${type} embedding generation: ${duration}ms (threshold: ${threshold}ms)`
      );
    }
  }

  /**
   * Record image upload performance
   */
  recordImageUpload(fileSize: number, duration: number): void {
    this.recordMetric('image_upload', duration, 'ms', { fileSize });
    this.recordMetric('image_size', fileSize, 'bytes');

    // Calculate upload speed
    const speedMbps = (fileSize / duration / 1024 / 1024) * 1000;
    logger.debug(`Image upload speed: ${speedMbps.toFixed(2)} MB/s`);
  }

  /**
   * Get metric value
   */
  getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Send metric to external service
   */
  private async sendToExternalService(_metric: PerformanceMetric): Promise<void> {
    // TODO: Integrate with external monitoring service (e.g., Datadog, New Relic)
    // Example for Datadog:
    // if (process.env.DATADOG_API_KEY) {
    //   await fetch('https://api.datadoghq.com/api/v1/series', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'DD-API-KEY': process.env.DATADOG_API_KEY,
    //     },
    //     body: JSON.stringify({
    //       series: [
    //         {
    //           metric: `continueml.${metric.name}`,
    //           points: [[Date.now() / 1000, metric.value]],
    //           type: 'gauge',
    //           tags: Object.entries(metric.context || {}).map(
    //             ([k, v]) => `${k}:${v}`
    //           ),
    //         },
    //       ],
    //     }),
    //   });
    // }
  }

  /**
   * Get Web Vitals (client-side only)
   */
  reportWebVitals(_metric: {
    id: string;
    name: string;
    value: number;
    label: 'web-vital' | 'custom';
  }): void {
    if (typeof window === 'undefined') return;

    this.recordMetric(`web_vital_${_metric.name}`, _metric.value, 'ms', {
      id: _metric.id,
      label: _metric.label,
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric };
