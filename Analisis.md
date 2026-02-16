PLAN MAESTRO: SISTEMA "GESTIÓN 360" (v2.3)

1. VISIÓN Y ARQUITECTURA
Plataforma: Aplicación Web Modular.
Ecosistema: Google (Antigravity + Firebase Firestore).
Roles: 
* Admin: Configuración total, gestión de usuarios y acceso a datos financieros.
* Operador: Gestión operativa (stock, clientes y carga de ventas). Bloqueado: datos financieros ($), costos, ganancias y configuración del sistema.
* cliente: Navegación, carrito y compra web
* SuperAdmin. Es el programador del sistema. Para tareas de configuracion y acceso total.
Aclaracion: SuperAdmin > Admin > Operador.

2. EXPERIENCIA DEL CLIENTE (FRONT-END) 
PAGINA PRINCIPAL (CATALOGO). Esta pagina es publica y no requiere login. El sistema siempre debe iniciar en esta pantalla. El menu lateral no debe estar visible nunca.
Siempre debe mostrar:
Aclaracion: Si el navegador detecta una sesion activa de Admin/Operador/SuperAdmin, el sistema redirigira automaticamente al Dashboard. Caso contrario, mostrara el catalogo publico.
Parte superior: 
    Logo, Nombre del negocio, Acceso a Registro y Login, Acceso a Carrito, Acceso a Mi Cuenta, Acceso a Cerrar Sesión.
Parte media:
    Buscador: Predictivo e inteligente por Nombre de  Producto y con filtros por Categoría.
    Ordenamiento: Por Precio (Ascendente y Descendente), Nombre (Ascendente y Descendente), Stock (Ascendente y Descendente).
    Catálogo: Cards de productos "Activos" con Foto, Nombre, Precio/Oferta y Stock.
    Paginación: Sistema clásico (1, 2, 3, Sig, Último).
Parte inferior: 
    Slogan,Datos de contacto, telefono, redes sociales etc

Feedback: Notificaciones emergentes (Toasts) temporales para informar acciones (ej: "Producto agregado al carrito").

3. MENU LATERAL
Menu Lateral solo visible para usuarios Admin - Operadores y SuperAdmin.
Se puede ocultar para dar mas espacio a la grilla de datos.
Debe contener:
    Dashboard (muestra estadisticas del negocio. ej. Total de ventas del mes, total de compras del mes, Total productos con stock cero, Total de producto con stock por debajo del minimo, etc.).
    Productos (muestra todos los productos, Operaciones CRUD).
    Categorias (muestra todas las categorias, Operaciones CRUD).
    Clientes (muestra todos los clientes, Operaciones CRUD).
    Proveedores (muestra todos los proveedores, Operaciones CRUD).
    Compras (muestra todas las compras, Operaciones CRUD).
    Ventas (muestra todas las ventas, Operaciones CRUD).
    Usuarios (muestra todos los usuarios, Operaciones CRUD).
    log/auditoria (muestra todos los logs).
    Configuracion (muestra todas las configuraciones del sistema).
    Empresa (muestra todas las configuraciones de la empresa).
    ---------------------------------
    Features (Menu de Nivel superior).
    Aclaracion: La visibilidad de estos items depende de la suscripcion (Feature Flags).
        Devoluciones (muestra todas las devoluciones, Operaciones CRUD).
        Ofertas (muestra todas las ofertas, Operaciones CRUD).
        Gastos (muestra todos los gastos, Operaciones CRUD).
        Cajas (muestra todas las cajas, Operaciones CRUD).
        Reportes (muestra todos los reportes, Operaciones CRUD).
    
4. Panatalla Inicial para Admin /  Operadores
Siempre debe ser la pantalla de Dashboard, pero adaptada al rol para proteger la información sensible:
*   **Vista Admin (Control Total):**
    *   Métricas Financieras: Total Ventas Mensual ($), Total Compras Mensual ($), Ganancia Estimada, Saldo de Cajas.
    *   Métricas Operativas: Stock Crítico, Cantidad de Clientes, Usuarios Activos.
    *   Gráficos: Curva de ventas diaria y ranking de productos más vendidos.
*   **Vista Operador (Gestión Operativa):**
    *   Alertas de Stock: Lista de productos que llegaron al stock mínimo (reposición urgente).
    *   Actividad del Día: "Tus ventas de hoy: X pedidos", "Últimos clientes registrados".
    *   Accesos Rápidos: Botones destacados para "Nueva Venta", "Consultar Stock", "Cargar Cliente".
    *   *Nota: No se muestran valores monetarios ($), costos ni balances generales.*

