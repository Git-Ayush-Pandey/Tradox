// Fixed Home.js - Proper 4-section layout structure

import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import WatchList from "./Watchlist/index";

const Home = () => {
  return (
    <>
      {/* TopBar contains indices (32%) and menu (68%) */}
      <TopBar />
      
      {/* Dashboard container with watchlist (32%) and content (68%) */}
      <div className="dashboard-container">
        <div className="watchlist-container">
          <WatchList />
        </div>
        <div className="content">
          <Dashboard />
        </div>
      </div>
    </>
  );
};

export default Home;