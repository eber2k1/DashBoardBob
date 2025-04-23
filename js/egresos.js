// --- Selección de elementos al inicio ---
const egresoModal = document.getElementById('egreso-modal');
const egresoForm = document.getElementById('egreso-form');
const egresoId = document.getElementById('egreso-id');
const egresoFecha = document.getElementById('egreso-fecha');
const egresoHora = document.getElementById('egreso-hora');
const egresoClienteAutocomplete = document.getElementById('egreso-cliente-autocomplete');
const egresoClienteHidden = document.getElementById('egreso-cliente');
const egresoAutocompleteList = document.getElementById('egreso-autocomplete-list');
const egresoMedio = document.getElementById('egreso-medio');
const egresoBanco = document.getElementById('egreso-banco');
const egresoMoneda = document.getElementById('egreso-moneda');
const egresoImporte = document.getElementById('egreso-importe');
const egresoConcepto = document.getElementById('egreso-concepto');
const egresosTbody = document.getElementById('egresos-tbody');
const filtroFecha = document.getElementById('filtro-fecha');
const filtroCliente = document.getElementById('filtro-cliente');
const filtroMedio = document.getElementById('filtro-medio');
const filtroBanco = document.getElementById('filtro-banco');
const filtroMoneda = document.getElementById('filtro-moneda');


// --- CRUD Egresos ---
function renderEgresos() {
    const egresos = egresosStore.getState();
    egresosTbody.innerHTML = '';
    egresos.forEach(egreso => {
        const cliente = clientesStore.getById(egreso.cliente);
        egresosTbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-2 whitespace-nowrap">${egreso.fecha}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.hora}</td>
                <td class="px-4 py-2 whitespace-nowrap">${cliente ? cliente.nombre : '(Sin cliente)'}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.medio}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.banco}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.moneda}</td>
                <td class="px-4 py-2 whitespace-nowrap font-bold text-right text-red-500">${Number(egreso.importe).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td class="px-6 py-4 break-words max-w-xs text-gray-500" style="white-space:pre-line;">${egreso.concepto}</td>
                <td class="px-4 py-2 whitespace-nowrap text-right">
                    <button class="text-[#2c9494] hover:text-[#f3ab13] focus:outline-none rounded mr-2" aria-label="Editar egreso" onclick="editarEgreso(${egreso.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-500 hover:text-red-700 focus:outline-none rounded" aria-label="Eliminar egreso" onclick="eliminarEgreso(${egreso.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

egresoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = Number(egresoId.value);
    const fecha = egresoFecha.value;
    const hora = egresoHora.value;
    const cliente = Number(egresoClienteHidden.value);
    const medio = egresoMedio.value;
    const banco = egresoBanco.value;
    const moneda = egresoMoneda.value;
    const importe = Number(egresoImporte.value);
    const concepto = egresoConcepto.value;
    if (!cliente) {
        egresoClienteAutocomplete.focus();
        egresoClienteAutocomplete.classList.add('border-red-400');
        return;
    } else {
        egresoClienteAutocomplete.classList.remove('border-red-400');
    }
    if (id) {
        egresosStore.update(id, { fecha, hora, cliente, medio, banco, moneda, importe, concepto });
    } else {
        egresosStore.add({ fecha, hora, cliente, medio, banco, moneda, importe, concepto });
    }
    renderEgresos();
    resetEgresoForm();
    closeModal();
});

window.editarEgreso = function(id) {
    const egreso = egresosStore.getById(id);
    if (!egreso) return;
    egresoId.value = egreso.id;
    egresoFecha.value = egreso.fecha;
    egresoHora.value = egreso.hora;
    egresoClienteHidden.value = egreso.cliente;
    const cliente = clientesStore.getById(egreso.cliente);
    egresoClienteAutocomplete.value = cliente ? cliente.nombre : '';
    egresoMedio.value = egreso.medio;
    egresoBanco.value = egreso.banco;
    egresoMoneda.value = egreso.moneda;
    egresoImporte.value = egreso.importe;
    egresoConcepto.value = egreso.concepto;
    document.getElementById('modal-egreso-title').textContent = 'Editar Egreso';
    openModal();
};

window.eliminarEgreso = function(id) {
    if (confirm('¿Seguro que deseas eliminar este egreso?')) {
        egresosStore.remove(id);
        renderEgresos();
    }
};

