/**
 * Enhanced logger with security event tracking
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SECURITY: 'SECURITY'
};

class SecurityLogger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    
    return logEntry;
  }

  _shouldLog(level) {
    // Always log SECURITY and ERROR
    if (level === LOG_LEVELS.SECURITY || level === LOG_LEVELS.ERROR) {
      return true;
    }
    
    // In production, skip DEBUG logs
    if (!this.isDevelopment && level === LOG_LEVELS.DEBUG) {
      return false;
    }
    
    return true;
  }

  _log(level, message, data = null) {
    if (!this._shouldLog(level)) {
      return;
    }

    const logEntry = this._formatMessage(level, message, data);
    
    // In production, you might want to send this to a logging service
    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.SECURITY) {
      console.error(JSON.stringify(logEntry));
    } else if (level === LOG_LEVELS.WARN) {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message, data = null) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }

  warn(message, data = null) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  info(message, data = null) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  debug(message, data = null) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  /**
   * Log security events - these are always logged and highlighted
   */
  security(message, data = null) {
    this._log(LOG_LEVELS.SECURITY, `🚨 SECURITY: ${message}`, data);
    
    // In production, send to security monitoring service
    // Example: Sentry, DataDog, CloudWatch, etc.
    if (!this.isDevelopment) {
      // TODO: Integrate with your security monitoring service
      // await sendToSecurityMonitoring({ message, data, timestamp: new Date() });
    }
  }

  /**
   * Log suspicious activity that might indicate an attack
   */
  suspiciousActivity(activity, details = {}) {
    this.security(`Suspicious activity detected: ${activity}`, {
      ...details,
      timestamp: new Date().toISOString(),
      severity: 'high'
    });
  }

  /**
   * Log rate limit violations
   */
  rateLimitViolation(ip, endpoint, count) {
    this.security('Rate limit exceeded', {
      ip,
      endpoint,
      requestCount: count,
      severity: 'medium'
    });
  }

  /**
   * Log blocked requests
   */
  blockedRequest(ip, reason, details = {}) {
    this.security('Request blocked', {
      ip,
      reason,
      ...details,
      severity: 'high'
    });
  }

  /**
   * Log authentication failures
   */
  authFailure(ip, username = null, reason = null) {
    this.security('Authentication failure', {
      ip,
      username,
      reason,
      severity: 'medium'
    });
  }

  /**
   * Log file operation security events
   */
  fileSecurityEvent(operation, path, reason, ip = null) {
    this.security(`File operation blocked: ${operation}`, {
      operation,
      path,
      reason,
      ip,
      severity: 'high'
    });
  }
}

const logger = new SecurityLogger();

// Export both the instance and LOG_LEVELS
export default logger;
export { LOG_LEVELS };
