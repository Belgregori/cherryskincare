/**
 * Utilidades de accesibilidad.
 * 
 * Funciones helper para mejorar la accesibilidad de la aplicación.
 */

import { capitalizeFirst } from './formatUtils';

/**
 * Genera un ID único para elementos que necesitan ser referenciados por aria-labelledby o aria-describedby.
 */
export const generateAriaId = (prefix = 'aria') => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Obtiene el texto alternativo descriptivo para una imagen de producto.
 * 
 * @param {object} product - El producto
 * @param {string} context - Contexto adicional (opcional)
 * @returns {string} - Texto alternativo descriptivo
 */
export const getProductImageAlt = (product, context = '') => {
  if (!product) return 'Imagen de producto';
  
  const parts = [];
  if (product.name) parts.push(capitalizeFirst(product.name));
  if (product.category) parts.push(`categoría ${product.category}`);
  if (context) parts.push(context);
  
  return parts.length > 0 
    ? `Imagen de ${parts.join(', ')}` 
    : 'Imagen de producto';
};

/**
 * Obtiene el texto alternativo para un botón de acción.
 * 
 * @param {string} action - La acción (ej: 'agregar', 'eliminar', 'editar')
 * @param {string} item - El item sobre el que se actúa (ej: 'producto', 'carrito')
 * @returns {string} - Texto alternativo descriptivo
 */
export const getActionButtonAlt = (action, item) => {
  const actions = {
    add: 'Agregar',
    remove: 'Eliminar',
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver',
    close: 'Cerrar',
    open: 'Abrir',
  };
  
  const actionText = actions[action.toLowerCase()] || action;
  return `${actionText} ${item}`;
};

/**
 * Obtiene el texto para aria-label de un campo de formulario.
 * 
 * @param {string} label - El label del campo
 * @param {boolean} required - Si el campo es requerido
 * @returns {string} - Texto para aria-label
 */
export const getFormFieldAriaLabel = (label, required = false) => {
  return required ? `${label}, campo requerido` : label;
};

/**
 * Obtiene el texto para aria-describedby cuando hay un mensaje de error.
 * 
 * @param {string} fieldId - ID del campo
 * @returns {string} - ID del elemento que describe el error
 */
export const getErrorDescriptionId = (fieldId) => {
  return `${fieldId}-error`;
};

/**
 * Obtiene el texto para aria-describedby cuando hay ayuda adicional.
 * 
 * @param {string} fieldId - ID del campo
 * @returns {string} - ID del elemento que describe la ayuda
 */
export const getHelpDescriptionId = (fieldId) => {
  return `${fieldId}-help`;
};

/**
 * Valida si un elemento es accesible por teclado.
 * 
 * @param {HTMLElement} element - El elemento a validar
 * @returns {boolean} - true si es accesible por teclado
 */
export const isKeyboardAccessible = (element) => {
  if (!element) return false;
  
  // Elementos nativamente accesibles por teclado
  const accessibleElements = ['button', 'a', 'input', 'select', 'textarea'];
  if (accessibleElements.includes(element.tagName.toLowerCase())) {
    return true;
  }
  
  // Elementos con tabindex >= 0
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex !== null && parseInt(tabIndex) >= 0) {
    return true;
  }
  
  // Elementos con role interactivo
  const role = element.getAttribute('role');
  const interactiveRoles = [
    'button', 'link', 'menuitem', 'option', 'tab', 'checkbox', 'radio',
    'switch', 'textbox', 'combobox', 'slider', 'spinbutton'
  ];
  if (role && interactiveRoles.includes(role)) {
    return true;
  }
  
  return false;
};

/**
 * Enfoca el primer elemento accesible por teclado en un contenedor.
 * 
 * @param {HTMLElement} container - El contenedor
 */
export const focusFirstAccessibleElement = (container) => {
  if (!container) return;
  
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([aria-disabled="true"])',
  ].join(', ');
  
  const firstFocusable = container.querySelector(focusableSelectors);
  if (firstFocusable) {
    firstFocusable.focus();
  }
};

/**
 * Atrapa el foco dentro de un contenedor (útil para modales).
 * 
 * @param {HTMLElement} container - El contenedor
 * @param {HTMLElement} firstElement - Primer elemento enfocable
 * @param {HTMLElement} lastElement - Último elemento enfocable
 */
export const trapFocus = (container, firstElement, lastElement) => {
  if (!container || !firstElement || !lastElement) return;
  
  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Anuncia un mensaje a los lectores de pantalla.
 * 
 * @param {string} message - El mensaje a anunciar
 * @param {string} priority - 'polite' o 'assertive' (default: 'polite')
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remover después de que el lector de pantalla lo haya leído
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};
