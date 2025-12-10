// Navigate back to previous page
function goBack() {
    // Check if there is history to go back to
    if (window.history.length > 1) {
        window.history.back();
    } else {
        // If no history, go to home page
        window.location.href = '/';
    }
}

// Toggle password visibility
function togglePassword(inputId = 'password') {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById('toggleIcon' + inputId.charAt(0).toUpperCase() + inputId.slice(1));

    if (!passwordInput) {
        // For login page with single password field
        const singlePasswordInput = document.getElementById('password');
        const singleToggleIcon = document.getElementById('toggleIcon');

        if (singlePasswordInput.type === 'password') {
            singlePasswordInput.type = 'text';
            singleToggleIcon.classList.remove('bi-eye');
            singleToggleIcon.classList.add('bi-eye-slash');
        } else {
            singlePasswordInput.type = 'password';
            singleToggleIcon.classList.remove('bi-eye-slash');
            singleToggleIcon.classList.add('bi-eye');
        }
        return;
    }

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('bi-eye');
        toggleIcon.classList.add('bi-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('bi-eye-slash');
        toggleIcon.classList.add('bi-eye');
    }
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dni = document.getElementById('dni').value;
        const password = document.getElementById('password').value;

        // Validar DNI
        if (dni.length !== 8 || !/^\d+$/.test(dni)) {
            showAlert('Por favor, ingresa un DNI válido de 8 dígitos.', 'danger');
            return;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dni: dni,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();

                // Guardar el token y datos del usuario
                localStorage.setItem('token', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userDni', data.dni);

                // Obtener información completa del usuario
                const userResponse = await fetch('/api/usuarios/dni/' + data.dni, {
                    headers: {
                        'Authorization': 'Bearer ' + data.token
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    localStorage.setItem('userName', userData.nombres + ' ' + userData.apellidos);
                }

                showAlert('¡Inicio de sesión exitoso!', 'success');

                // Redirigir según el rol
                setTimeout(() => {
                    if (data.role === 'ADMIN') {
                        window.location.href = '/admin/redirect';
                    } else {
                        // Check if there's an intended action (from comprar button)
                        const intendedAction = localStorage.getItem('intendedAction');
                        const intendedPeliculaId = localStorage.getItem('intendedPeliculaId');

                        if (intendedAction === 'comprarEntrada' && intendedPeliculaId) {
                            // Clear the intention
                            localStorage.removeItem('intendedAction');
                            localStorage.removeItem('intendedPeliculaId');
                            // Redirect to movie details with functions section
                            window.location.href = `/pelicula-detalle?id=${intendedPeliculaId}#funciones`;
                        } else if (intendedAction === 'verCartelera') {
                            // Clear the intention
                            localStorage.removeItem('intendedAction');
                            // Redirect to movies page
                            window.location.href = '/peliculas';
                        } else {
                            window.location.href = '/';
                        }
                    }
                }, 1000);
            } else {
                const error = await response.json();
                showAlert(error.message || 'Credenciales incorrectas. Por favor, verifica tus datos.', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al iniciar sesión. Por favor, intenta nuevamente.', 'danger');
        }
    });
}

// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dni = document.getElementById('dni').value;
        const nombre = document.getElementById('nombre').value;
        const apellido = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Validaciones
        if (dni.length !== 8 || !/^\d+$/.test(dni)) {
            showAlert('Por favor, ingresa un DNI válido de 8 dígitos.', 'danger');
            return;
        }

        if (telefono.length !== 9 || !/^\d+$/.test(telefono)) {
            showAlert('Por favor, ingresa un teléfono válido de 9 dígitos.', 'danger');
            return;
        }

        if (password.length < 8) {
            showAlert('La contraseña debe tener al menos 8 caracteres.', 'danger');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Las contraseñas no coinciden.', 'danger');
            return;
        }

        if (!terms) {
            showAlert('Debes aceptar los términos y condiciones.', 'danger');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dni: dni,
                    nombres: nombre,
                    apellidos: apellido,
                    email: email,
                    telefono: telefono,
                    password: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                showAlert('¡Registro exitoso! Redirigiendo al inicio de sesión...', 'success');

                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                const error = await response.json();
                showAlert(error.message || 'Error al registrar. Por favor, verifica tus datos.', 'danger');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Error al registrar. Por favor, intenta nuevamente.', 'danger');
        }
    });
}

// Show alert function
function showAlert(message, type) {
    // Eliminar alertas previas
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const form = document.querySelector('form');
    form.parentNode.insertBefore(alert, form);

    // Auto-dismiss después de 5 segundos
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Validación en tiempo real para DNI
const dniInput = document.getElementById('dni');
if (dniInput) {
    dniInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

// Validación en tiempo real para teléfono
const telefonoInput = document.getElementById('telefono');
if (telefonoInput) {
    telefonoInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
}

