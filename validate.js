const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns { errors: {field: message}, value: cleanedObject }
// partial = true for PATCH (fields optional, but any given must be valid)
function validateStudent(body, { partial = false } = {}) {
  const errors = {};
  const value = {};
  const b = body && typeof body === 'object' ? body : {};

  const has = (k) => b[k] !== undefined;
  const need = (k) => !partial && !has(k) && (errors[k] = `${k} is required`);

  need('name'); need('email'); need('course'); need('year');

  if (has('name')) {
    const v = typeof b.name === 'string' ? b.name.trim() : '';
    if (v.length < 2 || v.length > 100) errors.name = 'name must be 2-100 characters';
    else value.name = v;
  }
  if (has('email')) {
    const v = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(v)) errors.email = 'email must be a valid address';
    else value.email = v;
  }
  if (has('course')) {
    const v = typeof b.course === 'string' ? b.course.trim() : '';
    if (!v) errors.course = 'course must be a non-empty string';
    else value.course = v;
  }
  if (has('year')) {
    if (!Number.isInteger(b.year) || b.year < 1 || b.year > 6) errors.year = 'year must be an integer from 1 to 6';
    else value.year = b.year;
  }
  if (partial && Object.keys(b).length === 0) errors._body = 'provide at least one field to update';

  return { errors, value };
}

module.exports = { validateStudent };
