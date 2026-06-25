import { Link } from "react-router-dom";

function CreateTicket() {
  return (
    <div className="container">
      <div className="row p-5 mt-5 mb-5">
        <h1 className="fs-2">To create a ticket, select a relevant topic</h1>

        {/* Account Opening */}
        <div className="col-4 p-5 mt-2 mb-2">
          <h4 style={{ fontWeight: 400, fontSize: "20px" }}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i> Account
            Opening
          </h4>
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Resident individual
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Minor
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Non Resident Indian (NRI)
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Company, Partnership, HUF and LLP
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Glossary
          </Link>
          <br />
        </div>

        {/* Your Tradox Account */}
        <div className="col-4 p-5 mt-2 mb-2">
          <h4 style={{ fontWeight: 400, fontSize: "20px" }}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i> Your Tradox
            Account
          </h4>
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Your Profile
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Account modification
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Client Master Report (CMR) and Depository Participant (DP)
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Nomination
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Transfer and conversion of securities
          </Link>
          <br />
        </div>

        {/* Kite */}
        <div className="col-4 p-5 mt-2 mb-2">
          <h4 style={{ fontWeight: 400, fontSize: "20px" }}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i> Kite
          </h4>
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            IPO
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Trading FAQs
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Margin Trading Facility (MTF) and Margins
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Charts and orders
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Alerts and Nudges
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            General
          </Link>
          <br />
        </div>

        {/* Funds */}
        <div className="col-4 p-5 mt-2 mb-2">
          <h4 style={{ fontWeight: 400, fontSize: "20px" }}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i> Funds
          </h4>
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Add money
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Withdraw money
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Add bank accounts
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            eMandates
          </Link>
          <br />
        </div>

        {/* Console */}
        <div className="col-4 p-5 mt-2 mb-2">
          <h4 style={{ fontWeight: 400, fontSize: "20px" }}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i> Console
          </h4>
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Portfolio
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Corporate actions
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Funds statement
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Reports
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Profile
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Segments
          </Link>
          <br />
        </div>

        {/* Coin */}
        <div className="col-4 p-5 mt-2 mb-2">
          <h4 style={{ fontWeight: 400, fontSize: "20px" }}>
            <i className="fa fa-plus-circle" aria-hidden="true"></i> Coin
          </h4>
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Mutual funds
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            National Pension Scheme (NPS)
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Fixed Deposit (FD)
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Features on Coin
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            Payments and Orders
          </Link>
          <br />
          <Link
            to="link"
            className="blue-link"
            style={{ textDecoration: "none", lineHeight: "2.5" }}
          >
            General
          </Link>
          <br />
        </div>
      </div>
    </div>
  );
}

export default CreateTicket;
