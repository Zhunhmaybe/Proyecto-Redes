-- =============================================
-- CREACIÓN DE LOS OBJETOS DE LA BASE DE DATOS (MySQL Compatible)
-- =============================================

DROP DATABASE IF EXISTS bank_db;
CREATE DATABASE bank_db;
USE bank_db;

CREATE TABLE Empleado (
       chr_emplcodigo       CHAR(4) NOT NULL,
       vch_emplpaterno      VARCHAR(25) NOT NULL,
       vch_emplmaterno      VARCHAR(25) NOT NULL,
       vch_emplnombre       VARCHAR(30) NOT NULL,
       vch_emplciudad       VARCHAR(30) NOT NULL,
       vch_empldireccion    VARCHAR(50) NOT NULL,
       vch_emplusuario      VARCHAR(15) NOT NULL,
       vch_emplclave        VARCHAR(15) NOT NULL,
       CONSTRAINT XPKEmpleado 
              PRIMARY KEY (chr_emplcodigo)
) ENGINE=InnoDB;

CREATE TABLE Sucursal (
       chr_sucucodigo       CHAR(3) NOT NULL,
       vch_sucunombre       VARCHAR(50) NOT NULL,
       vch_sucuciudad       VARCHAR(30) NOT NULL,
       vch_sucudireccion    VARCHAR(50) NOT NULL,
       int_sucucontcuenta   INT NOT NULL,
       CONSTRAINT XPKSucursal 
              PRIMARY KEY (chr_sucucodigo)
) ENGINE=InnoDB;

CREATE TABLE Asignado (
       chr_asigcodigo       CHAR(6) NOT NULL,
       chr_sucucodigo       CHAR(3) NOT NULL,
       chr_emplcodigo       CHAR(4) NOT NULL,
       dtt_asigfechaalta    DATE NOT NULL,
       dtt_asigfechabaja    DATE NULL,
       CONSTRAINT XPKAsignado 
              PRIMARY KEY (chr_asigcodigo), 
       CONSTRAINT fk_asignado_empleado
              FOREIGN KEY (chr_emplcodigo)
                             REFERENCES Empleado(chr_emplcodigo), 
       CONSTRAINT fk_asignado_sucursal
              FOREIGN KEY (chr_sucucodigo)
                             REFERENCES Sucursal(chr_sucucodigo)
) ENGINE=InnoDB;

CREATE TABLE TipoMovimiento (
       chr_tipocodigo       CHAR(3) NOT NULL,
       vch_tipodescripcion  VARCHAR(40) NOT NULL,
       vch_tipoaccion       VARCHAR(10) NOT NULL,
       vch_tipoestado       VARCHAR(15) DEFAULT 'ACTIVO' NOT NULL,
       CONSTRAINT XPKTipoMovimiento 
              PRIMARY KEY (chr_tipocodigo)
) ENGINE=InnoDB;

CREATE TABLE Cliente (
       chr_cliecodigo       CHAR(5) NOT NULL,
       vch_cliepaterno      VARCHAR(25) NOT NULL,
       vch_cliematerno      VARCHAR(25) NOT NULL,
       vch_clienombre       VARCHAR(30) NOT NULL,
       chr_cliedni          CHAR(8) NOT NULL,
       vch_clieciudad       VARCHAR(30) NOT NULL,
       vch_cliedireccion    VARCHAR(50) NOT NULL,
       vch_clietelefono     VARCHAR(20) NULL,
       vch_clieemail        VARCHAR(50) NULL,
       CONSTRAINT XPKCliente 
              PRIMARY KEY (chr_cliecodigo)
) ENGINE=InnoDB;

CREATE TABLE Moneda (
       chr_monecodigo       CHAR(2) NOT NULL,
       vch_monedescripcion  VARCHAR(20) NOT NULL,
       CONSTRAINT XPKMoneda 
              PRIMARY KEY (chr_monecodigo)
) ENGINE=InnoDB;

CREATE TABLE Cuenta (
       chr_cuencodigo       CHAR(8) NOT NULL,
       chr_monecodigo       CHAR(2) NOT NULL,
       chr_sucucodigo       CHAR(3) NOT NULL,
       chr_emplcreacuenta   CHAR(4) NOT NULL,
       chr_cliecodigo       CHAR(5) NOT NULL,
       dec_cuensaldo        DECIMAL(12,2) NOT NULL,
       dtt_cuenfechacreacion DATETIME NOT NULL,
       vch_cuenestado       VARCHAR(15) DEFAULT 'ACTIVO' NOT NULL,
       int_cuencontmov      INT NOT NULL,
       chr_cuenclave        CHAR(6) NOT NULL,
       CONSTRAINT XPKCuenta 
              PRIMARY KEY (chr_cuencodigo), 
       CONSTRAINT fk_cuente_cliente
              FOREIGN KEY (chr_cliecodigo)
                             REFERENCES Cliente(chr_cliecodigo), 
       CONSTRAINT fk_cuente_empleado
              FOREIGN KEY (chr_emplcreacuenta)
                             REFERENCES Empleado(chr_emplcodigo), 
       CONSTRAINT fk_cuenta_sucursal
              FOREIGN KEY (chr_sucucodigo)
                             REFERENCES Sucursal(chr_sucucodigo), 
       CONSTRAINT fk_cuenta_moneda
              FOREIGN KEY (chr_monecodigo)
                             REFERENCES Moneda(chr_monecodigo)
) ENGINE=InnoDB;

