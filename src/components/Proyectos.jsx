import React, { useState, useEffect } from 'react';

const Proyectos = () => {
  const [proyectos, setProyectos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtener el token almacenado

        if (!token) {
          setError('Token no encontrado. Por favor, inicia sesión.');
          return;
        }

        const response = await fetch('http://localhost:8080/api/proyectos', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Adjuntar el token en la cabecera
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener los proyectos.');
        }

        const data = await response.json();
        setProyectos(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProyectos();
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Lista de Proyectos</h2>
      <ul>
        {proyectos.map(proyecto => (
          <li key={proyecto.id}>{proyecto.titulo} - {proyecto.estado}</li>
        ))}
      </ul>
    </div>
  );
};

export default Proyectos;
