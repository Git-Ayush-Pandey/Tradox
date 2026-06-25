import Hero from "./Hero";
import Awards from "./Awards";
import Education from "./Education";
import Pricing from "./Pricing";
import OpenAccount from "../OpenAccount";
import Stats from "./Stats";

function HomePage() {
  return (
    <div style={{ paddingTop: "50px" }}>
      <Hero />
      <Awards />
      <Stats />
      <Pricing />
      <Education />
      <OpenAccount />
    </div>
  );
}

export default HomePage;
