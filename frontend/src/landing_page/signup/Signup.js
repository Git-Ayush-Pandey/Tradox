import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import OTPVerifyWindow from "./OTPVerifyWindow"; // adjust path if needed
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
    setInputValue({
      ...inputValue,
      [name]: value,
    });
    if (name === "email") {
      setVerified((prev) => ({ ...prev, email: false }));
    }
    if (name === "phone") {
      setVerified((prev) => ({ ...prev, phone: false }));
    }
  };
  const handleError = (err) =>
    toast.error(err, {
      position: "top-right",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
    });
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
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          window.location.href = process.env.REACT_APP_REDIRECT_URL;
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      const msg = error.response.data.error;
      handleError(msg);
    }
    setInputValue({
      ...inputValue,
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };
  return (
    <div className="container  mb-5" style={{ paddingTop: "50px" }}>
      <div className="text-center mt-5  p-3">
        <h1 style={{ color: "#404040" }}>
          Open a free demat and trading account online
        </h1>
        <h3 className="text-muted mt-3 mb-5 fs-4 fw-normal">
          Start investing brokerage free and join a community of 1.6+ crore
          investors and traders
        </h3>
      </div>
      <div className="row">
        <div className="col-6">
          <img src="media/images/signup.png" alt="" style={{ width: "90%" }} />
        </div>
        <div className="col-6" style={{ alignContent: "center" }}>
          <h2>Signup Account</h2>
          <form onSubmit={handleSubmit} className="p-4 rounded shadow bg-white">
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label fw-semibold">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="form-control"
                  name="name"
                  value={name}
                  onChange={handleOnChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label fw-semibold">
                  Email
                </label>
                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    name="email"
                    value={email}
                    onChange={handleOnChange}
                    placeholder="example@gmail.com"
                    required
                  />
                  {verified.email ? (
                    <span className="input-group-text text-success">✅</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleOpenOTP("email")}
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label htmlFor="phone" className="form-label fw-semibold">
                  Mobile Number
                </label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input
                    type="number"
                    id="phone"
                    className="form-control"
                    name="phone"
                    value={phone}
                    onChange={handleOnChange}
                    placeholder="Enter phone number"
                    required
                  />
                  {verified.phone ? (
                    <span className="input-group-text text-success">✅</span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleOpenOTP("phone")}
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="password" className="form-label fw-semibold">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Choose a strong password"
                  required
                />
              </div>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberCheck"
              />
              <label className="form-check-label" htmlFor="rememberCheck">
                Remember me
              </label>
            </div>

            <div className="mb-3">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={!verified.email || !verified.phone}
              >
                Create Account
              </button>
            </div>

            <p className="text-muted text-center">
              Already have an account?{" "}
              <Link to={"/login"} className="text-primary text-decoration-none">
                Login here
              </Link>
            </p>
          </form>

          <p className="text-muted text-12 m-0">
            By proceeding, you agree to the Tradox
            <Link to="/terms" className="blue-link">
              {" "}
              terms{" "}
            </Link>
            &amp;
            <Link to="/privacy" className="blue-link">
              {" "}
              privacy policy
            </Link>
          </p>
        </div>
      </div>
      <OTPVerifyWindow
        open={!!showOTP.type}
        type={showOTP.type}
        value={showOTP.value}
        onClose={() => setShowOTP({ type: "", value: "" })}
        onVerified={handleVerified}
      />
    </div>
  );
}

export default Signup;
