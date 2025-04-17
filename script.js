// Control del menú hamburguesa
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-menu');
const overlay = document.getElementById('overlay');

// Abrir menú
menuBtn.addEventListener('click', () => {
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
});

// Cerrar menú
closeBtn.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
});

// Cerrar al hacer clic en el overlay
overlay.addEventListener('click', () => {
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
});

// Cerrar menú al seleccionar una opción
document.querySelectorAll('#sidebar a').forEach(link => {
    link.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });
});