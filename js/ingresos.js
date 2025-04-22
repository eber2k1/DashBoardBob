// --- Selección de elementos al inicio ---
const ingresoModal = document.getElementById('ingreso-modal');
const ingresoForm = document.getElementById('ingreso-form');
const ingresoId = document.getElementById('ingreso-id');
const ingresoFecha = document.getElementById('ingreso-fecha');
const ingresoHora = document.getElementById('ingreso-hora');
const clienteAutocompleteInput = document.getElementById('ingreso-cliente-autocomplete');
const clienteHiddenInput = document.getElementById('ingreso-cliente');
const autocompleteList = document.getElementById('autocomplete-list');
const ingresoMedio = document.getElementById('ingreso-medio');
const ingresoBanco = document.getElementById('ingreso-banco');
const ingresoMoneda = document.getElementById('ingreso-moneda');
const ingresoImporte = document.getElementById('ingreso-importe');
const ingresoConcepto = document.getElementById('ingreso-concepto');
const ingresosTbody = document.getElementById('ingresos-tbody');
const filtroFecha = document.getElementById('filtro-fecha');
const filtroCliente = document.getElementById('filtro-cliente');
const filtroMedio = document.getElementById('filtro-medio');
const filtroBanco = document.getElementById('filtro-banco');
const filtroMoneda = document.getElementById('filtro-moneda');

// --- CRUD Ingresos ---
function renderIngresos() {
    const ingresos = ingresosStore.getState();
    ingresosTbody.innerHTML = '';
    ingresos.forEach(ingreso => {
        const cliente = clientesStore.getById(ingreso.cliente);
        ingresosTbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.fecha}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.hora}</td>
                <td class="px-4 py-2 whitespace-nowrap">${cliente ? cliente.nombre : '(Sin cliente)'}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.medio}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.banco}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.moneda}</td>
                <td class="px-4 py-2 whitespace-nowrap font-bold text-right text-green-500">${Number(ingreso.importe).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.concepto}</td>
                <td class="px-4 py-2 whitespace-nowrap text-right">
                    <button class="text-[#2c9494] hover:text-[#f3ab13] focus:outline-none rounded mr-2" aria-label="Editar ingreso" onclick="editarIngreso(${ingreso.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-500 hover:text-red-700 focus:outline-none rounded" aria-label="Eliminar ingreso" onclick="eliminarIngreso(${ingreso.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// --- Autocompletado de cliente en modal de ingreso ---
clienteAutocompleteInput.addEventListener('input', function() {
    const value = this.value.trim().toLowerCase();
    autocompleteList.innerHTML = '';
    if (!value) {
        autocompleteList.classList.add('hidden');
        clienteHiddenInput.value = '';
        return;
    }
    const clientes = clientesStore.getState();
    const matches = clientes.filter(c => c.nombre.toLowerCase().includes(value));
    if (matches.length === 0) {
        autocompleteList.classList.add('hidden');
        clienteHiddenInput.value = '';
        return;
    }
    matches.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = cliente.nombre;
        li.className = 'px-3 py-2 cursor-pointer hover:bg-[#f3ab13]/20';
        li.addEventListener('mousedown', function(e) {
            e.preventDefault();
            clienteAutocompleteInput.value = cliente.nombre;
            clienteHiddenInput.value = cliente.id;
            autocompleteList.classList.add('hidden');
        });
        autocompleteList.appendChild(li);
    });
    autocompleteList.classList.remove('hidden');
});

clienteAutocompleteInput.addEventListener('blur', function() {
    setTimeout(() => autocompleteList.classList.add('hidden'), 100);
});

// --- Crear o editar ingreso ---
ingresoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = Number(ingresoId.value);
    const fecha = ingresoFecha.value;
    const hora = ingresoHora.value;
    const cliente = Number(clienteHiddenInput.value);
    const medio = ingresoMedio.value;
    const banco = ingresoBanco.value;
    const moneda = ingresoMoneda.value;
    const importe = Number(ingresoImporte.value);
    const concepto = ingresoConcepto.value;
    if (!cliente) {
        clienteAutocompleteInput.focus();
        clienteAutocompleteInput.classList.add('border-red-400');
        return;
    } else {
        clienteAutocompleteInput.classList.remove('border-red-400');
    }
    if (id) {
        ingresosStore.update(id, { fecha, hora, cliente, medio, banco, moneda, importe, concepto });
    } else {
        ingresosStore.add({ fecha, hora, cliente, medio, banco, moneda, importe, concepto });
    }
    renderIngresos();
    resetIngresoForm();
    closeModal();
});

