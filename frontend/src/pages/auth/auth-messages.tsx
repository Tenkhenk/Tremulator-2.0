import React, { useContext, useEffect } from "react";
import {AppContext} from "../../context/app-context";
interface Props {}
export const Authenticating: React.FC<Props> = (props: Props) => {
  const {setAlertMessage} = useContext(AppContext)
  useEffect(()=>{setAlertMessage({message:"You are about to be redirected to Google© Authentication form.", type:"success"});},[setAlertMessage])
  return null;
};

export const Authenticated: React.FC<Props> = (props: Props) => {
  const {setAlertMessage} = useContext(AppContext)
  useEffect(()=>{setAlertMessage({message:"Authentication success. Welcome in Tremulator!", type:"success"});},[setAlertMessage])
  return null;
};

export const NotAuthenticated: React.FC<Props> = (props: Props) => {
  const {setAlertMessage} = useContext(AppContext)
  useEffect(()=>{setAlertMessage({message:"Authentication failed!", type:"warning"});},[setAlertMessage])
  return null;
};

export const SessionLost: React.FC<Props> = (props: Props) => {
  const {setAlertMessage} = useContext(AppContext)
  useEffect(()=>{setAlertMessage({message:"Your session has expired. Please login.", type:"warning"});},[setAlertMessage])
  return null;
};