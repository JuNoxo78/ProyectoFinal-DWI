// Pelicula Detalle JavaScript

let currentPelicula = null;
let allFunciones = [];

document.addEventListener('DOMContentLoaded', function() {
    // Update navbar based on login status
    updateNavbar();

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const peliculaId = urlParams.get('id');

    if (!peliculaId) {
        window.location.href = '/peliculas';
        return;
    }

    // Load movie details and functions
    loadMovieDetails(peliculaId);
});

function updateNavbar() {
    if (window.SessionManager && window.SessionManager.isAuthenticated()) {
        const userName = localStorage.getItem('userName');
        const userRole = window.SessionManager.getUserRole();

        const btnUnete = document.getElementById('btnUnete');
        const userDropdown = document.getElementById('userDropdown');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const navTusReservas = document.getElementById('navTusReservas');

        if (userRole === 'USER') {
            if (btnUnete) btnUnete.style.display = 'none';

            if (userDropdown && userNameDisplay) {
                userDropdown.style.display = 'block';
                userNameDisplay.textContent = userName || 'Usuario';
            }

            if (navTusReservas) {
                navTusReservas.style.display = 'block';
            }
        }
    }
}

async function loadMovieDetails(peliculaId) {
    try {
        // Load movie data
        const pelicula = await fetch(`/api/peliculas/${peliculaId}`).then(res => res.json());
        currentPelicula = pelicula;

        // Load functions
        const funciones = await fetch('/api/funciones').then(res => res.json());
        allFunciones = funciones.filter(f => f.peliculaId === parseInt(peliculaId));

        // Render movie details
        renderMovieDetails(pelicula);

        // Render functions
        renderFunctions(allFunciones);

        // Show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('movieContent').style.display = 'block';

        // Check if URL has #funciones hash and scroll to it
        if (window.location.hash === '#funciones') {
            setTimeout(() => {
                const funcionesSection = document.getElementById('funciones');
                if (funcionesSection) {
                    funcionesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500); // Wait for content to render
        }

        // Setup buy button
        document.getElementById('btnComprarTickets').addEventListener('click', function() {
            handleComprarTickets();
        });

        // Setup play trailer button
        document.getElementById('playTrailerBtn').addEventListener('click', function() {
            playTrailer(pelicula.urlTrailer);
        });

    } catch (error) {
        console.error('Error loading movie details:', error);
        alert('Error al cargar los detalles de la película');
        window.location.href = '/peliculas';
    }
}

function renderMovieDetails(pelicula) {
    // Set trailer background
    if (pelicula.urlPortada) {
        document.querySelector('.trailer-section').style.backgroundImage =
            `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${pelicula.urlPortada})`;
    }

    // Set poster
    document.getElementById('moviePoster').src = pelicula.urlPortada || 'https://via.placeholder.com/300x450?text=Sin+Imagen';
    document.getElementById('moviePoster').alt = pelicula.nombre;

    // Show estreno badge if applicable
    if (pelicula.estreno) {
        document.getElementById('estrenoBadge').style.display = 'block';
    }

    // Set movie details
    document.getElementById('movieTitle').textContent = pelicula.nombre;
    document.getElementById('movieGenre').textContent = pelicula.genero;
    document.getElementById('movieDuration').textContent = `${pelicula.duracion} min`;
    document.getElementById('movieClasificacion').textContent = pelicula.clasificacion;
    document.getElementById('movieSinopsis').textContent = pelicula.sinopsis || 'Sin sinopsis disponible.';

    // Update page title
    document.title = `${pelicula.nombre} - Cineplanet`;
}

function renderFunctions(funciones) {
    const container = document.getElementById('functionsContainer');

    if (funciones.length === 0) {
        container.innerHTML = `
            <div class="empty-functions">
                <i class="bi bi-calendar-x"></i>
                <h3>No hay funciones disponibles</h3>
                <p>Vuelve pronto para ver los horarios</p>
            </div>
        `;
        return;
    }

    // Group functions by date
    const funcionesByDate = {};
    funciones.forEach(funcion => {
        if (!funcionesByDate[funcion.fecha]) {
            funcionesByDate[funcion.fecha] = [];
        }
        funcionesByDate[funcion.fecha].push(funcion);
    });

    // Sort dates
    const sortedDates = Object.keys(funcionesByDate).sort();

    // Render functions grouped by date
    container.innerHTML = sortedDates.map(fecha => {
        const funcionesDelDia = funcionesByDate[fecha];

        // Sort by time
        funcionesDelDia.sort((a, b) => a.horario.localeCompare(b.horario));

        // Format date
        const dateObj = new Date(fecha + 'T00:00:00');
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        const formattedDate = dateObj.toLocaleDateString('es-ES', options);
        const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

        return `
            <div class="date-group">
                <div class="date-header">
                    <i class="bi bi-calendar-event"></i>
                    <span>${capitalizedDate}</span>
                </div>
                <div class="functions-grid">
                    ${funcionesDelDia.map(funcion => `
                        <div class="function-card" onclick="selectFunction(${funcion.funcionId})">
                            <div class="function-time">${formatTime(funcion.horario)}</div>
                            <div class="function-sala">Sala ${funcion.numeroSala}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function formatTime(horario) {
    // Format time from HH:mm:ss to HH:mm
    return horario.substring(0, 5);
}

function selectFunction(funcionId) {
    if (window.SessionManager && window.SessionManager.isAuthenticated()) {
        // User is logged in, proceed to seat selection
        alert(`Seleccionar asientos para función ${funcionId} - Por implementar`);
        // TODO: Redirect to seat selection page
    } else {
        // User is not logged in, redirect to login
        window.location.href = '/login';
    }
}

function handleComprarTickets() {
    if (window.SessionManager && window.SessionManager.isAuthenticated()) {
        // Scroll to functions section
        document.querySelector('.functions-section').scrollIntoView({ behavior: 'smooth' });
    } else {
        // Redirect to login
        window.location.href = '/login';
    }
}

function playTrailer(urlTrailer) {
    if (urlTrailer) {
        // Extract YouTube video ID if it's a YouTube URL
        let videoId = null;

        if (urlTrailer.includes('youtube.com')) {
            const urlParams = new URLSearchParams(new URL(urlTrailer).search);
            videoId = urlParams.get('v');
        } else if (urlTrailer.includes('youtu.be')) {
            videoId = urlTrailer.split('/').pop().split('?')[0];
        }

        if (videoId) {
            // Create embedded YouTube player
            const trailerContainer = document.getElementById('trailerContainer');
            trailerContainer.innerHTML = `
                <div class="trailer-video-container">
                    <iframe 
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            `;
        } else {
            alert('Formato de tráiler no soportado');
        }
    } else {
        alert('Tráiler no disponible');
    }
}

