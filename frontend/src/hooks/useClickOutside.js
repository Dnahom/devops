import { useEffect, useRef } from "react";

export default function useClickOutside(callbackHandler) {
  const ref = useRef();
      if (!ref.current?.contains(event.target)) {

  useEffect(() => {
    let mouseDownFunc = (event) => {
        callbackHandler();
      }
    };
    document.addEventListener("mousedown", mouseDownFunc);
    return () => {
      document.removeEventListener("mousedown", mouseDownFunc);
    };
  }, [callbackHandler, ref]);

  return ref;
}
