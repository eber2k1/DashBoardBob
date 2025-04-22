// js/store.js

function createStore(key, initialState = []) {
    let state = initialState;
    const listeners = [];

    function getState() {
        return state;
    }

    function setState(newState) {
        state = newState;
        localStorage.setItem(key, JSON.stringify(state));
        listeners.forEach(listener => listener(state));
    }

    function add(item) {
        const newId = state.length > 0 ? Math.max(...state.map(x => x.id || 0)) + 1 : 1;
        const newItem = { ...item, id: newId };
        setState([...state, newItem]);
        return newItem;
    }

    function update(id, newData) {
        const newState = state.map(item => item.id === id ? { ...item, ...newData } : item);
        setState(newState);
    }

    function remove(id) {
        setState(state.filter(item => item.id !== id));
    }

    function getById(id) {
        return state.find(item => item.id === id) || null;
    }

    function subscribe(listener) {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    }

    function load() {
        const saved = localStorage.getItem(key);
        if (saved) state = JSON.parse(saved);
    }

    // Inicialización automática
    load();

    return {
        getState,
        setState,
        add,
        update,
        remove,
        getById,
        subscribe,
    };
}

// --- Instancias para cada entidad ---
const clientesStore = createStore('bob_clientes', []);
const ingresosStore = createStore('bob_ingresos', []);
const egresosStore = createStore('bob_egresos', []);

// --- Función para balance por cliente ---
function calcularBalancePorCliente(clienteId) {
    const ingresos = ingresosStore.getState().filter(i => i.cliente === clienteId);
    const egresos = egresosStore.getState().filter(e => e.cliente === clienteId);
    const totalIngresos = ingresos.reduce((sum, i) => sum + Number(i.importe || 0), 0);
    const totalEgresos = egresos.reduce((sum, e) => sum + Number(e.importe || 0), 0);
    return totalIngresos - totalEgresos;
}

// --- Función para balance general ---
function calcularBalanceGeneral() {
    const ingresos = ingresosStore.getState();
    const egresos = egresosStore.getState();
    const totalIngresos = ingresos.reduce((sum, i) => sum + Number(i.importe || 0), 0);
    const totalEgresos = egresos.reduce((sum, e) => sum + Number(e.importe || 0), 0);
    return totalIngresos - totalEgresos;
}