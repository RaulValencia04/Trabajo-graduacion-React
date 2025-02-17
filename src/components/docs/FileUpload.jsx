import React, { useState, useContext } from "react";
import { useDropzone } from "react-dropzone";
import { AuthContext } from "../Auth/Context/AuthContext";
import "./FileUpload.css";

const FileUpload = ({
  fileName,
  selectedFile,      // Lo maneja el padre
  isUploaded,        // Lo maneja el padre
  onFileSelect,      // Callback para avisar "hay nuevo archivo"
  onSetIsUploaded,   // Callback para avisar "se subió con éxito"
  onSuccess,         // Callback adicional, si deseas
}) => {
  const API_URL = process.env.REACT_APP_API_URL;
  const { state } = useContext(AuthContext);
  const { userId, token } = state;

  // Manejamos SOLO la previsualización local
  const [filePreview, setFilePreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Mostrar vista previa local
        setFilePreview(URL.createObjectURL(file));
        // Avisar al padre que se eligió un nuevo archivo
        if (onFileSelect) {
          onFileSelect(file);
        }
      }
    },
    // disabled: isUploaded, // si lo quieres desactivado luego de subir, déjalo; si no, coméntalo
  });

  // Subir el archivo al backend
  const uploadFile = async () => {
    if (!userId || !token) {
      console.error("Faltan credenciales de usuario o token");
      return;
    }
    if (!selectedFile) {
      console.warn("No hay archivo seleccionado");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
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

      // Notificamos al padre que se subió
      if (onSetIsUploaded) {
        onSetIsUploaded(true, rutaArchivo);
      }

      // Limpiar la previsualización local (opcional)
      setFilePreview(null);

      // Si quieres pasar la ruta al padre por otro callback
      if (onSuccess) {
        onSuccess(rutaArchivo);
      }

    } catch (error) {
      console.error("Error al subir el archivo:", error.message);
    }
  };

  return (
    <div className="file-upload-container">
      {isUploaded ? (
        // Estado: Archivo ya subido
        <div className="success-container">
          <div className="icon-success">✔</div>
          <p className="success-message">Archivo subido con éxito</p>
          {/* Podrías agregar un botón "Reemplazar archivo" o algo similar */}
        </div>
      ) : (
        // Estado: Aún no subido
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

          {/* Botón de subir solo si tenemos un selectedFile */}
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
