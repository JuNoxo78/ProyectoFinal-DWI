// Admin Dashboard JavaScript

// Check if user is admin on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadDashboardData();
    setupEventListeners();
});

// Check admin authentication
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || userRole !== 'ADMIN') {
        window.location.href = '/login';
        return;
    }

    // Display admin name
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('adminName').textContent = userName;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            showSection(section);

            // Update active state
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Show section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');

        // Update active state in sidebar
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            if (item.getAttribute('data-section') === sectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Load data for the section
        loadSectionData(sectionId);
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load statistics
        const [usuarios, peliculas, funciones, reservas] = await Promise.all([
            fetchWithAuth('/api/usuarios'),
            fetchWithAuth('/api/peliculas'),
            fetchWithAuth('/api/funciones'),
            fetchWithAuth('/api/reservas')
        ]);

        // Animate counter from 0 to target value
        animateCounter('totalUsuarios', usuarios.length || 0);
        animateCounter('totalPeliculas', peliculas.length || 0);
        animateCounter('totalFunciones', funciones.length || 0);
        animateCounter('totalReservas', reservas.length || 0);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Animate counter function
function animateCounter(elementId, targetValue, duration = 200) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = 0;
    const startTime = performance.now();

    // Add counting class for visual effect
    element.classList.add('counting');

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOutExpo) for smooth deceleration
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        const currentValue = Math.floor(easeProgress * targetValue);
        element.textContent = currentValue;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue;
            element.classList.remove('counting');
        }
    }

    requestAnimationFrame(updateCounter);
}

// Load section-specific data
async function loadSectionData(sectionId) {
    switch (sectionId) {
        case 'usuarios':
            loadUsuarios();
            break;
        case 'peliculas':
            loadPeliculas();
            break;
        case 'funciones':
            loadFunciones();
            break;
        case 'reservas':
            loadReservas();
            break;
    }
}

