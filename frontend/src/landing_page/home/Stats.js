import { Link } from "react-router-dom";

function Stats() {
  return (
    <div className="container p-3">
      <div className="row p-5">
        <div className="col-6 p-5">
          <h1 className="fs-2 mb-5">Trust with Confidence</h1>
          <h2 className="fs-4">Customer-first Always</h2>
          <p className="text-muted">
            That's why 1.3+ crore customers trust Tradox with $3.5+ lakh crores
            worth of equity investments.
          </p>
          <h2 className="fs-4">No spam or gimmicks</h2>
          <p className="text-muted">
            No gimmicks, spam, "gamification", or annoying push notifications.
            High quality apps that you use at your pace, the way you like.
          </p>
          <h2 className="fs-4">The Tradox universe</h2>
          <p className="text-muted">
            Not just an app, but a whole ecosystem. Our investments in 30+
            fintech startups offer you tailored services specific to your needs.
          </p>
          <h2 className="fs-4">Do better with money</h2>
          <p className="text-muted">
            With initiatives like Nudge and Kill Switch, we don't just
            facilitate transactions, but actively help you do better with your
            money.
          </p>
        </div>
        <div className="col-6 p-5">
          <img
            src="media/images/ecosystem.png"
            style={{ width: "90%" }}
            alt="img"
          />
          <div className="text-center">
            <Link
              to="link"
              className="mx-5 blue-link"
              style={{ textDecoration: "none" }}
            >
              Explore our Products{" "}
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </Link>
            <Link
              to="link"
              className="mx-5 blue-link"
              style={{ textDecoration: "none" }}
            >
              Try Kite Demo{" "}
              <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
