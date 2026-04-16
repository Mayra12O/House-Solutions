// auth.js - Verificar autenticación y protección de rutas

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si hay token
 */
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

/**
 * Redirige a login si no está autenticado
 * Usar al inicio de páginas protegidas
 */
function requireLogin() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
    }
}

/**
 * Redirige a index.html si ya está autenticado
 * Usar en login.html para no mostrar login a usuarios ya logueados
 */
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = '/index.html';
    }
}

/**
 * Guarda el token en localStorage (usar en login exitoso)
 * @param {string} token - Token JWT del servidor
 */
function saveToken(token) {
    localStorage.setItem('token', token);
}

/**
 * Obtiene el token del localStorage
 * @returns {string|null} Token o null
 */
function getToken() {
    return localStorage.getItem('token');
}

/**
 * Limpia la sesión (usar en cerrar sesión)
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('carrito');
    window.location.href = '/login.html';
}
