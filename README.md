a) Descripción del proyecto
Frontend web para la gestión de inventario de activos tecnológicos de Grupo EMIN, consumiendo una API REST. Permite autenticación, visualización y administración de activos (alta/edición/listado), búsqueda con filtros, paginación y operaciones relacionadas con usuarios/empresas según los endpoints disponibles en el backend. El objetivo es ofrecer una interfaz clara y rápida para operar el inventario desde navegador.

b) Tecnologías utilizadas y justificación de elección
Frontend:

React + TypeScript: Componentización, escalabilidad y tipado estático para reducir errores y mejorar mantenibilidad.
Vite: Bundler moderno con arranque rápido y excelente DX para desarrollo local.
React Router (si aplica): Navegación SPA con rutas públicas/privadas.
Consumo HTTP (Fetch/Axios): Integración simple con la API REST y manejo centralizado de headers (JWT).
Manejo de estado (Context/Redux/Zustand, según esté implementado): Control de sesión (token/usuario) y estado compartido entre vistas.
UI/CSS (Tailwind/Material UI/CSS modules, según esté implementado): Maquetación rápida y consistente.
Justificación: se eligió un stack moderno de frontend (React + Vite + TS) por su velocidad de desarrollo, facilidad de mantenimiento, y buena integración con APIs REST con autenticación JWT.

# . Instalar MongoDB compass para visualizar los datos
https://www.mongodb.com/try/download/compass
StringConnection: mongodb+srv://root:uZBcJp9pmBntJTEI@cluster0.lpxcbjf.mongodb.net/?appName=Cluster0


c) Instrucciones para ejecutar localmente
# 1. Clonar el repositorio (frontend)
git clone https://github.com/Nelson-Arenas/prueba-tecnica-emin-front-Nelson-Arenas.git
cd prueba-tecnica-emin-front-Nelson-Arenas

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# (crear .env.local en la raíz )
VITE_API_URL=http://localhost:3000

# 4. Ejecutar en desarrollo
npm run dev

# 5. Build de producción
npm run build

# 6. Preview (opcional)
npm run preview

e) Link al deploy (si aplica)
Frontend (Netlify): https://nelson-eminadministrarequipos.netlify.app/
Backend (Render): https://prueba-tecnica-emin-nelson-arenas.onrender.com/

f) Decisiones técnicas relevantes
Rutas protegidas: acceso a pantallas internas condicionado a sesión válida (JWT).
Persistencia de sesión: token almacenado para mantener login (por ejemplo en localStorage) y adjuntado en cada request.
Cliente HTTP centralizado: configuración única de baseURL y headers para evitar duplicación (y facilitar manejo de errores).
UX para listados grandes: paginación y filtros en UI para no cargar volúmenes completos.
Validaciones en formulario: validación previa al envío para reducir errores y mejorar experiencia.
Componentización: separación de vistas, componentes reutilizables (inputs, tablas, modales) y servicios (API).
g) Mejoras que harías con más tiempo
Tests unitarios y e2e: Vitest/React Testing Library + Playwright/Cypress.
Refresh token / manejo de sesión avanzado: renovación automática y logout por expiración.
Mejoras de accesibilidad (a11y): foco, ARIA, navegación por teclado.
Mejor manejo de errores: pantallas 401/403/404, retry, mensajes consistentes.
Optimización de performance: memoization, code-splitting por rutas, virtualización de tablas.
UI/UX: skeleton loaders, estados vacíos, confirmaciones y feedback más claro.
Gestión de permisos (roles): UI basada en claims (admin/user/viewer).
Documentación técnica: guía de arquitectura, convenciones y ejemplos de consumo de API.
