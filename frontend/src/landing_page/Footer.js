import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer
      className="footer main-footer"
      style={{ backgroundColor: "rgb(250,250,250)" }}
    >
      <div className="container border-top mt-5 footer-container">
        <div className="row mt-5 text-muted footer-links">
          <div className="col-3 mr-5 footer-details">
            <div className="info">
              <img
                className="mb-3"
                src="media/images/logo.png"
                alt="Company logo"
                style={{ width: "120px" }}
              />
              <p style={{ lineHeight: "20px", fontSize: "13px" }}>
                &copy; 2010 - 2024, Not Tradox Broking Ltd.
                <br />
                All rights reserved.
              </p>
            </div>
            <div className="links">
              <Link to="link">
                <i className="fa fa-instagram" aria-hidden="true"></i>
                <i className="fa fa-facebook-official" aria-hidden="true"></i>
                <i className="fa fa-linkedin-square" aria-hidden="true"></i>
                <i className="fa fa-twitter-square" aria-hidden="true"></i>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #ccc",
                    opacity: 0.5,
                  }}
                />
                <i className="fa fa-youtube-play" aria-hidden="true"></i>
                <i className="fa fa-whatsapp" aria-hidden="true"></i>
                <i className="fa fa-telegram" aria-hidden="true"></i>
              </Link>
            </div>
          </div>

          <div className="col-9 d-flex">
            <div className="col">
              <p>
                Account <br />
                <Link to="link">Open an account</Link>
                <br />
                <Link to="link">Minor demat account</Link>
                <br />
                <Link to="link">NRI demat account</Link>
                <br />
                <Link to="link">Commodity</Link>
                <br />
                <Link to="link">Dematerialisation</Link>
                <br />
                <Link to="link">Fund transfer</Link>
                <br />
                <Link to="link">MTF</Link>
                <br />
                <Link to="link">Minor demat account</Link>
                <br />
              </p>
            </div>

            <div className="col">
              <p>
                Support
                <br />
                <Link to="link">Contact us</Link>
                <br />
                <Link to="link">Support portal</Link>
                <br />
                <Link to="link">How to file a complaint?</Link>
                <br />
                <Link to="link">Status of your complaints</Link>
                <br />
                <Link to="link">Bulletin</Link>
                <br />
                <Link to="link">Circular</Link>
                <br />
                <Link to="link">Z-Connect blog</Link>
                <br />
                <Link to="link">Downloads</Link>
                <br />
              </p>
            </div>

            <div className="col">
              <p>
                Company
                <br />
                <Link to="link">About</Link>
                <br />
                <Link to="link">Philosophy</Link>
                <br />
                <Link to="link">Press & media</Link>
                <br />
                <Link to="link">Careers</Link>
                <br />
                <Link to="link">Tradox Cares (CSR)</Link>
                <br />
                <Link to="link">Tradox.tech</Link>
                <br />
                <Link to="link">Open source</Link>
                <br />
              </p>
            </div>

            <div className="col">
              <p>
                Quick links
                <br />
                <Link to="link">Upcoming IPOs</Link>
                <br />
                <Link to="link">Brokerage charges</Link>
                <br />
                <Link to="link">Market holidays</Link>
                <br />
                <Link to="link">Economic calendar</Link>
                <br />
                <Link to="link">Calculators</Link>
                <br />
                <Link to="link">ZMarkets</Link>
                <br />
                <Link to="link">Sectors</Link>
                <br />
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-5 mb-5 footer-disclaimer"
          style={{
            fontSize: "11px",
            color: "#A0A0A0",
          }}
        >
          <p>
            Tradox Broking Ltd.: Member of NSE, BSE​ &​ MCX – SEBI Registration
            no.: INZ000031633 CDSL/NSDL: Depository services through Tradox
            Broking Ltd. – SEBI Registration no.: IN-DP-431-2019 Commodity
            Trading through Tradox Commodities Pvt. Ltd. MCX: 46025; NSE-50001 –
            SEBI Registration no.: INZ000038238 Registered Address: Tradox
            Broking Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence
            Public School, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka,
            India. For any complaints pertaining to securities broking please
            write to{" "}
            <Link className="blue-link" to="link">
              complaints@Tradox.com
            </Link>
            , for DP related to{" "}
            <Link className="blue-link" to="link">
              dp@Tradox.com
            </Link>
            . Please ensure you carefully read the Risk Disclosure Document as
            prescribed by SEBI | ICF <br />
            <br />
            Procedure to file a complaint on{" "}
            <Link className="blue-link" to="link">
              SEBI SCORES
            </Link>{" "}
            : Register on SCORES portal. Mandatory details for filing complaints
            on SCORES: Name, PAN, Address, Mobile Number, E-mail ID. Benefits:
            Effective Communication, Speedy redressal of the grievances <br />
            <br />
            <Link className="blue-link" to="link">
              Smart Online Dispute Resolution
            </Link>{" "}
            |{" "}
            <Link className="blue-link" to="link">
              Grievances Redressal
            </Link>{" "}
            <br />
            <br />
            Mechanism Investments in securities market are subject to market
            risks; read all the related documents carefully before investing.
            <br />
            <br />
            Attention investors: 1) Stock brokers can accept securities as
            margins from clients only by way of pledge in the depository system
            w.e.f September 01, 2020. 2) Update your e-mail and phone number
            with your stock broker / depository participant and receive OTP
            directly from depository on your e-mail and/or mobile number to
            create pledge. 3) Check your securities / MF / bonds in the
            consolidated account statement issued by NSDL/CDSL every month.
            <br />
            <br />
            "Prevent unauthorised transactions in your account. Update your
            mobile numbers/email IDs with your stock brokers. Receive
            information of your transactions directly from Exchange on your
            mobile/email at the end of the day. Issued in the interest of
            investors. KYC is one time exercise while dealing in securities
            markets - once KYC is done through a SEBI registered intermediary
            (broker, DP, Mutual Fund etc.), you need not undergo the same
            process again when you approach another intermediary." Dear
            Investor, if you are subscribing to an IPO, there is no need to
            issue a cheque. Please write the Bank account number and sign the
            IPO application form to authorize your bank to make payment in case
            of allotment. In case of non allotment the funds will remain in your
            bank account. As a business we don't give stock tips, and have not
            authorized anyone to trade on behalf of others. If you find anyone
            claiming to be part of Tradox and offering such services, please{" "}
            <Link className="blue-link" to="link">
              create a ticket here.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
