// =======================
// 📦 app.js
// Configuración principal de la app Express
// =======================

'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ---------------------
// 🔧 Middlewares globales
// ---------------------
app.use(cors()); // Permite solicitudes desde cualquier origen
app.use(express.json()); // Permite parsear JSON en body
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios
app.use(morgan('dev')); // Logger de peticiones HTTP

// ---------------------
// 🛣️ Rutas
// ---------------------
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('✅ API Backend House Solutions funcionando correctamente');
});

module.exports = app;
