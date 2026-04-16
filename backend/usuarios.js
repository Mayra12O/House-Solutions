// usuarios.js
// Modelo de Usuario para House Solutions usando Mongoose

const mongoose = require('mongoose');

// Esquema de usuario
const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    tipoDoc: {
        type: String,
        enum: ['CC', 'TI', 'CE'], // Cédula de Ciudadanía, Tarjeta de Identidad, Cédula de Extranjería
        required: true
    },
    doc: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,           // Evita correos duplicados
        lowercase: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true
    },
    departamento: {
        type: String,
        required: true
    },
    ciudad: {
        type: String,
        required: true
    },
    barrio: {
        type: String,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    pago: {
        type: String,
        enum: ['Efectivo', 'Tarjeta', 'Nequi', 'Daviplata', 'PSE'], // Métodos de pago aceptados
        required: true
    },
    contrasena: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Agrega automáticamente createdAt y updatedAt
});

// Exporta el modelo
module.exports = mongoose.model('Usuario', UsuarioSchema);
