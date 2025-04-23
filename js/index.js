// --- Dashboard resumen Bob ---

// ==== GLOBAL ELEMENTS ====
const ingresosCardEl = document.querySelector('#ingresos-card');
const egresosCardEl = document.querySelector('#egresos-card');
const balanceGeneralCardEl = document.querySelector('#balance-general-card');
const monedaLabelIngresosEl = document.querySelector('#moneda-label-ingresos');
const monedaLabelEgresosEl = document.querySelector('#moneda-label-egresos');
const monedaLabelBalanceEl = document.querySelector('#moneda-label-balance');
const clientesCardEl = document.querySelector('.bg-blue-50 .font-bold');
const tbodyMovimientosEl = document.querySelector('tbody.bg-white.divide-y');
const selectMonedaEl = document.querySelector('#moneda-dashboard');
const totalClientesEl = document.querySelector('#totalClientes');
const clientesTipoDocChartEl = document.querySelector('#clientesTipoDocChart');

// === DATA HELPERS ===

// funcion para obtener los ingresos en una moneda dada
function getIngresosEnMoneda(moneda, tipoCambio) {
    return ingresosStore.getState().reduce((total, i) => {
        return total + window.convertirImporte(i.importe, i.moneda || 'PEN', moneda, tipoCambio);
    }, 0);
}

// funcion para obtener los egresos en una moneda dada
function getEgresosEnMoneda(moneda, tipoCambio) {
    return egresosStore.getState().reduce((total, e) => {
        return total + window.convertirImporte(e.importe, e.moneda || 'PEN', moneda, tipoCambio);
    }, 0);
}

// funcion para obtener el total de clientes
function getTotalClientes() {
    return clientesStore.getState().length;
}

// funcion para obtener los ultimos movimientos
function getUltimosMovimientos(n = 5) {
    const ingresos = ingresosStore.getState().map(i => ({...i, tipo: 'Ingreso'}));
    const egresos = egresosStore.getState().map(e => ({...e, tipo: 'Egreso'}));
    return [...ingresos, ...egresos]
        .sort((a, b) => {
            const fechaA = a.fecha + ' ' + (a.hora || '00:00');
            const fechaB = b.fecha + ' ' + (b.hora || '00:00');
            return fechaB.localeCompare(fechaA);
        })
        .slice(0, n);
}

// funcion para obtener un cliente por su id
function getClientePorId(id) {
    return clientesStore.getById(id);
}

// ==== DOM HELPERS ====

// funcion para setear un valor en un elemento
function setCardValue(element, value) {
    if (element) element.textContent = value;
}

// funcion para setear un label en un elemento
function setCardLabel(element, value) {
    if (element) element.textContent = value;
}

// funcion para setear el total de clientes
function setClientesCard(value) {
    if (clientesCardEl) clientesCardEl.textContent = value;
}

// funcion para renderizar el dashboard resumen
function renderDashboardResumen() {
    const moneda = window.monedaDashboard || 'PEN';
    const tipoCambio = window.tipoCambioActual || 1;
    const totalIngresos = getIngresosEnMoneda(moneda, tipoCambio);
    const totalEgresos = getEgresosEnMoneda(moneda, tipoCambio);
    const balance = totalIngresos - totalEgresos;
    setCardValue(ingresosCardEl, totalIngresos.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}));
    setCardValue(egresosCardEl, totalEgresos.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}));
    setCardValue(balanceGeneralCardEl, balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}));
    setCardLabel(monedaLabelIngresosEl, moneda);
    setCardLabel(monedaLabelEgresosEl, moneda);
    setCardLabel(monedaLabelBalanceEl, moneda);
    setClientesCard(getTotalClientes());
}

// funcion para renderizar los ultimos movimientos
function renderUltimosRegistros() {
    const movimientos = getUltimosMovimientos(5);
    if (!tbodyMovimientosEl) return;
    tbodyMovimientosEl.innerHTML = '';
    movimientos.forEach(mov => {
        const cliente = getClientePorId(mov.cliente);
        tbodyMovimientosEl.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${mov.fecha} ${mov.hora || ''}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">${cliente ? cliente.nombre : '(Sin cliente)'}</td>
                <td class="px-4 py-3 text-sm">${mov.concepto || ''}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mov.tipo === 'Ingreso' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">${mov.tipo}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium ${mov.tipo === 'Ingreso' ? 'text-green-600' : 'text-yellow-600'}">${mov.tipo === 'Ingreso' ? '+' : '-'}${Number(mov.importe).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            </tr>
        `;
    });
}

// funcion para setear la reactividad
function setUpReactivity() {
    clientesStore.subscribe(renderDashboardResumen);
    ingresosStore.subscribe(() => {
        renderDashboardResumen();
        renderUltimosRegistros();
    });
    egresosStore.subscribe(() => {
        renderDashboardResumen();
        renderUltimosRegistros();
    });
    document.addEventListener('tipoCambioActualizado', renderDashboardResumen);
    document.addEventListener('monedaDashboardCambiada', renderDashboardResumen);
}

// funcion para setear el selector de moneda
function setUpMonedaSelector() {
    if (selectMonedaEl) {
        selectMonedaEl.value = window.monedaDashboard || 'PEN';
        selectMonedaEl.onchange = function() {
            window.setMonedaDashboard(this.value);
        };
    }
}

// funcion para renderizar la grafica de clientes por tipo de documento
function renderGraficaClientesTipoDoc() {
    setTimeout(function() {
        let clientes = [];
        if (typeof clientesStore !== 'undefined' && clientesStore.getState) {
            clientes = clientesStore.getState();
        }
        setCardValue(totalClientesEl, clientes.length);
        const totalRuc = clientes.filter(c => c.tipo_doc && c.tipo_doc.toLowerCase() === 'ruc').length;
        const totalDni = clientes.filter(c => c.tipo_doc && c.tipo_doc.toLowerCase() === 'dni').length;
        const ctx = clientesTipoDocChartEl.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['RUC', 'DNI'],
                datasets: [{
                    data: [totalRuc, totalDni],
                    backgroundColor: [
                        '#f3ab13', // RUC
                        '#2c9494'  // DNI
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }, 200);
}

// ==== MAIN ENTRY ====
document.addEventListener('DOMContentLoaded', function() {
    renderDashboardResumen();
    renderUltimosRegistros();
    setUpReactivity();
    setUpTipoCambioAutoUpdate();
    setUpMonedaSelector();
    renderGraficaClientesTipoDoc();
});