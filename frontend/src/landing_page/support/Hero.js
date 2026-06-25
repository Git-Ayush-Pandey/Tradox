import { useState } from "react";
import { Link } from "react-router-dom";

function Hero() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
    setSearchQuery("");
  };

  return (
    <section
      className="container-fluid"
      style={{ paddingTop: "50px", height: "400px" }}
      id="supportHero"
    >
      <div className="row">
        <div className="col-7">
          <h4>Support Portal</h4>
          <h1 className="fs-3 mt-5">
            Search for an answer or browse help topics to create a ticket
          </h1>

          <div style={{ position: "relative", width: "100%" }} className="mb-4">
            <input
              type="text"
              placeholder="Eg. track account opening"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingRight: "40px" }}
            />
            <span
              onClick={handleSearch}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#007bff",
                fontSize: "18px",
              }}
            >
              🔍
            </span>
          </div>

          <div className="d-flex flex-wrap gap-.5">
            <p>
              <Link to="/track-account">Track account opening</Link>
            </p>
            <p>
              <Link to="/segment-activation">Track segment activation</Link>
            </p>
            <p>
              <Link to="/intraday-margins">Intraday margins</Link>
            </p>
            <p>
              <Link to="/kite-manual">Kite user manual</Link>
            </p>
          </div>
        </div>

        <div className="col-5">
          <Link to="/tickets">Track Tickets</Link>
          <h1 className="fs-3 mt-5">Featured</h1>
          <ol>
            <li>
              <Link to="/exclusion-fno">
                Exclusion of F&O contracts on 8 securities from August 29, 2025
              </Link>
            </li>
            <br />
            <li>
              <Link to="/expiry-revision">
                Revision in expiry day of Index and Stock derivatives contracts
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
