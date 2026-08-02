import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {

  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);


  const fetchDashboard = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/api/dashboard/1"
      );

      console.log(response.data);

      setData(response.data);

    } catch(error) {

      console.error(
        "Dashboard Error:",
        error
      );

    }

  };


  if(!data){

    return (
      <h3>
        Loading Dashboard...
      </h3>
    );

  }


  return (

    <div className="dashboard">

      <h2>
        Trading Dashboard
      </h2>


      <div className="dashboard-grid">


        <div className="card">
          <h3>Wallet</h3>
          <p>
            ${data.wallet_balance}
          </p>
        </div>



        <div className="card">
          <h3>Portfolio Value</h3>
          <p>
            ${data.portfolio_value}
          </p>
        </div>



        <div className="card">
          <h3>Profit/Loss</h3>
          <p>
            ${data.total_profit_loss}
          </p>
        </div>



        <div className="card">
          <h3>Transactions</h3>
          <p>
            {data.total_transactions}
          </p>
        </div>


      </div>


      <div className="best-stock">

        <h3>
          Best Stock
        </h3>


        {
          data.best_stock ?

          <p>
            {data.best_stock.symbol}
            {" "}
            +$
            {data.best_stock.profit}
          </p>

          :

          <p>
            No stock data
          </p>

        }

      </div>


    </div>

  );

}


export default Dashboard;