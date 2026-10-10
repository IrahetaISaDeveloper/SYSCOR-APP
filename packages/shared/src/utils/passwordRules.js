// Reglas de contraseña del backend.
//
// Son las que aplica el servidor al registrar y al restablecer la
// contraseña; están aquí para poder avisar al cliente ANTES de enviar el
// formulario. Si el backend las cambia, hay que actualizarlas aquí también.
//
// Comprobadas contra /auth/recovery-password/new-password:
//   - al menos 8 caracteres
//   - al menos una letra mayúscula
//   - al menos una letra minúscula
//   - al menos un número
//   - al menos un carácter especial
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'Al menos 8 caracteres',
    test: (value) => (value || '').length >= 8,
  },
  {
    id: 'upper',
    label: 'Una letra mayúscula',
    test: (value) => /[A-Z]/.test(value || ''),
  },
  {
    id: 'lower',
    label: 'Una letra minúscula',
    test: (value) => /[a-z]/.test(value || ''),
  },
  {
    id: 'number',
    label: 'Un número',
    test: (value) => /[0-9]/.test(value || ''),
  },
  {
    id: 'special',
    label: 'Un carácter especial (!, @, #…)',
    test: (value) => /[^A-Za-z0-9]/.test(value || ''),
  },
];

// Estado de cada regla, para pintar la lista de requisitos.
export const checkPasswordRules = (password) =>
  PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));

export const isPasswordValid = (password) =>
  PASSWORD_RULES.every((rule) => rule.test(password));

// Primer requisito que falta, para el mensaje de error.
export const firstPasswordProblem = (password) => {
  const failed = PASSWORD_RULES.find((rule) => !rule.test(password));
  return failed ? `La contraseña necesita: ${failed.label.toLowerCase()}.` : null;
};

export default {
  PASSWORD_RULES,
  checkPasswordRules,
  isPasswordValid,
  firstPasswordProblem,
};