// Load Usuarios
async function loadUsuarios() {
    try {
        const usuarios = await fetchWithAuth('/api/usuarios');
        const tbody = document.getElementById('usuariosTable');

        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
            return;
        }

        // Ordenar usuarios: admin primero
        const sortedUsuarios = usuarios.sort((a, b) => {
            const aIsAdmin = a.role?.name === 'ADMIN';
            const bIsAdmin = b.role?.name === 'ADMIN';
            if (aIsAdmin && !bIsAdmin) return -1;
            if (!aIsAdmin && bIsAdmin) return 1;
            return 0;
        });

        tbody.innerHTML = sortedUsuarios.map(usuario => {
            const isAdmin = usuario.role?.name === 'ADMIN';
            const rowClass = isAdmin ? 'table-warning' : '';
            const editButtonDisabled = isAdmin ? 'disabled' : '';
            const editButtonClass = isAdmin ? 'btn btn-sm btn-secondary btn-sm-action' : 'btn btn-sm btn-warning btn-sm-action';
            const deleteButtonDisabled = isAdmin ? 'disabled' : '';
            const deleteButtonClass = isAdmin ? 'btn btn-sm btn-secondary btn-sm-action' : 'btn btn-sm btn-danger btn-sm-action';

            return `
            <tr class="${rowClass}">
                <td>${usuario.usuarioId}</td>
                <td>${usuario.dni}</td>
                <td>${usuario.nombres} ${usuario.apellidos}${isAdmin ? ' <i class="bi bi-shield-fill-check text-warning"></i>' : ''}</td>
                <td>${usuario.email}</td>
                <td><span class="badge bg-${isAdmin ? 'danger' : 'info'}">${usuario.role?.name || 'USER'}</span></td>
                <td><span class="badge bg-${usuario.estado === 'Activo' ? 'success' : 'danger'}">${usuario.estado}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary btn-sm-action" onclick="viewUsuario(${usuario.usuarioId})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="${editButtonClass}" onclick="editUsuario(${usuario.usuarioId})" title="${isAdmin ? 'No se puede editar cuenta de administrador' : 'Editar'}" ${editButtonDisabled}>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="${deleteButtonClass}" onclick="deleteUsuario(${usuario.usuarioId})" title="${isAdmin ? 'No se puede eliminar cuenta de administrador' : 'Eliminar'}" ${deleteButtonDisabled}>
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading usuarios:', error);
        document.getElementById('usuariosTable').innerHTML =
            '<tr><td colspan="7" class="text-center text-danger">Error al cargar usuarios</td></tr>';
    }
}

// Load Peliculas
async function loadPeliculas() {
    try {
        const peliculas = await fetchWithAuth('/api/peliculas');
        const tbody = document.getElementById('peliculasTable');

        if (peliculas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay películas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = peliculas.map(pelicula => `
            <tr>
                <td>${pelicula.peliculaId}</td>
                <td>${pelicula.nombre}</td>
                <td>${pelicula.genero}</td>
                <td>${pelicula.duracion} min</td>
                <td>${pelicula.clasificacion}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-sm-action" onclick="viewPelicula(${pelicula.peliculaId})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning btn-sm-action" onclick="editPelicula(${pelicula.peliculaId})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-sm-action" onclick="deletePelicula(${pelicula.peliculaId})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading peliculas:', error);
        document.getElementById('peliculasTable').innerHTML =
            '<tr><td colspan="6" class="text-center text-danger">Error al cargar películas</td></tr>';
    }
}

// Load Funciones
async function loadFunciones() {
    try {
        const funciones = await fetchWithAuth('/api/funciones');
        const tbody = document.getElementById('funcionesTable');

        if (funciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay funciones registradas</td></tr>';
            return;
        }

        tbody.innerHTML = funciones.map(funcion => `
            <tr>
                <td>${funcion.funcionId}</td>
                <td>${funcion.pelicula?.nombre || 'N/A'}</td>
                <td>${funcion.fecha || 'N/A'}</td>
                <td>${funcion.horario || 'N/A'}</td>
                <td>Sala ${funcion.numeroSala || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-sm-action" onclick="viewFuncion(${funcion.funcionId})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning btn-sm-action" onclick="editFuncion(${funcion.funcionId})" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-sm-action" onclick="deleteFuncion(${funcion.funcionId})" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading funciones:', error);
        document.getElementById('funcionesTable').innerHTML =
            '<tr><td colspan="6" class="text-center text-danger">Error al cargar funciones</td></tr>';
    }
}

// Load Reservas
async function loadReservas() {
    try {
        const reservas = await fetchWithAuth('/api/reservas');
        const tbody = document.getElementById('reservasTable');

        if (reservas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay reservas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = reservas.map(reserva => `
            <tr>
                <td>${reserva.reservaId}</td>
                <td>${reserva.usuario?.nombres || 'N/A'} ${reserva.usuario?.apellidos || ''}</td>
                <td>${reserva.funcion?.pelicula?.nombre || 'N/A'}</td>
                <td>${reserva.cantidadAsientos || 0}</td>
                <td>S/. ${reserva.total?.toFixed(2) || '0.00'}</td>
                <td><span class="badge bg-${reserva.estado === 'Confirmada' ? 'success' : 'warning'}">${reserva.estado}</span></td>
                <td>${new Date(reserva.fechaReserva).toLocaleDateString('es-PE')}</td>
                <td>
                    <button class="btn btn-sm btn-primary btn-sm-action" onclick="viewReserva(${reserva.reservaId})" title="Ver">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-sm-action" onclick="cancelReserva(${reserva.reservaId})" title="Cancelar">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading reservas:', error);
        document.getElementById('reservasTable').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Error al cargar reservas</td></tr>';
    }
}

// Fetch with authentication
async function fetchWithAuth(url) {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Request failed');
    }

    return await response.json();
}

// Fetch with authentication and custom method (POST, PUT, DELETE)
async function fetchWithAuthAndMethod(url, method, body = null) {
    const token = localStorage.getItem('token');
    const options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
    }

    // For DELETE requests, there might be no content
    if (method === 'DELETE' && response.status === 204) {
        return null;
    }

    return await response.json();
}

// Logout function (sin confirmación, ya que se muestra en el modal)
function logout() {
    // Usar el SessionManager global
    if (window.SessionManager) {
        window.SessionManager.logout();
    } else {
        // Fallback si no está disponible
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userDni');
        window.location.href = '/login';
    }
}

