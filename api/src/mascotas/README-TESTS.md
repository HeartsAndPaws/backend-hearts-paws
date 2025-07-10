# Pruebas Unitarias - Módulo Mascotas

Este documento explica cómo ejecutar y mantener las pruebas unitarias para el módulo de mascotas.

## Archivos de Pruebas

### 1. `mascotas.service.spec.ts`
Contiene las pruebas unitarias para el servicio `MascotasService`. Incluye:

- **GetMascotas**: Verificar que retorna todas las mascotas
- **GetMascotaById**: Verificar que retorna una mascota por ID
- **GetMascotasByOngId**: Verificar que retorna mascotas por organización
- **GetTipo**: Verificar que retorna todos los tipos de mascotas
- **CreateTipoMascota**: Verificar la creación de tipos de mascotas
- **CreateMascota**: Verificar la creación de mascotas con validaciones
- **contarMascotas**: Verificar el conteo de mascotas
- **SubirImagenes**: Verificar validaciones básicas de subida de imágenes

### 2. `mascotas.controller.spec.ts`
Contiene las pruebas unitarias para el controlador `MascotasController`. Incluye:

- **GetMascotas**: Endpoint para obtener todas las mascotas
- **GetMascotaById**: Endpoint para obtener mascota por ID
- **GetMascotasByOngId**: Endpoint para obtener mascotas por organización autenticada
- **listaDeMascotasEnAdopcionPorOng**: Endpoint para mascotas en adopción
- **contarTotalMascotas**: Endpoint para contar mascotas
- **GetTiposMascotas**: Endpoint para obtener tipos de mascotas
- **CreateTipoMascota**: Endpoint para crear tipos de mascotas

## Comandos para Ejecutar Pruebas

### Ejecutar todas las pruebas del proyecto
```bash
npm test
```

### Ejecutar solo las pruebas del módulo mascotas
```bash
npm test -- mascotas
```

### Ejecutar solo las pruebas del servicio
```bash
npm test -- mascotas.service.spec.ts
```

### Ejecutar solo las pruebas del controller
```bash
npm test -- mascotas.controller.spec.ts
```

### Ejecutar pruebas en modo watch (se re-ejecutan al cambiar archivos)
```bash
npm run test:watch -- mascotas
```

### Ejecutar pruebas con cobertura de código
```bash
npm run test:cov -- mascotas
```

## Estructura de las Pruebas

### Patrón AAA (Arrange-Act-Assert)
Las pruebas siguen el patrón AAA:

1. **Arrange** (Preparar): Configurar mocks y datos de prueba
2. **Act** (Actuar): Ejecutar el método a probar
3. **Assert** (Verificar): Comprobar que el resultado es el esperado

### Ejemplo de una prueba:
```typescript
it('should return a mascota by id', async () => {
  // Arrange
  service.GetMascotaById.mockResolvedValue(mockMascota);

  // Act
  const result = await controller.GetMascotaById('1');

  // Assert
  expect(result).toEqual(mockMascota);
  expect(service.GetMascotaById).toHaveBeenCalledWith('1');
});
```

## Mocks Utilizados

### PrismaService Mock
- **mascota**: findMany, findUnique, create, count
- **tiposMascota**: findMany, findUnique, create
- **organizacion**: findUnique
- **imagenMascota**: create

### CloudinaryService Mock
- **subirIamgen**: Mock para simular subida de imágenes

### Guards Mock
- **AuthGuard**: Simulado para permitir acceso en pruebas
- **RolesGuard**: Simulado para permitir acceso en pruebas

## Datos Mock

### Mascota Mock
```typescript
const mockMascota = {
  id: '1',
  nombre: 'Firulais',
  edad: 2,
  organizacionId: 'org-1',
  tipoId: 'tipo-1',
  descripcion: 'Perro amigable',
  creada_en: new Date(),
  imagenes: []
};
```

### Usuario Autenticado Mock
```typescript
const mockAuthenticatedRequest = {
  user: {
    id: 'org-1',
    email: 'test@example.com',
    role: 'ORGANIZACION'
  }
};
```

## Buenas Prácticas

1. **Aislamiento**: Cada prueba debe ser independiente
2. **Descriptivas**: Los nombres de las pruebas deben ser claros
3. **Mocks**: Usar mocks para dependencias externas
4. **Cleanup**: Limpiar mocks después de cada prueba
5. **Cobertura**: Cubrir casos exitosos y de error

