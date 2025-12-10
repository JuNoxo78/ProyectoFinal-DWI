// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Check if user is logged in and update navbar
document.addEventListener('DOMContentLoaded', function() {
    if (window.SessionManager && window.SessionManager.isAuthenticated()) {
        const userName = localStorage.getItem('userName');
        const userRole = window.SessionManager.getUserRole();

        // Elementos del navbar
        const btnUnete = document.getElementById('btnUnete');
        const userDropdown = document.getElementById('userDropdown');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const navTusReservas = document.getElementById('navTusReservas');

        // Si es usuario USER (no ADMIN)
        if (userRole === 'USER') {
            if (btnUnete) btnUnete.style.display = 'none';

            if (userDropdown && userNameDisplay) {
                userDropdown.style.display = 'block';
                userNameDisplay.textContent = userName || 'Usuario';
            }

            // Mostrar opción "Tus Reservas"
            if (navTusReservas) {
                navTusReservas.style.display = 'block';
            }
        }
        // Si es ADMIN, no mostrar nada especial (se redirige al panel)
        else if (userRole === 'ADMIN') {
            // El admin será redirigido al dashboard automáticamente
            // por el SessionManager, así que no necesitamos hacer nada aquí
        }
    }

    // Manejar el botón "Comprar Entradas"
    const btnComprarEntradas = document.getElementById('btnComprarEntradas');
    if (btnComprarEntradas) {
        btnComprarEntradas.addEventListener('click', function() {
            // Verificar si el usuario está logueado
            if (window.SessionManager && window.SessionManager.isAuthenticated()) {
                const userRole = window.SessionManager.getUserRole();
                // Si está logueado y es USER, redirigir a la página de películas
                if (userRole === 'USER') {
                    window.location.href = '/peliculas';
                }
            } else {
                // Si no está logueado, guardar intención y redirigir al login
                localStorage.setItem('intendedAction', 'verCartelera');
                window.location.href = '/login';
            }
        });
    }
});

