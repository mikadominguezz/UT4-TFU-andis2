/**
 * Gateway Offloading Pattern Implementation
 * 
 * Este patrón de seguridad descarga responsabilidades de seguridad comunes 
 * del backend hacia el API Gateway, centralizando:
 * - Autenticación y autorización
 * - Validación de entrada
 * - Rate limiting
 * - Logging de seguridad
 * - Headers de seguridad
 * 
 * Beneficios:
 * - Centraliza la lógica de seguridad
 * - Reduce la duplicación de código de seguridad en microservicios
 * - Mejora la consistencia en políticas de seguridad
 * - Facilita el mantenimiento y auditoría
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

class GatewayOffloading {
  constructor() {
    this.securityLogs = [];
    this.requestCounts = new Map();
  }

  /**
   * Middleware para headers de seguridad
   */
  securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  /**
   * Rate limiting para prevenir ataques de fuerza bruta
   */
  createRateLimiter(options = {}) {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
      max: options.max || 100, // máximo 100 requests por ventana
      message: {
        error: 'Demasiadas solicitudes desde esta IP, intente más tarde.',
        pattern: 'Gateway Offloading - Rate Limiting'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path
        });
        res.status(429).json({
          error: 'Demasiadas solicitudes desde esta IP, intente más tarde.',
          pattern: 'Gateway Offloading - Rate Limiting'
        });
      }
    });
  }

  /**
   * Validación de entrada centralizada
   */
  validateInput() {
    return (req, res, next) => {
      // Validar headers obligatorios
      if (!req.headers['user-agent']) {
        return res.status(400).json({
          error: 'User-Agent header es obligatorio',
          pattern: 'Gateway Offloading - Input Validation'
        });
      }

      // Validar tamaño del payload
      const contentLength = parseInt(req.headers['content-length'] || '0');
      if (contentLength > 1048576) { // 1MB límite
        return res.status(413).json({
          error: 'Payload demasiado grande (máximo 1MB)',
          pattern: 'Gateway Offloading - Input Validation'
        });
      }

      // Sanitizar parámetros de query
      if (req.query) {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string' && value.length > 1000) {
            return res.status(400).json({
              error: `Parámetro ${key} demasiado largo`,
              pattern: 'Gateway Offloading - Input Validation'
            });
          }
        }
      }

      next();
    };
  }

  /**
   * Logging de eventos de seguridad
   */
  logSecurityEvent(eventType, details) {
    const event = {
      timestamp: new Date().toISOString(),
      type: eventType,
      details: details,
      pattern: 'Gateway Offloading'
    };
    
    this.securityLogs.push(event);
    
    // Mantener solo los últimos 1000 eventos
    if (this.securityLogs.length > 1000) {
      this.securityLogs.shift();
    }
    
    console.log(`🔒 Security Event [${eventType}]:`, details);
  }

  /**
   * Middleware de logging de seguridad
   */
  securityLogger() {
    return (req, res, next) => {
      // Log de todas las requests autenticadas
      if (req.user) {
        this.logSecurityEvent('AUTHENTICATED_REQUEST', {
          user: req.user.username,
          roles: req.user.roles,
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      // Log de intentos de acceso a endpoints protegidos sin token
      if (req.path.startsWith('/admin') || req.path.startsWith('/protected')) {
        if (!req.headers.authorization) {
          this.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('User-Agent')
          });
        }
      }

      next();
    };
  }

  /**
   * Middleware de autorización mejorada
   */
  authorizeRoles(requiredRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        this.logSecurityEvent('UNAUTHORIZED_ACCESS', {
          path: req.path,
          requiredRoles: requiredRoles,
          ip: req.ip
        });
        return res.status(401).json({ 
          error: 'Token de autenticación requerido',
          pattern: 'Gateway Offloading - Authorization'
        });
      }

      const userRoles = req.user.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (requiredRoles.length > 0 && !hasRequiredRole) {
        this.logSecurityEvent('INSUFFICIENT_PRIVILEGES', {
          user: req.user.username,
          userRoles: userRoles,
          requiredRoles: requiredRoles,
          path: req.path,
          ip: req.ip
        });
        return res.status(403).json({ 
          error: `Roles insuficientes. Se requiere: ${requiredRoles.join(' o ')}`,
          pattern: 'Gateway Offloading - Authorization'
        });
      }

      next();
    };
  }

  /**
   * Obtener logs de seguridad
   */
  getSecurityLogs(limit = 50) {
    return this.securityLogs.slice(-limit).reverse();
  }

  /**
   * Obtener estadísticas de seguridad
   */
  getSecurityStats() {
    const eventTypes = {};
    this.securityLogs.forEach(log => {
      eventTypes[log.type] = (eventTypes[log.type] || 0) + 1;
    });

    return {
      totalEvents: this.securityLogs.length,
      eventTypes: eventTypes,
      pattern: 'Gateway Offloading',
      description: 'Patrón de seguridad que centraliza responsabilidades de seguridad en el gateway'
    };
  }
}

// Instancia global del gateway offloading
const gatewayOffloading = new GatewayOffloading();

module.exports = {
  GatewayOffloading,
  gatewayOffloading
};