// Función que se ejecuta al confirmar el cierre de sesión en el modal
function confirmLogout() {
    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('logoutModal'));
    if (modal) {
        modal.hide();
    }
    // Ejecutar logout
    logout();
}

// Placeholder functions for CRUD operations
let currentUsuarioId = null;

function showAddUserModal() {
    // Reset form
    document.getElementById('usuarioForm').reset();
    document.getElementById('usuarioId').value = '';
    document.getElementById('usuarioModalTitle').textContent = 'Nuevo Usuario';
    document.getElementById('passwordRequired').style.display = 'inline';
    document.getElementById('usuarioPassword').required = true;
    document.getElementById('passwordHelp').textContent = 'Mínimo 6 caracteres';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    modal.show();
}

async function viewUsuario(id) {
    try {
        const usuario = await fetchWithAuth(`/api/usuarios/${id}`);

        document.getElementById('viewUsuarioId').textContent = usuario.usuarioId;
        document.getElementById('viewUsuarioDni').textContent = usuario.dni;
        document.getElementById('viewUsuarioNombres').textContent = usuario.nombres;
        document.getElementById('viewUsuarioApellidos').textContent = usuario.apellidos;
        document.getElementById('viewUsuarioEmail').textContent = usuario.email;
        document.getElementById('viewUsuarioTelefono').textContent = usuario.telefono || 'N/A';
        document.getElementById('viewUsuarioRole').textContent = usuario.role?.name || 'USER';
        document.getElementById('viewUsuarioEstado').textContent = usuario.estado;

        // Si es usuario tipo USER, cargar y mostrar sus reservas
        const reservasSection = document.getElementById('reservasSection');
        if (usuario.role?.name === 'USER') {
            reservasSection.style.display = 'block';
            await loadUsuarioReservas(usuario.usuarioId);
        } else {
            reservasSection.style.display = 'none';
        }

        const modal = new bootstrap.Modal(document.getElementById('viewUsuarioModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading usuario:', error);
        alert('Error al cargar los datos del usuario');
    }
}

// Cargar reservas de un usuario específico
async function loadUsuarioReservas(usuarioId) {
    try {
        const reservas = await fetchWithAuth('/api/reservas');
        const tbody = document.getElementById('viewUsuarioReservasTable');

        // Filtrar reservas del usuario
        const reservasUsuario = reservas.filter(r => r.usuario?.usuarioId === usuarioId);

        if (reservasUsuario.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay reservas registradas</td></tr>';
            return;
        }

        tbody.innerHTML = reservasUsuario.map(reserva => `
            <tr>
                <td>${reserva.reservaId}</td>
                <td>${reserva.funcion?.pelicula?.nombre || 'N/A'}</td>
                <td>${reserva.funcion?.fechaHora ? new Date(reserva.funcion.fechaHora).toLocaleString('es-PE', { 
                    year: 'numeric', 
                    month: '2-digit', 
                    day: '2-digit', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : 'N/A'}</td>
                <td>${reserva.funcion?.sala || 'N/A'}</td>
                <td>${reserva.cantidadAsientos || 0}</td>
                <td>S/. ${reserva.total?.toFixed(2) || '0.00'}</td>
                <td><span class="badge bg-${reserva.estado === 'Confirmada' ? 'success' : reserva.estado === 'Cancelada' ? 'danger' : 'warning'}">${reserva.estado}</span></td>
                <td>${new Date(reserva.fechaReserva).toLocaleDateString('es-PE')}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading usuario reservas:', error);
        document.getElementById('viewUsuarioReservasTable').innerHTML =
            '<tr><td colspan="8" class="text-center text-danger">Error al cargar reservas</td></tr>';
    }
}

async function editUsuario(id) {
    try {
        const usuario = await fetchWithAuth(`/api/usuarios/${id}`);

        // Fill form with user data
        document.getElementById('usuarioId').value = usuario.usuarioId;
        document.getElementById('usuarioDni').value = usuario.dni;
        document.getElementById('usuarioNombres').value = usuario.nombres;
        document.getElementById('usuarioApellidos').value = usuario.apellidos;
        document.getElementById('usuarioEmail').value = usuario.email;
        document.getElementById('usuarioTelefono').value = usuario.telefono || '';
        document.getElementById('usuarioRole').value = usuario.role?.name || 'USER';
        document.getElementById('usuarioEstado').value = usuario.estado;
        document.getElementById('usuarioPassword').value = '';

        // Update modal title
        document.getElementById('usuarioModalTitle').textContent = 'Editar Usuario';
        document.getElementById('passwordRequired').style.display = 'none';
        document.getElementById('usuarioPassword').required = false;
        document.getElementById('passwordHelp').textContent = 'Dejar vacío para mantener la contraseña actual';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading usuario:', error);
        alert('Error al cargar los datos del usuario');
    }
}

function deleteUsuario(id) {
    // Fetch user data to show in confirmation modal
    fetchWithAuth(`/api/usuarios/${id}`).then(usuario => {
        currentUsuarioId = id;
        document.getElementById('deleteUsuarioInfo').textContent =
            `${usuario.nombres} ${usuario.apellidos} (DNI: ${usuario.dni})`;

        const modal = new bootstrap.Modal(document.getElementById('deleteUsuarioModal'));
        modal.show();
    }).catch(error => {
        console.error('Error loading usuario:', error);
        alert('Error al cargar los datos del usuario');
    });
}

async function saveUsuario() {
    const form = document.getElementById('usuarioForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const usuarioId = document.getElementById('usuarioId').value;
    const isEdit = usuarioId !== '';

    const data = {
        dni: document.getElementById('usuarioDni').value,
        nombres: document.getElementById('usuarioNombres').value,
        apellidos: document.getElementById('usuarioApellidos').value,
        email: document.getElementById('usuarioEmail').value,
        telefono: document.getElementById('usuarioTelefono').value || null,
        role: { name: document.getElementById('usuarioRole').value },
        estado: document.getElementById('usuarioEstado').value
    };

    // Only include password if it's filled
    const password = document.getElementById('usuarioPassword').value;
    if (password) {
        data.password = password;
    } else if (!isEdit) {
        alert('La contraseña es obligatoria para nuevos usuarios');
        return;
    }

    try {
        const url = isEdit ? `/api/usuarios/${usuarioId}` : '/api/usuarios';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetchWithAuthAndMethod(url, method, data);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
        modal.hide();

        // Show success message
        alert(isEdit ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');

        // Reload table and dashboard stats
        loadUsuarios();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving usuario:', error);
        alert('Error al guardar el usuario. ' + (error.message || ''));
    }
}

async function confirmDeleteUsuario() {
    if (!currentUsuarioId) return;

    try {
        await fetchWithAuthAndMethod(`/api/usuarios/${currentUsuarioId}`, 'DELETE');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUsuarioModal'));
        modal.hide();


        // Reload table and dashboard stats
        loadUsuarios();
        loadDashboardData();

        currentUsuarioId = null;
    } catch (error) {
        console.error('Error deleting usuario:', error);
        alert('Error al eliminar el usuario');
    }
}

function showAddMovieModal() {
    // Reset form
    document.getElementById('peliculaForm').reset();
    document.getElementById('peliculaId').value = '';
    document.getElementById('peliculaImagenUrl').value = '';
    document.getElementById('peliculaModalTitle').textContent = 'Nueva Película';

    // Show placeholder, hide image
    document.getElementById('posterPreview').style.display = 'none';
    document.getElementById('posterPlaceholder').style.display = 'flex';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('peliculaModal'));
    modal.show();
}

async function viewPelicula(id) {
    try {
        const pelicula = await fetchWithAuth(`/api/peliculas/${id}`);

        document.getElementById('viewPeliculaId').textContent = pelicula.peliculaId;
        document.getElementById('viewPeliculaNombre').textContent = pelicula.nombre;
        document.getElementById('viewPeliculaGenero').textContent = pelicula.genero;
        document.getElementById('viewPeliculaDuracion').textContent = `${pelicula.duracion} min`;
        document.getElementById('viewPeliculaClasificacion').textContent = pelicula.clasificacion;
        document.getElementById('viewPeliculaUrlTrailer').textContent = pelicula.urlTrailer || 'N/A';
        document.getElementById('viewPeliculaSinopsis').textContent = pelicula.sinopsis || 'Sin sinopsis';

        // Set poster image
        const posterUrl = pelicula.urlPortada || '';
        if (posterUrl) {
            document.getElementById('viewPeliculaPoster').src = posterUrl;
        } else {
            document.getElementById('viewPeliculaPoster').src = 'https://via.placeholder.com/300x450?text=Sin+Imagen';
        }

        // Cargar funciones asociadas
        await loadPeliculaFunciones(pelicula.peliculaId);

        const modal = new bootstrap.Modal(document.getElementById('viewPeliculaModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading pelicula:', error);
        alert('Error al cargar los datos de la película');
    }
}

// Cargar funciones asociadas a una película específica
async function loadPeliculaFunciones(peliculaId) {
    try {
        const funciones = await fetchWithAuth('/api/funciones');
        const tbody = document.getElementById('viewPeliculaFuncionesTable');

        // Filtrar funciones de la película
        const funcionesPelicula = funciones.filter(f => f.peliculaId === peliculaId);

        if (funcionesPelicula.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay funciones registradas para esta película</td></tr>';
            return;
        }

        // Ordenar por fecha y horario
        funcionesPelicula.sort((a, b) => {
            const dateA = new Date(a.fecha + 'T' + a.horario);
            const dateB = new Date(b.fecha + 'T' + b.horario);
            return dateA - dateB;
        });

        tbody.innerHTML = funcionesPelicula.map(funcion => `
            <tr>
                <td>${funcion.funcionId}</td>
                <td>${funcion.fecha}</td>
                <td>${funcion.horario}</td>
                <td>Sala ${funcion.numeroSala}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading pelicula funciones:', error);
        document.getElementById('viewPeliculaFuncionesTable').innerHTML =
            '<tr><td colspan="4" class="text-center text-danger">Error al cargar funciones</td></tr>';
    }
}

async function editPelicula(id) {
    try {
        const pelicula = await fetchWithAuth(`/api/peliculas/${id}`);

        // Fill form with movie data
        document.getElementById('peliculaId').value = pelicula.peliculaId;
        document.getElementById('peliculaNombre').value = pelicula.nombre;
        document.getElementById('peliculaGenero').value = pelicula.genero;
        document.getElementById('peliculaDuracion').value = pelicula.duracion;
        document.getElementById('peliculaClasificacion').value = pelicula.clasificacion;
        document.getElementById('peliculaUrlTrailer').value = pelicula.urlTrailer || '';
        document.getElementById('peliculaSinopsis').value = pelicula.sinopsis || '';
        document.getElementById('peliculaImagenUrl').value = pelicula.urlPortada || '';

        // Set poster preview
        if (pelicula.urlPortada) {
            document.getElementById('posterPreview').src = pelicula.urlPortada;
            document.getElementById('posterPreview').style.display = 'block';
            document.getElementById('posterPlaceholder').style.display = 'none';
        } else {
            document.getElementById('posterPreview').style.display = 'none';
            document.getElementById('posterPlaceholder').style.display = 'flex';
        }

        // Update modal title
        document.getElementById('peliculaModalTitle').textContent = 'Editar Película';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('peliculaModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading pelicula:', error);
        alert('Error al cargar los datos de la película');
    }
}

let currentPeliculaId = null;

function deletePelicula(id) {
    // Fetch movie data to show in confirmation modal
    fetchWithAuth(`/api/peliculas/${id}`).then(pelicula => {
        currentPeliculaId = id;
        document.getElementById('deletePeliculaInfo').textContent =
            `${pelicula.nombre} (${pelicula.genero})`;

        const modal = new bootstrap.Modal(document.getElementById('deletePeliculaModal'));
        modal.show();
    }).catch(error => {
        console.error('Error loading pelicula:', error);
        alert('Error al cargar los datos de la película');
    });
}

async function savePelicula() {
    const form = document.getElementById('peliculaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const peliculaId = document.getElementById('peliculaId').value;
    const isEdit = peliculaId !== '';

    const data = {
        nombre: document.getElementById('peliculaNombre').value,
        genero: document.getElementById('peliculaGenero').value,
        duracion: parseInt(document.getElementById('peliculaDuracion').value),
        clasificacion: document.getElementById('peliculaClasificacion').value,
        urlTrailer: document.getElementById('peliculaUrlTrailer').value || null,
        sinopsis: document.getElementById('peliculaSinopsis').value || null,
        urlPortada: document.getElementById('peliculaImagenUrl').value || null
    };

    try {
        const url = isEdit ? `/api/peliculas/${peliculaId}` : '/api/peliculas';
        const method = isEdit ? 'PUT' : 'POST';

        await fetchWithAuthAndMethod(url, method, data);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('peliculaModal'));
        modal.hide();

        // Show success message
        alert(isEdit ? 'Película actualizada correctamente' : 'Película creada correctamente');

        // Reload table and dashboard stats
        loadPeliculas();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving pelicula:', error);
        alert('Error al guardar la película. ' + (error.message || ''));
    }
}

async function confirmDeletePelicula() {
    if (!currentPeliculaId) return;

    try {
        await fetchWithAuthAndMethod(`/api/peliculas/${currentPeliculaId}`, 'DELETE');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deletePeliculaModal'));
        modal.hide();

        // Reload table and dashboard stats
        loadPeliculas();
        loadDashboardData();

        currentPeliculaId = null;
    } catch (error) {
        console.error('Error deleting pelicula:', error);
        alert('Error al eliminar la película');
    }
}

// Image Selection Functions
function showImageSelectionModal() {
    // Reset inputs
    document.getElementById('imageUrlInput').value = '';
    document.getElementById('imageFileInput').value = '';
    document.getElementById('urlLoadingMessage').style.display = 'none';

    const modal = new bootstrap.Modal(document.getElementById('imageSelectionModal'));
    modal.show();
}

async function loadImageFromUrl() {
    const imageUrl = document.getElementById('imageUrlInput').value.trim();

    if (!imageUrl) {
        alert('Por favor ingresa una URL válida');
        return;
    }

    // Validate URL format
    try {
        new URL(imageUrl);
    } catch (e) {
        alert('URL inválida');
        return;
    }

    // Show loading message
    document.getElementById('urlLoadingMessage').style.display = 'block';

    try {
        // Upload image from URL to server
        const response = await fetchWithAuthAndMethod('/api/peliculas/upload-from-url', 'POST', { imageUrl: imageUrl });

        // Update preview and hidden input
        const serverPath = response.path;
        document.getElementById('posterPreview').src = serverPath;
        document.getElementById('posterPreview').style.display = 'block';
        document.getElementById('posterPlaceholder').style.display = 'none';
        document.getElementById('peliculaImagenUrl').value = serverPath;

        // Hide loading message
        document.getElementById('urlLoadingMessage').style.display = 'none';

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('imageSelectionModal'));
        modal.hide();

        alert('Imagen cargada correctamente');
    } catch (error) {
        console.error('Error loading image from URL:', error);
        document.getElementById('urlLoadingMessage').style.display = 'none';
        alert('Error al descargar la imagen. Verifica que la URL sea correcta y accesible.');
    }
}

async function loadImageFromFile(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
    }

    try {
        // Create FormData to upload file
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/peliculas/upload-from-file', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();
        const serverPath = result.path;

        // Update preview and hidden input
        document.getElementById('posterPreview').src = serverPath;
        document.getElementById('posterPreview').style.display = 'block';
        document.getElementById('posterPlaceholder').style.display = 'none';
        document.getElementById('peliculaImagenUrl').value = serverPath;

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('imageSelectionModal'));
        modal.hide();

        alert('Imagen cargada correctamente');
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error al subir la imagen');
    }
}

