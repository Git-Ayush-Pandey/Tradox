function Team() {
  return (
    <div className="container">
      <div className="row p-5">
        <h1 className="text-center fw-bold">Meet the Developer</h1>
      </div>

      <div
        className="row p-5 fs-6 text-muted align-items-center"
        style={{ lineHeight: "1.8", fontSize: "1.1em" }}
      >
        <div className="col-lg-4 col-md-5 col-12 text-center mb-4">
          <img
            src="/media/images/ayush-pandey.png"
            style={{
              borderRadius: "50%",
              width: "70%",
              maxWidth: "220px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
            alt="Ayush Pandey"
          />
          <h4 className="mt-4 mb-1">Ayush Pandey</h4>
          <h6 className="text-secondary">Full Stack Developer</h6>
        </div>

        <div className="col-lg-8 col-md-7 col-12 p-3">
          <p>
            Hi, I’m Ayush — the creator and developer behind{" "}
            <strong>Tradox</strong>, a modern stock trading platform inspired by
            industry leaders like Zerodha. This project combines my passion for
            technology, finance, and creating seamless user experiences.
          </p>
          <p>
            From designing the UI to integrating live market data, every part of
            this platform was built to learn, experiment, and replicate
            real-world trading functionalities.
          </p>
          <p>
            When I’m not coding, you’ll probably find me exploring financial
            markets, working on new tech ideas, or enjoying basketball.
          </p>
          <p>
            Connect with me on{" "}
            <a
              className="blue-link"
              href="https://github.com/Git-Ayush-Pandey"
              style={{ textDecoration: "none" }}
            >
              GitHub
            </a>{" "}
            /{" "}
            <a
              className="blue-link"
              href="https://www.linkedin.com/in/ayush-pandey-108ap/"
              style={{ textDecoration: "none" }}
            >
              LinkedIn
            </a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
