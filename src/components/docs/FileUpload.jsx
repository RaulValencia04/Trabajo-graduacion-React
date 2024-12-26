import React, { useState, useContext, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { AuthContext } from "../Auth/Context/AuthContext"; // Asegúrate de importar correctamente tu contexto
// import { useApi } from "../Auth/Helpers/api";
import "./FileUpload.css";

const FileUpload = ({ onSuccess, fileName, initialUploaded = false }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext); // Extraer datos del contexto de autenticación
  const { userId, token } = state; // Obtener el `userId` y `token` del estado global
  // const { authFetch } = useApi();

  const [isUploaded, setIsUploaded] = useState(initialUploaded); // Estado inicial persistente
  const [filePreview, setFilePreview] = useState(null); // Previsualización del archivo
  const [uploadedFilePath, setUploadedFilePath] = useState(null); // Ruta del archivo subido
  const [selectedFile, setSelectedFile] = useState(null); // Archivo seleccionado

  // Sincronizar `initialUploaded` con el estado local al montar
  useEffect(() => {
    setIsUploaded(initialUploaded);
  }, [initialUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFilePreview(URL.createObjectURL(file));
        setSelectedFile(file);
      }
    },
    disabled: isUploaded, // Deshabilitar si el archivo ya fue subido
  });

  const uploadFile = async () => {
    if (!userId || !token) {
      console.error("userId o token no encontrados en el contexto");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("subidoPorId", userId); // Agregar el userId al FormData

    try {
      const response = await fetch(`${API_URL}/api/documentos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Agregar el token de autorización
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error al subir el archivo: ${errorText}`);
      }

      const rutaArchivo = await response.text();
      setIsUploaded(true);
      setUploadedFilePath(rutaArchivo);

      if (onSuccess) {
        onSuccess(rutaArchivo); // Propagar la ruta al componente padre
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
    }
  };

  return (
    <div className="file-upload-container">
      {isUploaded ? (
        <div className="success-container">
          <div className="icon-success">✔</div>
          <p className="success-message">Archivo subido con éxito</p>
          {uploadedFilePath && <p className="file-path">Ruta: {uploadedFilePath}</p>}
        </div>
      ) : (
        <div>
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} id={`file-input-${fileName}`} />
            {isDragActive ? (
              <p>Suelta el archivo aquí...</p>
            ) : (
              <p>Arrastra y suelta un archivo, o haz clic para seleccionar</p>
            )}
          </div>
          {filePreview && (
            <div className="file-preview">
              <p>Archivo seleccionado:</p>
              <img
                src={filePreview}
                alt="Previsualización"
                className="preview-image"
              />
            </div>
          )}
          {selectedFile && (
            <button type="button" onClick={uploadFile} className="upload-button">
              Subir archivo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
