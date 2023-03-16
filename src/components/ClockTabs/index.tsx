import Timer from "../Timer";
import "./ClockTabs.css";

function ClockTabs() {
  return (
    <div className="ClockTabs">
      <nav className="ClockTabs-nav">
        <ul>
          <li>Timer</li>
          <li>Alarm</li>
        </ul>
      </nav>
      <Timer />
    </div>
  );
}

export default ClockTabs;
