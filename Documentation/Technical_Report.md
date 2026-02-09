# Banco Pacifico - Proyecto Integrador: Red Bancaria Multi-Sucursal

## 1. Contexto del Caso

Este proyecto implementa la infraestructura lógica y de software para un banco con 5 sucursales. Se ha migrado la lógica de negocio a **Node.js** con base de datos **MySQL**, permitiendo una arquitectura distribuida y ligera.

![Network Architecture Diagram](/C:/Users/Zunhz/.gemini/antigravity/brain/dc0afe85-0c7f-48dd-bda2-5841e26406bc/network_diagram.png)

## 2. Arquitectura de Red (Simulación)

### A. Red Interna (LAN)

Cada sucursal opera como una entidad independiente. En un despliegue real, se recomienda la siguiente segmentación:

- **VLAN 10 (Usuarios/Cajas)**: 192.168.X.0/24 (Donde X es el ID de sucursal)
- **VLAN 20 (Servidores/BD)**: 192.168.X.128/25
- **Gateway**: Router/Firewall perimetral encargándose del Inter-VLAN routing.

### B. Interconexión (WAN)

La comunicación entre sucursales se realiza a través de una **VPN Site-to-Site** (IPsec/OpenVPN).

- En esta implementación de software, la "WAN" se simula mediante peticiones HTTP seguras entre las instancias de Node.js corriendo en diferentes puertos (ej. Sucursal 1 en puerto 3000, Sucursal 2 en puerto 3001).

### C. Redundancia y Alta Disponibilidad

El sistema implementa **Recuperación ante Desastres (DR)** mediante replicación asíncrona de backups:

1.  **Backup Automático**: Un cron job genera un dump de la BD cada 5 minutos (configurable).
2.  **Transferencia "Cross-Branch"**: El backup generado en la Sucursal X es enviado automáticamente a la Sucursal Y (definida en `.env` como `PEER_BRANCH_URL`).
3.  **Restauración**: En caso de fallo total de la Sucursal X, los datos pueden recuperarse desde la Sucursal Y y restaurarse en una nueva instancia.

## 3. Base de Datos

Se utiliza un esquema Relacional (MySQL) migrado desde Oracle.

- **Tablas Principales**: Cliente, Cuenta, Movimiento, Empleado, Sucursal.
- **Seguridad**:
  - Usuarios de BD con privilegios mínimos (en producción).
  - Claves de empleados almacenadas (se recomienda hashing en update futuro).
  - **AuditLog**: Tabla dedicada para registrar eventos críticos.

## 4. Plan de Backup y Recuperación

### Estrategia

- **Frecuencia**: Cada 5 minutos (demo) / Diario (prod).
- **Retención**: Últimos 7 días.
- **Ubicación**:
  - Local: `./backups`
  - Remota: `./peer_backups` (en la sucursal par).

### Procedimiento de Recuperación (Paso a Paso)

1.  Identificar la caída de la Sucursal Principal.
2.  Acceder a la Sucursal de Respaldo (Peer).
3.  Localizar el archivo `.sql` más reciente en la carpeta `peer_backups`.
4.  Levantar una nueva instancia de Node.js o usar la herramienta de restauración (`/api/restore`).
5.  Ejecutar el script de restauración apuntando al archivo recuperado.
