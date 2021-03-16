import React, { FC, useContext, useEffect, useState } from "react";
import { AppContext } from "../context/app-context";

const Alert: FC<Props> = () => {
  const context = useContext(AppContext);

  // State
  const [visible, setVisible] = useState<Boolean>(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // When message change
  // => update the state
  useEffect(() => {
    setVisible(true);
    const id = context.alertMessage.type !== "warning" ? window.setTimeout(() => setVisible(false), 5000) : null;
    setTimeoutId(id);

    // cleanup
    return () => {
      if (id) window.clearTimeout(id);
    };
  }, [context.alertMessage]);

  return (
    <div className={`alert alert-${context.alertMessage.type} ` + (visible ? "visible" : "invisible")} role="alert">
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
  );
};
export default Alert;
