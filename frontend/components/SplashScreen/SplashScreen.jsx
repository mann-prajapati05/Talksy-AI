import { useEffect, useState } from "react";
import "./SplashScreen.css";

const SPLASH_STORAGE_KEY = "talksy_splash_seen_v1";
const FORWARD_DURATION = 2000;
const REVERSE_DURATION = 1800;
const EXIT_DURATION = 700;

function SplashScreen() {
  const [phase, setPhase] = useState("forward");
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.sessionStorage.getItem(SPLASH_STORAGE_KEY) !== "true";
  });

  useEffect(() => {
    if (!isVisible) {
      return undefined;
    }

    window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");

    const reverseTimer = window.setTimeout(() => {
      setPhase("reverse");
    }, FORWARD_DURATION);

    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, FORWARD_DURATION + REVERSE_DURATION);

    const hideTimer = window.setTimeout(
      () => {
        setIsVisible(false);
      },
      FORWARD_DURATION + REVERSE_DURATION + EXIT_DURATION,
    );

    return () => {
      window.clearTimeout(reverseTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`splash-screen splash-screen--${phase}`} aria-hidden="true">
      <div className="splash-screen__content">
        <svg
          className="splash-screen__logo"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 46"
          role="img"
          aria-label="Talksy AI logo"
        >
          <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
        </svg>
        <p className="splash-screen__label">TALKSY.AI</p>
      </div>
    </div>
  );
}

export default SplashScreen;
