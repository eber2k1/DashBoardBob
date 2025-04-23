// --- Balance e Historial por Cliente ---

// Poblar el filtro de clientes en balance.html
definePoblarClientesSelect();

function definePoblarClientesSelect() {
    window.poblarClientesSelectBalance = function() {
        const select = document.getElementById('filtro-cliente');
        if (!select) return;
        const clientes = clientesStore.getState();
        select.innerHTML = '<option value="">Todos los clientes</option>' + clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
}

// Renderizar tabla de balances por cliente
defineRenderBalances();

function defineRenderBalances() {
    window.renderBalances = function() {
        const tbody = document.getElementById('balance-tbody');
        const filtroCliente = document.getElementById('filtro-cliente').value;
        const clientes = clientesStore.getState();
        const moneda = window.monedaBalance || 'PEN';
        const tipoCambio = window.tipoCambioActual || 1;
        tbody.innerHTML = '';
        clientes.filter(c => !filtroCliente || String(c.id) === filtroCliente).forEach(cliente => {
            let totalIngresos = 0, totalEgresos = 0;
            const ingresos = ingresosStore.getState().filter(i => i.cliente === cliente.id);
            const egresos = egresosStore.getState().filter(e => e.cliente === cliente.id);
            ingresos.forEach(i => {
                totalIngresos += window.convertirImporte(Number(i.importe), i.moneda || 'PEN', moneda, tipoCambio);
            });
            egresos.forEach(e => {
                totalEgresos += window.convertirImporte(Number(e.importe), e.moneda || 'PEN', moneda, tipoCambio);
            });
            const balance = totalIngresos - totalEgresos;
            tbody.innerHTML += `
                <tr class="hover:bg-[#e6f5f5] transition rounded-xl shadow-sm">
                    <td class="px-6 py-4 whitespace-nowrap font-semibold text-[#2c9494]">${cliente.nombre}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-green-600 font-bold">${Number(totalIngresos).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} <span class="text-xs">${moneda}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-red-500 font-bold">${Number(totalEgresos).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} <span class="text-xs">${moneda}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-right font-semibold ${balance >= 0 ? 'text-[#2c9494]' : 'text-red-600'}">${Number(balance).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} <span class="text-xs">${moneda}</span></td>
                    <td class="px-6 py-4 whitespace-nowrap text-center">
                        <button class="text-blue-600 hover:underline ver-detalle-btn" data-id="${cliente.id}">Ver detalle</button>
                    </td>
                </tr>
            `;
        });
    }
}

// Mostrar historial detallado de ingresos y egresos de un cliente en un modal
defineMostrarDetalleCliente();

function defineMostrarDetalleCliente() {
    window.mostrarDetalleCliente = function(clienteId) {
        const cliente = clientesStore.getById(clienteId);
        if (!cliente) return;
        const ingresos = ingresosStore.getState().filter(i => i.cliente === clienteId);
        const egresos = egresosStore.getState().filter(e => e.cliente === clienteId);
        // Unificar y ordenar por fecha/hora
        const movimientos = [
            ...ingresos.map(i => ({...i, tipo: 'Ingreso'})),
            ...egresos.map(e => ({...e, tipo: 'Egreso'}))
        ].sort((a, b) => {
            const fechaA = a.fecha + ' ' + (a.hora || '00:00');
            const fechaB = b.fecha + ' ' + (b.hora || '00:00');
            return fechaA.localeCompare(fechaB);
        });
        const tbody = document.getElementById('detalle-tbody');
        tbody.innerHTML = '';
        movimientos.forEach(mov => {
            tbody.innerHTML += `
                <tr class="hover:bg-[#e6f5f5] transition">
                    <td class="px-5 py-3 whitespace-nowrap font-medium">${mov.fecha} ${mov.hora || ''}</td>
                    <td class="px-5 py-3 whitespace-nowrap">${mov.tipo}</td>
                    <td class="px-5 py-3 whitespace-nowrap">${mov.medio || ''}</td>
                    <td class="px-5 py-3 whitespace-nowrap">${mov.banco || ''}</td>
                    <td class="px-5 py-3 whitespace-nowrap">${mov.moneda || ''}</td>
                    <td class="px-5 py-3 whitespace-nowrap ${mov.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'} font-bold">${Number(mov.importe).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                    <td class="px-5 py-3 whitespace-pre-line max-w-xs break-words text-gray-500">${mov.concepto || ''}</td>
                </tr>
            `;
        });
        document.getElementById('modal-detalle-title').textContent = `Detalle de Movimientos - ${cliente.nombre}`;
        document.getElementById('detalle-modal').classList.remove('hidden');
    }
}

// Cerrar el modal de detalle
defineCerrarDetalleModal();

function defineCerrarDetalleModal() {
    document.getElementById('close-detalle-modal').onclick = function() {
        document.getElementById('detalle-modal').classList.add('hidden');
    }
}

// Inicialización automática al cargar la página

document.addEventListener('DOMContentLoaded', function() {
    poblarClientesSelectBalance();
    renderBalances();
    document.getElementById('filtro-cliente').addEventListener('change', renderBalances);
    document.getElementById('limpiar-filtros').addEventListener('click', function() {
        document.getElementById('filtro-cliente').value = '';
        renderBalances();
    });
    // Reactividad: actualizar balances si cambia el store
    ingresosStore.subscribe(renderBalances);
    egresosStore.subscribe(renderBalances);
    clientesStore.subscribe(() => {
        poblarClientesSelectBalance();
        renderBalances();
    });
    document.addEventListener('tipoCambioActualizado', renderBalances);
    document.addEventListener('monedaBalanceCambiada', renderBalances);
    // Selector de moneda
    const selectMoneda = document.getElementById('moneda-balance');
    if (selectMoneda) {
        selectMoneda.value = window.monedaBalance || 'PEN';
        selectMoneda.onchange = function() {
            window.setMonedaBalance(this.value);
        };
    }
    // Listener para los botones "Ver detalle"
    document.getElementById('balance-tbody').addEventListener('click', function(e) {
        const btn = e.target.closest('.ver-detalle-btn');
        if (btn) {
            const clienteId = btn.getAttribute('data-id');
            if (clienteId) window.mostrarDetalleCliente(Number(clienteId));
        }
    });
});