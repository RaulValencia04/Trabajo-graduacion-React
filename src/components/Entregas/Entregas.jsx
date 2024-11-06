import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Entregas.css';
import FileUpload from '../docs/FileUpload';
import { AuthContext } from '../Auth/Context/AuthContext'; // Asegúrate de que la ruta sea correcta

const Entregas = () => {
  const { state } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Definir hooks al inicio del componente
  const [messages, setMessages] = useState([
    { id: 1, title: 'Primera Entrega', type: 'Entrega', text: 'Este es el primer avance del proyecto.', file: null, state: 'Visto', date: '2024-08-24', user: 'Estudiante' },
    { id: 2, title: 'Duda sobre el alcance', type: 'Duda', text: 'Tengo una duda sobre el alcance del proyecto.', file: null, state: 'No Visto', date: '2024-08-25', user: 'Estudiante' },
    { id: 3, title: 'Material de apoyo', type: 'Material', text: 'Adjunto un documento de referencia para el proyecto.', file: 'material.pdf', state: 'Visto', date: '2024-08-26', user: 'Asesor' },
    // ... más mensajes
  ]);
  const [filters, setFilters] = useState({
    title: '',
    state: '',
    type: '',
    startDate: '',
    endDate: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verificar si el usuario está autenticado y tiene el rol adecuado
  if (!state.logged) {
    navigate('/login'); // Redirigir al login si no está autenticado
    return null; // Retornar null para no renderizar nada mientras redirige
  }

  if (state.role !== 'Estudiante') {
    return <div>No tienes autorización para acceder a esta página.</div>;
  }

  const handleSendMessage = (newMessage) => {
    setMessages([...messages, newMessage]);
    setIsModalOpen(false);
  };

  const handleStateChange = (id) => {
    setMessages(messages.map(msg => msg.id === id ? { ...msg, state: msg.state === 'Visto' ? 'No Visto' : 'Visto' } : msg));
  };

  const filteredMessages = messages.filter(msg => {
    return (
      (filters.title === '' || msg.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.state === '' || msg.state === filters.state) &&
      (filters.type === '' || msg.type === filters.type) &&
      (filters.startDate === '' || new Date(msg.date) >= new Date(filters.startDate)) &&
      (filters.endDate === '' || new Date(msg.date) <= new Date(filters.endDate))
    );
  });

  return (
    <div className="entregas-container">
      <h2 className="title">Seguimiento de Proyecto</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />
        <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}>
          <option value="">Todos los estados</option>
          <option value="Visto">Visto</option>
          <option value="No Visto">No Visto</option>
        </select>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">Todos los tipos</option>
          <option value="Entrega">Entrega</option>
          <option value="Duda">Duda</option>
          <option value="Material">Material</option>
          <option value="Feedback">Feedback</option>
          <option value="Revisión">Revisión</option>
          <option value="Sugerencia">Sugerencia</option>
          <option value="Comentario General">Comentario General</option>
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      <div className="messages-list">
        {filteredMessages.map(msg => (
          <div key={msg.id} className={`message-item ${msg.state.toLowerCase()}`}>
            <div className="message-header">
              <h3>{msg.title}</h3>
              <div className="message-meta">
                <span className="message-type">{msg.type}</span>
                <span className={`message-state ${msg.state.toLowerCase()}`}>{msg.state}</span>
                <span className="message-date">{msg.date}</span>
                <label>
                  <input
                    type="checkbox"
                    checked={msg.state === 'Visto'}
                    onChange={() => handleStateChange(msg.id)}
                  />
                  Marcar como {msg.state === 'Visto' ? 'No Visto' : 'Visto'}
                </label>
              </div>
            </div>
            <p>{msg.text}</p>
            {msg.file && <p><a href={`/path/to/files/${msg.file}`} download>{msg.file}</a></p>}
          </div>
        ))}
      </div>

      <div className="send-message-button">
        <button onClick={() => setIsModalOpen(true)}>Enviar nuevo mensaje</button>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h3>Enviar nuevo mensaje</h3>
            <MessageForm onSendMessage={handleSendMessage} />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de formulario para enviar mensajes
const MessageForm = ({ onSendMessage }) => {
  const [form, setForm] = useState({
    title: '',
    type: 'Entrega',
    text: '',
    file: null,
    state: 'No Visto',
    date: new Date().toISOString().split('T')[0] // Formato de fecha YYYY-MM-DD
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage({ ...form, id: Date.now(), user: 'Estudiante' });
    setForm({
      title: '',
      type: 'Entrega',
      text: '',
      file: null,
      state: 'No Visto',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="message-form">
      <input
        type="text"
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
        <option value="Entrega">Entrega</option>
        <option value="Duda">Duda</option>
        <option value="Material">Material</option>
        <option value="Feedback">Feedback</option>
        <option value="Revisión">Revisión</option>
        <option value="Sugerencia">Sugerencia</option>
        <option value="Comentario General">Comentario General</option>
      </select>
      <textarea
        placeholder="Escribe tu mensaje aquí..."
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        required
      />
      <FileUpload onSuccess={(file) => setForm({ ...form, file: file.name })} />
      <button type="submit">Enviar</button>
    </form>
  );
};

export default Entregas;