5. "LA LEY" DE LAS PANTALLAS DE GESTIÓN (BACK-OFFICE)
Todas las pantallas de gestión deben respetar el mismo formato.
Estructura: Cabecera con Título y botón "Agregar" (va a pantalla de creación). Boton "Volver" que siempre vuelve al dashboard.
Grilla Central: Tabla con los datos, permitiendo filtrar y ordenar columnas.
Acciones: Botones al final de cada fila para Editar (va a otra pantalla) y Eliminar/Desactivar.
Paginación: Siempre presente en la base de la grilla.
Regla de Visualización en Grillas (Admin): Todas las tablas de gestión (Productos, Contactos, etc.) deben mostrar el universo total de registros, independientemente de su estado. Se implementará un Filtro de Estado (Combo: Todos, Activos, Inactivos). Los registros inactivos deben tener una distinción visual (ej: texto en gris o badge de estado) y permitirán ser reactivados con un solo clic.
Reporte PDF: Botón para generar un PDF con la info que muestra la grilla según los filtros aplicados. El reporte debe contener logo y datos de la Empresa. Titulo del reporte, fecha y hora de creacion, filtros aplicados y los datos de la grilla. El nombre del archivo debe ser : "Reporte_" + Modelo + "_" + fecha y hora de creacion.pdf, donde Modelo es el nombre de la pantalla.
Aclaracion: La visibilidad y accion de este boton estara sujeta al perfil del usuario. El sistema validara si el usuario tiene permisos de exportacion antes de mostrarlo.

6. "La Ley" de las Pantallas de Creación/Edición
Todas las pantallas de creación/edición deben respetar el mismo formato.
Estructura: Cabecera con Título y botón "Volver" que siempre vuelve a la pantalla de gestion que la llamo.
Formulario: Campos ordenados lógicamente con validaciones claras.
Regla de Validacion: Se implementara una validacion dual: 
*   **En tiempo real (on-change/on-blur):** Feedback visual inmediato mientras el usuario completa los campos.
*   **Al Guardar (submit):** Re-validacion total de todos los campos antes de impactar en la base de datos.
Acciones: Botón "Guardar" y botón "Cancelar" que vuelve a la pantalla de gestion que la llamo.
Notificaciones emergentes (Toasts) temporales para informar acciones.

7. CONFIGURACIÓN DEL NEGOCIO. Empresa
Perfil de Empresa: Pantalla para que el Admin configure:
Logo y Nombre del negocio.
Dirección, Teléfono y WhatsApp.
Redes Sociales (FB, IG, etc.).
Datos de Cobro (Alias MP, CBU) para que aparezcan en los PDFs de venta.
Nombre de la Instancia: El usuario escribe el nombre de su app (ej: "Ferretería Pérez"). Este nombre será el Título Principal en el Dashboard y encabezados, y aparecerá en la pestaña del navegador.
Selector de Color Primario: Un "Color Picker" (selector de colores). El color elegido se aplicará de forma GLOBAL y obligatoria para todos los perfiles (Admin, Operador, Cliente), afectando botones, bordes, encabezados y elementos destacados para mantener la identidad visual de la marca.
Logo y Favicon: Espacio para subir el logo (para los PDFs y el encabezado) y el icono chiquito que se ve en la pestaña del navegador.


8. Modulos Basicos - Tablas Principales (reglas de negocio)
8.1 Productos
Regla de negocio: Codigo de producto debe ser unico (SKU). Nombre de producto debe ser unico. Precio, stock actual y stock minimo deben ser numeros positivos. Cada producto pertenece a una ÚNICA categoría (idCategoria obligatorio). Activo debe ser booleano por defecto true. Fecha de creacion y modificacion debe ser automatica. Fecha de vencimiento no debe ser obligatoria. Fecha de Eliminacion debe ser la fecha cuando se desactiva el producto. Si el producto se vuelve a activar, la fecha de eliminacion debe ser nula.
Campos: Id(int, not null, primary key, auto increment), Nombre(string, not null, max 100), Descripcion(string, null, max 255), Precio(decimal, not null, >0), StockActual(decimal, not null, >=0), StockMinimo(decimal, not null, >=0), IdCategoria(int, not null, foreign key references Categorias(Id)), Activo(boolean, not null, default true), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null), FechaVencimiento(datetime, null), FechaEliminacion(datetime, null)

