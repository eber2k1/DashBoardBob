// Funcionalidad para el menú móvil
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

const modal = document.querySelector('#cliente-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.querySelector('#modal-title');
const nuevoClienteBtn = document.querySelector('#nuevo-cliente-btn');
const closeModalBtn = document.querySelector('#close-modal');


document.addEventListener('DOMContentLoaded', function () {
    // Abrir menú
    if (menuBtn) menuBtn.addEventListener('click', function () {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
    });
    // Cerrar menú
    function closeMenu() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    }
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
});

// Reset del formulario
function resetForm() {
    formClientes.reset();
    inputId.value = '';
    if (modalTitle) modalTitle.textContent = 'Nuevo Cliente';
}

// Abre el modal
function openModal() {
    if (modal) modal.classList.remove('hidden');
    if (modalOverlay) modalOverlay.classList.remove('hidden');
}

// Cierra el modal
function closeModal() {
    if (modal) modal.classList.add('hidden');
    if (modalOverlay) modalOverlay.classList.add('hidden');
    resetForm();
}


if (nuevoClienteBtn) nuevoClienteBtn.onclick = () => {
    resetForm();
    openModal();
};


if (closeModalBtn) closeModalBtn.onclick = closeModal;