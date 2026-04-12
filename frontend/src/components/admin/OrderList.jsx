import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import './OrderList.css';

function OrderList() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las órdenes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status?status=${newStatus}`);
      // Recargar órdenes después de actualizar
      loadOrders();
      if (selectedOrder?.id === orderId) {
        // Actualizar orden seleccionada si está abierta
        const updatedOrder = orders.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder({ ...updatedOrder, status: newStatus });
        }
      }
    } catch (err) {
      showToast('Error al actualizar el estado de la orden', { variant: 'error' });
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'SIN_CONFIRMAR':
        return 'status-pending';
      case 'PAGADO':
        return 'status-paid';
      case 'ENTREGADO':
        return 'status-delivered';
      default:
        return 'status-unknown';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toUpperCase()) {
      case 'SIN_CONFIRMAR':
        return 'Sin Confirmar';
      case 'PAGADO':
        return 'Pagado';
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return status || '-';
    }
  };

  const getShippingMethodLabel = (method) => {
    switch (method) {
      case 'gratis':
        return 'Envío Gratis';
      case 'uber':
        return 'Uber';
      case 'sabado':
        return 'Retiro Sábado';
      case 'retiro':
        return 'Retiro Personal';
      default:
        return method || '-';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status?.toUpperCase() === statusFilter.toUpperCase());

  if (loading) {
    return <div className="loading">Cargando órdenes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>Gestión de Órdenes</h2>
        <div className="header-controls">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Todas las órdenes</option>
            <option value="SIN_CONFIRMAR">Sin Confirmar</option>
            <option value="PAGADO">Pagado</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
          <p className="order-count">Total: {filteredOrders.length} órdenes</p>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No hay órdenes {statusFilter !== 'all' ? `con estado "${getStatusLabel(statusFilter)}"` : 'registradas'}</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Método Envío</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName || order.userName || '-'}</div>
                      <div className="customer-email">{order.userEmail || '-'}</div>
                    </div>
                  </td>
                  <td className="order-total">${order.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{getShippingMethodLabel(order.shippingMethod)}</td>
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-button"
                        onClick={() => setSelectedOrder(order)}
                        title="Ver detalles"
                      >
                        👁️ Ver
                      </button>
                      {order.status?.toUpperCase() !== 'SIN_CONFIRMAR' && (
                        <select
                          className="status-select"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="SIN_CONFIRMAR">Sin Confirmar</option>
                          <option value="PAGADO">Pagado</option>
                          <option value="ENTREGADO">Entregado</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles de orden */}
      {selectedOrder && (
        <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles de Orden #{selectedOrder.id}</h3>
              <button className="close-button" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="modal-content">
              <div className="order-details-section">
                <h4>Información del Cliente</h4>
                <div className="detail-row">
                  <span className="detail-label">Nombre:</span>
                  <span>{selectedOrder.customerName || selectedOrder.userName || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span>{selectedOrder.userEmail || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Teléfono:</span>
                  <span>{selectedOrder.shippingPhone || selectedOrder.userPhone || '-'}</span>
                </div>
              </div>

              <div className="order-details-section">
                <h4>Dirección de Envío</h4>
                <div className="detail-row">
                  <span className="detail-label">Dirección:</span>
                  <span>{selectedOrder.shippingAddress || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Ciudad:</span>
                  <span>{selectedOrder.shippingCity || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Código Postal:</span>
                  <span>{selectedOrder.shippingPostalCode || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dentro del anillo:</span>
                  <span>{selectedOrder.insideRing ? 'Sí' : 'No'}</span>
                </div>
              </div>

              <div className="order-details-section">
                <h4>Información de Envío y Pago</h4>
                <div className="detail-row">
                  <span className="detail-label">Método de Envío:</span>
                  <span>{getShippingMethodLabel(selectedOrder.shippingMethod)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Método de Pago:</span>
                  <span>{selectedOrder.paymentMethod || '-'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <select
                    className="status-select-modal"
                    value={selectedOrder.status}
                    onChange={(e) => {
                      handleStatusChange(selectedOrder.id, e.target.value);
                    }}
                  >
                    <option value="SIN_CONFIRMAR">Sin Confirmar</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="ENTREGADO">Entregado</option>
                  </select>
                </div>
              </div>

              <div className="order-details-section">
                <h4>Productos</h4>
                <div className="order-items-list">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">Producto ID: {item.productId}</span>
                        <span className="item-quantity">Cantidad: {item.quantity}</span>
                      </div>
                      <div className="item-pricing">
                        <span className="item-price">${item.price?.toFixed(2) || '0.00'} c/u</span>
                        <span className="item-subtotal">Subtotal: ${item.subtotal?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-details-section total-section">
                <div className="detail-row total-row">
                  <span className="detail-label">Total:</span>
                  <span className="order-total-amount">${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha de Creación:</span>
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
                {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                  <div className="detail-row">
                    <span className="detail-label">Última Actualización:</span>
                    <span>{formatDate(selectedOrder.updatedAt)}</span>
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

export default OrderList;


