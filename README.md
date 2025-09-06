# 📝 Advanced To-Do List App

Una aplicación web de gestión de tareas construida con **React** y **TypeScript** que permite organizar tus pendientes de manera eficiente con filtros avanzados y persistencia local.

## 🚀 Características

- ✅ Crear, editar y eliminar tareas  
- 🔄 Estados de tareas: Pendiente, En progreso, Completada  
- 🔍 Búsqueda por título y descripción  
- 🏷️ Filtros por estado de tarea  
- 💾 Persistencia automática con localStorage  
- 📱 Interfaz responsive  

## 🛠️ Tecnologías

- **React 18** con TypeScript  
- **Hooks** para manejo de estado  
- **localStorage** para persistencia  
- **CSS3** para estilos  
- **Vite** como build tool  

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 16+)  
- npm o yarn  

### Pasos

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/todo-app.git
   cd todo-app
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre el navegador en**
   ```
   http://localhost:5173
   ```

## 🎮 Uso de la Aplicación

### Gestión de Tareas

**Crear nueva tarea**
1. Haz clic en **"Nueva Tarea"**  
2. Completa título y descripción  
3. Selecciona el estado inicial  
4. Guarda con el botón **"Crear"**

**Editar tarea existente**
1. Haz clic en el ícono de edición (✏️)  
2. Modifica los campos necesarios  
3. Guarda los cambios  

**Eliminar tarea**
- Haz clic en el ícono de papelera (🗑️)  
- Confirma la eliminación  

**Cambiar estado**
- Utiliza el selector desplegable de estado  
- Los cambios se guardan automáticamente  

### Filtros y Búsqueda

- **Filtrar por estado:** Usa los botones *Todas, Pendientes, En Progreso, Completadas*  
- **Buscar tareas:** Escribe en la barra de búsqueda para filtrar por título o descripción  
- **Combinar filtros:** Puedes usar búsqueda y estado al mismo tiempo  

## 📂 Estructura de Datos

Las tareas se almacenan con la siguiente estructura:

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Vista previa del build
npm run lint     # Verificar código con ESLint
```

## 💾 Almacenamiento Local

- Las tareas se guardan automáticamente en **localStorage**  
- Los datos persisten entre sesiones del navegador  
- No se requiere configuración adicional  
- Para limpiar datos: usar herramientas de desarrollador del navegador  

## 🏗️ Estructura del Proyecto

```
src/
├── components/        # Componentes React
│   ├── TaskForm/      # Formulario de tareas
│   ├── TaskList/      # Lista de tareas
│   ├── TaskItem/      # Item individual
│   └── FilterBar/     # Barra de filtros
├── types/             # Interfaces TypeScript
├── hooks/             # Custom hooks
├── utils/             # Funciones utilitarias
└── App.tsx            # Componente principal
```

---

✨ Proyecto desarrollado con React + TypeScript
