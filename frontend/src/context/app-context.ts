import React, { Context } from "react";
import { AlertMessage, CollectionFullType } from "../types/index";

export interface AppContextType {
  alertMessage: AlertMessage;
  modalTarget?: HTMLDivElement;
  setAlertMessage: (message: AlertMessage) => void;
}

export const AppContext: Context<AppContextType> = React.createContext<AppContextType>({
  alertMessage: { message: "", type: "" },
  setAlertMessage: (message: AlertMessage) => {},
});
