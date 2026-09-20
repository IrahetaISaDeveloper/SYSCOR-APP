// Deriva un nombre para mostrar a partir del objeto `user` que entrega /auth/me,
// que trae forma distinta para empleados (personalInfo.name/lastname) y clientes (name).
export function getDisplayName(user) {
  if (!user) return '';
  const personal = user.personalInfo;
  if (personal?.name) return `${personal.name} ${personal.lastname || ''}`.trim();
  return user.name || user.fullName || user.email || '';
}

// Solo el primer nombre, útil para saludos cortos ("Hola, Ricardo").
export function getFirstName(user) {
  const fullName = getDisplayName(user);
  return fullName.split(' ')[0] || '';
}
