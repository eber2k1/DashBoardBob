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

// === SECCIÓN: TIPO DE CAMBIO DE MONEDA ===
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
    const ingresos = ingresosStore.getState()
    const egresos = egresosStore.getState()
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

function setCardValue(element, value) {
    if (element) element.textContent = value;
}

function setCardLabel(element, value) {
    if (element) element.textContent = value;
}

function setClientesCard(value) {
    if (clientesCardEl) clientesCardEl.textContent = value;
}

// === SECCIÓN: DATOS GENERALES ===
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

// === SECCIÓN: MOSTRAR ÚLTIMOS 5 REGISTROS ===
function renderUltimosRegistros() {
    const movimientos = getUltimosMovimientos(5);
    if (!tbodyMovimientosEl) return;
    tbodyMovimientosEl.innerHTML = '';
    movimientos.forEach(mov => {
        const cliente = getClientePorId(mov.cliente);
        tbodyMovimientosEl.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${mov.fecha} ${mov.hora || ''}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${mov.tipo}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${cliente ? (cliente.nombre || cliente.razon || '') : ''}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${mov.medio || ''}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${mov.moneda || ''}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">${mov.importe.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
            </tr>
        `;
    });
}

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

function setUpMonedaSelector() {
    if (selectMonedaEl) {
        selectMonedaEl.value = window.monedaDashboard || 'PEN';
        selectMonedaEl.onchange = function() {
            window.setMonedaDashboard(this.value);
        };
    }
}

// === SECCIÓN: GRÁFICA CIRCULAR ===
let clientesTipoDocChart = null;
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
        // Destruir la gráfica anterior si existe
        if (clientesTipoDocChart) {
            clientesTipoDocChart.destroy();
        }
        clientesTipoDocChart = new Chart(ctx, {
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
    }, 0);
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

// === SECCIÓN: IMPORTACIÓN DE EXCEL ===
function importarTransaccionesUnificadas(event) {
    const archivo = event.target.files[0];
    const lector = new FileReader();

    lector.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const hoja = workbook.Sheets['Transacciones'];
        const registros = XLSX.utils.sheet_to_json(hoja || []);

        const nuevosClientes = [];
        const nuevosIngresos = [];
        const nuevosEgresos = [];

        registros.forEach(reg => {
            if (!reg.correo || !reg.tipo || !reg.importe) return; // Validación básica

            let cliente = nuevosClientes.find(c => c.correo === reg.correo);
            let clienteId;

            if (cliente) {
                // Actualizar cliente si ya existe
                Object.assign(cliente, {
                    nombre: reg.nombre_razon,
                    tipo_doc: reg.dni_ruc,
                    numdoc: reg.numdoc,
                    observaciones: reg.observaciones
                });
                clienteId = cliente.id;
            } else {
                // Crear nuevo cliente
                clienteId = nuevosClientes.length + 1;
                cliente = {
                    id: clienteId,
                    correo: reg.correo,
                    nombre: reg.nombre_razon,
                    tipo_doc: reg.dni_ruc,
                    numdoc: reg.numdoc,
                    observaciones: reg.observaciones
                };
                nuevosClientes.push(cliente);
            }

            const transaccion = {
                id: (reg.tipo === 'ingreso' ? nuevosIngresos : nuevosEgresos).length + 1,
                fecha: reg.fecha,
                hora: reg.hora,
                cliente: clienteId,
                medio: reg.medio,
                banco: reg.banco,
                moneda: reg.moneda,
                importe: Number(reg.importe),
                concepto: reg.concepto
            };

            if (reg.tipo.toLowerCase() === 'ingreso') {
                nuevosIngresos.push(transaccion);
            } else if (reg.tipo.toLowerCase() === 'egreso') {
                nuevosEgresos.push(transaccion);
            }
        });

        clientesStore.setState(nuevosClientes);
        ingresosStore.setState(nuevosIngresos);
        egresosStore.setState(nuevosEgresos);

        // Renderiza la gráfica y otros componentes después de actualizar los stores
        setTimeout(() => {
            renderGraficaClientesTipoDoc();
            renderDashboardResumen && renderDashboardResumen();
            renderUltimosRegistros && renderUltimosRegistros();
        }, 0);

        alert('Transacciones importadas correctamente.');
    };

    lector.readAsArrayBuffer(archivo);
}

// === SECCIÓN: EXPORTACIÓN DE EXCEL ===
function exportarTransaccionesUnificadas() {
    const ingresos = ingresosStore.getState().map(i => {
        const cliente = clientesStore.getById(i.cliente) || {};
        return {
            tipo: 'ingreso',
            fecha: i.fecha,
            hora: i.hora,
            correo: cliente.correo || '',
            nombre_razon: cliente.nombre || cliente.razon || '',
            dni_ruc: cliente.dni || cliente.ruc || '',
            numdoc: cliente.numdoc || '',
            observaciones: cliente.observaciones || '',
            medio: i.medio,
            banco: i.banco,
            moneda: i.moneda,
            importe: i.importe,
            concepto: i.concepto
        };
    });

    const egresos = egresosStore.getState().map(e => {
        const cliente = clientesStore.getById(e.cliente) || {};
        return {
            tipo: 'egreso',
            fecha: e.fecha,
            hora: e.hora,
            correo: cliente.correo || '',
            nombre_razon: cliente.nombre || cliente.razon || '',
            dni_ruc: cliente.dni || cliente.ruc || '',
            numdoc: cliente.numdoc || '',
            observaciones: cliente.observaciones || '',
            medio: e.medio,
            banco: e.banco,
            moneda: e.moneda,
            importe: e.importe,
            concepto: e.concepto
        };
    });

    const registros = [...ingresos, ...egresos];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(registros);
    XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
    XLSX.writeFile(wb, 'bob_transacciones.xlsx');
}