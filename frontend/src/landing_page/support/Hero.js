function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5 " id="supportWrapper">
        <h4>Support Portal</h4>
        <a href="link">Track Tickets</a>
      </div>
      <div className="row">
        <div className="col-7 p-3">
          <h1 className="fs-3">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input placeholder="Eg. how do I activate F&O" className="mb-4" />
          <br />
          <div className="d-flex flex-wrap">
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
