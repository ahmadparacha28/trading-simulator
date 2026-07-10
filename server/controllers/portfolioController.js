const pool = require("../config/db");

const buyStock = async (req, res) => {
  try {
    const { user_id, stock_id, quantity } = req.body;

    const stockResult = await pool.query(
      "SELECT * FROM stocks WHERE id = $1",
      [stock_id]
    );

    if (stockResult.rows.length === 0) {
      return res.status(404).json({
        message: "Stock not found",
      });
    }

    const stock = stockResult.rows[0];

    const existing = await pool.query(
      `
      SELECT * FROM portfolios
      WHERE user_id = $1 AND stock_id = $2
      `,
      [user_id, stock_id]
    );

    let portfolioData;

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        `
        UPDATE portfolios
        SET quantity = quantity + $1
        WHERE user_id = $2 AND stock_id = $3
        RETURNING *
        `,
        [quantity, user_id, stock_id]
      );

      portfolioData = updated.rows[0];
    } else {
      const result = await pool.query(
        `
        INSERT INTO portfolios
        (user_id, stock_id, quantity)
        VALUES ($1,$2,$3)
        RETURNING *
        `,
        [user_id, stock_id, quantity]
      );

      portfolioData = result.rows[0];
    }

    await pool.query(
      `
      INSERT INTO transactions
      (
        user_id,
        stock_id,
        transaction_type,
        quantity,
        price,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        user_id,
        stock_id,
        "BUY",
        quantity,
        stock.current_price,
        quantity * stock.current_price,
      ]
    );

    res.status(201).json(portfolioData);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const sellStock = async (req, res) => {
  try {
    const { user_id, stock_id, quantity } = req.body;

    const existing = await pool.query(
      `
      SELECT * FROM portfolios
      WHERE user_id = $1 AND stock_id = $2
      `,
      [user_id, stock_id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        message: "Stock not found in portfolio",
      });
    }

    const holding = existing.rows[0];

    if (holding.quantity < quantity) {
      return res.status(400).json({
        message: "Not enough shares to sell",
      });
    }

    const stockResult = await pool.query(
      "SELECT * FROM stocks WHERE id = $1",
      [stock_id]
    );

    const stock = stockResult.rows[0];

    const updated = await pool.query(
      `
      UPDATE portfolios
      SET quantity = quantity - $1
      WHERE user_id = $2 AND stock_id = $3
      RETURNING *
      `,
      [quantity, user_id, stock_id]
    );

    await pool.query(
      `
      INSERT INTO transactions
      (
        user_id,
        stock_id,
        transaction_type,
        quantity,
        price,
        total_amount
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        user_id,
        stock_id,
        "SELL",
        quantity,
        stock.current_price,
        quantity * stock.current_price,
      ]
    );

    res.json(updated.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.stock_id,
        s.symbol,
        s.company_name,
        p.quantity,
        s.current_price,
        (p.quantity * s.current_price) AS total_value
      FROM portfolios p
      JOIN stocks s
        ON p.stock_id = s.id
      WHERE p.user_id = $1
      ORDER BY s.symbol
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  buyStock,
  sellStock,
  getPortfolio,
};
