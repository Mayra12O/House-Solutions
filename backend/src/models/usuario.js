'use strict';

const mongoose = require('mongoose');

// Esquema del modelo de Usuario
const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [3, 'El nombre debe tener al menos 3 caracteres']
    },
    tipoDoc: {
        type: String,
        required: [true, 'El tipo de documento es obligatorio'],
        enum: ['CC', 'TI', 'CE'] // CC: Cédula, TI: Tarjeta Identidad, CE: Cédula Extranjería
    },
    doc: {
        type: String,
        required: [true, 'El número de documento es obligatorio'],
        unique: true,
        trim: true
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Correo inválido']
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        trim: true
    },
    departamento: {
        type: String,
        required: [true, 'El departamento es obligatorio'],
        trim: true
    },
    ciudad: {
        type: String,
        required: [true, 'La ciudad es obligatoria'],
        trim: true
    },
    barrio: {
        type: String,
        required: [true, 'El barrio es obligatorio'],
        trim: true
    },
    direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        trim: true
    },
    pago: {
        type: String,
        required: [true, 'La forma de pago es obligatoria'],
        enum: ['Efectivo', 'Tarjeta', 'Nequi', 'Daviplata', 'PSE']
    },
    contrasena: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
        // Se almacena de forma segura (hash) en el controlador
    }
}, {
    timestamps: true // Crea automáticamente createdAt y updatedAt
});

// Exportar el modelo
module.exports = mongoose.model('Usuario', userSchema);
