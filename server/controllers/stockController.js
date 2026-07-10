const pool = require("../config/db");

const getStocks = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM stocks ORDER BY symbol ASC"
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
  getStocks,
};