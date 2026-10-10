// Preguntas predefinidas del panel de Chef Panchita en el login de empleados.
//
// Igual que las de clientes, pero sin "crear cuenta" ni "explorar el menú":
// las cuentas de empleado las da de alta administración.
//
// `recovery: true` marca las que llevan al flujo de recuperar contraseña.
export const EMPLOYEE_LOGIN_WELCOME =
  '¡Hola! Soy Chef Panchita. Puedo ayudarte a entrar a tu cuenta de empleado o a recuperar tu contraseña. ¿En qué te ayudo?';

export const EMPLOYEE_LOGIN_FAQ = [
  {
    id: 'olvide-contrasena',
    icon: 'key-outline',
    question: 'Olvidé mi contraseña',
    answer:
      'No hay problema, se recupera desde aquí mismo. Toca "¿Olvidaste tu contraseña?" y te enviaremos un código a tu correo para que definas una nueva.',
    recovery: true,
  },
  {
    id: 'codigo-no-llega',
    icon: 'mail-unread-outline',
    question: 'No me llega el código',
    answer:
      'Revisa tu carpeta de spam o correo no deseado, ahí suele caer. Ten en cuenta que el código dura poco, así que úsalo apenas llegue. Si ya pasaron unos minutos, puedes pedir uno nuevo con "Reenviar" en la pantalla del código.',
  },
  {
    id: 'credenciales-invalidas',
    icon: 'lock-closed-outline',
    question: 'Mi contraseña no funciona',
    answer:
      'Verifica que no tengas activadas las mayúsculas y que no haya espacios de más. Puedes tocar el ojo del campo para ver lo que escribiste. Si aun así no entra, lo más rápido es recuperar tu contraseña.',
    recovery: true,
  },
  {
    id: 'sin-cuenta',
    icon: 'person-add-outline',
    question: 'No tengo cuenta de empleado',
    answer:
      'Las cuentas de empleado no se crean desde la app: las da de alta administración. Pide a tu encargado que te registre con tu correo y te asigne tu puesto (mesero, cocina o repartidor).',
  },
  {
    id: 'app-clientes',
    icon: 'phone-portrait-outline',
    question: 'Soy cliente, ¿por qué no puedo entrar?',
    answer:
      'Esta app es solo para el equipo de El Corral. Para hacer pedidos descarga la app de clientes de El Corral e inicia sesión ahí con tu cuenta.',
  },
];

export default EMPLOYEE_LOGIN_FAQ;
