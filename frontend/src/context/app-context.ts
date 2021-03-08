import React, { Context } from "react";
import { AlertMessage, CollectionFullType } from "../types/index";

export interface AppContextType {
  alertMessage: AlertMessage;
  currentCollection: CollectionFullType | null;
  modalTarget?: HTMLDivElement;
  setAlertMessage: (message: AlertMessage) => void;
  setCurrentCollection: (collection: CollectionFullType | null) => void;
}

export const AppContext: Context<AppContextType> = React.createContext<AppContextType>({
  alertMessage: { message: "", type: "" },
  currentCollection: null,
  setAlertMessage: (message: AlertMessage) => {},
  setCurrentCollection: (collection: CollectionFullType | null) => {},
});
