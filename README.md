# To-Do List

Aplicación de gestión de tareas desarrollada con **React** y **TypeScript**.  
Permite crear, editar, eliminar y organizar tareas con persistencia en `localStorage`.

---

## Instalación

Sigue estos pasos para instalar el proyecto en tu máquina local:

1. Asegúrate de tener instalado **Node.js** (versión 16 o superior) y **npm**.  
   Verifica la instalación ejecutando en tu terminal:
   ```bash
   node --version
   npm --version
   ```

2. Clona este repositorio en tu equipo:
   ```bash
   git clone https://github.com/ramon300602-cloud/advanced-todo-app.git
   cd advanced-todo-app
   ```

3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre tu navegador en la dirección indicada (generalmente):
   ```
   http://localhost:5173
   ```

---

## Scripts disponibles

Estos son los comandos principales que puedes usar:

- `npm run dev` → Ejecuta la aplicación en modo desarrollo.  
- `npm run build` → Genera la aplicación lista para producción en la carpeta `dist/`.  
- `npm run preview` → Sirve localmente la versión de producción generada.  

---

## Uso de la aplicación

1. Accede a la aplicación desde tu navegador.  
2. Para **crear una tarea**, completa el formulario con título y descripción, y guárdala.  
3. Puedes **editar** o **eliminar** una tarea utilizando los botones correspondientes.  
4. Usa los **filtros por estado** (pendiente, en progreso, completada) para organizar tus tareas.  
5. Utiliza la **barra de búsqueda** para encontrar tareas por título o descripción.  
6. Todas las tareas se guardan automáticamente en `localStorage`, por lo que estarán disponibles al volver a abrir la aplicación.  

---

## Notas adicionales

- No se requiere un backend, todos los datos se almacenan en el navegador.  
- Compatible con navegadores modernos como Chrome, Firefox, Edge y Safari.  
- Este proyecto está diseñado para fines de aprendizaje y como base para proyectos más avanzados.  
