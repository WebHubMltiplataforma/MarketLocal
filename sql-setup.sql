-- Este archivo puede ser útil para recrear la base de datos desde cero
DROP DATABASE IF EXISTS tienda_bienes_online;
CREATE DATABASE tienda_bienes_online;
USE tienda_bienes_online;

CREATE TABLE users (
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
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category ENUM('ropa', 'hogar', 'electronica', 'propiedades', 'otros') NOT NULL,
    image_url VARCHAR(500),
    seller_id INT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar algunos datos de ejemplo
INSERT INTO users (name, email, password, type) VALUES 
('Vendedor Ejemplo', 'vendedor@example.com', '$2a$12$LQv3c1yqBWVHxkd0L6kZPuY9LqSYPHj5O5VWrC0aUcU6C2oV9JjW2', 'seller'),
('Comprador Ejemplo', 'comprador@example.com', '$2a$12$LQv3c1yqBWVHxkd0L6kZPuY9LqSYPHj5O5VWrC0aUcU6C2oV9JjW2', 'buyer');

INSERT INTO products (name, description, price, category, image_url, seller_id) VALUES
('iPhone 13', 'Smartphone en excelente estado, 128GB', 15000.00, 'electronica', 'https://example.com/iphone.jpg', 1),
('Sofá de 3 plazas', 'Sofá cómodo, color gris, poco uso', 4500.00, 'hogar', 'https://example.com/sofa.jpg', 1);