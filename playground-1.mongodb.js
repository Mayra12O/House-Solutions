/* global use, db */
// MongoDB Playground - Creación de colección con validación

use('housesolutions');

db.createCollection('usuarios', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "nombre", "tipoDoc", "doc", "correo", "telefono",
                "departamento", "ciudad", "barrio", "direccion",
                "pago", "contrasena"
            ],
            properties: {
                nombre: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                tipoDoc: {
                    enum: ["CC", "TI", "CE"],
                    description: "Debe ser uno de los valores permitidos y es obligatorio"
                },
                doc: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                correo: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto única y es obligatorio"
                },
                telefono: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                departamento: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                ciudad: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                barrio: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                direccion: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                pago: {
                    enum: ["Efectivo", "Tarjeta", "Nequi", "Daviplata", "PSE"],
                    description: "Debe ser uno de los valores permitidos y es obligatorio"
                },
                contrasena: {
                    bsonType: "string",
                    description: "Debe ser una cadena de texto y es obligatorio"
                },
                createdAt: {
                    bsonType: "date",
                    description: "Timestamp generado automáticamente"
                },
                updatedAt: {
                    bsonType: "date",
                    description: "Timestamp generado automáticamente"
                }
            }
        }
    }
});

