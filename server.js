const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware ESENCIAL
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.log('❌ Error de conexión a MongoDB:', err));

// SERVIR ARCHIVOS ESTÁTICOS CORRECTAMENTE
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para CSS
app.get('/css/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/css/styles.css'));
});

// Ruta para JS
app.get('/js/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/js/app.js'));
});

// Ruta para Font Awesome (CDN está bien, pero por si acaso)
app.get('/fontawesome/*', (req, res) => {
  res.redirect('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
});

// Importar rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: '🚀 MarketLocal API funcionando',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// RUTA PRINCIPAL - Servir el HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Para todas las demás rutas, servir el HTML (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🎯 MARKETLOCAL INICIADO CORRECTAMENTE');
  console.log('='.repeat(60));
  console.log(`📍 URL Principal: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
});