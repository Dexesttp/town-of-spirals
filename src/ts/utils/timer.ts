export interface TimeoutPromise extends Promise<void> {
  cancel?: () => void;
}

export function TimerPromise(timeout: number): TimeoutPromise {
  let timerID: ReturnType<typeof setTimeout> | undefined;
  const p: TimeoutPromise = new Promise((resolve, reject) => {
    timerID = setTimeout(() => {
      resolve();
    }, timeout);
  });
  p.cancel = () => {
    clearTimeout(timerID);
  };
  return p;
}
