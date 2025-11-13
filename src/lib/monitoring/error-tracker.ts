/**
 * Error tracking and reporting service
 * Integrates with external error tracking services like Sentry
 */

import { logger } from './logger';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  EMBEDDING = 'embedding',
  GENERATION = 'generation',
  UNKNOWN = 'unknown',
}

interface ErrorContext {
  userId?: string;
  worldId?: string;
  entityId?: string;
  generationId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  [key: string]: string | number | boolean | undefined;
}

interface TrackedError {
  error: Error;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: ErrorContext;
  timestamp: string;
}

class ErrorTracker {
  private isProduction = process.env.NODE_ENV === 'production';
  private sentryInitialized = false;

  constructor() {
    this.initializeSentry();
  }

  /**
   * Initialize Sentry (or other error tracking service)
   */
  private initializeSentry(): void {
    // TODO: Uncomment and configure when Sentry is set up
    // if (this.isProduction && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    //   Sentry.init({
    //     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //     environment: process.env.NODE_ENV,
    //     tracesSampleRate: 0.1,
    //     beforeSend(event, hint) {
    //       // Filter out sensitive data
    //       if (event.request?.headers) {
    //         delete event.request.headers['authorization'];
    //         delete event.request.headers['cookie'];
    //       }
    //       return event;
    //     },
    //   });
    //   this.sentryInitialized = true;
    // }
  }

  /**
   * Track an error
   */
  track(
    error: Error,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ): void {
    const trackedError: TrackedError = {
      error,
      category,
      severity,
      context,
      timestamp: new Date().toISOString(),
    };

    // Log to console/logger
    logger.error(
      `[${category.toUpperCase()}] ${error.message}`,
      error,
      context
    );

    // Send to Sentry in production
    if (this.isProduction && this.sentryInitialized) {
      // TODO: Uncomment when Sentry is configured
      // Sentry.captureException(error, {
      //   level: this.mapSeverityToSentryLevel(severity),
      //   tags: {
      //     category,
      //   },
      //   contexts: {
      //     custom: context,
      //   },
      // });
    }

    // Alert for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      this.alertCriticalError(trackedError);
    }
  }

  /**
   * Track database error
   */
  trackDatabaseError(error: Error, context?: ErrorContext): void {
    this.track(error, ErrorCategory.DATABASE, ErrorSeverity.HIGH, context);
  }

  /**
   * Track external API error
   */
  trackExternalAPIError(
    error: Error,
    service: string,
    context?: ErrorContext
  ): void {
    this.track(
      error,
      ErrorCategory.EXTERNAL_API,
      ErrorSeverity.MEDIUM,
      {
        ...context,
        service,
      }
    );
  }

  /**
   * Track authentication error
   */
  trackAuthError(error: Error, context?: ErrorContext): void {
    this.track(error, ErrorCategory.AUTHENTICATION, ErrorSeverity.HIGH, context);
  }

  /**
   * Track validation error
   */
  trackValidationError(error: Error, context?: ErrorContext): void {
    this.track(error, ErrorCategory.VALIDATION, ErrorSeverity.LOW, context);
  }

  /**
   * Track storage error
   */
  trackStorageError(error: Error, context?: ErrorContext): void {
    this.track(error, ErrorCategory.STORAGE, ErrorSeverity.MEDIUM, context);
  }

  /**
   * Track embedding generation error
   */
  trackEmbeddingError(error: Error, context?: ErrorContext): void {
    this.track(error, ErrorCategory.EMBEDDING, ErrorSeverity.MEDIUM, context);
  }

  /**
   * Track generation error
   */
  trackGenerationError(error: Error, context?: ErrorContext): void {
    this.track(error, ErrorCategory.GENERATION, ErrorSeverity.MEDIUM, context);
  }

  /**
   * Map severity to Sentry level
   */
  private mapSeverityToSentryLevel(
    severity: ErrorSeverity
  ): 'fatal' | 'error' | 'warning' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'fatal';
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warning';
      case ErrorSeverity.LOW:
        return 'info';
    }
  }

  /**
   * Alert for critical errors
   */
  private alertCriticalError(trackedError: TrackedError): void {
    // TODO: Implement alerting (email, Slack, PagerDuty, etc.)
    logger.error(
      `🚨 CRITICAL ERROR: ${trackedError.error.message}`,
      trackedError.error,
      trackedError.context
    );

    // Example: Send to Slack webhook
    // if (process.env.SLACK_WEBHOOK_URL) {
    //   fetch(process.env.SLACK_WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       text: `🚨 Critical Error in continueml`,
    //       blocks: [
    //         {
    //           type: 'section',
    //           text: {
    //             type: 'mrkdwn',
    //             text: `*Error:* ${trackedError.error.message}\n*Category:* ${trackedError.category}\n*Time:* ${trackedError.timestamp}`,
    //           },
    //         },
    //       ],
    //     }),
    //   });
    // }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(_userId: string, _email?: string, _name?: string): void {
    if (this.sentryInitialized) {
      // TODO: Uncomment when Sentry is configured
      // Sentry.setUser({
      //   id: _userId,
      //   email: _email,
      //   username: _name,
      // });
    }
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    if (this.sentryInitialized) {
      // TODO: Uncomment when Sentry is configured
      // Sentry.setUser(null);
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(
    _message: string,
    _category: string,
    _data?: Record<string, string | number | boolean>
  ): void {
    if (this.sentryInitialized) {
      // TODO: Uncomment when Sentry is configured
      // Sentry.addBreadcrumb({
      //   message: _message,
      //   category: _category,
      //   data: _data,
      //   level: 'info',
      //   timestamp: Date.now() / 1000,
      // });
    }
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Export types
export type { ErrorContext, TrackedError };
