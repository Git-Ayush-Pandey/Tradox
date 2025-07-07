function Team() {
  return (
    <div className="container">
      <div className="row p-5 ">
        <h1 className=" text-center">People</h1>
      </div>

      <div
        className="row p-5  fs-6 text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-5 pl-8 text-center">
          <img
            src="/media/images/ayush-pandey.png"
            style={{ borderRadius: "100%", width: "60%" }}
          />
          <h4 className="mt-5">Ayush Pandey</h4>
          <h6>Developer of this Website.</h6>
        </div>
        <div className="col p-5">
          <p>
            Nithin bootstrapped and founded Zerodha in 2010 to overcome the
            hurdles he faced during his decade long stint as a trader. Today,
            Zerodha has changed the landscape of the Indian broking industry.
          </p>
          <p>
            He is a member of the SEBI Secondary Market Advisory Committee
            (SMAC) and the Market Data Advisory Committee (MDAC).
          </p>
          <p>Playing basketball is his zen.</p>
          <p>
            Connect on{" "}
            <a
              className="blue-link"
              href="link"
              style={{ textDecoration: "none" }}
            >
              {" "}
              Homepage
            </a>
            /{" "}
            <a
              className="blue-link"
              href="link"
              style={{ textDecoration: "none" }}
            >
              {" "}
              TradingQnA{" "}
            </a>
            /
            <a
              className="blue-link"
              href="link"
              style={{ textDecoration: "none" }}
            >
              {" "}
              Twitter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
