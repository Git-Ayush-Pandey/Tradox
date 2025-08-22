import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import PropTypes from "prop-types";

const formatCurrency = (val) =>
  Number(val).toLocaleString("en-IN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const invested = payload.find((p) => p.dataKey === "investment")?.value || 0;
  const pnl = payload.find((p) => p.dataKey === "pnl")?.value || 0;

  return (
    <div
      className="custom-tooltip"
      style={{
        background: "#fff",
        padding: "10px",
        border: "1px solid #ccc",
      }}
    >
      <strong>{label}</strong>
      <div>Investment: ${invested.toFixed(2)}</div>
      <div style={{ color: pnl >= 0 ? "#2e7d32" : "#c62828" }}>
        P&L: ${pnl.toFixed(2)}
      </div>
    </div>
  );
};

const PortfolioStackedChart = ({ data, title = "Portfolio Composition" }) => {
  const chartData = data.map((item) => {
    const investment = item.avg * item.qty;
    const current = item.price * item.qty;
    const pnl = current - investment;
    return {
      name: item.name,
      investment,
      pnl,
    };
  });

  return (
    <div className="mt-4">
      <h4>{title}</h4>
      <div style={{ width: "100%", height: 400, minHeight: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="investment" stackId="a" fill="#c5cae9" />
            <Bar dataKey="pnl" stackId="a">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#a5d6a7" : "#ef9a9a"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

PortfolioStackedChart.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
};

export default PortfolioStackedChart;
