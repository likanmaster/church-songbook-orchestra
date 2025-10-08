
# Church Songbook

Bienvenido a **Church Songbook**, una aplicación web diseñada para músicos e iglesias que desean organizar su repertorio y servicios de manera eficiente.

---

## Funcionalidades Principales

### 🎶 Biblioteca de Canciones
- Agrega, edita y elimina canciones.
- Guarda información detallada: título, autor, tonalidad, tempo, estilo, duración, categorías, etiquetas y favoritos.
- **Importador de Canciones**: Importa canciones desde archivos de texto con formato automático.
- **Transposición de Tonalidades**: Cambia la tonalidad de las canciones automáticamente.
- **Editor Enriquecido**: Editor de texto con formato para letras y acordes.
- **Botón Canción Aleatoria**: Selecciona una canción aleatoria de tu biblioteca.
- Busca canciones rápidamente por nombre, autor u otros filtros.
- Marca canciones como favoritas para tener acceso inmediato.

### 📋 Generador de Servicios
- Crea servicios (ej. celebraciones, reuniones de jóvenes).
- Asigna un título, fecha, tema, predicador y notas adicionales al servicio.
- Añade canciones a cada servicio en el orden deseado.
- Añade secciones de texto descriptivo para introducir partes especiales del servicio.
- Organiza el orden de los elementos del servicio con "drag & drop".
- **Generador de Servicios Aleatorios**: Crea servicios automáticamente intercalando secciones predefinidas con canciones aleatorias (1-3 canciones por sección), priorizando que las canciones consecutivas tengan el mismo estilo musical.
- **Plantillas de Servicios**: Configura plantillas predeterminadas con secciones base que se pueden reutilizar.
- Edita servicios existentes o elimina los que ya no sean necesarios.

### 🔍 Búsqueda Avanzada
- Encuentra canciones por diferentes criterios: autor, tonalidad, tempo, estilo, etiquetas, favoritos, etc.
- Filtra resultados para encontrar rápidamente lo que necesitas.

### 👥 Grupos
- Crea grupos de usuarios (ej. equipos de alabanza).
- Invita miembros a los grupos mediante códigos únicos.
- **Chat de Grupo**: Comunícate con los miembros del grupo en tiempo real.
- **Notificaciones de Ensayo**: Envía notificaciones de ensayo a todos los miembros del grupo.
- Visualiza detalles del grupo, miembros, canciones compartidas y servicios asociados.
- Gestión de roles (administrador/miembro) con permisos diferenciados.

### 🙍‍♂️ Perfil de usuario
- Accede y edita tu información de usuario.
- Cambia tu contraseña y administra tu cuenta.

### 🎨 Apariencia Personalizable
- Cambia entre tema claro y oscuro.
- Ajusta el color del tema entre varias opciones.

### 🔔 Notificaciones
- Recibe notificaciones al ser invitado a un grupo o sobre cambios importantes en los servicios.
- Notificaciones de ensayos programados por los administradores de grupo.
- Sistema de notificaciones en tiempo real con campana de notificaciones.

### ⚙️ Configuraciones Avanzadas
- **Gestión de Estilos Musicales**: Configura estilos musicales personalizados para categorizar mejor tus canciones.
- **Plantillas de Servicios por Defecto**: Define plantillas predeterminadas que se cargan automáticamente al crear nuevos servicios.
- **Grupos de Servicios**: Organiza tus servicios en grupos temáticos con colores personalizados.

### 🎯 Funciones Especiales
- **Previsualización de Servicios**: Ve cómo se verá tu servicio antes de guardarlo.
- **Selección de Canciones por Estilo**: Encuentra canciones aleatorias filtradas por estilo musical.
- **Editor de Secciones**: Crea y edita secciones personalizadas para tus servicios.
- **Gestión de Miembros**: Administra permisos y elimina miembros de grupos con confirmación.

---

## Cómo Usar la Aplicación

### 1. **Inicio de Sesión y Registro**
- Desde la pantalla principal, puedes registrarte con tus datos o iniciar sesión si ya tienes cuenta.

### 2. **Navegación**
- Usa la barra de navegación superior para acceder rápidamente a:
  - Inicio
  - Canciones
  - Servicios
  - Grupos
  - Búsqueda
  - Ajustes

### 3. **Canciones**
- Haz clic en "Canciones" para ver la lista completa.
- Haz clic en "Nueva Canción" para agregar una canción al repertorio.
- Haz clic en el nombre de una canción para ver, editar o eliminar detalles.

### 4. **Servicios**
- Haz clic en "Servicios" para ver todos los servicios creados.
- Haz clic en "Nuevo Servicio" para crear uno nuevo.
- Dentro de un servicio puedes añadir canciones y secciones, cambiar su orden e incluir notas.
- Puedes editar o eliminar los servicios existentes.

### 5. **Grupos**
- Haz clic en "Grupos" para ver tus grupos.
- Crea uno nuevo o entra en un grupo existente para ver sus detalles, miembros, canciones y servicios asociados.
- Usa la función de "Invitar Miembros" para agregar otros usuarios a un grupo.

### 6. **Buscador**
- Usa el buscador avanzado para encontrar las canciones que necesitas de manera ágil.

### 7. **Ajustes**
- Personaliza el aspecto visual (tema oscuro/claro, colores).
- Configura preferencias de notificaciones.

---

## Instalación y Puesta en Marcha

### 1. **Requisitos**
- Node.js y npm instalados

### 2. **Clonar el Proyecto**
```sh
git clone https://github.com/likanmaster/church-songbook-orchestra
cd .\church-songbook-orchestra\ 
```

### 3. **Instalar Dependencias**
```sh
npm install
```

### 4. **Iniciar el Servidor de Desarrollo**
```sh
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (puede variar según tu configuración).

---

## Tecnologías Usadas

- **React** + **TypeScript**
- **React Router DOM** (ruteo de páginas)
- **shadcn-ui** (componentes UI modernos)
- **Tailwind CSS** (estilos rápidos y personalizables)
- **TanStack React Query** (manejo de datos remotos)
- **Recharts** (gráficas)
- **Lucide-react** (iconos)
- **sonner** (notificaciones y toasts)

---

## Sugerencias y Mejoras

¿Tienes ideas para mejorar la app o encontraste un error? Siéntete libre de abrir un *issue* o contribuir con un *pull request*.

---

_Disfruta organizando la música de tu iglesia de manera sencilla y potente con Church Songbook._
