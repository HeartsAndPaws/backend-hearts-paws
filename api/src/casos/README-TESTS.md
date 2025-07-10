# Pruebas Unitarias - Módulo Casos

## Resumen de Pruebas Implementadas

### CasosService (casos.service.spec.ts)
**Total de pruebas: 15**

#### Métodos Probados:
1. **GetCasos()** - Obtiene todos los casos
2. **GetCasoById(id)** - Obtiene un caso por ID
3. **GetCasosAdopcion()** - Obtiene casos de adopción pendientes
4. **GetCasosDonacion()** - Obtiene casos de donación
5. **obtenerIdDelCasoAdopcion(mascotaId)** - Obtiene ID de caso de adopción por mascota
6. **CreateCaso(dto, ongId)** - Crea nuevos casos (adopción y donación)
7. **buscarCasos(filtros)** - Busca casos por filtros

#### Casos de Prueba:
- ✅ Retorno exitoso de datos
- ✅ Validación de parámetros Prisma
- ✅ Manejo de excepciones (NotFoundException, BadRequestException)
- ✅ Casos de adopción y donación
- ✅ Filtros de búsqueda (por tipo de mascota, nombre, ambos)
- ✅ Casos límite (sin resultados)

### CasosController (casos.controller.spec.ts)
**Total de pruebas: 13**

#### Endpoints Probados:
1. **GET /casos** - Obtener todos los casos
2. **GET /casos/adopcion** - Obtener casos de adopción
3. **GET /casos/donacion** - Obtener casos de donación
4. **GET /casos/adopcion/id/:mascotaId** - Obtener ID de adopción
5. **GET /casos/:id** - Obtener caso por ID
6. **POST /casos** - Crear nuevo caso
7. **GET /casos/buscar** - Buscar casos con filtros
8. **GET /casos/ong** - Obtener casos de la organización

#### Casos de Prueba:
- ✅ Respuestas exitosas de endpoints
- ✅ Validación de autenticación (JWT)
- ✅ Validación de autorización (solo ONGs pueden crear casos)
- ✅ Manejo de excepciones (UnauthorizedException)
- ✅ Filtros de búsqueda opcionales
- ✅ Delegación correcta a métodos del servicio

## Mocks y Configuración

### Mocks de Prisma Service:
- **caso**: findMany, findUnique, findFirst, create, update, delete
- **mascota**: findUnique
- **casoAdopcion**: create
- **casoDonacion**: create

### Mocks de Datos:
- **mockCaso**: Caso base con relaciones (mascota, ong, adopcion)
- **mockMascota**: Mascota con casos de adopción
- **mockCreateCasoDto**: DTO para crear caso de adopción
- **mockCreateCasoDonacionDto**: DTO para crear caso de donación

### Guardias y Autenticación:
- **AuthGuard('jwt-local')**: Mockeado para permitir acceso
- **Requests simulados**: Con usuarios ONG y usuarios regulares

## Estructura de Includes Validada

### buscarCasos():
```typescript
include: {
  mascota: {
    include: {
      tipo: true,
      imagenes: true,
    }
  },
  ong: true,
  adopcion: true,
  donacion: true,
}
```

### GetCasosAdopcion() / GetCasosDonacion():
```typescript
include: {
  mascota: {
    include: {
      imagenes: {
        orderBy: { subida_en: 'desc' }
      }
    }
  },
  ong: true
}
```

## Resultados de Ejecución

```
Test Suites: 2 passed, 2 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        9.864 s
```

## Cobertura de Funcionalidades

### ✅ Completado:
- Todas las operaciones CRUD básicas
- Validación de autenticación y autorización
- Manejo de excepciones
- Filtros de búsqueda
- Creación de casos de adopción y donación
- Relaciones con entidades (mascota, ong, adopcion, donacion)

### 📝 Notas Técnicas:
- Se corrigieron los mocks para usar `casoAdopcion` y `casoDonacion` en lugar de `adopcion` y `donacion`
- Se ajustó la estructura del DTO de donación para incluir el objeto `donacion.metaDonacion`
- Se validaron los includes exactos del código de producción
- No se modificó la lógica de negocio, solo se crearon pruebas

### 🔧 Cambios Realizados:
- **Ningún cambio en el código de producción**
- Solo se crearon archivos de prueba (.spec.ts)
- Se mantuvieron intactas todas las funcionalidades existentes
