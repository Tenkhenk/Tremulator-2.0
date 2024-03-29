import React, { useState, PropsWithChildren, useRef } from "react";
import { AppContext } from "./app-context";
import { AlertMessage } from "../types/index";

interface Props {}

export const AppContextProvider: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  const [alertMessage, setAlertMessage] = useState<AlertMessage>({ message: "", type: "" });
  const { children } = props;
  const modalTarget = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="modal-container" ref={modalTarget} />
      <AppContext.Provider
        value={{
          alertMessage,
          setAlertMessage,
          modalTarget: modalTarget,
        }}
      >
        {children}
      </AppContext.Provider>
    </>
  );
};
