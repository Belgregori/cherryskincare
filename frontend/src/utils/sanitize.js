/**
 * Utilidades para sanitización de entradas y prevención de XSS
 */

/**
 * Sanitiza una cadena de texto eliminando caracteres peligrosos
 * @param {string} input - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  // Escapar caracteres HTML peligrosos
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitiza un objeto recursivamente
 * @param {any} input - Objeto a sanitizar
 * @returns {any} - Objeto sanitizado
 */
export const sanitizeObject = (input) => {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    return sanitizeString(input);
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeObject(item));
  }

  if (typeof input === 'object') {
    const sanitized = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[sanitizeString(key)] = sanitizeObject(input[key]);
      }
    }
    return sanitized;
  }

  return input;
};

/**
 * Valida y sanitiza un email
 * @param {string} email - Email a validar
 * @returns {string|null} - Email sanitizado o null si es inválido
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') {
    return null;
  }

  // Remover espacios y convertir a minúsculas
  const trimmed = email.trim().toLowerCase();

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // Sanitizar pero permitir caracteres válidos de email
  return trimmed.replace(/[<>"']/g, '');
};

/**
 * Valida y sanitiza una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {string|null} - Contraseña sanitizada o null si es inválida
 */
export const sanitizePassword = (password) => {
  if (typeof password !== 'string') {
    return null;
  }

  // Remover espacios al inicio y final
  const trimmed = password.trim();

  // Validar longitud mínima
  if (trimmed.length < 8) {
    return null;
  }

  return trimmed;
};

/**
 * Sanitiza HTML para prevenir XSS
 * @param {string} html - HTML a sanitizar
 * @returns {string} - HTML sanitizado
 */
export const sanitizeHTML = (html) => {
  if (typeof html !== 'string') {
    return '';
  }

  // Crear un elemento temporal para escapar HTML
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Valida que una URL sea segura
 * @param {string} url - URL a validar
 * @returns {boolean} - true si la URL es segura
 */
export const isValidURL = (url) => {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    // Solo permitir http, https
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Sanitiza un número
 * @param {any} input - Valor a sanitizar
 * @returns {number|null} - Número o null si es inválido
 */
export const sanitizeNumber = (input) => {
  if (typeof input === 'number' && !isNaN(input)) {
    return input;
  }

  if (typeof input === 'string') {
    const parsed = parseFloat(input);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
};

/**
 * Sanitiza un ID (número entero positivo)
 * @param {any} input - Valor a sanitizar
 * @returns {number|null} - ID o null si es inválido
 */
export const sanitizeId = (input) => {
  const num = sanitizeNumber(input);
  if (num !== null && Number.isInteger(num) && num > 0) {
    return num;
  }
  return null;
};
