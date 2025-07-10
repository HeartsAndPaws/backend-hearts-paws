# Pruebas Unitarias - Módulo Cloudinary

Este documento explica cómo ejecutar y mantener las pruebas unitarias para el módulo de cloudinary.

## Archivos de Pruebas

### 1. `cloudinary.service.spec.ts`
Contiene las pruebas unitarias para el servicio `CloudinaryService`. Incluye:

- **subirIamgen**: Verificar subida de imágenes a Cloudinary con diferentes formatos
- **subirPdf**: Verificar subida de PDFs con configuraciones específicas
- **Manejo de errores**: Verificar comportamiento ante fallos de upload
- **Configuraciones**: Verificar que se configuren correctamente las opciones de subida

### 2. `cloudinary.controller.spec.ts`
Contiene las pruebas unitarias para el controlador `UploadController`. Incluye:

- **subirArchivo**: Endpoint para subir archivos con validaciones
- **Formatos de archivo**: Manejo de diferentes tipos de imagen
- **Tamaños de archivo**: Pruebas con archivos grandes y pequeños
- **Caracteres especiales**: Manejo de nombres de archivos con caracteres especiales
- **Manejo de errores**: Respuesta ante errores del servicio

### 3. `file.interceptor.spec.ts`
Contiene las pruebas unitarias para el interceptor de archivos `filtroArchivoImagen`. Incluye:

- **Formatos permitidos**: Validación de JPEG, PNG, WebP, JPG
- **Formatos rechazados**: Rechazo de PDF, texto, video, audio, GIF, SVG
- **Límites de tamaño**: Configuración de límite de 5MB
- **Edge cases**: Manejo de mimetypes undefined o vacíos

## Comandos para Ejecutar Pruebas

### Ejecutar todas las pruebas del proyecto
```bash
npm test
```

### Ejecutar solo las pruebas del módulo cloudinary
```bash
npm test -- src/cloudinary
```

### Ejecutar solo las pruebas del servicio
```bash
npm test cloudinary.service.spec.ts
```

### Ejecutar solo las pruebas del controller
```bash
npm test cloudinary.controller.spec.ts
```

### Ejecutar solo las pruebas del interceptor
```bash
npm test file.interceptor.spec.ts
```

### Ejecutar pruebas en modo watch (se re-ejecutan al cambiar archivos)
```bash
npm run test:watch -- cloudinary
```

### Ejecutar pruebas con cobertura de código
```bash
npm run test:cov -- cloudinary
```

## Estructura de las Pruebas

### Patrón AAA (Arrange-Act-Assert)
Las pruebas siguen el patrón AAA:

1. **Arrange** (Preparar): Configurar mocks y datos de prueba
2. **Act** (Actuar): Ejecutar el método a probar
3. **Assert** (Verificar): Comprobar que el resultado es el esperado

### Ejemplo de una prueba:
```typescript
it('should upload file successfully and return secure URL', async () => {
  // Arrange
  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('fake-image-data'),
    // ... otros campos
  };

  const mockUploadResult = {
    secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
    // ... otros campos
  };

  mockCloudinaryService.subirIamgen.mockResolvedValue(mockUploadResult);

  // Act
  const result = await controller.subirArchivo(mockFile);

  // Assert
  expect(service.subirIamgen).toHaveBeenCalledWith(mockFile);
  expect(result).toEqual({
    url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
  });
});
```

## Mocks Utilizados

### CloudinaryService Mock
- **subirIamgen**: Mock para simular subida de imágenes
- **subirPdf**: Mock para simular subida de PDFs

### Cloudinary SDK Mock
- **uploader.upload_stream**: Mock del método de upload de Cloudinary
- **Configuración**: Mock de configuraciones de carpeta y opciones

### File Mock
- **Express.Multer.File**: Mock completo de archivos con todos los campos requeridos

## Datos Mock

### Archivo de Imagen Mock
```typescript
const mockFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('fake-image-data'),
  destination: '',
  filename: 'test-image.jpg',
  path: '',
  stream: null,
};
```

### Resultado de Upload Mock
```typescript
const mockUploadResult: Partial<UploadApiResponse> = {
  public_id: 'test-public-id',
  version: 1234567890,
  secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
  url: 'http://res.cloudinary.com/test/image/upload/test-image.jpg',
  folder: 'hertsandpaws',
  format: 'jpg',
  resource_type: 'image',
  bytes: 1024,
};
```

### Archivo PDF Mock
```typescript
const mockPdfFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'document.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 5120,
  buffer: Buffer.from('fake-pdf-data'),
  // ... otros campos
};
```

## Casos de Prueba Cubiertos

### Controller (7 pruebas)

#### subirArchivo (7 pruebas)
- ✅ Subida exitosa de archivo con retorno de URL segura
- ✅ Manejo correcto de errores del servicio
- ✅ Soporte para diferentes formatos de imagen (WebP)
- ✅ Manejo de archivos grandes (4MB)
- ✅ Procesamiento de nombres con caracteres especiales
- ✅ Manejo graceful de archivos undefined

### Service (10 pruebas)

