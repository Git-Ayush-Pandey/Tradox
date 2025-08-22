import { useContext, useEffect, useState } from "react";
import { addFunds, FetchFunds, withdrawFunds, getPnL } from "../hooks/api";
import FundWindow from "../components/windows/FundWindow";
import GeneralContext from "../contexts/GeneralContext";

const Funds = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [amount, setAmount] = useState("");
  const { user, setUser, showAlert, funds, setFunds } =
    useContext(GeneralContext);

  const fetchFunds = async () => {
    try {
      const res = await FetchFunds();
      setFunds(res.data);

      const pnlRes = await getPnL();
      if (pnlRes.data.success) {
        setUser((prev) => ({
          ...prev,
          realizedPL: pnlRes.data.realizedPL,
          unrealizedPL: pnlRes.data.unrealizedPL,
          totalPL: pnlRes.data.totalPL,
        }));
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to fetch funds or PnL.");
    }
  };

  useEffect(() => {
    fetchFunds();
    // eslint-disable-next-line
  }, []);
  if (!funds) return <p>Loading fund data...</p>;

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      showAlert("warning", "Enter a valid amount.");
      return;
    }

    try {
      if (modalType === "add") {
        await addFunds({ amount: parseFloat(amount) });
        showAlert("success", "Funds added successfully.");
      } else if (modalType === "withdraw") {
        await withdrawFunds({ amount: parseFloat(amount) });
        showAlert("success", "Withdrawal successful.");
      }
      await fetchFunds();
      setModalOpen(false);
      setAmount("");
    } catch (err) {
      showAlert("error", "Transaction failed.");
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

      <div className="row g-4 align-items-start">
        <div className="col-md-6">
          <div className="card shadow-sm rounded-3">
            <div className="card-body">
              <h5 className="card-title d-flex justify-content-between align-items-center mb-4">
                <span>Equity</span>
              </h5>
              <table className="table table-bordered table-sm mb-0">
                <tbody>
                  <tr>
                    <td>Available margin</td>
                    <td>
                      <strong>
                        {(funds?.availableMargin ?? 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Used margin</td>
                    <td>
                      <strong>{(funds?.usedMargin ?? 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr className="table-active">
                    <td>Available cash</td>
                    <td>
                      <strong>{(funds?.availableCash ?? 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Opening balance</td>
                    <td>{(funds?.openingBalance ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Payin</td>
                    <td>{(funds?.payin ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Total P&L</td>
                    <td
                      style={{
                        color: (user?.totalPL ?? 0) >= 0 ? "green" : "red",
                      }}
                    >
                      <strong>{(user?.totalPL ?? 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Realised P&L</td>
                    <td
                      style={{
                        color: (user?.realizedPL ?? 0) >= 0 ? "green" : "red",
                      }}
                    >
                      <strong>{(user?.realizedPL ?? 0).toFixed(2)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Unrealised P&L</td>
                    <td
                      style={{
                        color: (user?.unrealizedPL ?? 0) >= 0 ? "green" : "red",
                      }}
                    >
                      <strong>{(user?.unrealizedPL ?? 0).toFixed(2)}</strong>
                    </td>
                  </tr>

                  <tr>
                    <td>SPAN</td>
                    <td>{(funds?.span ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Delivery margin</td>
                    <td>{(funds?.deliveryMargin ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Exposure</td>
                    <td>{(funds?.exposure ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr className="table-active">
                    <td>Options premium</td>
                    <td>{(funds?.optionsPremium ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Collateral (Liquid funds)</td>
                    <td>{(funds?.collateralLiquid ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Collateral (Equity)</td>
                    <td>{(funds?.collateralEquity ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total collateral</strong>
                    </td>
                    <td>
                      <strong>
                        {(
                          funds?.collateralLiquid ??
                          0 + funds?.collateralEquity ??
                          0
                        ).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm rounded-3">
            <div className="card-body">
              <h5 className="card-title d-flex justify-content-between align-items-center mb-4">
                <span>Commodity</span>
              </h5>
              <table className="table table-bordered table-sm mb-0">
                <tbody>
                  <tr>
                    <td>Available margin</td>
                    <td>
                      <strong>
                        {(funds?.commodityAvailableMargin ?? 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Used margin</td>
                    <td>
                      <strong>
                        {(funds?.commodityUsedMargin ?? 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                  <tr className="table-active">
                    <td>Available cash</td>
                    <td>
                      <strong>
                        {(funds?.commodityAvailableCash ?? 0).toFixed(2)}
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Opening balance</td>
                    <td>{(funds?.commodityOpeningBalance ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Payin</td>
                    <td>{(funds?.commodityPayin ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SPAN</td>
                    <td>{(funds?.commoditySpan ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Delivery margin</td>
                    <td>{(funds?.commodityDeliveryMargin ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Exposure</td>
                    <td>{(funds?.commodityExposure ?? 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Options premium</td>
                    <td>{(funds?.commodityOptionsPremium ?? 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