// Al abrir modal para editar, rellenar input de autocompletado
window.editarIngreso = function(id) {
    const ingreso = ingresosStore.getById(id);
    if (!ingreso) return;
    ingresoId.value = ingreso.id;
    ingresoFecha.value = ingreso.fecha;
    ingresoHora.value = ingreso.hora;
    clienteHiddenInput.value = ingreso.cliente;
    const cliente = clientesStore.getById(ingreso.cliente);
    clienteAutocompleteInput.value = cliente ? cliente.nombre : '';
    ingresoMedio.value = ingreso.medio;
    ingresoBanco.value = ingreso.banco;
    ingresoMoneda.value = ingreso.moneda;
    ingresoImporte.value = ingreso.importe;
    ingresoConcepto.value = ingreso.concepto;
    document.getElementById('modal-ingreso-title').textContent = 'Editar Ingreso';
    openModal();
};

// Al crear nuevo ingreso, limpiar input de autocompletado y el id
function resetIngresoForm() {
    ingresoForm.reset();
    clienteAutocompleteInput.value = '';
    clienteHiddenInput.value = '';
    ingresoId.value = '';
}

// --- Eliminar ingreso ---
window.eliminarIngreso = function(id) {
    if (confirm('¿Seguro que deseas eliminar este ingreso?')) {
        ingresosStore.remove(id);
        renderIngresos();
    }
};

// --- Poblar select de clientes (ya no necesario para modal, pero sí para filtro) ---
function poblarClientesSelect() {
    const clientes = clientesStore.getState();
    const filtroCliente = document.getElementById('filtro-cliente');
    if (filtroCliente) {
        filtroCliente.innerHTML = '<option value="">Todos los clientes</option>';
        clientes.forEach(cliente => {
            filtroCliente.innerHTML += `<option value="${cliente.id}">${cliente.nombre}</option>`;
        });
    }
}

// --- Filtros básicos (puedes expandir según tus necesidades) ---
function aplicarFiltrosIngresos() {
    let ingresos = ingresosStore.getState();
    if (filtroFecha.value) ingresos = ingresos.filter(i => i.fecha === filtroFecha.value);
    if (filtroCliente.value) ingresos = ingresos.filter(i => String(i.cliente) === filtroCliente.value);
    if (filtroMedio.value) ingresos = ingresos.filter(i => i.medio === filtroMedio.value);
    if (filtroBanco.value) ingresos = ingresos.filter(i => i.banco === filtroBanco.value);
    if (filtroMoneda.value) ingresos = ingresos.filter(i => i.moneda === filtroMoneda.value);
    // Render con filtro
    ingresosTbody.innerHTML = '';
    ingresos.forEach(ingreso => {
        const cliente = clientesStore.getById(ingreso.cliente);
        ingresosTbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.fecha}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.hora}</td>
                <td class="px-4 py-2 whitespace-nowrap">${cliente ? cliente.nombre : '(Sin cliente)'}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.medio}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.banco}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.moneda}</td>
                <td class="px-4 py-2 whitespace-nowrap text-right font-bold text-green-500">${Number(ingreso.importe).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td class="px-4 py-2 whitespace-nowrap">${ingreso.concepto}</td>
                <td class="px-4 py-2 whitespace-nowrap text-right">
                    <button class="text-[#2c9494] hover:text-[#f3ab13] focus:outline-none rounded mr-2" aria-label="Editar ingreso" onclick="editarIngreso(${ingreso.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-500 hover:text-red-700 focus:outline-none rounded" aria-label="Eliminar ingreso" onclick="eliminarIngreso(${ingreso.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// --- Listeners de filtros ---
[filtroFecha, filtroCliente, filtroMedio, filtroBanco, filtroMoneda].forEach(filtro => {
    if (filtro) filtro.addEventListener('change', aplicarFiltrosIngresos);
});

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', function() {
    poblarClientesSelect();
    aplicarFiltrosIngresos();
    ingresosStore.subscribe(() => {
        poblarClientesSelect();
        aplicarFiltrosIngresos();
    });
    clientesStore.subscribe(() => {
        poblarClientesSelect();
        aplicarFiltrosIngresos();
    });
});