const pool = require("../config/db");

const getTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT
        t.id,
        s.symbol,
        s.company_name,
        t.transaction_type,
        t.quantity,
        t.price,
        t.total_amount,
        t.created_at
      FROM transactions t
      JOIN stocks s
        ON t.stock_id = s.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  getTransactions,
};