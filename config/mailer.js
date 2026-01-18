require('dotenv').config();
const nodemailer = require('nodemailer');

const correo = process.env.CORREO_FROM;
const contrasena = process.env.CORREO_PASS;

if (!correo || !contrasena) {
    throw new Error('❌ Faltan CORREO_FROM o CORREO_PASS en el archivo .env');
}

const domain = correo.split('@')[1]?.toLowerCase();

let service = null;

if (domain.includes('gmail')) {
    service = 'gmail';
} else if (domain.includes('hotmail') || domain.includes('outlook') || domain.includes('live')) {
    service = 'hotmail';
} else {
    console.warn('⚠️ Dominio no reconocido. Puede fallar si el servicio SMTP no se configura correctamente.');
}

const transporter = nodemailer.createTransport({
    service: service,
    auth: {
        user: correo,
        pass: contrasena,
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Error al configurar el correo:', error);
    } else {
        console.log('📬 Mailer configurado correctamente');
    }
});

module.exports = transporter;
