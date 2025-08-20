import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Home from "./components/Home";
import { LivePriceProvider } from "./contexts/LivePriceContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { GeneralContextProvider } from "./contexts/GeneralContext";
import { OrdersProvider } from "./contexts/OrdersContext";
import ProtectedRoute from "./routes/ProtectedRoute";

const resizeObserverErr =
  /ResizeObserver loop completed with undelivered notifications/;

window.addEventListener("error", (e) => {
  if (resizeObserverErr.test(e.message)) {
    e.stopImmediatePropagation();
  }
});

window.addEventListener("unhandledrejection", (e) => {
  if (resizeObserverErr.test(e.reason?.message || "")) {
    e.stopImmediatePropagation();
  }
});

const originalError = console.error;
console.error = (...args) => {
  if (args.length > 0 && resizeObserverErr.test(args[0])) {
    return;
  }
  originalError.apply(console, args);
};


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GeneralContextProvider>
      <LivePriceProvider>
        <OrdersProvider>
          <ProtectedRoute>
            <BrowserRouter>
              <Routes>
                <Route path="/*" element={<Home />} />
              </Routes>
            </BrowserRouter>
          </ProtectedRoute>
        </OrdersProvider>
      </LivePriceProvider>
    </GeneralContextProvider>
  </React.StrictMode>
);
