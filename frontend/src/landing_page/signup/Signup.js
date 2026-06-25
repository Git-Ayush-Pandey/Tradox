import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import OTPVerifyWindow from "./OTPVerifyWindow";
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showOTP, setShowOTP] = useState({ type: "", value: "" });
  const [verified, setVerified] = useState({ email: false, phone: false });
  const { name, email, phone, password } = inputValue;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({ ...inputValue, [name]: value });
    if (name === "email") setVerified((prev) => ({ ...prev, email: false }));
    if (name === "phone") setVerified((prev) => ({ ...prev, phone: false }));
  };

  const handleError = (err) => toast.error(err, { position: "top-right" });
  const handleSuccess = (msg) => toast.success(msg, { position: "top-right" });

  const handleOpenOTP = (type) => {
    const value = inputValue[type];
    if (!value) return toast.error(`Please enter ${type} first`);
    setShowOTP({ type, value });
  };

  const handleVerified = () => {
    setVerified((prev) => ({ ...prev, [showOTP.type]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/signup`,
        { ...inputValue },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          // FIX: Fall back to REACT_APP_DASHBOARD_URL if REACT_APP_REDIRECT_URL is absent
          const dest =
            process.env.REACT_APP_REDIRECT_URL ||
            process.env.REACT_APP_DASHBOARD_URL ||
            "http://localhost:3001";
          window.location.href = dest;
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      // FIX: Safe error extraction — error.response may be undefined on network failure
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      handleError(msg);
      console.error("Signup error:", error);
    }
    setInputValue({ name: "", email: "", phone: "", password: "" });
  };

  return (
    <div className="container mb-5" style={{ paddingTop: "50px" }}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4 text-center">Create Account</h2>
          <form
            onSubmit={handleSubmit}
            className="border p-4 rounded shadow-sm bg-light"
          >
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={handleOnChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleOnChange}
                  required
                />
                <button
                  type="button"
                  className={`btn btn-sm ${
                    verified.email ? "btn-success" : "btn-outline-secondary"
                  }`}
                  onClick={() => handleOpenOTP("email")}
                  disabled={verified.email}
                >
                  {verified.email ? "✓ Verified" : "Verify"}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <div className="input-group">
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  id="phone"
                  placeholder="Enter your phone"
                  value={phone}
                  onChange={handleOnChange}
                  required
                />
                <button
                  type="button"
                  className={`btn btn-sm ${
                    verified.phone ? "btn-success" : "btn-outline-secondary"
                  }`}
                  onClick={() => handleOpenOTP("phone")}
                  disabled={verified.phone}
                >
                  {verified.phone ? "✓ Verified" : "Verify"}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={handleOnChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Sign Up
            </button>
            <br />
            <span className="text-muted">
              Already have an account?{" "}
              <Link to="/login" className="blue-link">
                Login
              </Link>
              .
            </span>
          </form>
        </div>
      </div>

      {showOTP.type && (
        <OTPVerifyWindow
          open={!!showOTP.type}
          onClose={() => setShowOTP({ type: "", value: "" })}
          type={showOTP.type}
          value={showOTP.value}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}

export default Signup;
