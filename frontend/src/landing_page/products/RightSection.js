function RightSection({ imageURL, productName, productDesription, learnMore }) {
  return (
    <div className="container mt-5 productPage">
      <div className="row">
        <div className="col-6 p-5 mt-5">
          <h1>{productName}</h1>
          <p>{productDesription}</p>
          <div>
            <a className="blue-link" href={learnMore}>
              Learn More
            </a>
          </div>
        </div>
        <div className="col-6">
          <img src={imageURL} alt="img" />
        </div>
      </div>
    </div>
  );
}

export default RightSection;
