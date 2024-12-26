import React from 'react'; 
import InfoDocs from '../informacion/infodocs';
import './UploadProject.css'; // Importa el nuevo archivo CSS

const UploadProject = () => {


  return (
    <div className="upload-project-container">
      <h1 className='title'>Sube la propuesta de tu proyecto de graduacion</h1>
      <br />
      <div className="info-container mt-5 p-5">
        <p>
          Llene el fomumario para presentar su propuesta al decanato, escoja el tipo de trabajo de graduacion que deseas realizar para acceder al formulario
        </p>
        <h6>
          * Nota: el formulario facilitara el preceso de creacion de su propuesta pero preferentemente es desable que ya tenga la informacion lista que pondra. *
        </h6>
        <InfoDocs/>
        {/* <p className="info-text">
          Asegúrate de que tu documento cumpla con los requisitos del tipo de trabajo de graduación que vas a realizar para que tu propuesta sea aceptada. Arriba se muestran los requisitos para cada uno de ellos.
        </p> */}
        {/* <FileUpload onSuccess={handleFileUploadSuccess} /> */}
      </div>
    </div>
  );
};

export default UploadProject;
