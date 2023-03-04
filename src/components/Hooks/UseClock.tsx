import { useEffect, useState } from "react";

function getCurrentTime(): Date {
  return new Date();
}

function useClock() {
  const [currentTime, setCurrentTime] = useState<Date>(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 200);

    return () => {
      clearInterval(interval);
    };
  });

  return currentTime;
}

export default useClock;
