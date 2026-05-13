import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getApiErrorMessage } from '../../utils/apiError';
import './UserList.css';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'No pudimos cargar la lista de usuarios.', {
          byStatus: {
            403: 'Tu sesión no tiene permiso para ver usuarios.',
            503: 'No pudimos cargar usuarios en este momento.',
          },
        })
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'role-admin';
      case 'USER':
        return 'role-user';
      default:
        return 'role-unknown';
    }
  };

  const getRoleLabel = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuario';
      default:
        return role || '-';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role?.toUpperCase() === roleFilter.toUpperCase();
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefone?.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>Gestión de Usuarios</h2>
        <div className="header-controls">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-filter"
          >
            <option value="all">Todos los roles</option>
            <option value="USER">Usuarios</option>
            <option value="ADMIN">Administradores</option>
          </select>
          <p className="user-count">Total: {filteredUsers.length} usuarios</p>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios {searchTerm ? `que coincidan con "${searchTerm}"` : roleFilter !== 'all' ? `con rol "${getRoleLabel(roleFilter)}"` : 'registrados'}</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Órdenes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="user-id">#{user.id}</td>
                  <td className="user-name">{user.name || '-'}</td>
                  <td className="user-email">{user.email || '-'}</td>
                  <td className="user-phone">{user.telefone || '-'}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="order-count-cell">
                    <span className="order-count-badge">{user.orderCount || 0}</span>
                  </td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => setSelectedUser(user)}
                      title="Ver detalles"
                    >
                      👁️ Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles de usuario */}
      {selectedUser && (
        <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de Usuario #{selectedUser.id}</h3>
              <button className="close-button" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="user-details-section">
                <h4>Información Personal</h4>
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span>#{selectedUser.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Nombre:</span>
                  <span>{selectedUser.name || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span>{selectedUser.email || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Teléfono:</span>
                  <span>{selectedUser.telefone || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Rol:</span>
                  <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div className="user-details-section">
                <h4>Actividad</h4>
                <div className="detail-row">
                  <span className="detail-label">Total de Órdenes:</span>
                  <span className="order-count-large">{selectedUser.orderCount || 0}</span>
                </div>
                {selectedUser.orderCount > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className="status-active">Cliente Activo</span>
                  </div>
                )}
                {selectedUser.orderCount === 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Estado:</span>
                    <span className="status-inactive">Sin Órdenes</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;


