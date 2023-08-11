import {
  add,
  intervalToDuration,
  isPast,
  startOfToday,
  startOfTomorrow,
} from "date-fns";
import { useState } from "react";
import CountdownDisplay from "../CountdownDisplay";
import DurationInput from "../DurationInput";
import { SignedDuration } from "../Types";
import "./Timer.css";

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
  const [originalDuration, setOriginalDuration] = useState<SignedDuration>({
    negative: false,
    minutes: 15,
  });
  // when the timer is stopped, it's null.
  // when the timer is running, it's null.
  // when the timer is paused, show this.
  const [currentDuration, setCurrentDuration] = useState<SignedDuration | null>(
    null
  );
  // when the timer is stopped, it's null.
  // when the timer is running, calculate the time remaining from this.
  // when the timer is paused, it's null.
  const [alarmTime, setAlarmTime] = useState<Date | null>(null);
  // when the timer is stopped, it's null.
  // when the timer is running, it's null.
  // when the timer is paused, it determines whether to show the duration editing view, and force focus on it.
  const [initialEditing, setInitialEditing] = useState<boolean | null>(null);

  const [targetTimeText, setTargetTimeText] = useState<string>("");

  const [volume, setVolume] = useState<number>(1.0);

  const startTimer = (): void => {
    // we are stopped or paused.
    const targetDuration =
      currentDuration !== null ? currentDuration : originalDuration;
    // convert duration into time
    const targetTime = add(new Date(), targetDuration);
    setAlarmTime(targetTime);
  };

  const stopTimer = (): void => {
    // we are running.
    /* istanbul ignore next - unreachable */
    if (alarmTime === null) {
      throw new Error("Expected alarmTime to be non-null.");
    }
    const interval: Interval = {
      start: new Date(),
      end: alarmTime,
    };
    const targetDuration = intervalToDuration(interval);
    const targetSignedDuration = {
      negative: false,
      hours: targetDuration.hours,
      minutes: targetDuration.minutes,
      seconds: targetDuration.seconds,
    };
    setCurrentDuration(targetSignedDuration);
    setAlarmTime(null);
  };

  const resetTimer = (): void => {
    // we could be running, stopped, or paused.
    setCurrentDuration(null);
    setAlarmTime(null);
  };

  const stopAndEditTimer = () => {
    // we are running.
    stopTimer();
    setInitialEditing(true);
  };

  let display: JSX.Element;
  if (alarmTime !== null) {
    // running
    display = (
      <CountdownDisplay
        targetTime={alarmTime}
        volume={volume}
        onClick={stopAndEditTimer}
      />
    );
  } else {
    // paused or stopped
    let duration =
      currentDuration !== null ? currentDuration : originalDuration;
    const onFinishEditing = (
      newDuration: SignedDuration,
      immediatelyStart: boolean
    ): void => {
      setInitialEditing(false);
      setOriginalDuration(newDuration);
      setCurrentDuration(null);
      if (immediatelyStart) {
        // HACK: if we just call startTimer(), originalDuration and currentDuration won't be updated yet,
        // so we violate DRY here.
        const targetTime = add(new Date(), newDuration);
        setAlarmTime(targetTime);
      }
    };
    display = (
      <DurationInput
        duration={duration}
        initialEditing={!!initialEditing}
        onFinishEditing={onFinishEditing}
      />
    );
  }

  const setFromTime = () => {
    const parsedTime = parseTime(targetTimeText);
    if (parsedTime === null) {
      throw new Error("Expected time to be valid.");
    }
    const targetDateTime = getNextOccurenceOfTime(parsedTime);
    const newDuration = intervalToDuration({
      start: new Date(),
      end: targetDateTime,
    });
    if (
      (newDuration.days ?? 0) > 0 ||
      (newDuration.months ?? 0) > 0 ||
      (newDuration.weeks ?? 0) > 0 ||
      (newDuration.years ?? 0) > 0
    ) {
      throw new Error(
        "Expected duration until next occurence of time to be less than 24 hours."
      );
    }
    const newSignedDuration: SignedDuration = {
      negative: false,
      hours: newDuration.hours,
      minutes: newDuration.minutes,
      seconds: newDuration.seconds,
    };
    setOriginalDuration(newSignedDuration);
    setCurrentDuration(null);
  };

  const isRunning = alarmTime !== null;

  return (
    <div className="Timer">
      <div className="Timer-display">{display}</div>
      <nav className="Timer-controls">
        {isRunning && <input type="button" value="Stop" onClick={stopTimer} />}
        {!isRunning && (
          <input type="button" value="Start" onClick={startTimer} />
        )}
        <input type="button" value="Reset" onClick={resetTimer} />
        <div className="Timer-break" />
        {!isRunning && (
          <>
            <input
              type="time"
              value={targetTimeText}
              onChange={(e) => {
                setTargetTimeText(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setFromTime();
                }
              }}
            />
            <input type="button" value="Set from time" onClick={setFromTime} />
          </>
        )}
        <div className="Timer-break" />
        <label htmlFor="volume">Volume</label>
        <input
          type="range"
          name="volume"
          max={1.0}
          min={0.0}
          step={0.01}
          value={volume}
          onChange={(e) => {
            const newVolume = Number(e.currentTarget.value);
            // TODO: assert !isNan
            setVolume(newVolume);
          }}
          list="volume-markers"
        />
        <datalist id="volume-markers">
          <option value={0.0} />
          <option value={0.25} />
          <option value={0.5} />
          <option value={0.75} />
          <option value={1.0} />
        </datalist>
        <span>{Math.round(volume * 100)}</span>
      </nav>
    </div>
  );
}

type PositiveTime = {
  hours: number; // [0-23]
  minutes: number;
  seconds: number;
};

/**
 * Parse dateTime string in HH:mm format. Usually from input type="time" element.
 * @param dateString string in HH:mm format.
 * @returns PositiveTime with 0 seconds if parsed, or null if no parse.
 */
function parseTime(dateString: string): PositiveTime | null {
  if (dateString === "") {
    return null;
  }
  const results = dateString.match(/^(\d\d):(\d\d)$/);
  if (
    results === null ||
    results[1] === undefined ||
    results[2] === undefined
  ) {
    return null;
  }
  const hours = Number(results[1]);
  const minutes = Number(results[2]);
  return { hours, minutes, seconds: 0 };
}

function getNextOccurenceOfTime(time: PositiveTime): Date {
  const dateToday = startOfToday();
  const dateTomorrow = startOfTomorrow(); // FIXME: is this DST-safe?
  // add duration, instead of setHours/Minutes/Seconds. Why? Because startOfToday may be in UTC, so midnight won't be 00:00:00.
  // FIXME: Not sure about the above, though.
  // FIXME: if today is DST, does this cause any problems?
  const dateTimeToday = add(dateToday, time);
  const dateTimeTomorrow = add(dateTomorrow, time);
  if (!isPast(dateTimeToday)) {
    return dateTimeToday;
  }
  return dateTimeTomorrow;
}

export default Timer;
