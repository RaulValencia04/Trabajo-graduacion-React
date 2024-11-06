import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css'; // Importa tu CSS para el estilo

const FileUpload = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();
  const [filePreview, setFilePreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setValue('file', acceptedFiles); // Actualiza el valor del formulario con el archivo subido
      setFilePreview(URL.createObjectURL(acceptedFiles[0])); // Genera una URL de previsualización
    }
  });

  const onSubmit = async (data) => {
    console.log('Datos del formulario antes del envío:', data); // Log para depuración

    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('proyectoId', 2);
    formData.append('subidoPorId', 3);

    try {
      const token = localStorage.getItem('token'); // Recupera el token desde localStorage

      const response = await fetch('http://localhost:8080/api/documentos/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`, // Incluye el token en la cabecera Authorization
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const result = await response.json();
      console.log('Archivo subido con éxito:', result);
      if (onSuccess) {
        onSuccess(result); // Llama al callback de éxito con el resultado
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error);
    }
  };

  return (
    <div>
      <h2 className='title'>Subir Documento</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <div className='input-f'>
          <label>ID del Proyecto:</label>
          <input type="text" {...register('proyectoId', { required: true })} />
          {errors.proyectoId && <p>Este campo es obligatorio</p>}
        </div>
        <div className='input-f'>
          <label>ID del Usuario:</label>
          <input type="text" {...register('subidoPorId', { required: true })} />
          {errors.subidoPorId && <p>Este campo es obligatorio</p>}
        </div> */}
        <div  {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Suelta los archivos aquí...</p>
          ) : (
            <p>Arrastra y suelta el archivos, o haz clic para seleccionar archivos</p>
          )}
        </div>
        {filePreview && (
          <div className="file-preview">
            <p>Archivo seleccionado:</p>
            <img src={filePreview} alt="Previsualización" className="preview-image" />
          </div>
        )}
        {errors.file && <p>Este campo es obligatorio</p>}
        <button type="submit">Subir</button>
      </form>
    </div>
  );
};

export default FileUpload;
