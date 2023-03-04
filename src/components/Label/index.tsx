import classNames from "classnames";

type LabelProps = {
  label: "h" | "m" | "s";
  isLit: boolean;
};

function Label({ label, isLit }: LabelProps) {
  const classes = classNames("Label", {
    hours: label === "h",
    minutes: label === "m",
    seconds: label === "s",
    lit: isLit,
  });
  return <span className={classes}>{label}</span>;
}

export default Label;