CREATE TABLE Movimiento (
       chr_cuencodigo       CHAR(8) NOT NULL,
       int_movinumero       INT NOT NULL,
       dtt_movifecha        DATETIME NOT NULL,
       chr_emplcodigo       CHAR(4) NOT NULL,
       chr_tipocodigo       CHAR(3) NOT NULL,
       dec_moviimporte      DECIMAL(12,2) NOT NULL,
       chr_cuenreferencia   CHAR(8) NULL,
       CONSTRAINT XPKMovimiento 
              PRIMARY KEY (chr_cuencodigo, int_movinumero), 
       CONSTRAINT fk_movimiento_tipomovimiento
              FOREIGN KEY (chr_tipocodigo)
                             REFERENCES TipoMovimiento(chr_tipocodigo), 
       CONSTRAINT fk_movimiento_empleado
              FOREIGN KEY (chr_emplcodigo)
                             REFERENCES Empleado(chr_emplcodigo), 
       CONSTRAINT fk_movimiento_cuenta
              FOREIGN KEY (chr_cuencodigo)
                             REFERENCES Cuenta(chr_cuencodigo)
) ENGINE=InnoDB;

CREATE TABLE Parametro (
       chr_paracodigo       CHAR(3) NOT NULL,
       vch_paradescripcion  VARCHAR(50) NOT NULL,
       vch_paravalor        VARCHAR(70) NOT NULL,
       vch_paraestado       VARCHAR(15) DEFAULT 'ACTIVO' NOT NULL,
       CONSTRAINT XPKParametro 
              PRIMARY KEY (chr_paracodigo)
) ENGINE=InnoDB;

CREATE TABLE InteresMensual (
       chr_monecodigo       CHAR(2) NOT NULL,
       dec_inteimporte      DECIMAL(12,2) NOT NULL,
       CONSTRAINT XPKInteresMensual 
              PRIMARY KEY (chr_monecodigo), 
       CONSTRAINT fk_interesmensual_moneda
              FOREIGN KEY (chr_monecodigo)
                             REFERENCES Moneda(chr_monecodigo)
) ENGINE=InnoDB;

CREATE TABLE CostoMovimiento (
       chr_monecodigo       CHAR(2) NOT NULL,
       dec_costimporte      DECIMAL(12,2) NOT NULL,
       CONSTRAINT XPKCostoMovimiento 
              PRIMARY KEY (chr_monecodigo), 
       CONSTRAINT fk_costomovimiento_moneda
              FOREIGN KEY (chr_monecodigo)
                             REFERENCES Moneda(chr_monecodigo)
) ENGINE=InnoDB;

CREATE TABLE CargoMantenimiento (
       chr_monecodigo       CHAR(2) NOT NULL,
       dec_cargMontoMaximo  DECIMAL(12,2) NOT NULL,
       dec_cargImporte      DECIMAL(12,2) NOT NULL,
       CONSTRAINT XPKCargoMantenimiento 
              PRIMARY KEY (chr_monecodigo), 
       CONSTRAINT fk_cargomantenimiento_moneda
              FOREIGN KEY (chr_monecodigo)
                             REFERENCES Moneda(chr_monecodigo)
) ENGINE=InnoDB;

CREATE TABLE Contador (
       vch_conttabla        VARCHAR(30) NOT NULL,
       int_contitem         INT NOT NULL,
       int_contlongitud     INT NOT NULL,
       CONSTRAINT XPKContador 
              PRIMARY KEY (vch_conttabla)
) ENGINE=InnoDB;

CREATE TABLE AuditLog (
    int_auditid         INT AUTO_INCREMENT PRIMARY KEY,
    chr_emplcodigo      CHAR(4),
    vch_auditaccion     VARCHAR(50) NOT NULL,
    vch_audittabla      VARCHAR(30),
    vch_auditregistro   VARCHAR(20),
    vch_auditvalores    TEXT,
    vch_auditip         VARCHAR(45),
    dtt_auditfecha      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vch_auditresultado  VARCHAR(20) DEFAULT 'EXITOSO'
) ENGINE=InnoDB;

