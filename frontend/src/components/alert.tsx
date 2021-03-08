import React, { FC, useContext, useEffect, useState } from "react";
import { AppContext, AppContextType } from "../context/app-context";


interface Props {
  }
  
const Alert: FC<Props> = (props:Props) => {
    const context = useContext(AppContext)
    const [visible, setVisible] = useState<Boolean>(false)
    const [timeoutInstance, setTimeoutInstance] = useState<any>()
    useEffect(() => {
        setVisible(true)
        if (context.alertMessage.type !== "warning")
            setTimeoutInstance(setTimeout(() => setVisible(false), 5000));
    },[context.alertMessage])

    return <div className={`alert alert-${context.alertMessage.type} `+(visible ? 'visible' : 'invisible')} role="alert">
            {context.alertMessage.message}
            <button type="button" className="close" aria-label="Close" 
                onClick={() => {
                    if (context.alertMessage.type !== "warning")
                        clearTimeout(timeoutInstance);
                    setVisible(false);}}>
                <i className="fas fa-times"></i>
            </button>
        </div>
}
export default Alert