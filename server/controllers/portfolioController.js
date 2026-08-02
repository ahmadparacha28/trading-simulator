const pool = require("../config/db");


// BUY STOCK
const buyStock = async (req, res) => {
  try {
    const { user_id, stock_id, quantity } = req.body;


    // Get stock details
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

    const totalCost = quantity * Number(stock.current_price);


    // Check wallet balance
    const userResult = await pool.query(
      "SELECT wallet_balance FROM users WHERE id = $1",
      [user_id]
    );


    if (userResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    const walletBalance = Number(
      userResult.rows[0].wallet_balance
    );


    if (walletBalance < totalCost) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }



    // Check existing portfolio
    const existing = await pool.query(
      `
      SELECT *
      FROM portfolios
      WHERE user_id = $1
      AND stock_id = $2
      `,
      [
        user_id,
        stock_id
      ]
    );


    let portfolioData;


    // Existing stock
    if (existing.rows.length > 0) {


      const oldQuantity = Number(
        existing.rows[0].quantity
      );


      const oldAveragePrice = Number(
        existing.rows[0].average_buy_price
      );


      const newAveragePrice =
        (
          (oldQuantity * oldAveragePrice) +
          (quantity * Number(stock.current_price))
        )
        /
        (oldQuantity + quantity);



      const updated = await pool.query(
        `
        UPDATE portfolios
        SET
        quantity = quantity + $1,
        average_buy_price = $2
        WHERE user_id = $3
        AND stock_id = $4
        RETURNING *
        `,
        [
          quantity,
          newAveragePrice,
          user_id,
          stock_id
        ]
      );


      portfolioData = updated.rows[0];


    } else {


      // First purchase

      const result = await pool.query(
        `
        INSERT INTO portfolios
        (
          user_id,
          stock_id,
          quantity,
          average_buy_price
        )
        VALUES
        ($1,$2,$3,$4)
        RETURNING *
        `,
        [
          user_id,
          stock_id,
          quantity,
          stock.current_price
        ]
      );


      portfolioData = result.rows[0];

    }



    // Deduct wallet money

    await pool.query(
      `
      UPDATE users
      SET wallet_balance = wallet_balance - $1
      WHERE id = $2
      `,
      [
        totalCost,
        user_id
      ]
    );



    // Add transaction

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
      VALUES
      ($1,$2,$3,$4,$5,$6)
      `,
      [
        user_id,
        stock_id,
        "BUY",
        quantity,
        stock.current_price,
        totalCost
      ]
    );



    res.status(201).json(portfolioData);



  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:"Server Error"
    });

  }
};





// SELL STOCK

const sellStock = async (req,res)=>{

  try{

    const {
      user_id,
      stock_id,
      quantity
    } = req.body;



    const existing = await pool.query(
      `
      SELECT *
      FROM portfolios
      WHERE user_id=$1
      AND stock_id=$2
      `,
      [
        user_id,
        stock_id
      ]
    );



    if(existing.rows.length===0){

      return res.status(404).json({
        message:"Stock not found in portfolio"
      });

    }



    const holding = existing.rows[0];



    if(Number(holding.quantity)<quantity){

      return res.status(400).json({
        message:"Not enough shares"
      });

    }



    const stockResult = await pool.query(
      "SELECT * FROM stocks WHERE id=$1",
      [stock_id]
    );


    const stock = stockResult.rows[0];


    const totalAmount =
      quantity * Number(stock.current_price);



    const updated = await pool.query(
      `
      UPDATE portfolios
      SET quantity = quantity - $1
      WHERE user_id=$2
      AND stock_id=$3
      RETURNING *
      `,
      [
        quantity,
        user_id,
        stock_id
      ]
    );



    // Add money back

    await pool.query(
      `
      UPDATE users
      SET wallet_balance = wallet_balance + $1
      WHERE id=$2
      `,
      [
        totalAmount,
        user_id
      ]
    );



    // Save transaction

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
      VALUES
      ($1,$2,$3,$4,$5,$6)
      `,
      [
        user_id,
        stock_id,
        "SELL",
        quantity,
        stock.current_price,
        totalAmount
      ]
    );



    res.json(updated.rows[0]);



  }catch(error){

    console.error(error);

    res.status(500).json({
      message:"Server Error"
    });

  }

};






// GET PORTFOLIO

const getPortfolio = async(req,res)=>{

try{

const {userId}=req.params;


const result = await pool.query(
`
SELECT

p.id,
p.stock_id,

s.symbol,
s.company_name,

p.quantity,

p.average_buy_price,

s.current_price,


(p.quantity * s.current_price)
AS total_value,


(
(s.current_price - p.average_buy_price)
*
p.quantity
)
AS profit_loss


FROM portfolios p

JOIN stocks s

ON p.stock_id=s.id


WHERE p.user_id=$1

ORDER BY s.symbol

`,
[userId]
);



res.json(result.rows);



}catch(error){

console.error(error);


res.status(500).json({
message:"Server Error"
});


}

};




module.exports={
buyStock,
sellStock,
getPortfolio
};