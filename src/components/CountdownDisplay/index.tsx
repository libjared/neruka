import { add, intervalToDuration, toDate } from "date-fns";
import Announcer from "../Announcer/Announcer";
import useClock from "../Hooks/UseClock";
import { BaseTenDigit, FriendlyDuration, SignedDuration } from "../Types";

type CountdownDisplayProps = {
  targetTime: Date;
  volume: number;
  onClick: () => void;
};

function CountdownDisplay({
  targetTime,
  volume,
  onClick,
}: CountdownDisplayProps) {
  const currentTime = useClock();

  const handleClick = () => {
    onClick();
  };

  const duration = intervalToDurationCeiling({
    start: currentTime,
    end: targetTime,
  });

  const text = signedDurationToString(duration);

  return (
    <>
      <Announcer duration={duration} volume={volume} />
      <span role="timer" onClick={handleClick}>
        {text}
      </span>
    </>
  );
}

function signedDurationToString(duration: SignedDuration): string {
  const dur = toFriendlyDuration(duration);

  let str = "";
  if (dur.negative) {
    str += "-";
  }
  if (dur.hourTens !== undefined) {
    str += `${dur.hourTens}`;
  }
  if (dur.hourOnes !== undefined) {
    str += `${dur.hourOnes}h`;
  }
  if (dur.minuteTens !== undefined) {
    str += `${dur.minuteTens}`;
  }
  if (dur.minuteOnes !== undefined) {
    str += `${dur.minuteOnes}m`;
  }
  if (dur.secondTens !== undefined) {
    str += `${dur.secondTens}`;
  }
  str += `${dur.secondOnes}s`;

  const text = str;
  return text;
}

// A whole number is any integer that is zero or positive.
function isWhole(num: number): boolean {
  return Number.isInteger(num) && num >= 0;
}

function toFriendlyDuration(duration: SignedDuration): FriendlyDuration {
  if (duration.hours !== undefined && !isWhole(duration.hours))
    throw new Error("Expected hours to be a whole number.");
  if (duration.minutes !== undefined && !isWhole(duration.minutes))
    throw new Error("Expected minutes to be a whole number.");
  if (duration.seconds !== undefined && !isWhole(duration.seconds))
    throw new Error("Expected seconds to be a whole number.");

  if (
    (duration.hours === undefined || duration.hours === 0) &&
    (duration.minutes === undefined || duration.minutes === 0) &&
    (duration.seconds === undefined || duration.seconds === 0) &&
    duration.negative
  ) {
    throw new Error("Expected duration not to be negative 0.");
  }

  const digits: BaseTenDigit[] = new Array(6).fill("0");

  const asBaseTenDigit = (digit: string) => {
    /* istanbul ignore next - unreachable */
    if (digit.length !== 1 || digit < "0" || digit > "9") {
      return "0";
    }
    return digit as BaseTenDigit;
  };

  const safeHours = duration.hours || 0;
  const safeMins = duration.minutes || 0;
  const safeSecs = duration.seconds || 0;

  digits[0] = asBaseTenDigit(Math.floor(safeHours / 10).toString());
  digits[1] = asBaseTenDigit((safeHours % 10).toString());
  digits[2] = asBaseTenDigit(Math.floor(safeMins / 10).toString());
  digits[3] = asBaseTenDigit((safeMins % 10).toString());
  digits[4] = asBaseTenDigit(Math.floor(safeSecs / 10).toString());
  digits[5] = asBaseTenDigit((safeSecs % 10).toString());

  const firstNonZero = digits.findIndex((v) => v !== "0");
  // this always has at least one element, even if digits are all zeroes:
  const trimmedDigits = digits.slice(firstNonZero);

  const friendly: FriendlyDuration = {
    negative: duration.negative,
    secondOnes: trimmedDigits.pop()!,
    secondTens: trimmedDigits.pop(),
    minuteOnes: trimmedDigits.pop(),
    minuteTens: trimmedDigits.pop(),
    hourOnes: trimmedDigits.pop(),
    hourTens: trimmedDigits.pop(),
  };

  return friendly;
}

function intervalToDurationCeiling(interval: Interval): SignedDuration {
  const start = toDate(interval.start);
  const end = toDate(interval.end);
  const startTime = start.getTime();
  const endTime = end.getTime();

  // | s after | display |
  // |---------|---------|
  // |  -1.001 |      2s |
  // |  -1.000 |      1s |
  // |  -0.999 |      1s |
  // |  -0.001 |      1s |
  // |   0.000 |      0s | <-- ring, ring!
  // |   0.001 |      0s |
  // |   0.999 |      0s |
  // |   1.000 |     -1s |
  // |   1.001 |     -1s |

  // round up, by pushing the end into the future by 1 second only when 1. the difference is
  // inexact, and 2. when we're still before the target (because intervalToDuration() calls abs())
  const shouldRoundUp =
    startTime % 1000 !== endTime % 1000 && endTime > startTime;
  const fixedEnd = add(end, { seconds: shouldRoundUp ? 1 : 0 });

  const unsignedDuration = intervalToDuration({ start, end: fixedEnd });
  const showNegative = fixedEnd.getTime() - startTime <= -1000;

  return {
    hours: unsignedDuration.hours,
    minutes: unsignedDuration.minutes,
    seconds: unsignedDuration.seconds,
    negative: showNegative,
  };
}

export default CountdownDisplay;
export {
  toFriendlyDuration,
  intervalToDurationCeiling,
  signedDurationToString,
};
