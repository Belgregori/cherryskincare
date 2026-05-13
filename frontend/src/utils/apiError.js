/**
 * Mensaje legible a partir de un error típico de Axios (o similar).
 * Prioriza el cuerpo JSON del backend (`error`) y errores por campo (`fields`).
 *
 * @param {unknown} error
 * @param {string} [fallback] Mensaje cuando no hay detalle en la respuesta.
 * @param {{
 *   byStatus?: Record<number, string>,
 *   appendStatusToFallback?: boolean
 * }} [options]
 * - byStatus: mensajes por código HTTP cuando el cuerpo no aporta texto útil.
 * - appendStatusToFallback: si true, añade el código HTTP al final del fallback (solo depuración).
 */
export function getApiErrorMessage(
  error,
  fallback = 'Ocurrió un error. Intentá de nuevo.',
  options = {}
) {
  if (!error) return fallback;

  const opts = options && typeof options === 'object' ? options : {};
  const { byStatus, appendStatusToFallback = false } = opts;

  const data = error.response?.data;

  if (data && typeof data === 'object' && data.fields && typeof data.fields === 'object') {
    const entries = Object.entries(data.fields).filter(([, v]) => typeof v === 'string' && v.trim());
    if (entries.length > 0) {
      const detail = entries.map(([k, v]) => `${k}: ${v}`).join('. ');
      const head =
        typeof data.error === 'string' && data.error.trim() ? `${data.error.trim()}. ` : '';
      return `${head}${detail}`.trim();
    }
  }

  if (data && typeof data === 'object' && typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (error.response) {
    const status = error.response.status;
    if (byStatus && typeof byStatus[status] === 'string' && byStatus[status].trim()) {
      return byStatus[status].trim();
    }
    if (appendStatusToFallback) {
      return `${fallback} (código ${status})`;
    }
    return fallback;
  }
  if (error.request) {
    return 'No se pudo conectar al servidor. Comprobá tu conexión.';
  }
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}
