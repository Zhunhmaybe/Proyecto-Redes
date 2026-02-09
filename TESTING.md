# Guía de Pruebas del Proyecto Banco Pacífico

Esta guía detalla cómo ejecutar y probar la funcionalidad del sistema bancario en Node.js con Oracle Database.

## 1. Requisitos Previos

- **Node.js**: Asegúrate de tenerlo instalado (v14+).
- **Oracle Database**: Debe estar ejecutándose (versión XE o Enterprise).
- **Conexión a Base de Datos**:
  - Host: `127.0.0.1`
  - Puerto: `1521`
  - SID/Service Name: `xe`
  - Usuario: `admin`
  - Contraseña: `admin`
  - _(Verifica estos valores en tu archivo `.env`)_

## 2. Configuración Inicial (Si aún no lo has hecho)

1.  **Instalar dependencias**:

    ```bash
    npm install
    ```

2.  **Base de Datos**:
    Ejecuta el script SQL para crear las tablas y datos de prueba. Puedes usar SQL Plus o SQL Developer.
    - Archivo: `database/schema.sql`

## 3. Ejecutar la Aplicación

Para desarrollo (reinicia automáticamente al guardar cambios):

```bash
npm run dev
```

Para producción o ejecución simple:

```bash
npm start
```

El servidor iniciará en: `http://localhost:3000`

## 4. Comandos de Prueba (Endpoints)

Puedes probar estos endpoints usando **cURL**, **Postman** o tu navegador (para los GET).

### A. Verificar Estado del Servidor

Verifica que la API está en línea y a qué sucursal pertenece.

```bash
curl http://localhost:3000/
```

### B. Gestión de Clientes

**Listar todos los clientes:**

```bash
curl http://localhost:3000/api/clients
```

**Obtener un cliente por ID:**

```bash
curl http://localhost:3000/api/clients/00001
```

**Crear un nuevo cliente (POST):**
_Nota: Ajusta los datos JSON según sea necesario._

```bash
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"codigo":"00099", "paterno":"Perez", "materno":"Lopez", "nombre":"Juan", "dni":"12345678", "ciudad":"Lima", "direccion":"Av. Test 123", "telefono":"555-0000", "email":"juan@test.com"}'
```

### C. Gestión de Cuentas

**Listar todas las cuentas:**

```bash
curl http://localhost:3000/api/accounts
```

### D. Transacciones

**Realizar un Depósito:**

```bash
curl -X POST http://localhost:3000/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -d '{"accountId":"00100001", "amount": 100.00, "employeeId":"0001"}'
```

**Realizar un Retiro:**

```bash
curl -X POST http://localhost:3000/api/transactions/withdraw \
  -H "Content-Type: application/json" \
  -d '{"accountId":"00100001", "amount": 50.00, "employeeId":"0001"}'
```

**Realizar una Transferencia:**

```bash
curl -X POST http://localhost:3000/api/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromAccountId":"00100001", "toAccountId":"00200001", "amount": 25.00, "employeeId":"0001"}'
```

### E. Empleados y Autenticación

**Listar empleados:**

```bash
curl http://localhost:3000/api/employees
```

**Login de Empleado:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"cromero", "clave":"chicho"}'
```

---

## Solución de Problemas Comunes

- **Error de Conexión Oracle (ORA-...)**: Verifica que tu servicio Oracle `xe` esté corriendo y que las credenciales en `.env` sean correctas.
- **Error `module not found`**: Ejecuta `npm install` nuevamente.
- **Puerto Ocupado**: Si el puerto 3000 está en uso, cambia el valor `PORT` en el archivo `.env`.
