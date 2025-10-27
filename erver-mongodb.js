require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Configuración (el código completo que te mostré anteriormente)
// ... [todo el código del servidor MongoDB]

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Servidor MongoDB ejecutándose en: http://localhost:${PORT}`);
});