import classNames from 'classnames';
import { useState } from 'react';
import './DurationInput.css';

function DurationInput() {
  const [ isEditing, setEditing ] = useState<boolean>(false);
  // hhmmss, right-aligned, length is [0,6], no left-padding with zeroes
  const [ digits, setDigits ] = useState<Array<number>>([1,5,0,0]);
  // how many digits from the right should be lit up? also lights up the h/m/s labels.
  // only valid when isEditing true.
  const [ lightLength, setLightLength ] = useState<number>(0);

  const onFocus: React.FocusEventHandler<HTMLDivElement> = () => {
    setEditing(true);
    // on edit, every digit is present, but unlit, like a placeholder
    setLightLength(0);
  };
  const onBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    setEditing(false);
    // TODO: run digits through a duration normalizer
    // 99m => 1h39m
    // 0m10s => 10s
    // 01s => 1s
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) => {
    console.assert(isEditing);
    if (ev.key === 'Backspace') {
      if (digits.length <= 0) return;
      if (lightLength === 0) {
        // backspace when all digits are placeholder sets it to 00h00m00s
        setDigits([]);
      } else {
        const newDigits = [ ...digits ];
        newDigits.pop();
        setDigits(newDigits);
        setLightLength((ll) => ll - 1);
      }
    } else if (ev.key === 'Enter') {
      ev.currentTarget.blur();
    } else if ('0' <= ev.key && ev.key <= '9') {
      if (digits.length >= 6) return;

      const digit = Number(ev.key);
      console.assert(0 <= digit && digit <= 9);

      let initial: Array<number>;
      if (lightLength === 0) {
        initial = []; // discard the existing placeholder digits
      } else {
        initial = [ ...digits ]; // we're in the process of typing digits
      }

      setDigits([ ...initial, digit ]);
      setLightLength((ll) => ll + 1);
    }
  };

  const ssmmhh = [ ...digits ].reverse();

  const elements = [];
  const digitsToWrite = isEditing ? 6 : ssmmhh.length;
  console.assert(1 <= digitsToWrite && digitsToWrite <= 6);
  for (let i = digitsToWrite; i > 0; i--) {
    const idx = i - 1;
    const isLit = idx < lightLength || !isEditing;
    elements.push(<Digit key={idx} value={ssmmhh[idx] || 0} isLit={isLit} />);
    if (i === 5) {
      elements.push(<Label key="h" label="h" isLit={isLit} />);
    }
    if (i === 3) {
      elements.push(<Label key="m" label="m" isLit={isLit} />);
    }
    if (i === 1) {
      elements.push(<Label key="s" label="s" isLit={isLit} />);
    }
  }

  // always display at least 0s
  if (elements.length === 0) {
    console.assert(!isEditing);
    elements.push(<Digit key="1" value={0} isLit />);
    elements.push(<Label key="s" label="s" isLit />);
  }

  const innerClass = classNames("DurationInput-area", {
    editing: isEditing
  });

  return (
    <div
      className="DurationInput-main"
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <div className={innerClass}>
        {elements}
      </div>
    </div>
  );
}

type DigitProps = {
  value: number,
  isLit: boolean
};

function Digit({ value, isLit }: DigitProps) {
  const classes = classNames("Digit", {
    lit: isLit
  });
  return (
    <span className={classes}>
      {value.toString().substring(0, 1)}
    </span>
  );
}

type LabelProps = {
  label: "h" | "m" | "s"
  isLit: boolean
};

function Label({ label, isLit }: LabelProps) {
  const classes = classNames("Label", {
    hours: label === "h",
    minutes: label === "m",
    seconds: label === "s",
    lit: isLit
  });
  return (
    <span className={classes}>{label}</span>
  );
}

export default DurationInput;
