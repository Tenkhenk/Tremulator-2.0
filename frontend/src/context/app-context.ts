import React, { Context } from "react";
import { AlertMessage } from "../types/index";

export interface AppContextType {
  alertMessage: AlertMessage;
  modalTarget?: HTMLDivElement;
  setAlertMessage: (a: AlertMessage) => void;
}

export const AppContext: Context<AppContextType> = React.createContext<AppContextType>({
  alertMessage: { message: "", type: "" },
  setAlertMessage: (a: AlertMessage) => {},
});
