import { useState } from "react";

function Hero() {

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
    setSearchQuery("")
  };

  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5" id="supportWrapper">
        <h4>Support Portal</h4>
        <a href="link">Track Tickets</a>
      </div>
      <div className="row">
        <div className="col-7 p-3">
          <h1 className="fs-3">
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
                fontSize: "18px"
              }}
            >
              🔍
            </span>
          </div>

          <div className="d-flex flex-wrap gap-3">
            <p>
              <a href="link">Track account opening</a>
            </p>
            <p>
              <a href="link">Track segment activation</a>
            </p>
            <p>
              <a href="link">Intraday margins</a>
            </p>
            <p>
              <a href="link">Kite user manual</a>
            </p>
          </div>
        </div>
        <div className="col-5 p-3">
          <h1 className="fs-3">Featured</h1>
          <ol>
            <li>
              <a href="link">
                Exclusion of F&O contracts on 8 securities from August 29, 2025
              </a>
            </li>
            <br />
            <li>
              <a href="link">
                Revision in expiry day of Index and Stock derivatives contracts
              </a>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export default Hero;
