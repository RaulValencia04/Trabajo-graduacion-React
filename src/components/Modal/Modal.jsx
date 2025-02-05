import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css'; // Archivo CSS para estilos del modal

const Modal = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root') // El contenedor debe estar en tu HTML principal
  );
};

export default Modal;
