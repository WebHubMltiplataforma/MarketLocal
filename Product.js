const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede tener más de 1000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['ropa', 'electronica', 'hogar', 'vehiculos', 'herramientas', 'terrenos']
  },
  condition: {
    type: String,
    required: [true, 'La condición es requerida'],
    enum: ['nuevo', 'usado', 'como-nuevo']
  },
  images: [String],
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['disponible', 'vendido', 'reservado'],
    default: 'disponible'
  },
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Product', productSchema);