// --- Selección de elementos al inicio ---
const formClientes = document.querySelector('#form-clientes') || document.querySelector('#cliente-form');
const inputId = document.querySelector('#cliente-id');
const inputNombre = document.querySelector('#cliente-nombre');
const inputCorreo = document.querySelector('#cliente-correo');
const inputTipoDoc = document.querySelector('#cliente-tipo-doc');
const inputNumdoc = document.querySelector('#cliente-numdoc');
const inputObservaciones = document.querySelector('#cliente-observaciones');
const tbody = document.querySelector('#clientes-tbody');
const mobileList = document.querySelector('#clientes-mobile-list');

const buscarCliente = document.querySelector('#buscar-cliente');
const documentTypeFilter = document.querySelector('#document-type-filter');
const balanceFilter = document.querySelector('#balance-filter');
const clearFiltersBtn = document.querySelector('#clear-filters');

// --- Renderiza la tabla de clientes ---
function renderClientes(clientes) {
    if (!tbody) return;
    clientes = clientes || clientesStore.getState();
    tbody.innerHTML = '';
    clientes.forEach(cliente => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-100 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${cliente.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.correo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.tipo_doc}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.numdoc}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.observaciones || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button class='text-[#2c9494] hover:text-[#f3ab13] focus:outline-none rounded mr-2' aria-label='Editar cliente' onclick='editarCliente(${cliente.id})'><i class='fa-solid fa-pen'></i></button>
                    <button class='text-red-500 hover:text-red-700 focus:outline-none rounded' aria-label='Eliminar cliente' onclick='eliminarCliente(${cliente.id})'><i class='fa-solid fa-trash'></i></button>
                </td>
            </tr>
        `;
    });
}

// --- Renderiza la lista de clientes para móviles ---
function mobileRenderClientes(clientes) {
    if (!mobileList) return;
    clientes = clientes || clientesStore.getState();
    mobileList.classList.remove('hidden');
    mobileList.innerHTML = '';
    clientes.forEach(cliente => {
        mobileList.innerHTML += `
            <div class="bg-white p-4 rounded-lg shadow-sm mb-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <img src="./assets/icons/bob-sm.png" alt="Logo Bob Subastas" class="h-8">
                        <div class="ml-2">
                            <h3 class="text-lg font-semibold text-gray-900">${cliente.nombre}</h3>
                            <p class="text-sm text-gray-500">${cliente.correo}</p>
                        </div>
                    </div>
                    <div class="flex items-center">
                        <button class='text-[#2c9494] hover:text-[#f3ab13] focus:outline-none rounded mr-2' aria-label='Editar cliente' onclick='editarCliente(${cliente.id})'><i class='fa-solid fa-pen'></i></button>
                    <button class='text-red-500 hover:text-red-700 focus:outline-none rounded' aria-label='Eliminar cliente' onclick='eliminarCliente(${cliente.id})'><i class='fa-solid fa-trash'></i></button>
                    </div>
                </div>
                <div class="mt-2">
                    <p class="text-sm text-gray-500">${cliente.tipo_doc}: ${cliente.numdoc}</p>
                    <p class="text-sm text-gray-500">Obs: ${cliente.observaciones || ''}</p>
                </div>
            </div>
        `;
    });
}

// Crear o editar cliente
formClientes.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = Number(inputId.value);
    const nombre = inputNombre.value;
    const correo = inputCorreo.value;
    const tipo_doc = inputTipoDoc.value;
    const numdoc = inputNumdoc.value;
    const observaciones = inputObservaciones.value;

    if (id) {
        clientesStore.update(id, { nombre, correo, tipo_doc, numdoc, observaciones });
    } else {
        clientesStore.add({ nombre, correo, tipo_doc, numdoc, observaciones });
    }
    renderClientes();
    mobileRenderClientes();
    formClientes.reset();
    closeModal();
});

// Eliminar cliente
window.eliminarCliente = function (id) {
    if (confirm('¿Eliminar cliente?')) {
        clientesStore.remove(id);
        renderClientes();
        mobileRenderClientes();
    }
}

// almacenar datos del cliente para editar
window.editarCliente = function (id) {
    const cliente = clientesStore.getById(id);
    if (!cliente) return;
    inputId.value = cliente.id;
    inputNombre.value = cliente.nombre;
    inputCorreo.value = cliente.correo;
    inputTipoDoc.value = cliente.tipo_doc;
    inputNumdoc.value = cliente.numdoc;
    inputObservaciones.value = cliente.observaciones || '';
    modalTitle.textContent = 'Editar Cliente';
    modal.classList.remove('hidden');
}

// filtrar dni o ruc

// Buscar cliente
buscarCliente.addEventListener('input', function (e) {
    const clientes = clientesStore.getState();
    const nombre = buscarCliente.value.toLowerCase();
    const filteredClientes = clientes.filter(cliente => cliente.nombre.toLowerCase().includes(nombre));
    renderClientes(filteredClientes);
    mobileRenderClientes(filteredClientes);
});

// Filtrar clientes por tipo de documento
documentTypeFilter.addEventListener('change', function (e) {
    const clientes = clientesStore.getState();
    const tipo_doc = documentTypeFilter.value;
    const filteredClientes = clientes.filter(cliente => cliente.tipo_doc.toLowerCase() === tipo_doc.toLowerCase());
    renderClientes(filteredClientes);
    mobileRenderClientes(filteredClientes);
});

// Reactividad: vuelve a renderizar si cambia el store
clientesStore.subscribe(() => {
    renderClientes();
    mobileRenderClientes();
});

// Cargar clientes al inicio
document.addEventListener('DOMContentLoaded', () => {
    renderClientes();
    mobileRenderClientes();
});