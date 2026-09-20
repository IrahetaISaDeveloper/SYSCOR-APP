# SYSCOR — Sistema de Gestión Integral para Taquería El Corral

SYSCOR es una solución tecnológica desarrollada a medida para optimizar y modernizar las operaciones administrativas, contables y comerciales de Taquería El Corral. El sistema combina una plataforma web de gestión interna con aplicaciones móviles orientadas al cliente final y al personal del local, resultado de un proceso formal de levantamiento de requerimientos y entrevistas directas con la administración del negocio.

Este repositorio contiene **las aplicaciones móviles** del sistema: la app de clientes y la app de empleados.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Funcionalidades](#funcionalidades)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Dependencias del Proyecto](#dependencias-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Variables de Entorno](#variables-de-entorno)
- [Roles del Sistema](#roles-del-sistema)
- [Licencia](#licencia)

## Descripción General

El proyecto surge como respuesta a los desafíos operativos identificados en Taquería El Corral: desorden en el registro de compras, dificultades en la gestión del personal, pérdida de ventas en horarios de alta demanda, y ausencia de herramientas para la administración de eventos. SYSCOR centraliza estas áreas en un sistema unificado, reduciendo errores humanos y mejorando la eficiencia general del negocio.

Las aplicaciones móviles están separadas en **dos proyectos Expo independientes** que comparten código común mediante npm workspaces. Cada una se compila y distribuye por separado, con su propio identificador de aplicación:

| App | Directorio | Identificador | Dirigida a |
|---|---|---|---|
| **El Corral** | `apps/customer/` | `com.syscor.clientes` | Cliente final |
| **El Corral Staff** | `apps/employee/` | `com.syscor.empleados` | Meseros y cocina |

> El sistema fue desarrollado utilizando convención **camelCase** en nombres de variables, funciones y campos de base de datos.

## Funcionalidades

### Aplicación de Clientes

- Visualización del menú con fotografías y descripción de productos
- Detalle de producto con selección de extras, complementos y cantidad
- Carrito de compras con cálculo de totales
- Registro de cliente con verificación por código enviado al correo
- Recuperación de contraseña mediante código de verificación
- Perfil del cliente
- Pagos en línea mediante la pasarela **Wompi**

### Aplicación de Empleados

**Módulo de Mesero**
- Mapa interactivo de mesas del local con su estado en tiempo real
- Asignación de clientes a mesas
- Creación y edición de comandas por mesa
- Administración de mesas: alta, estado y capacidad

**Módulo de Cocina**
- Tablero de comandas activas con filtros por estado (pendientes, en preparación, retrasadas)
- Avance del estado de cada comanda a lo largo del flujo de preparación
- División de comandas por área: bebidas, comida general y especialidades mexicanas

**Común a ambos puestos**
- Inicio de sesión exclusivo para personal del local
- Perfil del empleado con sus datos y puesto asignado

## Tecnologías Utilizadas

### Aplicación Móvil
- React Native
- Expo SDK 57
- React Navigation (stack y bottom tabs)

### Backend (repositorio aparte)
- Node.js
- Express.js 5
- MongoDB / Mongoose

### Frontend Web (repositorio aparte)
- React.js

### Autenticación y Seguridad
- JSON Web Tokens (JWT) transportados en cookies `httpOnly`
- Bcrypt

### Servicios Externos
- Nodemailer (notificaciones por correo)
- Wompi (pagos en línea)
- Cloudinary (almacenamiento y gestión de imágenes)

## Dependencias del Proyecto

Ambas aplicaciones (`apps/customer/package.json` y `apps/employee/package.json`) comparten el mismo conjunto de dependencias:

| Paquete | Versión | Uso |
|---|---|---|
| `expo` | ~57.0.24 | Plataforma y herramientas de React Native |
| `react` | 19.2.3 | Librería de interfaz de usuario |
| `react-native` | 0.86.3 | Framework de aplicaciones móviles nativas |
| `@react-navigation/native` | ^7.4.1 | Núcleo de navegación |
| `@react-navigation/native-stack` | ^7.19.2 | Navegación por pila (stack) |
| `@react-navigation/bottom-tabs` | ^7.19.2 | Navegación por pestañas inferiores |
| `react-native-screens` | ~4.26.0 | Optimización nativa de pantallas |
| `react-native-safe-area-context` | ~5.7.0 | Manejo de áreas seguras del dispositivo |
| `@react-native-async-storage/async-storage` | 2.2.0 | Almacenamiento local persistente (sesión) |
| `axios` | ^1.20.0 | Cliente HTTP para consumo de la API |
| `@expo/vector-icons` | ^15.0.2 | Iconografía de la interfaz |
| `expo-font` | ~57.0.4 | Carga de tipografías personalizadas |
| `expo-splash-screen` | ~57.0.9 | Pantalla de carga inicial |
| `expo-status-bar` | ~57.0.1 | Control de la barra de estado |
| `@syscor/shared` | * | Paquete interno de código compartido |

> Las versiones de los paquetes nativos las fija el Expo SDK. Para actualizarlas se debe usar `npx expo install --fix` dentro de cada app, no `npm update`.

## Estructura del Proyecto

El repositorio es un **monorepo con npm workspaces**. Las dos aplicaciones son independientes entre sí y solo se comunican a través del paquete compartido.

```
SYSCOR-APP/
├── apps/
│   ├── customer/                  App de clientes
│   │   ├── assets/
│   │   ├── src/
│   │   │   ├── context/           CartContext
│   │   │   ├── hooks/             useMenu, useCart, usePayment, useCustomerAuth...
│   │   │   ├── screens/
│   │   │   │   └── auth/          Login, registro, verificación, recuperación
│   │   │   ├── services/          api, recoveryPasswordApi
│   │   │   ├── styles/
│   │   │   └── utils/
│   │   ├── App.js
│   │   ├── app.json
│   │   ├── index.js
│   │   └── package.json
│   │
│   └── employee/                  App de empleados
│       ├── assets/
│       ├── src/
│       │   ├── components/
│       │   │   └── waiterDashboard/   Mapa de mesas y modales de comanda
│       │   ├── hooks/             useWaiterDashboard, useOrders, useTableManagement...
│       │   ├── screens/
│       │   │   ├── auth/          Login de empleado
│       │   │   ├── waiter/        Dashboard y perfil del mesero
│       │   │   └── chef/          Comandas y perfil de cocina
│       │   ├── services/          waiterDashboardApi, tablesApi, kitchenOrdersApi...
│       │   └── styles/
│       ├── App.js
│       ├── app.json
│       ├── index.js
│       └── package.json
│
├── packages/
│   └── shared/                    Código común a ambas apps
│       ├── assets/
│       ├── src/
│       │   ├── components/        Componentes de interfaz reutilizables
│       │   ├── config/            env.js — URL del backend
│       │   ├── constants/         roles.js
│       │   ├── context/           AuthContext
│       │   ├── hooks/             useForm
│       │   ├── navigation/        AppTabBar, BootGate
│       │   ├── screens/           Splash, onboarding, bienvenida
│       │   ├── services/          apiClient
│       │   ├── styles/            theme y estilos compartidos
│       │   └── utils/
│       └── package.json
│
├── package.json                   Definición de los workspaces
└── README.md
```

### Reglas de organización del código

- Lo que usan **ambas** apps vive en `packages/shared` y se importa como `@syscor/shared/src/<ruta>`.
- Una app **nunca** importa código de la otra. Si algo debe compartirse, se mueve a `packages/shared`.
- `packages/shared` no importa nada de `apps/`.

## Instalación y Configuración

### Prerrequisitos

- Node.js v18 o superior
- npm v8 o superior (con soporte para workspaces)
- Expo Go en un dispositivo físico, o Android Studio / Xcode para emuladores
- El backend de SYSCOR en ejecución (local o desplegado)

### 1. Clonar el repositorio

```bash
git clone https://github.com/IrahetaISaDeveloper/SYSCOR-APP.git
cd SYSCOR-APP
```

### 2. Instalar las dependencias

Se instalan **una sola vez desde la raíz**. npm enlaza automáticamente ambas apps con el paquete compartido:

```bash
npm install
```

> No ejecutar `npm install` dentro de `apps/customer` o `apps/employee`: eso rompe el enlace de los workspaces.

### 3. Levantar la aplicación de Clientes

```bash
npm run customer
```

### 4. Levantar la aplicación de Empleados

```bash
npm run employee
```

Cualquiera de los dos comandos inicia Metro y muestra un código QR para abrir la app con Expo Go. Ambas aplicaciones pueden ejecutarse al mismo tiempo; la segunda usará un puerto distinto.

### 5. Compilar en un emulador o dispositivo

```bash
npm run customer:android
npm run employee:android
```

Como cada app tiene un identificador propio, ambas pueden instalarse simultáneamente en el mismo dispositivo sin sobrescribirse.

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run customer` | Inicia Metro para la app de clientes |
| `npm run employee` | Inicia Metro para la app de empleados |
| `npm run customer:android` | Compila e instala la app de clientes en Android |
| `npm run employee:android` | Compila e instala la app de empleados en Android |
| `npx expo-doctor` | Verifica la salud y compatibilidad del proyecto |

## Variables de Entorno

La URL del backend está centralizada en `packages/shared/src/config/env.js` y apunta por defecto al servidor desplegado en producción. No es necesario configurar nada para trabajar contra ese entorno.

Para apuntar a un backend local, crear un archivo `.env.local` dentro de la carpeta de la app correspondiente:

```env
# apps/customer/.env.local  (o apps/employee/.env.local)

# Emulador de Android — 10.0.2.2 es la IP con la que el emulador accede al localhost de la PC
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api

# iOS o web
# EXPO_PUBLIC_API_URL=http://localhost:4000/api

# Dispositivo físico — usar la IP de la PC en la red local
# EXPO_PUBLIC_API_URL=http://192.168.1.100:4000/api
```

Únicamente las variables con el prefijo `EXPO_PUBLIC_` quedan disponibles dentro de la aplicación. Tras modificar un `.env.local` hay que reiniciar Metro limpiando la caché:

```bash
npx expo start --clear
```

> Los archivos `.env.local` nunca deben subirse al repositorio. Ya están incluidos en `.gitignore`.

## Roles del Sistema

La sesión se resuelve al iniciar la aplicación y determina qué pantallas se muestran. Cada app admite únicamente los roles que le corresponden: si un empleado inicia sesión en la app de clientes, o viceversa, la aplicación lo indica y no permite el acceso.

| Rol | Aplicación | Descripción |
|---|---|---|
| **Cliente** | El Corral | Consulta de menú, pedidos en línea y pagos |
| **Empleado — Mesero** | El Corral Staff | Gestión de mesas, asignación de clientes y comandas |
| **Empleado — Cocina** | El Corral Staff | Tablero de comandas y avance de su preparación |
| **Administrador** | Plataforma web | Acceso completo a todos los módulos de gestión |

## Licencia
<img width="800" height="800" alt="image" src="https://github.com/user-attachments/assets/d0112078-f0b1-41ee-92ac-a0ef172ba244" />

Proyecto desarrollado como propuesta tecnológica para Taquería El Corral. Todos los derechos reservados.