-- =============================================
-- CARGAR DATOS DE PRUEBA
-- =============================================

-- Tabla: Moneda
INSERT INTO Moneda VALUES ( '01', 'Soles' );
INSERT INTO Moneda VALUES ( '02', 'Dolares' );

-- Tabla: CargoMantenimiento
INSERT INTO CargoMantenimiento VALUES ( '01', 3500.00, 7.00 );
INSERT INTO CargoMantenimiento VALUES ( '02', 1200.00, 2.50 );

-- Tabla: CostoMovimiento (Corregido nombre de tabla en insert)
INSERT INTO CostoMovimiento VALUES ( '01', 2.00 );
INSERT INTO CostoMovimiento VALUES ( '02', 0.60 );

-- Tabla: InteresMensual
INSERT INTO InteresMensual VALUES ( '01', 0.70 );
INSERT INTO InteresMensual VALUES ( '02', 0.60 );

-- Tabla: TipoMovimiento
INSERT INTO TipoMovimiento VALUES( '001', 'Apertura de Cuenta', 'INGRESO', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '002', 'Cancelar Cuenta', 'SALIDA', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '003', 'Deposito', 'INGRESO', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '004', 'Retiro', 'SALIDA', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '005', 'Interes', 'INGRESO', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '006', 'Mantenimiento', 'SALIDA', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '007', 'ITF', 'SALIDA', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '008', 'Transferencia', 'INGRESO', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '009', 'Transferencia', 'SALIDA', 'ACTIVO' );
INSERT INTO TipoMovimiento VALUES( '010', 'Cargo por Movimiento', 'SALIDA', 'ACTIVO' );

-- Tabla: Sucursal
INSERT INTO Sucursal VALUES( '001', 'Sipan', 'Chiclayo', 'Av. Balta 1456', 1 );
INSERT INTO Sucursal VALUES( '002', 'Chan Chan', 'Trujillo', 'Jr. Independencia 456', 1 );
INSERT INTO Sucursal VALUES( '003', 'Los Olivos', 'Lima', 'Av. Central 1234', 1 );
INSERT INTO Sucursal VALUES( '004', 'Pardo', 'Lima', 'Av. Pardo 345 - Miraflores', 1 );
INSERT INTO Sucursal VALUES( '005', 'Misti', 'Arequipa', 'Bolivar 546', 1 );
INSERT INTO Sucursal VALUES( '006', 'Machupicchu', 'Cusco', 'Calle El Sol 534', 1 );

-- Tabla: Empleado
INSERT INTO Empleado VALUES( '9999', 'Internet', 'Internet', 'internet', 'Internet', 'internet', 'internet', 'internet' );
INSERT INTO Empleado VALUES( '0001', 'Romero', 'Castillo', 'Carlos Alberto', 'Trujillo', 'Call1 1 Nro. 456', 'cromero', 'chicho' );
INSERT INTO Empleado VALUES( '0002', 'Castro', 'Vargas', 'Lidia', 'Lima', 'Federico Villarreal 456 - SMP', 'lcastro', 'suerte' );
INSERT INTO Empleado VALUES( '0003', 'Reyes', 'Ortiz', 'Claudia', 'Lima', 'Av. Aviación 3456 - San Borja', 'creyes', 'linda' );
INSERT INTO Empleado VALUES( '0004', 'Ramos', 'Garibay', 'Angelica', 'Chiclayo', 'Calle Barcelona 345', 'aramos', 'china' );
INSERT INTO Empleado VALUES( '0005', 'Ruiz', 'Zabaleta', 'Claudia', 'Cusco', 'Calle Cruz Verde 364', 'cvalencia', 'angel' );
INSERT INTO Empleado VALUES( '0006', 'Cruz', 'Tarazona', 'Ricardo', 'Areguipa', 'Calle La Gruta 304', 'rcruz', 'cerebro' );
INSERT INTO Empleado VALUES( '0007', 'Torres', 'Diaz', 'Guino', 'Lima', 'Av. Salaverry 1416', 'gtorres', 'talento' );

-- Asignado
INSERT INTO Asignado VALUES( '000001', '001', '0001', '2007-01-01', '2007-12-31' );
INSERT INTO Asignado VALUES( '000002', '002', '0005', '2007-01-01', '2007-12-31' );
INSERT INTO Asignado VALUES( '000003', '001', '0004', '2008-01-01', NULL );
INSERT INTO Asignado VALUES( '000004', '002', '0001', '2008-01-01', NULL );
INSERT INTO Asignado VALUES( '000005', '003', '0002', '2008-01-01', NULL );
INSERT INTO Asignado VALUES( '000006', '004', '0003', '2007-01-01', '2007-12-31' );
INSERT INTO Asignado VALUES( '000007', '005', '0006', '2008-01-01', NULL );
INSERT INTO Asignado VALUES( '000008', '006', '0005', '2008-01-01', NULL );
INSERT INTO Asignado VALUES( '000009', '004', '0007', '2008-01-01', NULL );

