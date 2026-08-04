import { useEffect, useRef } from "react";
import { useNavigation } from "react-router";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";

export default function TopLoadingBar() {
  const { state } = useNavigation();

  const ref = useRef<LoadingBarRef>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (state === "loading") {
      timerRef.current = setTimeout(() => {
        startedRef.current = true;
        ref.current?.start();
      }, 100);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (startedRef.current) {
        ref.current?.complete();
        startedRef.current = false;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state]);

  return (
    <LoadingBar
      ref={ref}
      shadow={false}
      waitingTime={300}
      color="var(--primary-text)"
    />
  );
}
