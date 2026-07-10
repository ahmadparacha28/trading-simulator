import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStocks();
    fetchPortfolio();
    fetchTransactions();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/stocks"
      );

      setStocks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/portfolio/1"
      );

      setPortfolio(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/transactions/1"
      );

      setTransactions(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const buyStock = async (stockId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/portfolio/buy",
        {
          user_id: 1,
          stock_id: stockId,
          quantity: 1,
        }
      );

      setMessage("Stock purchased successfully!");
      fetchPortfolio();
      fetchTransactions();
    } catch (error) {
      console.error(error);
      setMessage("Purchase failed");
    }
  };

  const sellStock = async (stockId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/portfolio/sell",
        {
          user_id: 1,
          stock_id: stockId,
          quantity: 1,
        }
      );

      setMessage("Stock sold successfully!");
      fetchPortfolio();
      fetchTransactions();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
        "Sell failed"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Trading Simulator</h1>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      <h2>Available Stocks</h2>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginBottom: "40px",
        }}
      >
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.id}>
              <td>{stock.symbol}</td>
              <td>{stock.company_name}</td>
              <td>${stock.current_price}</td>
              <td>
                <button onClick={() => buyStock(stock.id)}>
                  Buy 1 Share
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>My Portfolio</h2>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginBottom: "40px",
        }}
      >
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total Value</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {portfolio.map((item) => (
            <tr key={item.id}>
              <td>{item.symbol}</td>
              <td>{item.company_name}</td>
              <td>{item.quantity}</td>
              <td>${item.current_price}</td>
              <td>${item.total_value}</td>
              <td>
                <button
                  onClick={() => sellStock(item.stock_id)}
                >
                  Sell 1 Share
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Transaction History</h2>

      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th>Type</th>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total Amount</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.transaction_type}</td>
              <td>{tx.symbol}</td>
              <td>{tx.quantity}</td>
              <td>${tx.price}</td>
              <td>${tx.total_amount}</td>
              <td>
                {new Date(tx.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;