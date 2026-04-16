'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno

const app = express();
const PORT = process.env.PORT || 3000;

// Importar rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const rutasIndex = require('./routes'); // Esto es opcional si defines rutas agrupadas en /routes/index.js

// -------------------
// 🔧 Middlewares
// -------------------
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------
// 🔗 Conexión a MongoDB
// -------------------
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Conectado a MongoDB');
}).catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
});

// -------------------
// 🛣️ Rutas
// -------------------
app.use('/api/usuarios', usuarioRoutes);

// Ruta raíz de prueba
app.get('/', (req, res) => {
    res.send('🚀 Servidor funcionando correctamente');
});

// Si tienes rutas agrupadas en /routes/index.js (opcional)
app.use(rutasIndex); // Este `routes/index.js` debe exportar un router agrupado

// -------------------
// ▶️ Iniciar servidor
// -------------------
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
