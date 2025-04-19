# 📋 Historias de Usuario – Sistema de Gestión de Ingresos y Egresos (Bob Subastas)

---

## 🧑‍💼 Historia de Usuario 1: Registro de Cliente

**Como** usuario interno del área de ventas o post-venta  
**Quiero** registrar un nuevo cliente en el sistema con sus datos identificativos  
**Para** poder asociar sus ingresos y egresos correctamente

### ✅ Criterios de Aceptación
- Dado que estoy en el módulo de clientes  
  Cuando ingreso el nombre, correo, DNI/RUC, tipo de documento, número y observaciones  
  Entonces el sistema debe guardar correctamente el cliente y mostrarlo en una tabla

### 🛠️ Notas Técnicas
- Componente: Formulario de Registro de Cliente
- Modelo de Datos:
  ```json
  {
    "id": "string",
    "nombre_razon": "string",
    "correo": "string",
    "tipo_doc": "DNI | RUC",
    "num_doc": "string",
    "observaciones": "string"
  }
  ```
- Validaciones: Campos requeridos, formato de correo electrónico

