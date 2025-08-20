import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
  });
  const { email, password } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };

  const handleError = (err) =>
    toast.error(err, {
      position: "top-right",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        inputValue,
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
      const errorMsg = error.response?.data?.message || "Something went wrong";
      handleError(errorMsg);
      console.error("Login error:", error);
    }

    setInputValue({
      email: "",
      password: "",
    });
  };

  return (
    <div className="container mt-5" style={{ paddingTop: "50px" }}>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4 text-center">Login</h2>
          <form
            onSubmit={handleSubmit}
            className="border p-4 rounded shadow-sm bg-light"
          >
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
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
                placeholder="Enter your password"
                value={password}
                onChange={handleOnChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
            <br />
            <span className="text-muted">
              Don't have an account?{" "}
              <Link to={"/signup"} className="blue-link">
                Signup
              </Link>
              .
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
