const pool = require("../config/db");

// Add stock to watchlist
const addToWatchlist = async (req, res) => {
  try {
    const { user_id, stock_id } = req.body;

    const result = await pool.query(
      `
      INSERT INTO watchlist (user_id, stock_id)
      VALUES ($1, $2)
      RETURNING *
      `,
      [user_id, stock_id]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "Stock already exists in watchlist",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get user's watchlist
const getWatchlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        w.id,
        s.id AS stock_id,
        s.symbol,
        s.company_name,
        s.current_price
      FROM watchlist w
      JOIN stocks s
      ON w.stock_id = s.id
      WHERE w.user_id = $1
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

// Remove stock from watchlist
const removeFromWatchlist = async (req, res) => {
  try {
    const { user_id, stock_id } = req.body;

    await pool.query(
      `
      DELETE FROM watchlist
      WHERE user_id = $1
      AND stock_id = $2
      `,
      [user_id, stock_id]
    );

    res.json({
      message: "Removed from watchlist",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist,
};