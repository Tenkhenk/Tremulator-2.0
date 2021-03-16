import React, { FC } from "react";
import { AppContext } from "../context/app-context";
import { createPortal } from "react-dom";

interface Props {
  onClose: () => void;
  title?: string;
}

const Modal: FC<Props> = ({ onClose, title, children }) => (
  <div role="dialog" className="modal" style={{ display: "block" }}>
    <div className="modal-backdrop" style={{ opacity: 0.2 }} onClick={() => onClose()} />
    <div className="modal-dialog modal-dialog-centered" role="document" style={{ zIndex: 1050 }}>
      <div className="modal-content">
        <div className="modal-header">
          {title && (
            <h5 className="modal-title">
              <span>{title}</span>
            </h5>
          )}
          <button type="button" className="close" aria-label="Fermer" onClick={() => onClose()}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  </div>
);

const ModalPortal: FC<Props> = (props) => (
  <AppContext.Consumer>
    {(context) => context.modalTarget && createPortal(<Modal {...props} />, context.modalTarget)}
  </AppContext.Consumer>
);

export default ModalPortal;
