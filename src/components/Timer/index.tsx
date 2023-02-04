import { differenceInHours, intervalToDuration } from 'date-fns';
import { useState } from 'react';
import DurationInput from '../DurationInput';
import './Timer.css';

// There are several states for a timer's UX:
// Rest - The clock shows a duration.
// Editing - The clock shows a duration in the middle of being updated.
// Countdown - The clock shows time until a specific point in the future. It must periodically refresh.
// Overdue - The clock shows time since the alarm hit. It must periodically refresh.
//
// All of these states need the logic to display digits in a particular manner. The underlying state that determines
// WHAT digits to show changes type: rest & editing use a duration, countdown & overdue use a time.

// Timer
// - holds state, and converts between types.
// - if alarmTime == null
// -   child is DurationDisplay
// -   if currentDuration is not null, we're "paused". send currentDuration.
// -   otherwise, we're "stopped". send originalDuration.
// - otherwise
// -   child is TimeDisplay

// DurationDisplay(duration, onRequestDurationChange)
// - when not editing, displays the duration without questioning.
// - when editing, convert the given duration to a state of digits.
//   - on finished editing, call onRequestDurationChange. if user hit the enter key, callback to make it a quick-start.

// CountdownDisplay(time)
// - show a countdown (or overdue, depending on the remaining time). useEffect setInterval/clearInterval to refresh it regularly.

// Digit(value, isLit)/Label(label, isLit)
// - renders one digit or label character.

function Timer() {
  const [ originalDuration, setOriginalDuration ] = useState<Duration>({ minutes: 15 });
  const [ currentDuration, setCurrentDuration ] = useState<Duration | null>(originalDuration);
  const [ alarmTime, setAlarmTime ] = useState<Date | null>(null);

  const startTimer = () => {
  };
  const onRequestDuration = () => {
  };
  const onQuickStart = () => {
  };

  return (
    <div className="Timer">
      <div className="Timer-display">
        <DurationInput
          onStart={onStartByInput}
        />
      </div>
      <nav className="Timer-controls">
        <input type="button" value="Set" onClick={() => { startTimer(); }} />
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
