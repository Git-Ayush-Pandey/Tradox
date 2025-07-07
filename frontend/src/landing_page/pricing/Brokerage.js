function Brokerage() {
  return (
    <div className="container">
      <div id="charges_tabs" class="container py-4">
        <ul class="nav nav-tabs mb-4" id="chargesTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              id="equities-tab"
              data-bs-toggle="tab"
              data-bs-target="#equities"
              type="button"
              role="tab"
            >
              Equity
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="fo-tab"
              data-bs-toggle="tab"
              data-bs-target="#fo"
              type="button"
              role="tab"
            >
              F&amp;O
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="currency-tab"
              data-bs-toggle="tab"
              data-bs-target="#currency"
              type="button"
              role="tab"
            >
              Currency
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              id="commodities-tab"
              data-bs-toggle="tab"
              data-bs-target="#commodities"
              type="button"
              role="tab"
            >
              Commodity
            </button>
          </li>
        </ul>

        <div class="tab-content">
          <div class="tab-pane fade show active" id="equities" role="tabpanel">
            <h3 class="d-none">Equity</h3>
            <div class="table-responsive">
              <table class="table table-bordered table-striped align-middle">
                <thead class="table-light">
                  <tr>
                    <th>&nbsp;</th>
                    <th>Equity delivery</th>
                    <th>Equity intraday</th>
                    <th>F&amp;O - Futures</th>
                    <th>F&amp;O - Options</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Brokerage</td>
                    <td>Zero Brokerage</td>
                    <td>0.03% or Rs. 20/executed order whichever is lower</td>
                    <td>0.03% or Rs. 20/executed order whichever is lower</td>
                    <td>Flat Rs. 20 per executed order</td>
                  </tr>
                  <tr class="table-secondary">
                    <td>STT/CTT</td>
                    <td>0.1% on buy &amp; sell</td>
                    <td>0.025% on the sell side</td>
                    <td>0.02% on the sell side</td>
                    <td>
                      <ul class="mb-0 ps-3">
                        <li>
                          0.125% of the intrinsic value on options that are
                          bought and exercised
                        </li>
                        <li>0.1% on sell side (on premium)</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>Transaction charges</td>
                    <td>
                      NSE: 0.00297%
                      <br />
                      BSE: 0.00375%
                    </td>
                    <td>
                      NSE: 0.00297%
                      <br />
                      BSE: 0.00375%
                    </td>
                    <td>
                      NSE: 0.00173%
                      <br />
                      BSE: 0
                    </td>
                    <td>
                      NSE: 0.03503% (on premium)
                      <br />
                      BSE: 0.0325% (on premium)
                    </td>
                  </tr>
                  <tr class="table-secondary">
                    <td>GST</td>
                    <td colspan="4">
                      18% on (brokerage + SEBI charges + transaction charges)
                    </td>
                  </tr>
                  <tr>
                    <td>SEBI charges</td>
                    <td colspan="4">₹10 / crore</td>
                  </tr>
                  <tr class="table-secondary">
                    <td>Stamp charges</td>
                    <td>0.015% or ₹1500 / crore on buy side</td>
                    <td>0.003% or ₹300 / crore on buy side</td>
                    <td>0.002% or ₹200 / crore on buy side</td>
                    <td>0.003% or ₹300 / crore on buy side</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="tab-pane fade" id="fo" role="tabpanel">
            <h3 class="d-none">F&amp;O</h3>
            <div class="table-responsive">
              <table class="table table-bordered table-striped align-middle">
                <thead class="table-light">
                  <tr>
                    <th>&nbsp;</th>
                    <th>F&amp;O - Futures</th>
                    <th>F&amp;O - Options</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Brokerage</td>
                    <td>0.03% or Rs. 20/executed order whichever is lower</td>
                    <td>Flat Rs. 20 per executed order</td>
                  </tr>
                  <tr class="table-secondary">
                    <td>STT/CTT</td>
                    <td>0.02% on the sell side</td>
                    <td>
                      <ul class="mb-0 ps-3">
                        <li>
                          0.0125% of the intrinsic value on options that are
                          bought and exercised
                        </li>
                        <li>0.1% on sell side (on premium)</li>
                      </ul>
                    </td>
                  </tr>
                  <tr>
                    <td>Transaction charges</td>
                    <td>
                      NSE: 0.00173%
                      <br />
                      BSE: 0
                    </td>
                    <td>
                      NSE: 0.03503% (on premium)
                      <br />
                      BSE: 0.0325% (on premium)
                    </td>
                  </tr>
                  <tr class="table-secondary">
                    <td>GST</td>
                    <td colspan="2">
                      18% on (brokerage + SEBI charges + transaction charges)
                    </td>
                  </tr>
                  <tr>
                    <td>SEBI charges</td>
                    <td colspan="2">₹10 / crore</td>
                  </tr>
                  <tr class="table-secondary">
                    <td>Stamp charges</td>
                    <td>0.002% or ₹200 / crore on buy side</td>
                    <td>0.003% or ₹300 / crore on buy side</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="currency"
            role="tabpanel"
            aria-labelledby="currency-tab"
          >
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>Currency futures</th>
                    <th>Currency options</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Brokerage</td>
                    <td>0.03% or ₹20/executed order whichever is lower</td>
                    <td>₹20/executed order</td>
                  </tr>
                  <tr className="table-secondary">
                    <td>STT/CTT</td>
                    <td>No STT</td>
                    <td>No STT</td>
                  </tr>
                  <tr>
                    <td>Transaction charges</td>
                    <td>
                      NSE: 0.00035%
                      <br />
                      BSE: 0.00045%
                    </td>
                    <td>
                      NSE: 0.0311%
                      <br />
                      BSE: 0.001%
                    </td>
                  </tr>
                  <tr className="table-secondary">
                    <td>GST</td>
                    <td>
                      18% on (brokerage + SEBI charges + transaction charges)
                    </td>
                    <td>
                      18% on (brokerage + SEBI charges + transaction charges)
                    </td>
                  </tr>
                  <tr>
                    <td>SEBI charges</td>
                    <td>₹10 / crore</td>
                    <td>₹10 / crore</td>
                  </tr>
                  <tr className="table-secondary">
                    <td>Stamp charges</td>
                    <td>0.0001% or ₹10 / crore on buy side</td>
                    <td>0.0001% or ₹10 / crore on buy side</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="tab-pane fade"
            id="commodities"
            role="tabpanel"
            aria-labelledby="commodities-tab"
          >
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>Commodity futures</th>
                    <th>Commodity options</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Brokerage</td>
                    <td>0.03% or ₹20/executed order whichever is lower</td>
                    <td>₹20/executed order</td>
                  </tr>
                  <tr className="table-secondary">
                    <td>STT/CTT</td>
                    <td>0.01% on sell side (Non-Agri)</td>
                    <td>0.05% on sell side</td>
                  </tr>
                  <tr>
                    <td>Transaction charges</td>
                    <td>
                      MCX: 0.0021%
                      <br />
                      NSE: 0.0001%
                    </td>
                    <td>
                      MCX: 0.0418%
                      <br />
                      NSE: 0.001%
                    </td>
                  </tr>
                  <tr className="table-secondary">
                    <td>GST</td>
                    <td>
                      18% on (brokerage + SEBI charges + transaction charges)
                    </td>
                    <td>
                      18% on (brokerage + SEBI charges + transaction charges)
                    </td>
                  </tr>
                  <tr>
                    <td>SEBI charges</td>
                    <td>
                      <strong>Agri:</strong> ₹1 / crore
                      <br />
                      <strong>Non-agri:</strong> ₹10 / crore
                    </td>
                    <td>₹10 / crore</td>
                  </tr>
                  <tr className="table-secondary">
                    <td>Stamp charges</td>
                    <td>0.002% or ₹200 / crore on buy side</td>
                    <td>0.003% or ₹300 / crore on buy side</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Brokerage;
