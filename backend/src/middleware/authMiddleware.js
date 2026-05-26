const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'clave_recuperacion';

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ exito: false, mensaje: 'Token no enviado' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        return next();
    } catch (error) {
        console.error('Error verificando token:', error);
        return res.status(401).json({ exito: false, mensaje: 'Token inválido o expirado' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({ exito: false, mensaje: 'Acceso denegado: solo personal autorizado' });
    }
    next();
}

module.exports = {
    authMiddleware,
    requireAdmin
};
