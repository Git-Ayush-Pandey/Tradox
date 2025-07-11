import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
function Signup() {
  const [inputValue, setInputValue] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const { name, email, phone, password } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };
  const handleError = (err) =>
    toast.error(err, {
      position: "bottom-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "bottom-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:3002/signup",
        {
          ...inputValue,
        },
        { withCredentials: true }
      );
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        setTimeout(() => {
          window.location.href = "http://localhost:3000/";
        }, 1000);
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
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
    <div className="container  mb-5">
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
          <form
            onSubmit={handleSubmit}
            className="border p-4 rounded shadow-sm bg-light"
          >
            <div class="form-row align-items-center">
              <div className="row">
                <div class="col-sm-3 my-1" style={{ width: "50%" }}>
                  <label class="sr-only" for="inlineFormInputGroupUsername">
                    name
                  </label>
                  <div class="input-group">
                    <div class="input-group-prepend">
                      <div class="input-group-text">@</div>
                    </div>
                    <input
                      type="text"
                      class="form-control"
                      id="inlineFormInputGroupUsername"
                      placeholder="name"
                      name="name"
                      onChange={handleOnChange}
                      value={name}
                      required
                    />
                  </div>
                </div>
                <div class="col-sm-3 my-1" style={{ width: "50%" }}>
                  <label class="sr-only" for="inlineFormInputName">
                    email
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="email"
                    placeholder="example@gmail.com"
                    name="email"
                    value={email}
                    onChange={handleOnChange}
                    required
                  />
                </div>
              </div>

              <div className="row m-0 mt-3 align-items-center mb-3">
                <div className="col-auto p-0  d-flex align-items-center">
                  <img
                    src="media/images/Flag_of_India.svg"
                    alt="Indian_Flag_Logo"
                    style={{ height: "20px" }}
                  />
                  <span className="fw-bold">+91</span>
                </div>
                <div className="p-0 col">
                  <input
                    type="number"
                    className="form-control"
                    id="user_mobile"
                    name="phone"
                    placeholder="Enter your mobile number"
                    min="1000000000"
                    max="9999999999"
                    value={phone}
                    onChange={handleOnChange}
                    required
                    autofocus
                  />
                </div>
              </div>
              <div class="form-group" style={{ width: "70%" }}>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div class="col-auto my-1">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="autoSizingCheck2"
                  />
                  <label class="form-check-label" for="autoSizingCheck2">
                    Remember me
                  </label>
                </div>
              </div>
              <div class="col-auto my-1">
                <button type="submit" class="btn btn-primary mb-2">
                  Submit
                </button>
              </div>
            </div>
            <span className="text-muted m-0">
              Already have an account?{" "}
              <Link to={"/login"} className="blue-link">
                Login
              </Link>{" "}
              here.
            </span>
          </form>

          <p className="text-muted text-12 m-0">
            By proceeding, you agree to the Zerodha
            <a className="blue-link" href="link">
              {" "}
              terms{" "}
            </a>
            &amp;{" "}
            <a className="blue-link" href="link">
              privacy policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
