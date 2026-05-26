// auth.js - Verificar autenticación y protección de rutas

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si hay token
 */
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

/**
 * URL base para llamadas a la API.
 * Usa el host actual si la página se sirve desde HTTP/S.
 * Si la página se abre con file://, usa localhost:3000.
 */
const API_BASE_URL = window.location.protocol.startsWith('http')
    ? window.location.origin
    : 'http://localhost:3000';

/**
 * Construye la URL completa para una ruta de API.
 * @param {string} path
 */
function getApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

/**
 * Devuelve el usuario autenticado almacenado en localStorage.
 * @returns {Object|null}
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Guarda la información del usuario en localStorage.
 * @param {Object} user
 */
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Redirige a login si no está autenticado
 * Usar al inicio de páginas protegidas
 */
function requireLogin() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

/**
 * Redirige a index.html si ya está autenticado
 * Usar en login.html para no mostrar login a usuarios ya logueados
 */
function redirectIfAuthenticated() {
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

/**
 * Devuelve true si el usuario autenticado es administrador.
 * @returns {boolean}
 */
function isAdmin() {
    const user = getCurrentUser();
    return !!user && user.rol === 'admin';
}

/**
 * Redirige a index.html si no es administrador.
 * Usar en admin.html.
 */
function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        window.location.href = 'index.html';
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
    localStorage.removeItem('user');
    localStorage.removeItem('carrito');
    window.location.replace('login.html');
}

/**
 * Pregunta si el usuario quiere cerrar sesión y la cierra en caso afirmativo.
 */
function confirmLogout() {
    if (confirm('¿Estás seguro de cerrar la sesión?')) {
        logout();
    }
}
