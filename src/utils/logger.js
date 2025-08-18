// Logger that works on both client and server
class Logger {
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  // Check if running on server-side
  isServer() {
    return typeof window === 'undefined';
  }

  // Send client logs to server for terminal visibility
  sendToServer(level, message, data) {
    if (typeof window !== 'undefined') {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data })
      }).catch(() => {}); // Silent fail if logging endpoint doesn't exist
    }
  }

  info(message, data = null) {
    if (this.isServer()) {
      // Server-side: JSON format for Docker/Portainer
      console.log(this.formatMessage('INFO', message, data));
    } else {
      // Client-side: Regular console format for browser DevTools
      console.log(`[INFO] ${message}`, data || '');
      // Also send to server for terminal visibility
      this.sendToServer('INFO', message, data);
    }
  }

  error(message, data = null) {
    if (this.isServer()) {
      console.error(this.formatMessage('ERROR', message, data));
    } else {
      console.error(`[ERROR] ${message}`, data || '');
      this.sendToServer('ERROR', message, data);
    }
  }

  warn(message, data = null) {
    if (this.isServer()) {
      console.warn(this.formatMessage('WARN', message, data));
    } else {
      console.warn(`[WARN] ${message}`, data || '');
      this.sendToServer('WARN', message, data);
    }
  }

  debug(message, data = null) {
    if (this.isServer()) {
      console.log(this.formatMessage('DEBUG', message, data));
    } else {
      console.debug(`[DEBUG] ${message}`, data || '');
      this.sendToServer('DEBUG', message, data);
    }
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
