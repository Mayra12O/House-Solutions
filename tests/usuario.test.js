// tests/usuario.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Asegúrate de que tu archivo app.js exporta correctamente la instancia de Express

describe('Pruebas de la API de Usuarios', () => {

    // Conexión a la BD antes de todas las pruebas (si usas una BD de test separada, mejor aún)
    beforeAll(async () => {
        // Puedes conectar manualmente si tu app no lo hace automáticamente
        // await mongoose.connect(process.env.TEST_DB_URI);
    });

    // Test: Obtener lista de usuarios
    test('GET /api/usuarios debe responder con status 200 y un array', async () => {
        const response = await request(app).get('/api/usuarios');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true); // Valida que responde con array
    });

    // Cerrar conexión después de todos los tests
    afterAll(async () => {
        await mongoose.connection.close();
    });
});
