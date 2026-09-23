// Preguntas predefinidas del panel de Chef Panchita.
//
// Cada una trae su respuesta escrita: al tocarla se contesta al instante, sin
// pasar por el backend. Son las dudas más comunes de esta pantalla, así que
// el cliente resuelve lo habitual con un solo toque, y el chat con IA queda
// para lo que se salga de aquí.
//
// `recovery: true` marca las que llevan al flujo de recuperar contraseña.
export const LOGIN_FAQ = [
  {
    id: 'codigo-no-llega',
    icon: 'mail-unread-outline',
    question: 'No me llega el código',
    answer:
      'Revisa tu carpeta de spam o correo no deseado, ahí suele caer. Ten en cuenta que el código dura poco, así que úsalo apenas llegue. Si ya pasaron unos minutos, puedes pedir uno nuevo con "Reenviar" en la pantalla de verificación.',
  },
  {
    id: 'olvide-contrasena',
    icon: 'key-outline',
    question: 'Olvidé mi contraseña',
    answer:
      'No hay problema, se recupera desde aquí mismo. Toca "¿Olvidaste tu contraseña?" y te enviaremos un código a tu correo para que definas una nueva.',
    recovery: true,
  },
  {
    id: 'correo-invalido',
    icon: 'at-outline',
    question: 'Dice que mi correo no es válido',
    answer:
      'Revisa que no tenga espacios al inicio o al final y que lleve bien el @ y el punto (por ejemplo: nombre@gmail.com). Si lo escribiste correcto y sigue sin aceptarlo, puede que aún no tengas cuenta: puedes crearla desde "Crear cuenta".',
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
    id: 'crear-cuenta',
    icon: 'person-add-outline',
    question: '¿Cómo creo mi cuenta?',
    answer:
      'Toca "Crear cuenta" abajo. Son tres pasos: tus datos, tu dirección de entrega y confirmar el código que te llega al correo. No tarda ni dos minutos.',
  },
  {
    id: 'pedir-sin-cuenta',
    icon: 'restaurant-outline',
    question: '¿Puedo pedir sin cuenta?',
    answer:
      'Puedes ver todo el menú sin cuenta con "Explorar el menú sin cuenta", pero para hacer un pedido sí necesitas registrarte: así sabemos a dónde llevarlo y puedes seguir tu orden.',
  },
];

export default LOGIN_FAQ;
