// Simple stdout logger for Docker/Portainer (server-side only)
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

  // Only log on server-side (not in browser)
  isServer() {
    return typeof window === 'undefined';
  }

  info(message, data = null) {
    if (this.isServer()) {
      console.log(this.formatMessage('INFO', message, data));
    }
  }

  error(message, data = null) {
    if (this.isServer()) {
      console.error(this.formatMessage('ERROR', message, data));
    }
  }

  warn(message, data = null) {
    if (this.isServer()) {
      console.warn(this.formatMessage('WARN', message, data));
    }
  }

  debug(message, data = null) {
    if (this.isServer()) {
      console.log(this.formatMessage('DEBUG', message, data));
    }
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
