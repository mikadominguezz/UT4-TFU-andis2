const jwtLib = require('jsonwebtoken');

function authenticateJWT(secret) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token faltante' });
    const token = auth.slice('Bearer '.length);
    jwtLib.verify(token, secret, (err, payload) => {
      if (err) return res.status(401).json({ error: 'Token inválido' });
      req.user = { id: payload.sub, username: payload.username, roles: payload.roles || [] };
      next();
    });
  };
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const roles = (req.user && req.user.roles) || [];
    const ok = roles.some(r => allowedRoles.includes(r));
    if (!ok) return res.status(403).json({ error: 'No autorizado (roles insuficientes)' });
    next();
  };
}

module.exports = { authenticateJWT, authorizeRoles };