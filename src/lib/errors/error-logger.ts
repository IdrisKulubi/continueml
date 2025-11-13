import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";

/**
 * Log levels for error logging
 */
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

/**
 * Error log entry structure
 */
interface ErrorLogEntry {
  level: LogLevel;
  code: ErrorCode;
  message: string;
  details?: unknown;
  stack?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

/**
 * Error logging service
 */
class ErrorLogger {
  private isDevelopment = process.env.NODE_ENV === "development";

  /**
   * Log an error with context
   */
  logError(
    error: Error | AppError,
    context?: Record<string, unknown>
  ): void {
    const logEntry = this.createLogEntry(error, LogLevel.ERROR, context);
    this.writeLog(logEntry);

    // In production, send to external logging service
    if (!this.isDevelopment) {
      this.sendToExternalService(logEntry);
    }
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: Record<string, unknown>): void {
    const logEntry: ErrorLogEntry = {
      level: LogLevel.WARN,
      code: ErrorCode.UNKNOWN_ERROR,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    this.writeLog(logEntry);
  }

  /**
   * Log info message
   */
  logInfo(message: string, context?: Record<string, unknown>): void {
    const logEntry: ErrorLogEntry = {
      level: LogLevel.INFO,
      code: ErrorCode.UNKNOWN_ERROR,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
    this.writeLog(logEntry);
  }

  /**
   * Log debug message (only in development)
   */
  logDebug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      const logEntry: ErrorLogEntry = {
        level: LogLevel.DEBUG,
        code: ErrorCode.UNKNOWN_ERROR,
        message,
        timestamp: new Date().toISOString(),
        context,
      };
      this.writeLog(logEntry);
    }
  }

  /**
   * Create a structured log entry from an error
   */
  private createLogEntry(
    error: Error | AppError,
    level: LogLevel,
    context?: Record<string, unknown>
  ): ErrorLogEntry {
    const isAppError = error instanceof AppError;

    return {
      level,
      code: isAppError ? error.code : ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      details: isAppError ? error.details : undefined,
      stack: this.isDevelopment ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        isOperational: isAppError ? error.isOperational : false,
      },
    };
  }

  /**
   * Write log to console (development) or structured logger (production)
   */
  private writeLog(logEntry: ErrorLogEntry): void {
    if (this.isDevelopment) {
      // Pretty print in development
      console[logEntry.level === LogLevel.ERROR ? "error" : "log"](
        `[${logEntry.level.toUpperCase()}] ${logEntry.timestamp}`,
        logEntry.message,
        logEntry.details ? `\nDetails:` : "",
        logEntry.details || "",
        logEntry.stack ? `\nStack:` : "",
        logEntry.stack || "",
        logEntry.context ? `\nContext:` : "",
        logEntry.context || ""
      );
    } else {
      // Structured JSON logging in production
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Send error to external logging service (e.g., Sentry, Datadog)
   * This is a placeholder for future integration
   */
  private sendToExternalService(logEntry: ErrorLogEntry): void {
    // TODO: Integrate with external logging service
    // Example: Sentry.captureException(error, { extra: logEntry.context });
    
    // For now, just ensure it's logged to console in production
    if (logEntry.level === LogLevel.ERROR) {
      console.error("External logging placeholder:", logEntry);
    }
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: unknown): unknown {
    if (typeof data !== "object" || data === null) {
      return data;
    }

    const sensitiveKeys = [
      "password",
      "token",
      "apiKey",
      "secret",
      "authorization",
      "cookie",
    ];

    const sanitized = { ...data } as Record<string, unknown>;

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof sanitized[key] === "object") {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();
