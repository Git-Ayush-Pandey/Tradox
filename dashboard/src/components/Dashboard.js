// Fixed Dashboard.js - Content routing only (no layout containers)

import { Route, Routes } from "react-router-dom";
import Funds from "./Funds";
import Holdings from "./Holdings";
import ProtectedRoute from "../routes/ProtectedRoute";
import Orders from "./Orders";
import Positions from "./Positions";
import Summary from "./Summary";
import { GeneralContextProvider } from "../contexts/GeneralContext";

const Dashboard = () => {
  return (
    <GeneralContextProvider>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/holdings" element={<Holdings />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/funds" element={<Funds />} />
        </Routes>
      </ProtectedRoute>
    </GeneralContextProvider>
  );
};

export default Dashboard;