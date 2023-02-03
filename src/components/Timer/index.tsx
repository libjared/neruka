import { differenceInHours, intervalToDuration } from 'date-fns';
import DurationInput from '../DurationInput';
import './Timer.css';

function Timer() {
  // const [ alarmTime, setAlarmTime ] = useState<Date | null>(null);
  // const [ requestedDuration, setRequestedDuration ] = useState<Duration>({ minutes: 15 });
  // const timeDisplayText = getTimeDisplayText(alarmTime);
  const onClickSet = () => {
  };

  return (
    <div className="Timer">
      <div className="Timer-display">
        <DurationInput />
      </div>
      <nav className="Timer-controls">
        <input type="button" value="Set" onClick={onClickSet} />
        <input type="button" value="Clear" />
      </nav>
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
