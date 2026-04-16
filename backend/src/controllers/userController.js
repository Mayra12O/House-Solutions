const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const transporter = require('../config/mailer');
const jwt = require('jsonwebtoken'); // <-- añadido
require('dotenv').config();

/**
 * Obtener todos los usuarios registrados (sin contraseña)
 */
exports.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-contrasena');
        res.status(200).json(usuarios);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Registrar nuevo usuario
 */
exports.createUsuario = async (req, res) => {
    try {
        const {
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena
        } = req.body;

        // Validación de campos
        if (!nombre || !tipoDoc || !doc || !correo || !telefono ||
            !departamento || !ciudad || !barrio || !direccion || !pago || !contrasena) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Validar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            $or: [{ correo }, { doc }]
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: 'El correo o documento ya está registrado' });
        }

        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombre, tipoDoc, doc, correo, telefono,
            departamento, ciudad, barrio, direccion,
            pago, contrasena: hashedPassword
        });

        await nuevoUsuario.save();

        const usuarioSinContrasena = nuevoUsuario.toObject();
        delete usuarioSinContrasena.contrasena;

        res.status(201).json({
            exito: true,
            mensaje: 'Usuario registrado exitosamente',
            usuario: usuarioSinContrasena
        });

    } catch (err) {
        console.error('Error al registrar usuario:', err);

        if (err.name === 'ValidationError') {
            const errores = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ error: errores.join(', ') });
        }

        if (err.code === 11000) {
            return res.status(400).json({ error: 'El correo o documento ya está registrado' });
        }

        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Iniciar sesión
 */
exports.loginUsuario = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ exito: false, mensaje: 'Correo y contraseña son obligatorios' });
        }

        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas' });
        }

        const esValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!esValida) {
            return res.status(401).json({ exito: false, mensaje: 'Credenciales incorrectas' });
        }

        const usuarioSinContrasena = usuario.toObject();
        delete usuarioSinContrasena.contrasena;

        res.status(200).json({
            exito: true,
            mensaje: 'Inicio de sesión exitoso',
            usuario: usuarioSinContrasena
        });

    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

/**
 * Recuperar cuenta - enviar correo con código/token
 */
exports.recuperarCuenta = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ exito: false, mensaje: 'Correo es obligatorio' });
        }

        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({ exito: false, mensaje: 'El correo no está registrado' });
        }

        // Generar código de recuperación (8 chars)
        const tokenCode = Math.random().toString(36).substr(2, 8);

        // Crear JWT que contiene el id del usuario y el código; expira en 15 minutos
        const recoveryToken = jwt.sign(
            { id: usuario._id, code: tokenCode },
            process.env.JWT_SECRET || 'clave_recuperacion',
            { expiresIn: '15m' }
        );

        // Preparar contenido del correo (incluye el código y enlace con token)
        const mailOptions = {
            from: process.env.CORREO_FROM || process.env.EMAIL_USER || 'no-reply@example.com',
            to: correo,
            subject: 'Recuperación de contraseña - House Solutions',
            html: `
                <p>Hola ${usuario.nombre},</p>
                <p>Recibimos una solicitud para recuperar tu cuenta.</p>
                <p><strong>Código de recuperación:</strong> ${tokenCode}</p>
                <p>O haz clic aquí para restablecer tu contraseña: 
                <a href="http://localhost:3000/reset_password.html?token=${encodeURIComponent(recoveryToken)}">Restablecer contraseña</a></p>
                <p>Si no fuiste tú, puedes ignorar este mensaje.</p>
            `
        };

        // Intentar enviar correo, pero no hacer que la falla detenga la respuesta con el token
        let mailSent = false;
        try {
            await transporter.sendMail(mailOptions);
            mailSent = true;
        } catch (mailErr) {
            console.error('Error enviando correo de recuperación (no crítico):', mailErr);
            // continuamos para devolver el token al frontend que inició la petición
        }

        // Responder con token para que el frontend lo guarde en localStorage (aunque el correo falle)
        return res.json({
            exito: true,
            mensaje: mailSent ? 'Se enviaron instrucciones a tu correo' : 'No se pudo enviar el correo, pero puedes usar el token recibido en la respuesta.',
            token: recoveryToken,
            mailSent
        });

    } catch (error) {
        console.error('Error procesando recuperarCuenta:', error);
        res.status(500).json({ exito: false, mensaje: 'No se pudo procesar la solicitud. Intenta más tarde.' });
    }
};

/**
 * Restablecer contraseña usando únicamente el código de recuperación
 */
exports.resetPassword = async (req, res) => {
    try {
        // Esperamos: correo, code, password, token (token es obligatorio)
        const correo = req.body && req.body.correo ? String(req.body.correo).trim().toLowerCase() : '';
        const rawCode = req.body && (req.body.code || req.body.code === 0 ? req.body.code : undefined);
        const password = req.body && req.body.password;
        const token = req.body && req.body.token ? String(req.body.token) : '';

        const code = rawCode !== undefined && rawCode !== null ? String(rawCode).trim() : '';

        if (!correo || !code || !password || !token) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Se requiere correo, código, token y la nueva contraseña'
            });
        }

        if (typeof password !== 'string' || password.length < 8) {
            return res.status(400).json({
                exito: false,
                mensaje: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // Verificar y decodificar token JWT
        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET || 'clave_recuperacion');
        } catch (err) {
            console.error('Token inválido o expirado:', err);
            return res.status(401).json({
                exito: false,
                mensaje: 'Token inválido o expirado. Solicita un nuevo código.'
            });
        }

        // payload debe contener id y code
        if (!payload || !payload.id || !payload.code) {
            return res.status(400).json({ exito: false, mensaje: 'Token inválido' });
        }

        // Buscar usuario por id y verificar correo coincide
        const usuario = await Usuario.findById(payload.id);
        if (!usuario || usuario.correo.toLowerCase() !== correo) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Usuario no encontrado o correo no coincide con el token'
            });
        }

        // Comparar el código enviado por el usuario con el que viene en el token
        if (payload.code !== code) {
            return res.status(401).json({
                exito: false,
                mensaje: 'Código de recuperación inválido'
            });
        }

        // Actualizar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        usuario.contrasena = hashedPassword;
        await usuario.save();

        // Notificar al usuario
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