function resetEgresoForm() {
    egresoForm.reset();
    egresoClienteAutocomplete.value = '';
    egresoClienteHidden.value = '';
    egresoId.value = '';
}

// --- Autocompletado de cliente en modal de egreso ---
egresoClienteAutocomplete.addEventListener('input', function() {
    const value = this.value.trim().toLowerCase();
    egresoAutocompleteList.innerHTML = '';
    if (!value) {
        egresoAutocompleteList.classList.add('hidden');
        egresoClienteHidden.value = '';
        return;
    }
    const clientes = clientesStore.getState();
    const matches = clientes.filter(c => c.nombre.toLowerCase().includes(value));
    if (matches.length === 0) {
        egresoAutocompleteList.classList.add('hidden');
        egresoClienteHidden.value = '';
        return;
    }
    matches.forEach(cliente => {
        const li = document.createElement('li');
        li.textContent = cliente.nombre;
        li.className = 'px-3 py-2 cursor-pointer hover:bg-[#f3ab13]/20';
        li.addEventListener('mousedown', function(e) {
            e.preventDefault();
            egresoClienteAutocomplete.value = cliente.nombre;
            egresoClienteHidden.value = cliente.id;
            egresoAutocompleteList.classList.add('hidden');
        });
        egresoAutocompleteList.appendChild(li);
    });
    egresoAutocompleteList.classList.remove('hidden');
});

egresoClienteAutocomplete.addEventListener('blur', function() {
    setTimeout(() => egresoAutocompleteList.classList.add('hidden'), 100);
});


function poblarClientesSelectEgreso() {
    const clientes = clientesStore.getState();
    const filtroCliente = document.getElementById('filtro-cliente');
    if (filtroCliente) {
        filtroCliente.innerHTML = '<option value="">Todos los clientes</option>';
        clientes.forEach(cliente => {
            filtroCliente.innerHTML += `<option value="${cliente.id}">${cliente.nombre}</option>`;
        });
    }
}

function aplicarFiltrosEgresos() {
    let egresos = egresosStore.getState();
    if (filtroFecha.value) egresos = egresos.filter(i => i.fecha === filtroFecha.value);
    if (filtroCliente.value) egresos = egresos.filter(i => String(i.cliente) === filtroCliente.value);
    if (filtroMedio.value) egresos = egresos.filter(i => i.medio === filtroMedio.value);
    if (filtroBanco.value) egresos = egresos.filter(i => i.banco === filtroBanco.value);
    if (filtroMoneda.value) egresos = egresos.filter(i => i.moneda === filtroMoneda.value);
    egresosTbody.innerHTML = '';
    egresos.forEach(egreso => {
        const cliente = clientesStore.getById(egreso.cliente);
        egresosTbody.innerHTML += `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-4 py-2 whitespace-nowrap">${egreso.fecha}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.hora}</td>
                <td class="px-4 py-2 whitespace-nowrap">${cliente ? cliente.nombre : '(Sin cliente)'}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.medio}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.banco}</td>
                <td class="px-4 py-2 whitespace-nowrap">${egreso.moneda}</td>
                <td class="px-4 py-2 whitespace-nowrap font-bold text-right text-red-500">${Number(egreso.importe).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td class="px-6 py-4 break-words max-w-xs text-gray-500" style="white-space:pre-line;">${egreso.concepto}</td>
                <td class="px-4 py-2 whitespace-nowrap text-right">
                    <button class="text-[#2c9494] hover:text-[#f3ab13] focus:outline-none rounded mr-2" aria-label="Editar egreso" onclick="editarEgreso(${egreso.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-500 hover:text-red-700 focus:outline-none rounded" aria-label="Eliminar egreso" onclick="eliminarEgreso(${egreso.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

[filtroFecha, filtroCliente, filtroMedio, filtroBanco, filtroMoneda].forEach(filtro => {
    if (filtro) filtro.addEventListener('change', aplicarFiltrosEgresos);
});

document.addEventListener('DOMContentLoaded', function() {
    poblarClientesSelectEgreso();
    aplicarFiltrosEgresos();
    egresosStore.subscribe(() => {
        poblarClientesSelectEgreso();
        aplicarFiltrosEgresos();
    });
    clientesStore.subscribe(() => {
        poblarClientesSelectEgreso();
        aplicarFiltrosEgresos();
    });
});