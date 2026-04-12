import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import './ContactMessages.css';

function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all'); // all | unread | read
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/contact-messages');
      setMessages(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los mensajes de contacto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (messages || []).filter((m) => {
      const matchesFilter =
        filter === 'all' ? true : filter === 'unread' ? !m.read : Boolean(m.read);
      const matchesSearch =
        !term ||
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.message?.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [messages, filter, search]);

  const markRead = async (id, read) => {
    try {
      await api.put(`/admin/contact-messages/${id}/read`, null, { params: { read } });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read } : m))
      );
      if (selected?.id === id) setSelected((prev) => ({ ...prev, read }));
    } catch (err) {
      console.error(err);
      setError('No se pudo actualizar el estado del mensaje');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) return <div className="loading">Cargando mensajes...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="contact-messages-container">
      <div className="contact-messages-header">
        <h2>Mensajes de Contacto</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Buscar por nombre, email o mensaje..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Todos</option>
            <option value="unread">No leídos</option>
            <option value="read">Leídos</option>
          </select>
          <button className="refresh-button" onClick={load} title="Recargar">
            🔄
          </button>
          <p className="count">Total: {filtered.length}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No hay mensajes para mostrar.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className={m.read ? 'is-read' : 'is-unread'}>
                  <td>
                    <span className={`badge ${m.read ? 'read' : 'unread'}`}>
                      {m.read ? 'Leído' : 'Nuevo'}
                    </span>
                  </td>
                  <td className="date-cell">{formatDateTime(m.createdAt)}</td>
                  <td className="name-cell">{m.name || '-'}</td>
                  <td className="email-cell">{m.email || '-'}</td>
                  <td className="actions-cell">
                    <button className="view-button" onClick={() => setSelected(m)}>
                      👁️ Ver
                    </button>
                    <button
                      className="toggle-button"
                      onClick={() => markRead(m.id, !m.read)}
                    >
                      {m.read ? 'Marcar no leído' : 'Marcar leído'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="message-modal-overlay" onClick={() => setSelected(null)}>
          <div className="message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mensaje #{selected.id}</h3>
              <button className="close-button" onClick={() => setSelected(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="meta">
                <div><strong>Estado:</strong> {selected.read ? 'Leído' : 'Nuevo'}</div>
                <div><strong>Fecha:</strong> {formatDateTime(selected.createdAt)}</div>
                <div><strong>Nombre:</strong> {selected.name}</div>
                <div><strong>Email:</strong> {selected.email}</div>
              </div>
              <div className="message-box">
                {selected.message}
              </div>
            </div>
            <div className="modal-footer">
              <a className="reply-link" href={`mailto:${selected.email}?subject=Re:%20Consulta%20desde%20tu%20web`}>
                Responder por email
              </a>
              <button
                className="toggle-button"
                onClick={() => markRead(selected.id, !selected.read)}
              >
                {selected.read ? 'Marcar no leído' : 'Marcar leído'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ContactMessages;