8.2 Categorias
Regla de negocio: Codigo de categoria debe ser unico. Nombre de categoria debe ser unico. Activo debe ser booleano por defecto true. Fecha de creacion y modificacion debe ser automatica. Fecha de Eliminacion debe ser la fecha cuando se desactiva la categoria. Si la categoria se vuelve a activar, la fecha de eliminacion debe ser nula.
Campos: Id(int, not null, primary key, auto increment), Nombre(string, not null, max 100), Descripcion(string, null, max 255), Activo(boolean, not null, default true), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null), FechaEliminacion(datetime, null)

8.3 Clientes
Este modelo se usara para clientes y proveedores. Tendra un campo "Tipo" que sera "Cliente" o "Proveedor".
Regla de negocio: No se requiere campo Código manual. La identificación principal será el ID (interno) y Nombre/Apellido o Razón Social. El nombre de cliente/proveedor debe ser único. Activo debe ser booleano por defecto true. Fecha de creacion y modificacion debe ser automatica. Fecha de Eliminacion debe ser la fecha cuando se desactiva el cliente. Si el cliente se vuelve a activar, la fecha de eliminacion debe ser nula. Debe tener campos que permitan completar datos de contacto (nombre, apellido, telefono, email, direccion, etc.) datos de facturacion (cuit, domicilio, etc.)
Campos: Id(int, not null, primary key, auto increment), Nombre(string, not null, max 100), Apellido(string, null, max 100), RazonSocial(string, null, max 100), Tipo (Cliente o Proveedor, not null), Direccion(string, null, max 255), Telefono(string, null, max 20), codigoPostal(string, null, max 10), Email(string, null, max 100), DNI(string, null, max 20), CUIT(string, null, max 20), Activo(boolean, not null, default true), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null), FechaEliminacion(datetime, null), EsResponsableIVA(boolean, not null, default false), Observaciones(string, null, max 255)

8.4 Ventas (Pedidos de clientes)
Regla de negocio: Codigo de venta debe ser unico con un formato similar a (OV-2026-0001). Estado debe ser "Pendiente", "Confirmada", "En proceso", "Completada" y "Cancelada". 
Automatizacion: El sistema calculará automáticamente el IVA, Subtotal y Total basado en los ítems cargados. Al completar una venta, el sistema descontará automáticamente el Stock de los productos involucrados.
Automatizacion: El sistema calculará automáticamente el IVA, Subtotal y Total basado en los ítems cargados. Al completar una venta, el sistema descontará automáticamente el Stock de los productos involucrados.
Campos: Id(int, not null, primary key, auto increment), Codigo(string, not null, max 100), Estado(string, not null, max 20), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null), FechaEliminacion(datetime, null), IdCliente(int, not null, foreign key references Clientes(Id)), IdUsuario(int, not null, foreign key references Usuarios(Id)), Total(decimal, not null, >=0), GananciTotal(decimal, not null, >=0), IVA(decimal, not null, >=0), TotalConIVA(decimal, not null, >=0), FechaVencimiento(datetime, null), FechaPago(datetime, null), FormaPago(string, null, max 20), Observaciones(string, null, max 255).
Items de una Venta: Id(int, not null, primary key, auto increment), IdVenta(int, not null, foreign key references Ventas(Id)), IdProducto(int, not null, foreign key references Productos(Id)), Cantidad(decimal, not null, >0), PrecioUnitario(decimal, not null, >=0), Subtotal(decimal, not null, >=0), Ganancia(decimal, not null, >=0), Descuento(decimal, not null, >=0), IdOfertaAplicada(int, null, foreign key references Ofertas(Id)), preciooriginal(decimal, not null, >=0).

8.5 Compras (Pedidos a proveedores)
Regla de negocio: Codigo de compra debe ser unico con un formato similar a (OC-2026-0001). Estado debe ser "Pendiente", "Recibida", "Cancelada". 
Automatizacion: El sistema calculará automáticamente el IVA y Totales. Al cambiar el estado a "Recibida", el sistema SUMARÁ automáticamente las cantidades al Stock Actual de los productos.
Automatizacion: El sistema calculará automáticamente el IVA y Totales. Al cambiar el estado a "Recibida", el sistema SUMARÁ automáticamente las cantidades al Stock Actual de los productos.
Campos: Id(int, not null, primary key, auto increment), Codigo(string, not null, max 100), Estado(string, not null, max 20), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null), FechaEliminacion(datetime, null), IdProveedor(int, not null, foreign key references Clientes(Id)), IdUsuario(int, not null, foreign key references Usuarios(Id)), Total(decimal, not null, >=0), GananciTotal(decimal, not null, >=0), IVA(decimal, not null, >=0), TotalConIVA(decimal, not null, >=0), FechaVencimiento(datetime, null), FechaPago(datetime, null), FormaPago(string, null, max 20), Observaciones(string, null, max 255).
Items de una Compra: Id(int, not null, primary key, auto increment), IdCompra(int, not null, foreign key references Compras(Id)), IdProducto(int, not null, foreign key references Productos(Id)), Cantidad(decimal, not null, >0), PrecioUnitario(decimal, not null, >=0), Subtotal(decimal, not null, >=0), Ganancia(decimal, not null, >=0).