-- Tabla: Parametro
INSERT INTO Parametro VALUES( '001', 'ITF - Impuesto a la Transacciones Financieras', '0.08', 'ACTIVO' );
INSERT INTO Parametro VALUES( '002', 'Número de Operaciones Sin Costo', '15', 'ACTIVO' );

-- Tabla: Cliente
INSERT INTO Cliente VALUES( '00001', 'CORONEL', 'CASTILLO', 'ERIC GUSTAVO', '06914897', 'LIMA', 'LOS OLIVOS', '9666-4457', 'gcoronel@viabcp.com' );
INSERT INTO Cliente VALUES( '00002', 'VALENCIA', 'MORALES', 'PEDRO HUGO', '01576173', 'LIMA', 'MAGDALENA', '924-7834', 'pvalencia@terra.com.pe' );
INSERT INTO Cliente VALUES( '00003', 'MARCELO', 'VILLALOBOS', 'RICARDO', '10762367', 'LIMA', 'LINCE', '993-62966', 'ricardomarcelo@hotmail.com' );
INSERT INTO Cliente VALUES( '00004', 'ROMERO', 'CASTILLO', 'CARLOS ALBERTO', '06531983', 'LIMA', 'LOS OLIVOS', '865-84762', 'c.romero@hotmail.com' );
INSERT INTO Cliente VALUES( '00005', 'ARANDA', 'LUNA', 'ALAN ALBERTO', '10875611', 'LIMA', 'SAN ISIDRO', '834-67125', 'a.aranda@hotmail.com' );
INSERT INTO Cliente VALUES( '00006', 'AYALA', 'PAZ', 'JORGE LUIS', '10679245', 'LIMA', 'SAN BORJA', '963-34769', 'j.ayala@yahoo.com' );
INSERT INTO Cliente VALUES( '00007', 'CHAVEZ', 'CANALES', 'EDGAR RAFAEL', '10145693', 'LIMA', 'MIRAFLORES', '999-96673', 'e.chavez@gmail.com' );
-- (Truncated list for brevity, adding key ones used in accounts)
INSERT INTO Cliente VALUES( '00008', 'FLORES', 'CHAFLOQUE', 'ROSA LIZET', '10773456', 'LIMA', 'LA MOLINA', '966-87567', 'r.florez@hotmail.com' );
INSERT INTO Cliente VALUES( '00010', 'GONZALES', 'GARCIA', 'GABRIEL ALEJANDRO', '10192376', 'LIMA', 'SAN MIGUEL', '945-56782', 'g.gonzales@yahoo.es' );


-- Tabla: Cuenta
INSERT INTO Cuenta VALUES('00100001','01','001','0004','00005',6900,'2008-01-06 16:27:48','ACTIVO',8,'123456');
INSERT INTO Cuenta VALUES('00100002','02','001','0004','00005',4500,'2008-01-08 14:21:12','ACTIVO',5,'123456');
INSERT INTO Cuenta VALUES('00200001','01','002','0001','00008',7000,'2008-01-05 13:15:30','ACTIVO',16,'123456');
INSERT INTO Cuenta VALUES('00200002','01','002','0001','00001',6800,'2008-01-09 10:30:25','ACTIVO',4,'123456');
INSERT INTO Cuenta VALUES('00200003','02','002','0001','00007',6000,'2008-01-11 15:45:12','ACTIVO',7,'123456');
INSERT INTO Cuenta VALUES('00300001','01','003','0002','00010',0000,'2008-01-07 12:45:12','CANCELADO',3,'123456');

-- Tabla: Movimiento
INSERT INTO Movimiento VALUES('00100001',01,'2008-01-06 16:27:48','0004','001',2800,null);
INSERT INTO Movimiento VALUES('00100001',02,'2008-01-15 13:47:31','0004','003',3200,null);
INSERT INTO Movimiento VALUES('00100001',03,'2008-01-20 17:11:15','0004','004',0800,null);

-- Tabla: Contador
INSERT INTO Contador Values( 'Moneda', 2, 2 );
INSERT INTO Contador Values( 'TipoMovimiento', 10, 3 );
INSERT INTO Contador Values( 'Sucursal', 6, 3 );
INSERT INTO Contador Values( 'Empleado', 6, 4 );
INSERT INTO Contador Values( 'Asignado', 6, 6 );
INSERT INTO Contador Values( 'Parametro', 2, 3 );
INSERT INTO Contador Values( 'Cliente', 21, 5 );

