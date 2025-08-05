function LeftSection({
  imageURL,
  productName,
  productDesription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-6">
          <img src={imageURL} alt="img" />
        </div>
        <div className="col-6 p-5 mt-5">
          <h1>{productName}</h1>
          <p>{productDesription}</p>
          <div>
            <a className="blue-link" href={tryDemo}>
              Try Demo
            </a>
            <a
              className="blue-link"
              href={learnMore}
              style={{ marginLeft: "50px" }}
            >
              Learn More
            </a>
          </div>
          <div className="mt-3">
            <a className="blue-link" href={googlePlay}>
              <img src="media/images/googlePlayBadge.svg" alt="img" />
            </a>
            <a className="blue-link" href={appStore}>
              <img
                src="media/images/appstoreBadge.svg"
                style={{ marginLeft: "50px" }}
                alt="img"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;
