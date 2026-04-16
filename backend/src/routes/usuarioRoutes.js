'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const { recuperarCuenta, resetPassword } = require('../controllers/userController');

/**
 * @route   GET /usuarios
 * @desc    Obtener todos los usuarios (sin contraseña)
 */
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-contrasena');
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al obtener usuarios'
        });
    }
});

/**
 * @route   POST /usuarios/register
 * @desc    Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
    try {
        const {
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena
        } = req.body;

        // Validación básica de campos obligatorios
        if (!nombre || !tipoDoc || !doc || !correo || !telefono ||
            !departamento || !ciudad || !barrio || !direccion || !pago || !contrasena) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ $or: [{ correo }, { doc }] });

        if (usuarioExistente) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El correo o documento ya está registrado'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena: hashedPassword
        });

        await nuevoUsuario.save();

        res.status(201).json({
            exito: true,
            mensaje: 'Usuario registrado exitosamente'
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);

        // Error por claves únicas duplicadas (correo o documento)
        if (error.code === 11000) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El correo o documento ya está registrado (clave duplicada)'
            });
        }

        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al registrar usuario'
        });
    }
});

/**
 * @route   POST /usuarios/login
 * @desc    Iniciar sesión de usuario
 */
router.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Correo y contraseña son obligatorios'
            });
        }

        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Credenciales incorrectas (correo no existe)'
            });
        }

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!esValida) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Contraseña incorrecta'
            });
        }

        // Eliminar contraseña antes de enviar al frontend
        const usuarioSinContrasena = usuario.toObject();
        delete usuarioSinContrasena.contrasena;

        res.status(200).json({
            exito: true,
            mensaje: '✅ Inicio de sesión exitoso',
            usuario: usuarioSinContrasena
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al iniciar sesión'
        });
    }
});

/**
 * @route   POST /usuarios/recuperar
 * @desc    Recuperar contraseña por correo
 */
router.post('/recuperar', recuperarCuenta);

/**
 * @route   POST /usuarios/reset-password
 * @desc    Restablecer contraseña con código
 */
router.post('/reset-password', resetPassword);

module.exports = router;
