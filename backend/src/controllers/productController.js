const db = require('../config/db');
const redisClient = require('../config/redis');
const { logAction } = require('../services/auditService');

const getAllProducts = async (req, res) => {
  try {
    const cacheKey = 'cache:products:all';
    
    // Check Redis cache first
    if (redisClient.isOpen) {
      const cachedProducts = await redisClient.get(cacheKey);
      if (cachedProducts) {
        return res.status(200).json({
          status: 'SUCCESS',
          source: 'cache',
          count: JSON.parse(cachedProducts).length,
          products: JSON.parse(cachedProducts)
        });
      }
    }

    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    
    // Save to Redis cache for 60 seconds
    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result.rows));
    }

    res.status(200).json({
      status: 'SUCCESS',
      source: 'database',
      count: result.rows.length,
      products: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProduct = async (req, res) => {
  const { title, description, price, stock } = req.body;
  const sellerId = req.user.id;

  try {
    const insertResult = await db.query(
      `INSERT INTO products (title, description, price, stock, seller_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, price, stock, sellerId]
    );

    const newProduct = insertResult.rows[0];

    // Invalidate product cache upon creation
    if (redisClient.isOpen) {
      await redisClient.del('cache:products:all');
    }

    await logAction('PRODUCT_CREATED', sellerId, {
      productId: newProduct.id,
      title: newProduct.title,
      price: newProduct.price
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllProducts, createProduct };