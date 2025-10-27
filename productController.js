const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, category, condition, location } = req.body;

    if (!title || !description || !price || !category || !condition || !location) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos.'
      });
    }

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      location: {
        address: location,
        city: location.split(',')[0] || location,
        state: location.split(',')[1] || ''
      },
      seller: req.user.id
    });

    await product.populate('seller', 'name email location');

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente.',
      product
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el producto.'
    });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, condition, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    
    const filter = { status: 'disponible' };
    
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('seller', 'name email location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los productos.'
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email location');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.'
      });
    }

    product.views += 1;
    await product.save();

    res.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto.'
    });
  }
};

exports.getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error obteniendo productos del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tus productos.'
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado.'
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este producto.'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente.'
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto.'
    });
  }
};