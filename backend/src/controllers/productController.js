const db = require('../config/db');
const redisClient = require('../config/redis');
const { logAction } = require('../services/auditService');

/**
 * Retrieves products with support for Redis caching, search, price filtering, and pagination.
 */
const getAllProducts = async (req, res) => {
  try {
    const { search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    
    // Construct a dynamic cache key based on query parameters to ensure precise cache hits
    const cacheKey = `cache:products:q:${search || 'all'}:min:${minPrice || 'none'}:max:${maxPrice || 'none'}:p:${page}:l:${limit}`;

    // 1. Check Redis cache first
    if (redisClient.isOpen) {
      const cachedProducts = await redisClient.get(cacheKey);
      if (cachedProducts) {
        return res.status(200).json({
          status: 'SUCCESS',
          source: 'cache',
          ...JSON.parse(cachedProducts)
        });
      }
    }

    let query = 'SELECT * FROM products WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    // 2. Optional keyword search on title or description
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // 3. Optional price filtering
    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      queryParams.push(minPrice);
      paramIndex++;
    }
    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      queryParams.push(maxPrice);
      paramIndex++;
    }

    // 4. Pagination (LIMIT and OFFSET)
    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const offset = (parsedPage - 1) * parsedLimit;

    query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(parsedLimit, offset);

    const result = await db.query(query, queryParams);

    const responsePayload = {
      page: parsedPage,
      limit: parsedLimit,
      count: result.rows.length,
      products: result.rows
    };

    // 5. Save query result to Redis cache for 60 seconds
    if (redisClient.isOpen) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(responsePayload));
    }

    res.status(200).json({
      status: 'SUCCESS',
      source: 'database',
      ...responsePayload
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

    // Invalidate all product cache variants upon creating a new product
    if (redisClient.isOpen) {
      const keys = await redisClient.keys('cache:products:*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
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