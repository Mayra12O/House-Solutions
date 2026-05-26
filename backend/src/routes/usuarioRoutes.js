'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');
const { recuperarCuenta, resetPassword } = require('../controllers/userController');


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

        // Registrarse desde la plataforma pública siempre crea un cliente.
        const nuevoUsuario = new Usuario({
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, rol: 'cliente',
            contrasena: hashedPassword
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
 * @route   POST /usuarios/admin
 * @desc    Crear un usuario nuevo (solo admin)
 */
router.post('/admin', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const {
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena, rol
        } = req.body;

        if (!nombre || !tipoDoc || !doc || !correo || !telefono ||
            !departamento || !ciudad || !barrio || !direccion || !pago || !contrasena) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const usuarioExistente = await Usuario.findOne({ $or: [{ correo }, { doc }] });
        if (usuarioExistente) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El correo o documento ya está registrado'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = new Usuario({
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago,
            rol: ['cliente', 'empleado', 'admin'].includes(rol) ? rol : 'cliente',
            contrasena: hashedPassword
        });

        await nuevoUsuario.save();

        res.status(201).json({
            exito: true,
            mensaje: 'Usuario creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear usuario admin:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El correo o documento ya está registrado (clave duplicada)'
            });
        }
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al crear usuario'
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

        // Proteger contra registros incompletos que podrían causar excepciones
        if (!usuario.contrasena) {
            console.error('Usuario encontrado sin contraseña:', usuario._id);
            return res.status(401).json({
                exito: false,
                mensaje: 'Credenciales incorrectas'
            });
        }

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!esValida) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Contraseña incorrecta'
            });
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                correo: usuario.correo,
                nombre: usuario.nombre,
                rol: usuario.rol || 'cliente'
            },
            process.env.JWT_SECRET || 'clave_recuperacion',
            { expiresIn: '8h' }
        );

        // Eliminar contraseña antes de enviar al frontend
        const usuarioSinContrasena = usuario.toObject();
        delete usuarioSinContrasena.contrasena;

        res.status(200).json({
            exito: true,
            mensaje: '✅ Inicio de sesión exitoso',
            usuario: usuarioSinContrasena,
            token
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

/**
 * @route   GET /usuarios/me
 * @desc    Obtener datos del usuario autenticado
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).select('-contrasena');
        if (!usuario) {
            return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
});

/**
 * @route   PATCH /usuarios/me
 * @desc    Actualizar datos personales del usuario autenticado (excepto documento)
 */
router.patch('/me', authMiddleware, async (req, res) => {
    try {
        const {
            nombre, tipoDoc, correo, telefono,
            departamento, ciudad, barrio, direccion, pago
        } = req.body;

        const usuario = await Usuario.findById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
        }

        if (!nombre || !tipoDoc || !correo || !telefono || !departamento || !ciudad || !barrio || !direccion || !pago) {
            return res.status(400).json({ exito: false, mensaje: 'Todos los campos del perfil son obligatorios' });
        }

        if (usuario.correo !== correo) {
            const correoExistente = await Usuario.findOne({ correo });
            if (correoExistente && correoExistente._id.toString() !== usuario._id.toString()) {
                return res.status(400).json({ exito: false, mensaje: 'El correo ya está en uso' });
            }
        }

        usuario.nombre = nombre;
        usuario.tipoDoc = tipoDoc;
        usuario.correo = correo.toLowerCase();
        usuario.telefono = telefono;
        usuario.departamento = departamento;
        usuario.ciudad = ciudad;
        usuario.barrio = barrio;
        usuario.direccion = direccion;
        usuario.pago = pago;

        await usuario.save();

        const usuarioSinContrasena = usuario.toObject();
        delete usuarioSinContrasena.contrasena;

        res.status(200).json({ exito: true, mensaje: 'Perfil actualizado correctamente', usuario: usuarioSinContrasena });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        if (error.name === 'ValidationError') {
            const mensajes = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ exito: false, mensaje: mensajes });
        }
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
});

/**
 * @route   PATCH /usuarios/me/password
 * @desc    Cambiar contraseña del usuario autenticado
 */
router.patch('/me/password', authMiddleware, async (req, res) => {
    try {
        const { actualContrasena, nuevaContrasena } = req.body;

        if (!actualContrasena || !nuevaContrasena) {
            return res.status(400).json({ exito: false, mensaje: 'Contraseña actual y nueva son obligatorias' });
        }

        if (typeof nuevaContrasena !== 'string' || nuevaContrasena.length < 8) {
            return res.status(400).json({ exito: false, mensaje: 'La nueva contraseña debe tener al menos 8 caracteres' });
        }

        const usuario = await Usuario.findById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
        }

        const esValida = await bcrypt.compare(actualContrasena, usuario.contrasena);
        if (!esValida) {
            return res.status(401).json({ exito: false, mensaje: 'Contraseña actual incorrecta' });
        }

        const salt = await bcrypt.genSalt(10);
        usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);
        await usuario.save();

        res.status(200).json({ exito: true, mensaje: 'Contraseña cambiada correctamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
});

/**
 * @route   PATCH /usuarios/:id/rol
 * @desc    Cambiar rol de un usuario (solo admin)
 */
router.patch('/:id/rol', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const { rol } = req.body;
        const validRoles = ['cliente', 'empleado', 'admin'];

        if (!rol || !validRoles.includes(rol)) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Rol inválido. Debe ser cliente, empleado o admin.'
            });
        }

        if (req.user.id === req.params.id && rol !== 'admin') {
            return res.status(400).json({
                exito: false,
                mensaje: 'No puedes cambiar tu propio rol desde aquí.'
            });
        }

        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        usuario.rol = rol;
        await usuario.save();

        res.status(200).json({
            exito: true,
            mensaje: 'Rol actualizado correctamente',
            usuario: { ...usuario.toObject(), contrasena: undefined }
        });
    } catch (error) {
        console.error('Error al cambiar rol de usuario:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno al cambiar el rol' });
    }
});

/**
 * @route   GET /usuarios
 * @desc    Obtener todos los usuarios (solo admin)
 */
router.get('/', authMiddleware, requireAdmin, async (req, res) => {
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
 * @route   DELETE /usuarios/:id
 * @desc    Eliminar un usuario (solo admin)
 */
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ exito: false, mensaje: 'No puedes eliminar tu propia cuenta desde aquí' });
        }

        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuarioEliminado) {
            return res.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
        }

        res.status(200).json({ exito: true, mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno al eliminar usuario' });
    }
});

module.exports = router;
