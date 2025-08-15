function Hero() {
  return (
    <div className="container">
      <div className="row mt-5 mb-5 p-5 text-center">
        <h1 className="fs-2 fw-bold">
          Redefining the Trading Experience.
          <br />
          Powered by Simplicity & Technology.
        </h1>
        <p className="text-muted mt-3" style={{ fontSize: "1.1em" }}>
          Tradox is a modern stock trading platform concept, designed to make
          market participation more accessible, transparent, and efficient for
          everyone.
        </p>
      </div>

      <div
        className="row p-5 mt-5 border-top text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.1em" }}
      >
        <div className="col-lg-6 col-12 p-4">
          <p>
            Tradox started as a personal project to explore the world of
            financial technology. The goal is simple — to remove barriers faced
            by traders and investors through intuitive design, cost efficiency,
            and cutting-edge tools.
          </p>
          <p>
            Built with real-time APIs and a robust backend, Tradox mimics the
            core features of professional brokerage platforms — including
            watchlists, live price updates, and seamless order management.
          </p>
          <p>
            From responsive UI to secure authentication, every feature is
            crafted with a focus on user experience and performance.
          </p>
        </div>

        <div className="col-lg-6 col-12 p-4">
          <p>
            The project also aims to bring educational and community-driven
            resources to help new investors learn about the markets while
            exploring the platform.
          </p>
          <p>
            <a
              className="blue-link"
              href="link"
              style={{ textDecoration: "none" }}
            >
              Tradox Labs
            </a>{" "}
            is a dedicated space for experimenting with new ideas — from
            automated alerts to AI-assisted trading insights.
          </p>
          <p>
            Stay tuned for the latest updates on our{" "}
            <a
              className="blue-link"
              href="link"
              style={{ textDecoration: "none" }}
            >
              blog
            </a>{" "}
            or explore our{" "}
            <a
              className="blue-link"
              href="link"
              style={{ textDecoration: "none" }}
            >
              design philosophy
            </a>{" "}
            to understand the thought process behind the platform.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Hero;