let currentFuncionId = null;

async function showAddFuncionModal() {
    // Reset form
    document.getElementById('funcionForm').reset();
    document.getElementById('funcionId').value = '';
    document.getElementById('funcionModalTitle').textContent = 'Nueva Función';

    // Load películas para el select
    await loadPeliculasSelect();

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('funcionModal'));
    modal.show();
}

async function loadPeliculasSelect() {
    try {
        const peliculas = await fetchWithAuth('/api/peliculas');
        const select = document.getElementById('funcionPelicula');

        // Clear existing options except first
        select.innerHTML = '<option value="">Seleccionar película...</option>';

        // Add películas
        peliculas.forEach(pelicula => {
            const option = document.createElement('option');
            option.value = pelicula.peliculaId;
            option.textContent = `#${pelicula.peliculaId} - ${pelicula.nombre}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading peliculas:', error);
    }
}

async function viewFuncion(id) {
    try {
        const funcion = await fetchWithAuth(`/api/funciones/${id}`);

        document.getElementById('viewFuncionId').textContent = funcion.funcionId;
        document.getElementById('viewFuncionPelicula').textContent = funcion.pelicula?.nombre || 'N/A';
        document.getElementById('viewFuncionFecha').textContent = funcion.fecha || 'N/A';
        document.getElementById('viewFuncionHorario').textContent = funcion.horario || 'N/A';
        document.getElementById('viewFuncionSala').textContent = `Sala ${funcion.numeroSala}`;

        const modal = new bootstrap.Modal(document.getElementById('viewFuncionModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading funcion:', error);
        alert('Error al cargar los datos de la función');
    }
}

async function editFuncion(id) {
    try {
        const funcion = await fetchWithAuth(`/api/funciones/${id}`);

        // Load películas first
        await loadPeliculasSelect();

        // Fill form with funcion data
        document.getElementById('funcionId').value = funcion.funcionId;
        document.getElementById('funcionPelicula').value = funcion.peliculaId;
        document.getElementById('funcionFecha').value = funcion.fecha;
        document.getElementById('funcionHorario').value = funcion.horario;
        document.getElementById('funcionNumeroSala').value = funcion.numeroSala;

        // Update modal title
        document.getElementById('funcionModalTitle').textContent = 'Editar Función';

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('funcionModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading funcion:', error);
        alert('Error al cargar los datos de la función');
    }
}

function deleteFuncion(id) {
    // Fetch funcion data to show in confirmation modal
    fetchWithAuth(`/api/funciones/${id}`).then(funcion => {
        currentFuncionId = id;
        document.getElementById('deleteFuncionInfo').textContent =
            `${funcion.pelicula?.nombre || 'N/A'} - ${funcion.fecha} ${funcion.horario} - Sala ${funcion.numeroSala}`;

        const modal = new bootstrap.Modal(document.getElementById('deleteFuncionModal'));
        modal.show();
    }).catch(error => {
        console.error('Error loading funcion:', error);
        alert('Error al cargar los datos de la función');
    });
}

async function saveFuncion() {
    const form = document.getElementById('funcionForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const funcionId = document.getElementById('funcionId').value;
    const isEdit = funcionId !== '';

    const data = {
        peliculaId: parseInt(document.getElementById('funcionPelicula').value),
        fecha: document.getElementById('funcionFecha').value,
        horario: document.getElementById('funcionHorario').value,
        numeroSala: parseInt(document.getElementById('funcionNumeroSala').value)
    };

    try {
        const url = isEdit ? `/api/funciones/${funcionId}` : '/api/funciones';
        const method = isEdit ? 'PUT' : 'POST';

        await fetchWithAuthAndMethod(url, method, data);

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('funcionModal'));
        modal.hide();

        // Show success message
        alert(isEdit ? 'Función actualizada correctamente' : 'Función creada correctamente');

        // Reload table and dashboard stats
        loadFunciones();
        loadDashboardData();
    } catch (error) {
        console.error('Error saving funcion:', error);
        alert('Error al guardar la función. ' + (error.message || ''));
    }
}

async function confirmDeleteFuncion() {
    if (!currentFuncionId) return;

    try {
        await fetchWithAuthAndMethod(`/api/funciones/${currentFuncionId}`, 'DELETE');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteFuncionModal'));
        modal.hide();

        // Reload table and dashboard stats
        loadFunciones();
        loadDashboardData();

        currentFuncionId = null;
    } catch (error) {
        console.error('Error deleting funcion:', error);
        alert('Error al eliminar la función');
    }
}

function viewReserva(id) {
    alert('Ver reserva ID: ' + id);
}

function cancelReserva(id) {
    if (confirm('¿Estás seguro de cancelar esta reserva?')) {
        alert('Cancelar reserva ID: ' + id);
    }
}


