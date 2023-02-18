import { add, intervalToDuration } from 'date-fns';
import { useState } from 'react';
import CountdownDisplay from '../CountdownDisplay';
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
// -   child is DurationInput
// -   if currentDuration is not null, we're "paused". send currentDuration.
// -   otherwise, we're "stopped". send originalDuration.
// - otherwise
// -   child is CountdownDisplay

// DurationInput(duration, onRequestDurationChange)
// - when not editing, displays the duration without questioning.
// - when editing, convert the given duration to a state of digits.
//   - on finished editing, call onRequestDurationChange. if user hit the enter key, callback to make it a quick-start.

// CountdownDisplay(time)
// - show a countdown (or overdue, depending on the remaining time). useEffect setInterval/clearInterval to refresh it regularly.

// Digit(value, isLit)/Label(label, isLit)
// - renders one digit or label character.

function Timer() {
  // when the timer is stopped, show this. after editing, update this. when clicking Start or Reset, copy this to currentDuration.
  const [ originalDuration, setOriginalDuration ] = useState<Duration>({ minutes: 15 });
  // when the timer is stopped, it's null.
  // when the timer is running, it's null.
  // when the timer is paused, show this.
  const [ currentDuration, setCurrentDuration ] = useState<Duration | null>(null);
  // when the timer is stopped, it's null.
  // when the timer is running, calculate the time remaining from this.
  // when the timer is paused, it's null.
  const [ alarmTime, setAlarmTime ] = useState<Date | null>(null);

  const startTimer = (): void => {
    // we are stopped or paused.
    const targetDuration = currentDuration !== null ? currentDuration : originalDuration;
    // convert duration into time
    const targetTime = add(new Date(), targetDuration);
    setAlarmTime(targetTime);
  };

  const stopTimer = (): void => {
    // we are running.
    if (alarmTime === null) throw new Error('Expected alarmTime to be non-null.');
    const interval: Interval = {
      start: new Date(),
      end: alarmTime
    };
    const targetDuration = intervalToDuration(interval);
    setCurrentDuration(targetDuration);
    setAlarmTime(null);
  };

  const resetTimer = (): void => {
    // we could be running, stopped, or paused.
    setCurrentDuration(null);
    setAlarmTime(null);
  };

  let display: JSX.Element;
  if (alarmTime !== null) {
    // running
    display = <CountdownDisplay targetTime={alarmTime} />;
  } else {
    // paused or stopped
    let duration = currentDuration !== null ? currentDuration : originalDuration;
    const onFinishEditing = (newDuration: Duration, immediatelyStart: boolean): void => {
      setOriginalDuration(newDuration);
      setCurrentDuration(null);
      if (immediatelyStart) {
        // HACK: if we just call startTimer(), originalDuration and currentDuration won't be updated yet,
        // so we violate DRY here.
        const targetTime = add(new Date(), newDuration);
        setAlarmTime(targetTime);
      }
    };
    display = <DurationInput duration={duration} onFinishEditing={onFinishEditing} />;
  }

  return (
    <div className="Timer">
      <div className="Timer-display">
        {display}
      </div>
      <nav className="Timer-controls">
        {alarmTime !== null && <input type="button" value="Stop" onClick={stopTimer} />}
        {alarmTime === null && <input type="button" value="Start" onClick={startTimer} />}
        <input type="button" value="Reset" onClick={resetTimer} />
      </nav>
    </div>
  );
}

export default Timer;