## Agregar Nuevas Pruebas

Para agregar nuevas pruebas:

1. Identifica el método a probar
2. Crea un `describe` block para el método
3. Escribe pruebas para casos exitosos y de error
4. Usa mocks apropiados para las dependencias
5. Verifica que los mocks se llamen correctamente

### Ejemplo para un nuevo método:
```typescript
describe('nuevoMetodo', () => {
  it('should handle success case', async () => {
    // Arrange
    prismaService.mascota.findUnique.mockResolvedValue(mockMascota);

    // Act
    const result = await service.nuevoMetodo('param');

    // Assert
    expect(result).toEqual(expected);
    expect(prismaService.mascota.findUnique).toHaveBeenCalledWith({
      where: { id: 'param' }
    });
  });

  it('should handle error case', async () => {
    // Arrange
    prismaService.mascota.findUnique.mockResolvedValue(null);

    // Act & Assert
    await expect(service.nuevoMetodo('param'))
      .rejects.toThrow(new NotFoundException('Error message'));
  });
});
```

## Resultados de las Pruebas

Actualmente todas las pruebas pasan:
- **Service**: 12 pruebas ✅
- **Controller**: 8 pruebas ✅
- **Total**: 20 pruebas ✅

Las pruebas cubren los casos principales de uso y manejo de errores del módulo de mascotas.

## Cambios Realizados en el Código

### Modificación en `MascotasService.SubirImagenes`

Durante la implementación de las pruebas, fue necesario modificar el método `SubirImagenes` para mejorar el manejo de errores:

#### **Problema Original:**
```typescript
async SubirImagenes(mascotaId: string, archivos: Express.Multer.File[], ongId: string) {
  try {
    const mascota = await this.prismaService.mascota.findUnique({
      where: { id: mascotaId},
    });

    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }

    if (mascota.organizacionId !== ongId) {
      throw new ForbiddenException('No puedes subir imagenes a esta mascota');
    }

    // ... resto del código
  } catch (error) {
    console.error('ErrorAl subir imagen:', error);
    throw new Error('Fallo la subida de imagen.')  // ❌ Problema: capturaba TODAS las excepciones
  }
}
```

#### **Solución Implementada:**
```typescript
async SubirImagenes(mascotaId: string, archivos: Express.Multer.File[], ongId: string) {
  // Validaciones fuera del try-catch
  const mascota = await this.prismaService.mascota.findUnique({
    where: { id: mascotaId},
  });

  if (!mascota) {
    throw new NotFoundException('Mascota no encontrada');
  }

  if (mascota.organizacionId !== ongId) {
    throw new ForbiddenException('No puedes subir imagenes a esta mascota');
  }

  const imagenes: any = []

  try {
    // Solo el procesamiento de archivos en el try-catch
    for(const file of archivos){
      // ... procesamiento de imágenes
    }
    return imagenes;
  } catch (error) {
    // Re-throw specific HTTP exceptions
    if (error instanceof BadRequestException || 
        error instanceof NotFoundException || 
        error instanceof ForbiddenException) {
      throw error;  // ✅ Solución: re-lanzar excepciones específicas
    }
    
    console.error('Error al subir imagen:', error);
    throw new Error('Fallo la subida de imagen.')
  }
}
```

#### **¿Por qué era necesario este cambio?**

1. **Problema**: El `try-catch` original capturaba **todas** las excepciones, incluyendo `NotFoundException` y `ForbiddenException`
2. **Efecto**: Las excepciones específicas se convertían en un `Error` genérico
3. **Resultado**: Las pruebas fallaban porque esperaban excepciones específicas pero recibían errores genéricos

#### **Beneficios del cambio:**

1. **✅ Pruebas funcionan**: Las validaciones lanzan las excepciones correctas
2. **✅ Mejor separación**: Validaciones fuera del try-catch, procesamiento dentro
3. **✅ Manejo específico**: Re-lanza excepciones HTTP específicas
4. **✅ Logging preservado**: Mantiene el log de errores para errores no HTTP

Este cambio mejoró tanto la testabilidad como la claridad del código, siguiendo el principio de "fail fast" para las validaciones.
