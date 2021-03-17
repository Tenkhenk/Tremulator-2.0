import React, { FC, useContext, useEffect, useState } from "react";
import { AppContext } from "../context/app-context";

export const Alert: FC = () => {
  const context = useContext(AppContext);

  // State
  const [visible, setVisible] = useState<Boolean>(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // When message change
  // => update the state
  useEffect(() => {
    let timeout: number | null = null;
    if (context.alertMessage.message) {
      setVisible(true);
      timeout = context.alertMessage.type !== "warning" ? window.setTimeout(() => setVisible(false), 5000) : null;
      setTimeoutId(timeout);
    }
    // cleanup
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [context.alertMessage]);

  return (
    <>
      {visible && (
        <div className={`alert alert-${context.alertMessage.type} visible`} role="alert">
          {context.alertMessage.message}
          <button
            type="button"
            className="close"
            aria-label="Close"
            title="Close"
            onClick={() => {
              if (timeoutId) window.clearTimeout(timeoutId);
              setVisible(false);
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </>
  );
};
