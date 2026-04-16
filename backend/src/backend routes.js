'use strict';

const express = require('express');
const router = express.Router();

// =========================
// 🚏 Rutas del sistema
// =========================

// 📌 Ruta para gestión de usuarios
const usuarioRoutes = require('./usuarioRoutes');
router.use('/api/usuarios', usuarioRoutes);

// Puedes agregar más rutas aquí:
// const productosRoutes = require('./productosRoutes');
// router.use('/api/productos', productosRoutes);

// Ruta de prueba base
router.get('/', (req, res) => {
    res.send('✅ API Backend House Solutions - Rutas centralizadas funcionando');
});

module.exports = router;
