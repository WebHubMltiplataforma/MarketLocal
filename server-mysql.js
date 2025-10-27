require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5500',
    credentials: true
}));
app.use(express.json());

// Pool de conexiones MySQL para Of Everything
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Inicializar base de datos Of Everything
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Crear tablas para Of Everything
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                type ENUM('buyer', 'seller') NOT NULL,
                phone VARCHAR(20),
                address TEXT,
                bio TEXT,
                rating DECIMAL(3,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                category ENUM('electronics', 'fashion', 'home', 'vehicles', 'properties', 'services', 'other') NOT NULL,
                image_url VARCHAR(500),
                seller_id INT,
                active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Base de datos Of Everything (MySQL) inicializada correctamente');
        connection.release();
    } catch (error) {
        console.error('❌ Error inicializando base de datos Of Everything:', error);
    }
}

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

// ========== ENDPOINTS OF EVERYTHING ========== //

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({ 
            success: true, 
            message: '✅ Of Everything - Servidor y base de datos funcionando',
            database: 'MySQL',
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: '❌ Of Everything - Error de conexión a BD' 
        });
    }
});

// Registrar usuario
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, type } = req.body;

        if (!name || !email || !password || !type) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        // Verificar si el usuario existe
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado en Of Everything' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insertar usuario
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, type) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, type]
        );

        // Generar token
        const token = jwt.sign(
            { 
                userId: result.insertId, 
                email: email, 
                type: type,
                name: name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: '✅ Usuario registrado en Of Everything',
            token: token,
            user: {
                id: result.insertId,
                name: name,
                email: email,
                type: type
            }
        });

    } catch (error) {
        console.error('Error en registro Of Everything:', error);
        res.status(500).json({ error: 'Error interno del servidor Of Everything' });
    }
});

// Login usuario
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verificar password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                type: user.type,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: '✅ Bienvenido a Of Everything',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                phone: user.phone,
                address: user.address,
                bio: user.bio,
                rating: user.rating
            }
        });

    } catch (error) {
        console.error('Error en login Of Everything:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener productos
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT p.*, u.name as seller_name, u.email as seller_email 
            FROM products p 
            JOIN users u ON p.seller_id = u.id 
            WHERE p.active = TRUE
            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            products: products
        });

    } catch (error) {
        console.error('Error obteniendo productos Of Everything:', error);
        res.status(500).json({ error: 'Error obteniendo productos' });
    }
});

// Agregar producto
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { name, description, price, category, image_url } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        const [result] = await pool.execute(
            `INSERT INTO products (name, description, price, category, image_url, seller_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, price, category, image_url, req.user.userId]
        );

        res.status(201).json({
            success: true,
            message: '✅ Producto agregado a Of Everything',
            productId: result.insertId
        });

    } catch (error) {
        console.error('Error agregando producto Of Everything:', error);
        res.status(500).json({ error: 'Error agregando producto' });
    }
});

// Obtener productos del usuario
app.get('/api/user/products', authenticateToken, async (req, res) => {
    try {
        const [products] = await pool.execute(
            'SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC',
            [req.user.userId]
        );

        res.json({
            success: true,
            products: products
        });

    } catch (error) {
        console.error('Error obteniendo productos del usuario Of Everything:', error);
        res.status(500).json({ error: 'Error obteniendo productos' });
    }
});

// Actualizar perfil
app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, phone, address, bio } = req.body;

        await pool.execute(
            `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, bio = ? 
             WHERE id = ?`,
            [name, email, phone, address, bio, req.user.userId]
        );

        res.json({
            success: true,
            message: '✅ Perfil actualizado en Of Everything'
        });

    } catch (error) {
        console.error('Error actualizando perfil Of Everything:', error);
        res.status(500).json({ error: 'Error actualizando perfil' });
    }
});

// Inicializar servidor Of Everything
const PORT = process.env.PORT || 3000;

async function startServer() {
    await initializeDatabase();
    
    app.listen(PORT, () => {
        console.log(`🚀 Of Everything - Servidor MySQL ejecutándose en: http://localhost:${PORT}`);
        console.log(`📊 Panel de administración: http://localhost:${PORT}/api/health`);
    });
}

startServer().catch(console.error);