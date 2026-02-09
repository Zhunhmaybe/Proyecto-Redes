# Banco Pacifico - Node.js Core Banking System

## Requisitos

- Node.js (v14+)
- **Oracle Database** (XE o Enterprise)
- **Oracle Instant Client** (Si es necesario en su OS)
- NPM

## Instalación

1.  Clonar o copiar el proyecto en `c:\xampp\htdocs\BancoPacifico`.
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Crear la base de datos y cargar el esquema:
    - Importar `database/schema.sql` en su gestor de MySQL (phpMyAdmin o Workbench).
    - O ejecutar: `mysql -u root -p < database/schema.sql`

## Configuración Multi-Sucursal

Para simular varias sucursales, cree copias del archivo `.env` o cambie las variables al iniciar.

**Ejemplo Sucursal 1 (.env):**

```ini
PORT=3000
DB_NAME=bank_db_1
BRANCH_ID=001
PEER_BRANCH_URL=http://localhost:3001
```

**Ejemplo Sucursal 2 (Crear otra carpeta o cambiar puerto):**

```ini
PORT=3001
DB_NAME=bank_db_2
BRANCH_ID=002
PEER_BRANCH_URL=http://localhost:3000
```

_Nota: Para que funcione la redundancia real, debe tener dos bases de datos distintas (`bank_db_1`, `bank_db_2`)._

## Ejecución

```bash
# Iniciar servidor
npm start

# Modo desarrollo
npm run dev
```

## Endpoints Principales

- **GET** `/`: Estado del servidor.
- **GET** `/api/clients`: Listar clientes.
- **POST** `/api/transactions/deposit`: Realizar depósito.
- **POST** `/api/transactions/transfer`: Realizar transferencia.
- **POST** `/api/auth/login`: Login de empleado.

## Disaster Recovery (DR)

El sistema realiza backups automáticos cada 5 minutos y los envía a la `PEER_BRANCH_URL`.
Para restaurar:

1.  **POST** `/api/restore`
    ```json
    { "filename": "backup-001-XXXX.sql" }
    ```
