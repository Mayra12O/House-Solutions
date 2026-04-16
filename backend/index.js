// index.js
require('dotenv').config(); // Cargar variables de entorno

const app = require('./app'); // Importar app Express
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/housesolutions';

mongoose.connect(MONGO_URI, {
  // useNewUrlParser y useUnifiedTopology ahora son valores por defecto
})
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err);
  });