#### subirIamgen (4 pruebas)
- ✅ Subida exitosa de imagen con configuración correcta
- ✅ Manejo de errores de upload de Cloudinary
- ✅ Manejo de resultado nulo sin error
- ✅ Soporte para diferentes formatos de imagen

#### subirPdf (6 pruebas)
- ✅ Subida exitosa de PDF con configuraciones específicas
- ✅ Manejo de errores de upload de PDF
- ✅ Manejo de resultado nulo para PDFs
- ✅ Procesamiento correcto de nombres de archivo (remover .pdf)
- ✅ Manejo de caracteres especiales en nombres de PDF

### File Interceptor (14 pruebas)

#### filtroArchivoImagen (12 pruebas)
- ✅ Aceptación de formatos permitidos: JPEG, PNG, WebP, JPG
- ✅ Rechazo de formatos no permitidos: PDF, texto, video, audio
- ✅ Rechazo de formatos de imagen no incluidos: GIF, SVG
- ✅ Manejo de mimetypes undefined y vacíos

#### limits (2 pruebas)
- ✅ Verificación de límite de tamaño correcto (5MB)
- ✅ Verificación de límite en bytes exactos

## Configuraciones de Cloudinary

### Configuración para Imágenes
```typescript
{
  folder: 'hertsandpaws'
}
```

### Configuración para PDFs
```typescript
{
  folder: 'heartsandpaws/verificaciones',
  resource_type: 'raw',
  public_id: 'filename-without-extension',
  use_filename: true,
  unique_filename: false,
}
```

## Validaciones de Archivos

### Formatos de Imagen Permitidos
- **image/jpeg** - Archivos JPEG estándar
- **image/png** - Archivos PNG con transparencia
- **image/webp** - Formato moderno WebP
- **image/jpg** - Variante de JPEG

### Formatos Rechazados
- **application/pdf** - Documentos PDF
- **text/plain** - Archivos de texto
- **video/mp4** - Videos
- **audio/mpeg** - Archivos de audio
- **image/gif** - Imágenes animadas
- **image/svg+xml** - Gráficos vectoriales

### Límites de Tamaño
- **Máximo**: 5 MB (5,242,880 bytes)
- **Aplicación**: Mediante configuración en `limits.fileSize`

## Buenas Prácticas

1. **Aislamiento**: Cada prueba es independiente y limpia sus mocks
2. **Mocks Realistas**: Los mocks simulan comportamiento real de Cloudinary
3. **Cobertura Completa**: Casos exitosos, errores y edge cases
4. **Asíncrono**: Pruebas correctas de operaciones asíncronas con Promises
5. **Validaciones**: Verificación exhaustiva de parámetros y configuraciones

## Agregar Nuevas Pruebas

Para agregar nuevas pruebas:

1. Identifica el método a probar
2. Crea un `describe` block para el método
3. Escribe pruebas para casos exitosos y de error
4. Configura mocks apropiados para Cloudinary
5. Verifica parámetros de configuración

### Ejemplo para un nuevo método:
```typescript
describe('nuevoMetodo', () => {
  it('should handle success case', async () => {
    // Arrange
    const mockFile: Express.Multer.File = {
      // ... configuración de archivo
    };
    
    const mockResult = {
      secure_url: 'https://test-url.com/image.jpg',
    };

    const mockStream = { end: jest.fn() };
    mockCloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
      setTimeout(() => callback(null, mockResult), 0);
      return mockStream;
    });

    // Act
    const result = await service.nuevoMetodo(mockFile);

    // Assert
    expect(result).toEqual(mockResult);
    expect(mockStream.end).toHaveBeenCalledWith(mockFile.buffer);
  });
});
```

## Resultados de las Pruebas

Actualmente todas las pruebas pasan:
- **Controller**: 7 pruebas ✅
- **Service**: 10 pruebas ✅
- **File Interceptor**: 14 pruebas ✅
- **Total**: 31 pruebas ✅

Las pruebas cubren todos los aspectos del módulo de cloudinary incluyendo:
- Subida de imágenes y PDFs
- Validación de formatos de archivo
- Manejo de errores y edge cases
- Configuraciones específicas para diferentes tipos de archivo
- Integración con el SDK de Cloudinary

## Notas de Implementación

### Manejo de Streams
El servicio utiliza streams de Cloudinary para subir archivos, las pruebas mockan correctamente este comportamiento asíncrono.

### Configuraciones Diferenciadas
- **Imágenes**: Van a la carpeta `hertsandpaws`
- **PDFs**: Van a la subcarpeta `heartsandpaws/verificaciones` con configuraciones específicas

### Validación de Archivos
El interceptor `filtroArchivoImagen` valida estrictamente los tipos MIME permitidos antes de llegar al controlador.

### Gestión de Errores
Las pruebas verifican tanto errores de Cloudinary como casos donde no se retorna resultado, asegurando robustez en el manejo de fallos.

### Nombres de Archivo
Para PDFs, el sistema remueve automáticamente la extensión `.pdf` del `public_id` manteniendo el nombre original en Cloudinary.
