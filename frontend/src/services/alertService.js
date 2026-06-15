// Colocar <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script> antes de este archivo en HTML.

(function (global) {
    const AlertService = {
        success(message = '', title = '¡Hecho!', timer = 2000) {
            return Swal.fire({
                icon: 'success',
                title,
                text: message,
                showConfirmButton: false,
                timer
            });
        },

        error(message = '', title = 'Error') {
            return Swal.fire({
                icon: 'error',
                title,
                text: message,
                showConfirmButton: false,
                timer: 2000
            });
        },

        info(message = '', title = 'Información') {
            return Swal.fire({
                icon: 'info',
                title,
                text: message
            });
        },

        warning(message = '', title = 'Advertencia') {
            return Swal.fire({
                icon: 'warning',
                title,
                text: message
            });
        },

        toast(message = '', icon = '', options = {}) {
            const cfg = Object.assign({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: icon,
                title: message
            }, options);
            return Swal.fire(cfg);
        },

        confirm({ title = '¿Estás seguro?', text = '', confirmButtonText = 'Sí', cancelButtonText = 'No', icon = 'question', reverseButtons = true } = {}) {
            return Swal.fire({
                title,
                text,
                icon,
                showCancelButton: true,
                confirmButtonText,
                cancelButtonText,
                reverseButtons
            }).then(result => !!result.isConfirmed);
        },

        prompt({ title = 'Ingresa un valor', input = 'text', inputPlaceholder = '', inputValue = '', inputAttributes = {}, showCancelButton = true } = {}) {
            return Swal.fire({
                title,
                input,
                inputPlaceholder,
                inputValue,
                inputAttributes,
                showCancelButton
            }).then(result => (result.isConfirmed ? result.value : null));
        },

        loading(title = 'Cargando...') {
            Swal.fire({
                title,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
            return () => Swal.close();
        }
    };

    global.AlertService = AlertService;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AlertService;
    }
})(typeof window !== 'undefined' ? window : this);
