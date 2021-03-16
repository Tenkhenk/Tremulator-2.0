import React, { Context, useState, PropsWithChildren, useRef } from "react";
import { AppContext } from "./app-context";
import { AlertMessage, CollectionFullType } from "../types/index";

interface Props {}

export const AppContextProvider: React.FC<Props> = (props: PropsWithChildren<Props>) => {
  const [alertMessage, setAlertMessage] = useState<AlertMessage>({ message: "", type: "" });
  const [currentCollection, setCurrentCollection] = useState<CollectionFullType | null>(null);
  const [currentImageID, setCurrentImageID] = useState<string | null>(null);
  const { children } = props;
  const modalTarget = useRef<HTMLDivElement>(null);

  return (
    <AppContext.Provider
      value={{
        alertMessage,
        currentCollection,
        currentImageID,
        modalTarget: modalTarget.current || undefined,
        setAlertMessage,
        setCurrentCollection,
        setCurrentImageID,
      }}
    >
      {children}
      <div className="modal-container" ref={modalTarget} />
    </AppContext.Provider>
  );
};
