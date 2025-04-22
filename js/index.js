// --- Dashboard resumen Bob ---

document.addEventListener('DOMContentLoaded', function() {
    renderDashboardResumen();
    renderUltimosRegistros();
    // Reactividad: actualiza si cambia algún store
    clientesStore.subscribe(renderDashboardResumen);
    ingresosStore.subscribe(() => {
        renderDashboardResumen();
        renderUltimosRegistros();
    });
    egresosStore.subscribe(() => {
        renderDashboardResumen();
        renderUltimosRegistros();
    });
    actualizarTipoCambio();
    setInterval(actualizarTipoCambio, 5 * 60 * 1000); // Actualiza cada 5 minutos
});

function renderDashboardResumen() {
    const clientes = clientesStore.getState();
    const totalClientes = clientes.length;
    const ingresos = ingresosStore.getState();
    const egresos = egresosStore.getState();
    const moneda = window.monedaDashboard || 'PEN';
    const tipoCambio = window.tipoCambioActual || 1;
    let totalIngresos = 0, totalEgresos = 0;
    ingresos.forEach(i => {
        totalIngresos += window.convertirImporte(i.importe, i.moneda || 'PEN', moneda, tipoCambio);
    });
    egresos.forEach(e => {
        totalEgresos += window.convertirImporte(e.importe, e.moneda || 'PEN', moneda, tipoCambio);
    });
    const balance = totalIngresos - totalEgresos;
    // Actualiza cards
    document.getElementById('ingresos-card').textContent = totalIngresos.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    document.getElementById('egresos-card').textContent = totalEgresos.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    document.getElementById('balance-general-card').textContent = balance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    document.getElementById('moneda-label-ingresos').textContent = moneda;
    document.getElementById('moneda-label-egresos').textContent = moneda;
    document.getElementById('moneda-label-balance').textContent = moneda;
    // Clientes
    const clientesCard = document.querySelector('.bg-blue-50 .font-bold');
    if (clientesCard) clientesCard.textContent = totalClientes;
}

function renderUltimosRegistros() {
    // Obtener los 5 últimos ingresos y egresos (por fecha+hora)
    const ingresos = ingresosStore.getState().map(i => ({...i, tipo: 'Ingreso'}));
    const egresos = egresosStore.getState().map(e => ({...e, tipo: 'Egreso'}));
    const movimientos = [...ingresos, ...egresos]
        .sort((a, b) => {
            const fechaA = a.fecha + ' ' + (a.hora || '00:00');
            const fechaB = b.fecha + ' ' + (b.hora || '00:00');
            return fechaB.localeCompare(fechaA);
        })
        .slice(0, 5);
    const tbody = document.querySelector('tbody.bg-white.divide-y');
    if (!tbody) return;
    tbody.innerHTML = '';
    movimientos.forEach(mov => {
        const cliente = clientesStore.getById(mov.cliente);
        tbody.innerHTML += `
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

document.addEventListener('DOMContentLoaded', function() {
    renderDashboardResumen();
    renderUltimosRegistros();
    clientesStore.subscribe(renderDashboardResumen);
    ingresosStore.subscribe(() => {
        renderDashboardResumen();
        renderUltimosRegistros();
    });
    egresosStore.subscribe(() => {
        renderDashboardResumen();
        renderUltimosRegistros();
    });
    actualizarTipoCambio();
    setInterval(actualizarTipoCambio, 5 * 60 * 1000);
    // Selector de moneda
    const selectMoneda = document.getElementById('moneda-dashboard');
    if (selectMoneda) {
        selectMoneda.value = window.monedaDashboard || 'PEN';
        selectMoneda.onchange = function() {
            window.setMonedaDashboard(this.value);
        };
    }
});
document.addEventListener('tipoCambioActualizado', renderDashboardResumen);
document.addEventListener('monedaDashboardCambiada', renderDashboardResumen);

// --- GRAFICA CIRCULAR CLIENTES POR TIPO DE DOCUMENTO ---
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que store.js cargue y exponga clientesStore
    setTimeout(function() {
        let clientes = [];
        if (typeof clientesStore !== 'undefined' && clientesStore.getState) {
            clientes = clientesStore.getState();
        }
        // Mostrar el total de clientes
        document.getElementById('totalClientes').textContent = clientes.length;

        const totalRuc = clientes.filter(c => c.tipo_doc && c.tipo_doc.toLowerCase() === 'ruc').length;
        const totalDni = clientes.filter(c => c.tipo_doc && c.tipo_doc.toLowerCase() === 'dni').length;
        const totalOtros = clientes.length - totalRuc - totalDni;
        const ctx = document.getElementById('clientesTipoDocChart').getContext('2d');
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
    }, 200); // Espera breve por si el store se inicializa
});