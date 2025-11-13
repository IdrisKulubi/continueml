/**
 * Centralized logging service for the application
 * Provides structured logging with different levels and context
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  userId?: string;
  worldId?: string;
  entityId?: string;
  generationId?: string;
  requestId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log entry for output
   */
  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const contextStr = entry.context
        ? ` | ${JSON.stringify(entry.context)}`
        : '';
      const errorStr = entry.error
        ? `\n${entry.error.stack || entry.error.message}`
        : '';
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${errorStr}`;
    } else {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify(entry);
    }
  }

  /**
   * Send log to external service in production
   */
  private async sendToExternalService(_entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    // TODO: Integrate with external logging service (e.g., Logtail, Datadog, Sentry)
    // Example for Logtail:
    // if (process.env.LOGTAIL_SOURCE_TOKEN) {
    //   await fetch('https://in.logtail.com', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${process.env.LOGTAIL_SOURCE_TOKEN}`,
    //     },
    //     body: JSON.stringify(entry),
    //   });
    // }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    const formattedLog = this.formatLog(entry);

    // Console output
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }

    // Send to external service in production
    if (this.isProduction && level !== LogLevel.DEBUG) {
      this.sendToExternalService(entry).catch((err) => {
        console.error('Failed to send log to external service:', err);
      });
    }
  }

  /**
   * Sanitize context to remove sensitive data
   */
  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined;

    const sanitized = { ...context };

    // Remove sensitive fields
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'apiKey',
      'accessKey',
      'secretKey',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info(`${method} ${path} ${statusCode} - ${duration}ms`, context);
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, context?: LogContext): void {
    this.debug(`DB Query: ${query} - ${duration}ms`, context);
  }

  /**
   * Log external API call
   */
  logExternalAPI(
    service: string,
    endpoint: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ): void {
    const message = `External API: ${service} ${endpoint} - ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`;
    if (success) {
      this.info(message, context);
    } else {
      this.warn(message, context);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types
export type { LogContext };
