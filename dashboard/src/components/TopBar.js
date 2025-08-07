import { useContext } from "react";
import Menu from "./Menu";
import GeneralContext from "../contexts/GeneralContext";

const TopBar = () => {
  const { showAlert } = useContext(GeneralContext);

  const indices = {
    SANDP: {
      name: "S&P 500",
      price: 5524.12,
      percent: "+0.46%",
    },
    DJIA: {
      name: "DJIA",
      price: 39783.21,
      percent: "-0.19%",
    },
  };

  const getPercentStyle = (percent) => {
    if (!percent) return {};
    if (percent.startsWith("+")) return { color: "green" };
    if (percent.startsWith("-")) return { color: "red" };
    return {};
  };

  const getArrow = (percent) => {
    if (percent.startsWith("+")) return "▲";
    if (percent.startsWith("-")) return "▼";
    return "";
  };

  const IndexBlock = ({ index, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginRight: "24px",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: "1rem", fontWeight: "600" }}>{index.name}</span>
      <div style={{ display: "flex", gap: "8px", fontSize: "0.78rem" }}>
        <span style={{ color: "grey" }}>₹{index.price.toLocaleString()}</span>
        <span style={getPercentStyle(index.percent)}>
          {getArrow(index.percent)} {index.percent}
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="topbar-container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#fff",
      }}
    >
      <div></div>
      <div className="indices-group" style={{ display: "flex", alignItems: "center" }}>
        <IndexBlock
          index={indices.SANDP}
          onClick={() => showAlert("info", "Open S&P 500 analytics")}
        />
      </div>
      <div className="indices-group" style={{ display: "flex", alignItems: "center" }}>
        <IndexBlock
          index={indices.DJIA}
          onClick={() => showAlert("info", "Open DJIA analytics")}
        />
      </div>
      <Menu />
    </div>
  );
};

export default TopBar;
