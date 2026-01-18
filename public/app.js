const form = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();

    if (!correo || !contrasena) {
        mostrarMensaje('Todos los campos son obligatorios', false);
        return;
    }

    try {
        const res = await fetch('/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo, contrasena })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || 'Error al iniciar sesión');
        }

        mostrarMensaje('Inicio de sesión exitoso ✅', true);
        console.log('Usuario autenticado:', data.usuario);
        // Aquí puedes redirigir a otra página si deseas:
        // window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Error:', error.message);
        mostrarMensaje(error.message, false);
    }
});

function mostrarMensaje(msg, exito = true) {
    mensaje.textContent = msg;
    mensaje.style.color = exito ? 'green' : 'red';
}
