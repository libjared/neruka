import classNames from "classnames";

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

export { Digit, Label };
