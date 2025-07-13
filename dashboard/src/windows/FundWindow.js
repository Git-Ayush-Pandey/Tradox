import "./Window.css";

const FundWindow = ({ type, amount, setAmount, onCancel, onConfirm }) => {
  const title = type === "add" ? "Add Funds" : "Withdraw Funds";

  return (
    <div
      style={{
        position: "absolute",
        top: "50px", // directly under the buttons
        left: "50%",
        transform: "translateX(-50%)",
        width: "300px",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        borderRadius: "10px",
        padding: "20px",
        zIndex: 999,
      }}
    >
      <h5 className="text-center mb-3">{title}</h5>
      <input
        type="number"
        className="form-control mb-3"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div className="d-flex justify-content-between">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
};

export default FundWindow;
