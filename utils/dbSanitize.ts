
/**
 * Gera um UUID v4 válido compatível com RFC4122.
 */
export function generateUUID(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch (e) {}

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sanitiza strings de UUID para o PostgreSQL.
 * Retorna null real se o valor for inválido, evitando o erro 22P02.
 */
export function sanitizeUUID(value?: string | null): string | null {
  if (!value) return null;
  
  const clean = String(value).trim().toLowerCase();
  
  if (clean === '' || clean === 'null' || clean === 'undefined') {
    return null;
  }
  
  // Validação simplificada mas eficaz para UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return uuidRegex.test(clean) ? clean : null;
}
