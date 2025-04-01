import { useEffect, useRef } from "react";

export default function useClickOutside(callbackHandler) {
  const ref = useRef();

  useEffect(() => {
    let mouseDownFunc = (event) => {
      // Ensure ref.current exists and event target is outside of it
      if (ref.current && !ref.current.contains(event.target)) {
        callbackHandler();
      }
    };

    document.addEventListener("mousedown", mouseDownFunc);
    return () => {
      document.removeEventListener("mousedown", mouseDownFunc);
    };
  }, [callbackHandler]);

  return ref;
}