8.6 Usuarios (usuarios del sistema)
Regla de negocio: El email no se puede repetir, Estado debe ser "Activo", "Inactivo". 
Campos: Id(int, not null, primary key, auto increment), Nombre(string, not null, max 100), Apellido(string, null, max 100), Email(string, not null, max 100), Password(string, not null, max 100), Estado(string, not null, max 20), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null), FechaEliminacion(datetime, null).

8.7 Log/Auditoria
Regla de negocio: Auditoría Global Configurable. El sistema registrará los cambios de "Antes" y "Después" para todos los modelos habilitados. Se deberá poder configurar (vía Feature Flags o Config) qué modelos se auditan y cuáles no (Ej: auditar Producto y Ventas, pero no Empresa).
campos: Id(int, not null, primary key, auto increment), Fecha(datetime, not null, default current_timestamp), UsuarioId(int, not null, foreign key references Usuarios(Id)), Accion(string, not null, max 100), Tabla(string, not null, max 100), Registro(string, not null, max 100), Antes(string, null, max 255), Despues(string, null, max 255).

8.8 Configuracion. No desarrollar por ahora

8.9 Empresa (datos de la empresa)
campos: Id(int, not null, primary key, auto increment), NombreComercial(string, not null, max 100), RazonSocial(string, null, max 100), CUIT(string, null, max 20), Direccion(string, null, max 255), Telefono(string, null, max 20), Email(string, not null, max 100), eslogan(string, null, max 255), Logo(string, null, max 255), Instagram(string, null, max 100), Facebook(string, null, max 100), Twitter(string, null, max 100), TikTok(string, null, max 100), WhatsApp(string, null, max 20), Web(string, null, max 255), CondicionFiscal(string, null, max 20), FechaModificacion(datetime, null).

8.10 Devoluciones (devoluciones de ventas)
Regla de negocio: En esta fase, las devoluciones son puramente INFORMATIVAS. No realizan reingreso automático de stock ni movimientos contables. Su propósito es generar estadísticas y reportes sobre motivos de devolución.
los motivos de devolucion son los siguientes:
        ProductoDefectuoso = 1,
        EmpaqueDañado = 2,
        ErrorEnPedido = 3,
        ProductoNoCoincide = 4,
        TiempoEntregaExcesivo = 5,
        ClienteArrepentido = 6,
        Otro = 99
campos: id(int, not null, primary key, auto increment), IdVenta(int, not null, foreign key references Ventas(Id)), IdProducto(int, not null, foreign key references Productos(Id)), Motivo(int not null, max 20), Observaciones(string, null, max 255), Fecha(datetime, not null, default current_timestamp).

8.12 Ofertas (ofertas de productos) * Modulo Opcional
LAs oferta pueden tener un tipo y alcance.
alcance
        Articulo = 1,
        Categoria = 2,
        Todos = 3
tipo
        Porcentual = 1,
        DescuentoFijo = 2,
        PrecioEspecial = 3,
        PorCantidad = 4
Campos: id(int, not null, primary key, auto increment), Nombre(string, not null, max 100), Descripcion(string, null, max 255), Alcance(int, not null, max 20), Tipo(int, not null, max 20), ProductoId(int, null, foreign key references Productos(Id)), CategoriaId(int, null, foreign key references Categorias(Id)), 
porcentajeDescuento(decimal, null, >=0), descuentoFijo(decimal, null, >=0), precioEspecial(decimal, null, >=0), cantidadMinima(int, null, >0), cantidadPagar(int, null, >0), FechaInicio(datetime, not null, default current_timestamp), FechaFin(datetime, not null), Activo(boolean, not null, default true), Prioridad(int, not null, >=0), FechaCreacion(datetime, not null, default current_timestamp), FechaModificacion(datetime, null).