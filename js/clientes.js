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

const sortIcon = document.querySelectorAll('.sort-icon');
const sortTh = document.querySelectorAll('th[data-sort]');

// --- Estado de ordenamiento global ---
let clientesSortCol = null;
let clientesSortDir = 1;
window.setClientesSort = function(col, dir) {
    clientesSortCol = col;
    clientesSortDir = dir;
    aplicarFiltros();
};

function sortClientes(clientes) {
    if (!clientesSortCol) return clientes;
    const sorted = [...clientes].sort((a, b) => {
        let va = a[clientesSortCol] || '';
        let vb = b[clientesSortCol] || '';
        // Para que numdoc (número) ordene numéricamente si corresponde
        if (clientesSortCol === 'numdoc' && !isNaN(va) && !isNaN(vb)) {
            va = Number(va);
            vb = Number(vb);
        } else {
            va = va.toString().toLowerCase();
            vb = vb.toString().toLowerCase();
        }
        if (va < vb) return -1 * clientesSortDir;
        if (va > vb) return 1 * clientesSortDir;
        return 0;
    });
    return sorted;
}

// --- Renderiza la tabla de clientes ---
function renderClientes(clientes) {
    if (!tbody) return;
    clientes = clientes || clientesStore.getState();
    clientes = sortClientes(clientes);
    tbody.innerHTML = '';
    clientes.forEach(cliente => {
        tbody.innerHTML += `
            <tr class="hover:bg-gray-100 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">${cliente.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.correo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.tipo_doc}</td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">${cliente.numdoc}</td>
                <td class="px-6 py-4 break-words max-w-xs text-gray-500" style="white-space:pre-line;">${cliente.observaciones ? cliente.observaciones : ''}</td>
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
    clientes = sortClientes(clientes);
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

// --- Filtrar clientes ---
function aplicarFiltros() {
    const clientes = clientesStore.getState();
    const texto = buscarCliente.value.toLowerCase();
    const tipo_doc = documentTypeFilter.value.toLowerCase();
    const balance = balanceFilter.value;

    let filtrados = clientes;

    // Filtrar por texto (nombre, correo, numdoc)
    if (texto) {
        filtrados = filtrados.filter(cliente =>
            cliente.nombre.toLowerCase().includes(texto) ||
            cliente.correo.toLowerCase().includes(texto) ||
            cliente.numdoc.toLowerCase().includes(texto)
        );
    }

    // Filtrar por tipo_doc si está seleccionado
    if (tipo_doc) {
        filtrados = filtrados.filter(cliente => cliente.tipo_doc && cliente.tipo_doc.toLowerCase() === tipo_doc);
    }

    // Filtrar por balance si está seleccionado
    if (balance) {
        if (balance === 'positive') {
            filtrados = filtrados.filter(cliente => Number(cliente.saldo) > 0);
        } else if (balance === 'zero') {
            filtrados = filtrados.filter(cliente => Number(cliente.saldo) === 0);
        }
    }

    renderClientes(filtrados);
    mobileRenderClientes(filtrados);
}

// Buscar cliente
buscarCliente.addEventListener('input', aplicarFiltros);
// Filtrar clientes por tipo de documento
documentTypeFilter.addEventListener('change', aplicarFiltros);
// Filtrar clientes por balance
balanceFilter.addEventListener('change', aplicarFiltros);
// Limpiar filtros
clearFiltersBtn.addEventListener('click', function() {
    buscarCliente.value = '';
    if (documentTypeFilter) documentTypeFilter.value = '';
    if (balanceFilter) balanceFilter.value = '';
    aplicarFiltros();
});


 // --- ORDENAMIENTO DE TABLA DE CLIENTES CON ICONOS ---
 let sortCol = null;
 let sortDir = 1;
 const sortIcons = {
     default: 'fa-sort',
     asc: 'fa-sort-up',
     desc: 'fa-sort-down'
 };
 function updateSortIcons() {
    sortIcon.forEach(icon => {
         const col = icon.getAttribute('data-col');
         icon.classList.remove('fa-sort-up', 'fa-sort-down', 'fa-sort', 'text-[#2c9494]');
         if (sortCol === col) {
             if (sortDir === 1) {
                 icon.classList.add('fa-sort-up', 'text-[#2c9494]');
             } else if (sortDir === -1) {
                 icon.classList.add('fa-sort-down', 'text-[#2c9494]');
             }
         } else {
             icon.classList.add('fa-sort');
         }
     });
 }

// Eventos de ordenamiento
sortTh.forEach(th => {
     th.addEventListener('click', function() {
         const col = th.getAttribute('data-sort');
         if (sortCol === col) {
             sortDir = -sortDir;
             // Si ya estaba descendente, vuelve a estado original (sin orden)
             if (sortDir === 1 && th.querySelector('.sort-icon').classList.contains('fa-sort-down')) {
                 sortCol = null;
                 sortDir = 1;
             }
         } else {
             sortCol = col;
             sortDir = 1;
         }
         window.setClientesSort && window.setClientesSort(sortCol, sortDir);
         updateSortIcons();
     });
 });
 // Inicializa iconos
 updateSortIcons();


// Reactividad: vuelve a renderizar si cambia el store
clientesStore.subscribe(aplicarFiltros);

// Cargar clientes al inicio
document.addEventListener('DOMContentLoaded', aplicarFiltros);