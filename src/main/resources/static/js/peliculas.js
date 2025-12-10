// Películas Page JavaScript

let allPeliculas = [];
let allFunciones = [];
let currentTab = 'cartelera';

// Check if user is logged in and update navbar
document.addEventListener('DOMContentLoaded', function() {
    // Update navbar based on login status
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
    }

    // Load movies and functions
    loadPeliculasYFunciones();

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');

            // Get tab type
            currentTab = this.getAttribute('data-tab');

            // Filter and display movies
            filterAndDisplayMovies();
        });
    });
});

// Load movies and functions from API
async function loadPeliculasYFunciones() {
    const moviesGrid = document.getElementById('moviesGrid');

    try {
        // Load both peliculas and funciones
        const [peliculas, funciones] = await Promise.all([
            fetch('/api/peliculas').then(res => res.json()),
            fetch('/api/funciones').then(res => res.json())
        ]);

        allPeliculas = peliculas;
        allFunciones = funciones;

        if (peliculas.length === 0) {
            moviesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-film"></i>
                    <h3>No hay películas disponibles</h3>
                    <p>Vuelve pronto para ver los últimos estrenos</p>
                </div>
            `;
            return;
        }

        // Display movies based on current tab
        filterAndDisplayMovies();

    } catch (error) {
        console.error('Error loading movies:', error);
        moviesGrid.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h3>Error al cargar películas</h3>
                <p>Por favor, intenta de nuevo más tarde</p>
            </div>
        `;
    }
}

// Filter and display movies based on current tab
function filterAndDisplayMovies() {
    const moviesGrid = document.getElementById('moviesGrid');

    // Classify movies
    const peliculasConFunciones = allPeliculas.filter(pelicula =>
        allFunciones.some(funcion => funcion.peliculaId === pelicula.peliculaId)
    );

    const peliculasSinFunciones = allPeliculas.filter(pelicula =>
        !allFunciones.some(funcion => funcion.peliculaId === pelicula.peliculaId)
    );

    let peliculasToShow = [];

    if (currentTab === 'cartelera') {
        peliculasToShow = peliculasConFunciones;
    } else if (currentTab === 'proximos') {
        peliculasToShow = peliculasSinFunciones;
    }

    // Display movies
    if (peliculasToShow.length === 0) {
        const message = currentTab === 'cartelera'
            ? 'No hay películas en cartelera actualmente'
            : 'No hay próximos estrenos por el momento';

        moviesGrid.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-film"></i>
                <h3>${message}</h3>
                <p>Vuelve pronto para ver las novedades</p>
            </div>
        `;
        return;
    }

    moviesGrid.innerHTML = peliculasToShow.map(pelicula => `
        <div class="movie-card-full">
            ${pelicula.estreno ? '<div class="estreno-badge">Estreno</div>' : ''}
            <div class="movie-poster">
                <img src="${pelicula.urlPortada || 'https://via.placeholder.com/280x420?text=Sin+Imagen'}"
                     alt="${pelicula.nombre}"
                     onerror="this.src='https://via.placeholder.com/280x420?text=Sin+Imagen'">
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${pelicula.nombre}</h3>
                <p class="movie-genre">${pelicula.genero}</p>
                <div class="movie-details">
                    <span class="movie-detail-badge">${pelicula.duracion} min</span>
                    <span class="movie-detail-badge">${pelicula.clasificacion}</span>
                </div>
                <div class="movie-actions">
                    <button class="btn-comprar" onclick="comprarEntrada(${pelicula.peliculaId})" ${currentTab === 'proximos' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="bi bi-ticket-perforated"></i> ${currentTab === 'proximos' ? 'Próximamente' : 'Comprar'}
                    </button>
                    <button class="btn-info" onclick="verDetalles(${pelicula.peliculaId})">
                        <i class="bi bi-info-circle"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to buy ticket (redirects to login if not authenticated)
function comprarEntrada(peliculaId) {
    if (window.SessionManager && window.SessionManager.isAuthenticated()) {
        // User is logged in, go to functions section
        window.location.href = `/pelicula-detalle?id=${peliculaId}#funciones`;
    } else {
        // User is not logged in, save intention and redirect to login
        localStorage.setItem('intendedAction', 'comprarEntrada');
        localStorage.setItem('intendedPeliculaId', peliculaId);
        window.location.href = '/login';
    }
}

// Function to view movie details
function verDetalles(peliculaId) {
    window.location.href = `/pelicula-detalle?id=${peliculaId}`;
}

