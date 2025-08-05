import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./components/Home";
import { LivePriceProvider } from "./contexts/LivePriceContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { GeneralContextProvider } from "./contexts/GeneralContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GeneralContextProvider>
      <LivePriceProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </LivePriceProvider>
    </GeneralContextProvider>
  </React.StrictMode>
);
