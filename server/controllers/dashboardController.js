const pool = require("../config/db");

const getDashboard = async (req, res) => {
  try {
    const { userId } = req.params;


    // Wallet
    const wallet = await pool.query(
      `
      SELECT wallet_balance
      FROM users
      WHERE id = $1
      `,
      [userId]
    );


    if (wallet.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }



    // Portfolio Analytics
    const portfolio = await pool.query(
      `
      SELECT

      COALESCE(
        SUM(p.quantity * s.current_price),
        0
      ) AS portfolio_value,


      COALESCE(
        SUM(p.quantity * p.average_buy_price),
        0
      ) AS invested_amount,


      COALESCE(
        SUM(
          (s.current_price - p.average_buy_price)
          *
          p.quantity
        ),
        0
      ) AS total_profit_loss,


      COUNT(p.stock_id) AS total_stocks



      FROM portfolios p

      JOIN stocks s

      ON p.stock_id = s.id


      WHERE p.user_id = $1

      `,
      [userId]
    );




    // Transactions Count

    const transactions = await pool.query(
      `
      SELECT COUNT(*) AS total_transactions

      FROM transactions

      WHERE user_id=$1

      `,
      [userId]
    );





    // Best Performing Stock

    const bestStock = await pool.query(
      `
      SELECT

      s.symbol,

      (
      (s.current_price - p.average_buy_price)
      *
      p.quantity
      )
      AS profit


      FROM portfolios p

      JOIN stocks s

      ON p.stock_id=s.id


      WHERE p.user_id=$1


      ORDER BY profit DESC

      LIMIT 1

      `,
      [userId]
    );




    res.json({

      wallet_balance:
      wallet.rows[0].wallet_balance,


      portfolio_value:
      portfolio.rows[0].portfolio_value,


      invested_amount:
      portfolio.rows[0].invested_amount,


      total_profit_loss:
      portfolio.rows[0].total_profit_loss,


      total_stocks:
      portfolio.rows[0].total_stocks,


      total_transactions:
      transactions.rows[0].total_transactions,


      best_stock:
      bestStock.rows.length > 0
      ? bestStock.rows[0]
      : null

    });



  } catch(error){

    console.error(error);


    res.status(500).json({
      message:"Server Error"
    });

  }
};


module.exports = {
  getDashboard
};