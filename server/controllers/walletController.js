const pool = require("../config/db");

const getWallet = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT wallet_balance FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  getWallet,
};