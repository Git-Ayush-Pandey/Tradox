import { Route, Routes } from "react-router-dom";
import Funds from "./Funds";
import Holdings from "./Holdings";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";

const Dashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Summary />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/holdings" element={<Holdings />} />
      <Route path="/positions" element={<Positions />} />
      <Route path="/funds" element={<Funds />} />
    </Routes>
  );
};

export default Dashboard;
