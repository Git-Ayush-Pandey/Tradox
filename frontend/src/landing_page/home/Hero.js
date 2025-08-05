function Hero() {
  return (
    <div className="container p-5 mb-5">
      <div className="row text-center">
        <img
          src="media/images/homeHero.png"
          alt="Hero"
          className="mb-5"
        />
        <h1 className="mt-5">Invest in everything!</h1>
        <p>
          online platform to invest in everything, derivatives, mutual funds,and
          more.
        </p>
        <a
          href="/signup"
          className="p-2 btn btn-primary fs-5 mb-5"
          style={{
            width: "20%",
            margin: "0 auto",
            display: "block",
            textAlign: "center",
          }}
        >
          Signup now
        </a>
      </div>
    </div>
  );
}

export default Hero;
