import React, { Context } from "react";
import { AlertMessage } from "../types/index";

export interface AppContextType {
  alertMessage: AlertMessage;
  modalTarget: { current: HTMLDivElement | null };
  setAlertMessage: (message: AlertMessage) => void;
}

export const AppContext: Context<AppContextType> = React.createContext<AppContextType>({
  alertMessage: { message: "", type: "" },
  modalTarget: { current: null },
  setAlertMessage: (message: AlertMessage) => {},
});
