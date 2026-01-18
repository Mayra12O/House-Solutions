// createCollection.js
const { MongoClient } = require('mongodb');

async function createCollection() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('housesolutions');

        await db.createCollection('usuarios', {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: [
                        "nombre", "tipoDoc", "doc", "correo", "telefono",
                        "departamento", "ciudad", "barrio", "direccion",
                        "pago", "contrasena"
                    ],
                    properties: {
                        nombre: { bsonType: "string" },
                        tipoDoc: { enum: ["CC", "TI", "CE"] },
                        doc: { bsonType: "string" },
                        correo: { bsonType: "string" },
                        telefono: { bsonType: "string" },
                        departamento: { bsonType: "string" },
                        ciudad: { bsonType: "string" },
                        barrio: { bsonType: "string" },
                        direccion: { bsonType: "string" },
                        pago: { enum: ["Efectivo", "Tarjeta", "Nequi", "Daviplata", "PSE"] },
                        contrasena: { bsonType: "string" },
                        createdAt: { bsonType: "date" },
                        updatedAt: { bsonType: "date" }
                    }
                }
            }
        });

        console.log('✅ Colección "usuarios" creada con validación.');
    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await client.close();
    }
}

createCollection();
