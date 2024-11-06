import React, { useState } from 'react';
import './DetalleAlumno.css'; // Importa el CSS
import FileUpload from '../docs/FileUpload';

const DetalleAlumno = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [comentario, setComentario] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' o 'reject'

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleDownload = (etapa) => {
    alert(`Documento de ${etapa} descargado.`);
  };

  const handleModalOpen = (etapa, action) => {
    setSelectedEntrega(etapa);
    setActionType(action);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setComentario('');
    setConfirmChecked(false);
  };

  const handleModalSubmit = () => {
    if (confirmChecked) {
      const action = actionType === 'approve' ? 'aprobada' : 'rechazada';
      alert(`Entrega de ${selectedEntrega} ${action} con comentario: ${comentario}`);
      handleModalClose();
    } else {
      alert('Debe confirmar la acción marcando la casilla.');
    }
  };

  const accordionItems = [
    {
      title: "Propuesta (Aceptada)",
      estado: "aceptada",
      comentario: "La propuesta es sólida y cumple con todos los requisitos.",
      fechaEntrega: "2024-01-15",
      calificacion: "10/10",
      content: (
        <>
          <p><strong>Comentario del asesor:</strong> La propuesta es sólida y cumple con todos los requisitos.</p>
          <p><strong>Fecha de Entrega:</strong> 2024-01-15</p>
          <button className="btn-descargar" onClick={() => handleDownload("Propuesta")}>Descargar Documento</button>
        </>
      ),
    },
    {
      title: "1ra Entrega (Rechazada)",
      estado: "rechazada",
      comentario: "No se cumplió con los objetivos planteados para esta entrega.",
      fechaEntrega: "2024-02-20",
      calificacion: "5/10",
      content: (
        <>
          <p><strong>Comentario del asesor:</strong> No se cumplió con los objetivos planteados para esta entrega.</p>
          <p><strong>Fecha de Entrega:</strong> 2024-02-20</p>
          <button className="btn-descargar" onClick={() => handleDownload("1ra Entrega")}>Descargar Documento</button>
        </>
      ),
    },
    {
      title: "1da Entrega (Pendiente de Revisión)",
      estado: "pendiente",
      fechaEntrega: "2024-03-15",
      content: (
        <>
          <p><strong>Fecha de Entrega:</strong> 2024-03-15</p>
          <button className="btn-descargar" onClick={() => handleDownload("2da Entrega")}>Descargar Documento</button>
          <button className="btn-aprobar-rechazar" onClick={() => handleModalOpen("2da Entrega", 'approve')}>Aprobar Entrega</button>
          <button className="btn-aprobar-rechazar" onClick={() => handleModalOpen("2da Entrega", 'reject')}>Rechazar Entrega</button>
        </>
      ),
    },
    {
      title: "Entrega Final (Pendiente de Entrega)",
      estado: "pendiente",
      fechaEntrega: "2024-04-30",
      content: (
        <>
          {/* <p><strong>Fecha de Entrega:</strong> 2024-04-30</p>
          <button className="btn-descargar" onClick={() => handleDownload("Entrega Final")}>Descargar Documento</button>
          <button className="btn-aprobar-rechazar" onClick={() => handleModalOpen("Entrega Final", 'approve')}>Aprobar Entrega</button>
          <button className="btn-aprobar-rechazar" onClick={() => handleModalOpen("Entrega Final", 'reject')}>Rechazar Entrega</button> */}
        </>
      ),
    }
  ];

  return (
    <div className="detalle-alumno-container">
      <h2 className="title">Gestión de Entregas del Alumno</h2>
      <div className="accordion">
        {accordionItems.map((item, index) => (
          <div
            key={index}
            className={`accordion-content ${activeIndex === index ? 'is-expanded' : ''} ${item.estado}`}
          >
            <header onClick={() => toggleAccordion(index)} style={{ cursor: 'pointer' }}>
              <span className="accordion-content-title">
                {item.title}
              </span>
              <i className={`fa-solid ${activeIndex === index ? 'fa-minus' : 'fa-plus'}`}></i>
            </header>
            <div
              className="accordion__content"
              style={{ height: activeIndex === index ? 'auto' : '0' }}
            >
              <div className="accordion-content-description">
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>{`${actionType === 'approve' ? 'Aprobar' : 'Rechazar'} Entrega de ${selectedEntrega}`}</h3>
            <textarea
              className="comentario-textarea"
              placeholder="Agrega un comentario sobre esta entrega..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            ></textarea>
            <div className="checkbox-container">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
                id="confirmar-accion"
              />
              <label htmlFor="confirmar-accion">Confirmo mi decisión</label>
            </div>
            <button className="btn-confirmar" onClick={handleModalSubmit}>Confirmar</button>
            <button className="btn-cerrar" onClick={handleModalClose}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalleAlumno;
