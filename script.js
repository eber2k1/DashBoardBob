// Funcionalidad para el menú móvil
document.addEventListener('DOMContentLoaded', function () {
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
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
    // Cerrar menú en pantallas grandes cuando se redimensiona
    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            closeMenu();
        }
    });
});