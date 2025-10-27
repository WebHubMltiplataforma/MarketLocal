-- mysql-setup.sql - Configuración inicial de base de datos MySQL

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS tienda_bienes_online;
USE tienda_bienes_online;

-- Tabla de usuarios
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('ropa', 'hogar', 'electronica', 'propiedades', 'otros') NOT NULL,
    image_url VARCHAR(500),
    seller_id INT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_seller (seller_id),
    INDEX idx_active (active)
);

-- Tabla de ubicaciones (para geolocalización)
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_coordinates (latitude, longitude)
);

-- Insertar datos de ejemplo (contraseña: password123)
INSERT INTO users (name, email, password, type, phone, address, bio) VALUES 
('Ana García', 'ana@example.com', '$2a$12$LQv3c1yqBWVHxkd0L6kZPuY9LqSYPHj5O5VWrC0aUcU6C2oV9JjW2', 'seller', '555-123-4567', 'Av. Principal 123, CDMX', 'Vendedora confiable con 5 años de experiencia'),
('Carlos López', 'carlos@example.com', '$2a$12$LQv3c1yqBWVHxkd0L6kZPuY9LqSYPHj5O5VWrC0aUcU6C2oV9JjW2', 'buyer', '555-987-6543', 'Calle Secundaria 456, CDMX', 'Comprador frecuente buscando buenas ofertas');

INSERT INTO products (name, description, price, category, image_url, seller_id) VALUES
('iPhone 13 Pro', 'Smartphone en excelente estado, 256GB, color azul', 18000.00, 'electronica', 'https://images.unsplash.com/photo-1632661674596-618e45e56c53?ixlib=rb-4.0.3&w=400', 1),
('Sofá de 3 plazas', 'Sofá cómodo, color gris, poco uso, perfecto estado', 4500.00, 'hogar', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400', 1),
('Zapatos deportivos', 'Zapatos Nike talla 28, nuevos, originales', 1200.00, 'ropa', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&w=400', 1);

INSERT INTO locations (user_id, latitude, longitude, address) VALUES
(1, 19.4326, -99.1332, 'Ciudad de México, CDMX'),
(2, 19.4350, -99.1400, 'Roma Norte, CDMX');

-- Mostrar tablas creadas
SHOW TABLES;

-- Ver datos de ejemplo
SELECT 'Usuarios:' AS '';
SELECT * FROM users;

SELECT 'Productos:' AS '';
SELECT * FROM products;

SELECT 'Ubicaciones:' AS '';
SELECT * FROM locations;