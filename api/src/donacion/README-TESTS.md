# Pruebas Unitarias - Módulo Donaciones

## Resumen de Pruebas Implementadas

### DonacionService (donacion.service.spec.ts)
**Total de pruebas: 14**

#### Métodos Probados:
1. **getDonaciones(filtros)** - Obtiene donaciones con filtros opcionales
2. **getDonacionesByOngId(ongId)** - Obtiene donaciones por ID de ONG
3. **getDonacionById(id)** - Obtiene una donación por ID
4. **obtenerValorTotalDonaciones()** - Obtiene el valor total de todas las donaciones
5. **getDetalleDonacionByCasoId(casoId)** - Obtiene detalles de donación por caso
6. **getDetallesDonacion()** - Obtiene detalles de todas las donaciones

#### Casos de Prueba:
- ✅ Filtros de búsqueda (nombre usuario, email usuario, nombre ONG, email ONG, fecha)
- ✅ Búsqueda sin filtros
- ✅ Agregación de monto total
- ✅ Formateo de montos (formatearARS)
- ✅ Cálculo de progreso de donaciones
- ✅ Manejo de excepciones (ForbiddenException)
- ✅ Casos límite (sin resultados, valores nulos)
- ✅ Validación de includes de Prisma

### DonacionController (donacion.controller.spec.ts)
**Total de pruebas: 14**

#### Endpoints Probados:
1. **GET /donacion** - Obtener todas las donaciones con filtros (ADMIN)
2. **GET /donacion/total** - Obtener valor total donado (ADMIN)
3. **GET /donacion/ong** - Obtener donaciones de la ONG autenticada
4. **GET /donacion/:id** - Obtener donación por ID
5. **GET /donacion/detalleDonacion/:CasoId** - Obtener detalle por caso
6. **GET /donacion/detalle/donaciones** - Obtener detalles de todas las donaciones

#### Casos de Prueba:
- ✅ Respuestas exitosas de endpoints
- ✅ Validación de autenticación (JWT)
- ✅ Validación de roles (ADMIN para endpoints específicos)
- ✅ Filtros opcionales en query parameters
- ✅ Manejo de errores y excepciones
- ✅ Delegación correcta a métodos del servicio

## Mocks y Configuración

### Mocks de Prisma Service:
- **donacion**: findMany, findUnique, findFirst, aggregate
- **casoDonacion**: findMany

### Mocks de Utilidades:
- **formatearARS**: Formatea montos en pesos argentinos
- **calcularPorcentajeProgreso**: Calcula porcentaje de progreso de donaciones

### Mocks de Datos:
- **mockDonacion**: Donación base con relaciones (usuario, organizacion, mascota, casoDonacion)
- **mockCasoDonacion**: Caso de donación con meta y estado
- **mockAuthenticatedAdminRequest**: Request de administrador
- **mockAuthenticatedOngRequest**: Request de ONG

### Guardias y Autenticación:
- **AuthGuard(['jwt-local', 'supabase'])**: Para endpoints de admin
- **AuthGuard('jwt-local')**: Para endpoints de ONG
- **RolesGuard**: Para validación de roles

## Estructura de Includes Validada

### getDonaciones():
```typescript
include: {
  usuario: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
  organizacion: {
    select: {
      id: true,
      nombre: true,
      email: true,
    },
  },
  mascota: {
    select: {
      id: true,
      nombre: true,
    },
  },
  casoDonacion: {
    select: {
      id: true,
      caso: {
        select: {
          titulo: true,
        },
      },
    },
  },
}
```

### getDonacionesByOngId() / getDonacionById():
```typescript
include: {
  usuario: true,
  organizacion: true,
  mascota: true,
  casoDonacion: true,
}
```

## Filtros Implementados

### Filtros de Fecha:
- Conversión de fecha string (YYYY-MM-DD) a rango de fechas
- Filtro por fecha inicio y fecha fin (00:00:00Z a 23:59:59Z)

### Filtros de Texto:
- Búsqueda insensible a mayúsculas/minúsculas
- Búsqueda por coincidencia parcial (contains)
- Filtros por nombre y email de usuario y organización

## Funcionalidades de Formateo

### Formateo de Montos:
- **montoFormateado**: En getDonaciones()
- **montoformateado**: En getDonacionesByOngId() y getDonacionById()
- **estadoDonacionARS** y **metaDonacionARS**: En detalles de donación

### Cálculo de Progreso:
- **progreso**: Porcentaje de progreso basado en meta y estado de donación

## Resultados de Ejecución

```
Test Suites: 2 passed, 2 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        36.463 s
```

## Cobertura de Funcionalidades

### ✅ Completado:
- Todas las operaciones de consulta (GET)
- Validación de autenticación y autorización
- Manejo de excepciones (ForbiddenException)
- Filtros avanzados de búsqueda
- Agregaciones (suma total de donaciones)
- Formateo de montos y cálculo de progreso
- Relaciones complejas con múltiples entidades

### 📝 Notas Técnicas:
- Se mockearon las funciones utilitarias de formateo
- Se validaron los filtros de fecha con timezone UTC
- Se testearon casos límite (valores nulos, arrays vacíos)
- Se verificó la correcta delegación entre controlador y servicio

### 🔧 Cambios Realizados:
- **Ningún cambio en el código de producción**
- Solo se crearon archivos de prueba (.spec.ts)
- Se mantuvieron intactas todas las funcionalidades existentes

### 🚀 Características Avanzadas Testeadas:
- **Filtros complejos** con múltiples criterios opcionales
- **Agregaciones** de base de datos (sum)
- **Transformaciones de datos** (formateo, cálculo de progreso)
- **Validaciones de permisos** (solo donadores pueden ver detalles)
- **Autenticación multi-método** (jwt-local, supabase)
