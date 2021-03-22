import React, { FC, useContext } from "react";
import { AppContext } from "../context/app-context";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  title?: string;
  icon?: string;
}

const Modal: FC<Props> = ({ onClose, title, icon, children }) => (
  <div role="dialog" className="modal" style={{ display: "block" }}>
    <div className="modal-backdrop" style={{ opacity: 0.2 }} onClick={() => onClose()} />
    <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1050 }}>
      <div className="modal-content">
        <div className="modal-header">
          {icon && <i className={`far ${icon}`}></i>}
          {title && <h5 className="modal-title">{title}</h5>}
          <button type="button" className="close" aria-label="Fermer" onClick={() => onClose()}>
            <i className="fas fa-times" />
          </button>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const ModalPortal: FC<Props> = (props) => {
  const context = useContext(AppContext);
  if (context.modalTarget.current) return createPortal(<Modal {...props} />, context.modalTarget.current);
  else return null;
};

export default ModalPortal;
