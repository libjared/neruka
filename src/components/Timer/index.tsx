import { differenceInHours, intervalToDuration } from 'date-fns';
import { useCallback, useState } from 'react';
// import { addDays, format } from 'date-fns/fp'
import './Timer.css';

function Timer() {
  const [ settedAlarmTime, setAlarmTime ] = useState<Date | null>(null); // setted: adjective

  const timeDisplayText = getTimeDisplayText(settedAlarmTime);
  const onSetClick = useCallback((that) => {

  });

  return (
    <div className="Timer">
      <nav className="Timer-controls">
        <input type="time" />
        <input type="button" value="Set" onClick={onClick} />
        <input type="button" value="Clear" />
      </nav>
      <div className="Timer-display">
        {timeDisplayText}
      </div>
    </div>
  );
}

function getTimeDisplayText(settedAlarmTime: Date | null) {
  if (settedAlarmTime == null)
    return "00:00:00";

  const now = new Date();

  const hrs = String(differenceInHours(now, settedAlarmTime)).padStart(2, "0");
  const diff = intervalToDuration({
    end: settedAlarmTime,
    start: now
  });
  // TODO check negative
  const min = String(diff.minutes || 0).padStart(2, "0");
  const sec = String(diff.seconds || 0).padStart(2, "0");
  return `${hrs}:${min}:${sec}`;
}

export default Timer;
