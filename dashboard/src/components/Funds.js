import { useEffect, useState } from "react";
import axios from "axios";
import FundWindow from "../windows/FundWindow";

const Funds = () => {
  const [fund, setFund] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // "add" or "withdraw"
  const [amount, setAmount] = useState("");

  const fetchFunds = async () => {
    try {
      const res = await axios.get("http://localhost:3002/funds", {
        withCredentials: true,
      });
      setFund(res.data);
    } catch (err) {
      console.error("Error fetching fund data:", err);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  if (!fund) return <p>Loading fund data...</p>;

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    try {
      // Use correct backend route: /funds/add or /funds/withdraw
      const url = `http://localhost:3002/funds/${modalType}`;
      await axios.post(
        url,
        { amount: parseFloat(amount) },
        { withCredentials: true }
      );

      await fetchFunds(); // Refresh fund info
      setModalOpen(false);
      setAmount("");
    } catch (err) {
      alert("Transaction failed");
      console.error("Fund transfer error:", err);
    }
  };

  return (
    <>
      <div className="funds text-center d-flex flex-column align-items-center justify-content-center py-3">
        <p className="mb-3 fw-semibold fs-5">
          Instant, zero-cost fund transfers with UPI
        </p>
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-success me-2"
            onClick={() => {
              setModalType("add");
              setModalOpen(true);
            }}
          >
            Add Funds
          </button>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setModalType("withdraw");
              setModalOpen(true);
            }}
          >
            Withdraw
          </button>
               {modalOpen && (
          <FundWindow
            type={modalType}
            amount={amount}
            setAmount={setAmount}
            onCancel={() => setModalOpen(false)}
            onConfirm={handleSubmit}
          />
        )}
        </div>

      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>
          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{fund.availableMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{fund.usedMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">{fund.availableCash.toFixed(2)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{fund.openingBalance.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>{fund.payin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>{fund.span.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>{fund.deliveryMargin.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>{fund.exposure.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>{fund.optionsPremium.toFixed(2)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>{fund.collateralLiquid.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>{fund.collateralEquity.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>
                {(fund.collateralLiquid + fund.collateralEquity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <button className="btn btn-outline-info">Open Account</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
