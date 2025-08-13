import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./components/Home";
import { LivePriceProvider } from "./contexts/LivePriceContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { GeneralContextProvider } from "./contexts/GeneralContext";

// ✅ Suppress ResizeObserver loop limit exceeded errors
const resizeObserverErr = /ResizeObserver loop completed with undelivered notifications/;
const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && resizeObserverErr.test(args[0])) {
    return; // skip logging this specific harmless error
  }
  originalError.apply(console, args);
};

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
