import React, { useState, useContext, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { AuthContext } from "../Auth/Context/AuthContext";
import "./FileUpload.css";

const FileUpload = ({ onSuccess, fileName, initialUploaded = false }) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { userId, token } = state;

  const [isUploaded, setIsUploaded] = useState(initialUploaded);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setIsUploaded(initialUploaded);
  }, [initialUploaded]);

  // Configuración de React Dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles,
  } = useDropzone({
    multiple: false,        // Sólo un archivo
    accept: {
      // Ejemplo: sólo imágenes; ajusta el MIME tipo según tu necesidad
      'image/*': []
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFilePreview(URL.createObjectURL(file));
        setSelectedFile(file);
      }
    },
    disabled: isUploaded,
  });

  const uploadFile = async (file) => {
    if (!userId || !token) {
      console.error("userId o token no encontrados en el contexto");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subidoPorId", userId);

    try {
      const response = await fetch(`${API_URL}/api/documentos/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
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
        onSuccess(rutaArchivo);
      }
    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile);
    } else {
      console.error("No se seleccionó ningún archivo");
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
          {/* Dropzone */}
          <div
            {...getRootProps({
              className: `dropzone ${isDragActive ? "isDragActive" : ""}`,
            })}
          >
            <input {...getInputProps()} id={`file-input-${fileName}`} />
            {isDragActive ? (
              <p>Suelta el archivo aquí...</p>
            ) : (
              <p>Arrastra y suelta un archivo, o haz clic para seleccionar</p>
            )}
          </div>

          {/* Previsualización */}
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

          {/* Botón de subir, solo visible si hay un archivo seleccionado */}
          {selectedFile && (
            <button type="button" onClick={handleUpload}>
              Subir archivo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
