// mongodb-setup.js - Configuración inicial de MongoDB

use tienda_bienes_online;

// Crear colecciones
db.createCollection("users");
db.createCollection("products");
db.createCollection("locations");

// Crear índices
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "sellerId": 1 });
db.products.createIndex({ "active": 1 });
db.locations.createIndex({ "userId": 1 });
db.locations.createIndex({ "coordinates": "2dsphere" });

// Insertar datos de ejemplo
db.users.insertMany([
    {
        name: "Ana García",
        email: "ana@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0L6kZPuY9LqSYPHj5O5VWrC0aUcU6C2oV9JjW2", // password123
        type: "seller",
        phone: "555-123-4567",
        address: "Av. Principal 123, CDMX",
        bio: "Vendedora confiable con 5 años de experiencia",
        rating: 4.5,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Carlos López",
        email: "carlos@example.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0L6kZPuY9LqSYPHj5O5VWrC0aUcU6C2oV9JjW2", // password123
        type: "buyer",
        phone: "555-987-6543",
        address: "Calle Secundaria 456, CDMX",
        bio: "Comprador frecuente buscando buenas ofertas",
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

// Obtener IDs de usuarios insertados
const ana = db.users.findOne({ email: "ana@example.com" });

db.products.insertMany([
    {
        name: "iPhone 13 Pro",
        description: "Smartphone en excelente estado, 256GB, color azul",
        price: 18000.00,
        category: "electronica",
        imageUrl: "https://images.unsplash.com/photo-1632661674596-618e45e56c53?ixlib=rb-4.0.3&w=400",
        sellerId: ana._id,
        sellerName: "Ana García",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: "Sofá de 3 plazas",
        description: "Sofá cómodo, color gris, poco uso, perfecto estado",
        price: 4500.00,
        category: "hogar",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&w=400",
        sellerId: ana._id,
        sellerName: "Ana García",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

db.locations.insertMany([
    {
        userId: ana._id,
        coordinates: {
            type: "Point",
            coordinates: [-99.1332, 19.4326]
        },
        address: "Ciudad de México, CDMX",
        createdAt: new Date()
    }
]);

// Verificar inserción
print("✅ Base de datos MongoDB inicializada correctamente");
print("📊 Usuarios insertados: " + db.users.countDocuments());
print("📦 Productos insertados: " + db.products.countDocuments());
print("📍 Ubicaciones insertadas: " + db.locations.countDocuments());