// Funcionalidad para el menú móvil
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-menu');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

const modal = document.querySelector('#cliente-modal') || document.querySelector('#ingreso-modal') || document.querySelector('#egreso-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.querySelector('#modal-title');

const nuevoFormBtn = document.querySelector('#nuevo-cliente-btn') || document.querySelector('#nuevo-ingreso-btn') || document.querySelector('#nuevo-egreso-btn');

const closeModalBtn = document.querySelector('#close-modal');

// Variables globales
window.tipoCambioActual = 0;
window.monedaDashboard = 'PEN';
window.monedaBalance = 'PEN';

window.setMonedaDashboard = function(moneda) {
    window.monedaDashboard = moneda;
    document.dispatchEvent(new CustomEvent('monedaDashboardCambiada'));
}

window.setMonedaBalance = function(moneda) {
    window.monedaBalance = moneda;
    document.dispatchEvent(new CustomEvent('monedaBalanceCambiada'));
}

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

// Abre el modal
function openModal() {
    if (modal) modal.classList.remove('hidden');
    if (modalOverlay) modalOverlay.classList.remove('hidden');
}

// Cierra el modal
function closeModal() {
    if (modal) modal.classList.add('hidden');
    if (modalOverlay) modalOverlay.classList.add('hidden');
}

if (nuevoFormBtn) nuevoFormBtn.onclick = () => {
    openModal();
};

if (closeModalBtn) closeModalBtn.onclick = closeModal;

// --- TIPO DE CAMBIO USD/PEN EN TIEMPO REAL (exchangerate-api.com) ---
// IMPORTANTE: Reemplaza 'TU_API_KEY' por tu propia API Key gratuita de https://www.exchangerate-api.com/
async function actualizarTipoCambio() {
    try {
        const apiKey = '5c2a1c28a9cad68ff1615da4'; // <-- PON AQUÍ TU API KEY
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
        const respuesta = await fetch(url);
        const data = await respuesta.json();
        // El tipo de cambio está en data.conversion_rates.PEN
        const valor = data.conversion_rates && data.conversion_rates.PEN;
        window.tipoCambioActual = valor;
        const span = document.getElementById('valor-tipo-cambio');
        if (span) {
            span.textContent = valor ? Number(valor).toLocaleString(undefined, {minimumFractionDigits:3, maximumFractionDigits:3}) : 'Error';
        }
        // Dispara evento para que otros scripts reactiven
        document.dispatchEvent(new CustomEvent('tipoCambioActualizado'));
    } catch (e) {
        console.error('Error al obtener tipo de cambio:', e);
        const span = document.getElementById('valor-tipo-cambio');
        if (span) span.textContent = 'Error';
    }
}

// funcion para setear el tipo de cambio
function setUpTipoCambioAutoUpdate() {
    actualizarTipoCambio();
    setInterval(actualizarTipoCambio, 5 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', function() {
    setUpTipoCambioAutoUpdate();
});