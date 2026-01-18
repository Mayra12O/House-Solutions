const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Configurar nodemailer (ajústalo con tus datos reales)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Registrar usuario
 */
exports.registrarUsuario = async (req, res) => {
    try {
        const {
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena
        } = req.body;

        // Validar campos
        if (
            !nombre || !tipoDoc || !doc || !correo || !telefono ||
            !departamento || !ciudad || !barrio || !direccion ||
            !pago || !contrasena
        ) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        // Verificar existencia previa
        const usuarioExistente = await Usuario.findOne({ $or: [{ correo }, { doc }] });
        if (usuarioExistente) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El correo o documento ya está registrado'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const nuevoUsuario = new Usuario({
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena: hashedPassword
        });

        await nuevoUsuario.save();

        res.status(201).json({
            exito: true,
            mensaje: 'Cuenta creada exitosamente'
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al registrar el usuario'
        });
    }
};

/**
 * Iniciar sesión
 */
exports.loginUsuario = async (req, res) => {
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
                mensaje: 'Usuario no existe o credenciales inválidas'
            });
        }

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!esValida) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Credenciales inválidas'
            });
        }

        const usuarioSinContrasena = usuario.toObject();
        delete usuarioSinContrasena.contrasena;

        res.status(200).json({
            exito: true,
            mensaje: 'Inicio de sesión exitoso',
            usuario: usuarioSinContrasena
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al iniciar sesión'
        });
    }
};

/**
 * Recuperar cuenta por correo (envía código)
 */
exports.recuperarCuenta = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Correo es obligatorio para recuperación'
            });
        }

        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El correo no está registrado'
            });
        }

        // Generar código de 6 dígitos (válido 15 minutos) y guardarlo en el usuario
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        usuario.resetCode = code;
        usuario.resetCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutos
        await usuario.save();

        // Enviar correo con el código únicamente (manejado en try/catch para no bloquear)
        try {
            await transporter.sendMail({
                from: `"House Solutions" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
                to: correo,
                subject: 'Recuperación de cuenta - House Solutions',
                html: `
                    <p>Hola ${usuario.nombre},</p>
                    <p>Usa el siguiente código para recuperar tu contraseña (válido 15 minutos):</p>
                    <p><strong>${code}</strong></p>
                    <p>Si no solicitaste este cambio, ignora este correo.</p>
                `
            });
        } catch (mailErr) {
            console.error('Error enviando correo de recuperación:', mailErr);
            // No fallar la petición principal si el correo no se envía
        }

        res.json({
            exito: true,
            mensaje: '📩 Se enviaron instrucciones a tu correo (si existe en nuestro sistema).'
        });
    } catch (error) {
        console.error('Error al recuperar cuenta:', error);
        res.status(500).json({
            exito: false,
            mensaje: '❌ Error al procesar la recuperación de cuenta'
        });
    }
};

/**
 * Restablecer contraseña usando únicamente el código de recuperación
 */
exports.resetPassword = async (req, res) => {
    try {
        // Normalizar y validar entrada
        const rawCode = req.body && (req.body.code || req.body.code === 0 ? req.body.code : undefined);
        const password = req.body && req.body.password;

        const code = rawCode !== undefined && rawCode !== null ? String(rawCode).trim() : '';

        if (!code || !password) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere el código de recuperación y la nueva contraseña'
            });
        }
        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                exito: false,
                mensaje: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Log para depuración (verifica qué llega desde el frontend)
        console.log(`[resetPassword] request from ${req.ip} - code="${code}", passwordLength=${password.length}`);

        // Buscar usuario por código (intentar como string y, si es numérico, como número)
        let usuario = await Usuario.findOne({ resetCode: code });

        if (!usuario) {
            // Si el código es numérico, intentar buscar por número también
            const numeric = Number(code);
            if (!Number.isNaN(numeric)) {
                usuario = await Usuario.findOne({ resetCode: numeric });
            }
        }

        if (!usuario) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Código de recuperación inválido'
            });
        }

        if (!usuario.resetCodeExpires || usuario.resetCodeExpires < Date.now()) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Código de recuperación expirado. Solicita uno nuevo.'
            });
        }

        // Actualizar contraseña y eliminar campos de recuperación
        const hashedPassword = await bcrypt.hash(password, 10);
        usuario.contrasena = hashedPassword;
        usuario.resetCode = undefined;
        usuario.resetCodeExpires = undefined;
        await usuario.save();

        // Notificar al usuario que su contraseña fue cambiada (intenta, pero no falla si no se puede enviar)
        try {
            await transporter.sendMail({
                from: `"House Solutions" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
                to: usuario.correo,
                subject: 'Contraseña actualizada - House Solutions',
                html: `
                    <p>Hola ${usuario.nombre},</p>
                    <p>Tu contraseña ha sido actualizada correctamente. Si no realizaste este cambio, contacta soporte inmediatamente.</p>
                `
            });
        } catch (mailErr) {
            console.error('No se pudo enviar correo de confirmación:', mailErr);
        }

        res.json({
            exito: true,
            mensaje: '✅ Contraseña actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al restablecer la contraseña'
        });
    }
};

