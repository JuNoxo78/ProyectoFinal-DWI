// Session Manager - Maneja la autenticación y redirección global
(function() {
    'use strict';

    // Configuración de rutas
    const routes = {
        public: ['/', '/index', '/login', '/register'],
        admin: ['/admin/dashboard', '/admin/redirect'],
        user: ['/'] // Usuarios normales van al home
    };

    // Obtener la ruta actual
    function getCurrentPath() {
        return window.location.pathname;
    }

    // Verificar si el usuario está autenticado
    function isAuthenticated() {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        return token && userRole;
    }

    // Obtener el rol del usuario
    function getUserRole() {
        return localStorage.getItem('userRole');
    }

    // Verificar si la ruta actual requiere autenticación
    function isProtectedRoute(path) {
        // Las rutas de admin siempre están protegidas
        return path.startsWith('/admin');

    }

    // Verificar si es una ruta de autenticación (login/register)
    function isAuthRoute(path) {
        return path === '/login' || path === '/register';
    }

    // Redirigir según el rol del usuario
    function redirectByRole(role) {
        const currentPath = getCurrentPath();

        if (role === 'ADMIN') {
            // Si el admin está en cualquier página que no sea del panel de admin, redirigir
            if (!currentPath.startsWith('/admin')) {
                console.log('Admin detectado, redirigiendo al panel de administración...');
                window.location.href = '/admin/dashboard';
                return true;
            }
        } else if (role === 'USER') {
            // Si el usuario está intentando acceder al panel de admin, redirigir al home
            if (currentPath.startsWith('/admin')) {
                console.log('Usuario sin permisos de admin, redirigiendo al inicio...');
                window.location.href = '/';
                return true;
            }
        }
        return false;
    }

    // Verificar sesión y redirigir si es necesario
    function checkSession() {
        const currentPath = getCurrentPath();
        const authenticated = isAuthenticated();
        const userRole = getUserRole();

        console.log('Verificando sesión:', { currentPath, authenticated, userRole });

        // Si el usuario está autenticado
        if (authenticated && userRole) {
            // Si está en login o register, redirigir según su rol
            if (isAuthRoute(currentPath)) {
                console.log('Usuario autenticado intentando acceder a login/register, redirigiendo...');
                if (userRole === 'ADMIN') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/';
                }
                return;
            }

            // Redirigir según el rol si está en una página incorrecta
            redirectByRole(userRole);
        } else {
            // Si NO está autenticado y está en una ruta protegida, redirigir al login
            if (isProtectedRoute(currentPath)) {
                console.log('Usuario no autenticado en ruta protegida, redirigiendo al login...');
                window.location.href = '/login';
                return;
            }
        }
    }

    // Ejecutar verificación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkSession);
    } else {
        checkSession();
    }

    // Exponer funciones globales para uso en otras partes de la aplicación
    window.SessionManager = {
        isAuthenticated: isAuthenticated,
        getUserRole: getUserRole,
        logout: function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
            localStorage.removeItem('userDni');
            window.location.href = '/';
        },
        checkSession: checkSession
    };
})();

