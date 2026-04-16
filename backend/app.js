// =======================
// 📦 app.js
// Configuración principal de la app Express
// =======================

'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// ---------------------
// 🔧 Middlewares globales
// ---------------------
app.use(cors()); // Permite solicitudes desde cualquier origen
app.use(express.json()); // Permite parsear JSON en body
app.use(express.urlencoded({ extended: true })); // Parsear datos de formularios
app.use(morgan('dev')); // Logger de peticiones HTTP

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// ---------------------
// 🛣️ Rutas
// ---------------------
const usuarioRoutes = require('./src/routes/usuarioRoutes');
app.use('/api/usuarios', usuarioRoutes);

// Ruta raíz - Redirige a login si no está autenticado
app.get('/', (req, res) => {
    // Verificar si hay token en cookies o localStorage (desde cliente)
    // Por ahora redirige a login (puedes agregar lógica de autenticación después)
    res.redirect('/login.html');
});

// Ruta 404 - Servir index.html para rutas no encontradas (para SPA)
app.use((req, res) => {
    const indexPath = path.join(__dirname, '../frontend/index.html');
    res.sendFile(indexPath);
});

module.exports = app;
