# Pruebas Unitarias - Módulo Chat

Este documento explica cómo ejecutar y mantener las pruebas unitarias para el módulo de chat.

## Archivos de Pruebas

### 1. `chat.service.spec.ts`
Contiene las pruebas unitarias para el servicio `ChatService`. Incluye:

- **iniciarChat**: Verificar creación de nuevos chats y manejo de chats existentes
- **getChatsDeUsuario**: Verificar obtención de chats de usuario con información de autor
- **getChatDeOrganizacion**: Verificar obtención de chats de organización
- **getMensajesDeChat**: Verificar normalización de mensajes con información de autor
- **getChatPorId**: Verificar búsqueda de chat por ID y manejo de no encontrado
- **verificarAccesoAlChat**: Verificar autorización de acceso a chats
- **crearMensaje**: Verificar creación de mensajes desde usuarios y organizaciones
- **getUsuariosConEstado**: Verificar obtención de usuarios con estado de conexión
- **getOrganizacionesConEstado**: Verificar obtención de organizaciones con estado de conexión

### 2. `chat.controller.spec.ts`
Contiene las pruebas unitarias para el controlador `ChatController`. Incluye:

- **iniciarChat**: Endpoint para iniciar chats con validaciones de autorización
- **getChatsDeUsuario**: Endpoint para obtener chats de usuario autenticado
- **getChatsDeOrganizacion**: Endpoint para obtener chats de organización autenticada
- **getMensajesDeChat**: Endpoint para obtener mensajes con validación de acceso
- **getUsuariosConEstado**: Endpoint para que ONGs busquen usuarios relacionados
- **getOrganizacionesConEstado**: Endpoint para que usuarios busquen organizaciones relacionadas

## Comandos para Ejecutar Pruebas

### Ejecutar todas las pruebas del proyecto
```bash
npm test
```

### Ejecutar solo las pruebas del módulo chat
```bash
npm test -- src/chat
```

### Ejecutar solo las pruebas del servicio
```bash
npm test chat.service.spec.ts
```

### Ejecutar solo las pruebas del controller
```bash
npm test chat.controller.spec.ts
```

### Ejecutar pruebas en modo watch (se re-ejecutan al cambiar archivos)
```bash
npm run test:watch -- chat
```

### Ejecutar pruebas con cobertura de código
```bash
npm run test:cov -- chat
```

## Estructura de las Pruebas

### Patrón AAA (Arrange-Act-Assert)
Las pruebas siguen el patrón AAA:

1. **Arrange** (Preparar): Configurar mocks y datos de prueba
2. **Act** (Actuar): Ejecutar el método a probar
3. **Assert** (Verificar): Comprobar que el resultado es el esperado

### Ejemplo de una prueba:
```typescript
it('should return user chats when authorized', async () => {
  // Arrange
  const usuarioId = 'user-123';
  const req = {
    user: { id: 'user-123', tipo: 'USUARIO' },
  } as AuthenticateRequest;

  const mockResult = {
    ok: true,
    chats: [
      {
        id: 'chat-1',
        usuarioId: 'user-123',
        organizacionId: 'org-123',
        organizacion: { id: 'org-123', nombre: 'ONG Test' },
      },
    ],
  };

  mockChatService.getChatsDeUsuario.mockResolvedValue(mockResult);

  // Act
  const result = await controller.getChatsDeUsuario(usuarioId, req);

  // Assert
  expect(service.getChatsDeUsuario).toHaveBeenCalledWith(usuarioId);
  expect(result).toEqual(mockResult);
});
```

## Mocks Utilizados

### PrismaService Mock
- **chat**: findFirst, findMany, findUnique, create, update
- **mensaje**: findMany, create
- **usuario**: findUnique, findMany
- **organizacion**: findMany
- **donacion**: findMany
- **solicitudDeAdopcion**: findMany

### ChatConnectionService Mock
- **isUserConnected**: Mock para simular estado de conexión de usuarios

### Guards Mock
- **AuthGuard**: Simulado para permitir acceso en pruebas con múltiples estrategias
  - `['jwt-local', 'supabase']`: Para endpoints de usuarios
  - `['jwt-local']`: Para endpoints de organizaciones

## Datos Mock

### Chat Mock
```typescript
const mockChat = {
  id: 'chat-123',
  usuarioId: 'user-123',
  organizacionId: 'org-123',
  createdAt: new Date(),
  ultimoMensajeId: null
};
```

### Mensaje Mock
```typescript
const mockMessage = {
  id: 'msg-1',
  contenido: 'Hola',
  enviado_en: new Date(),
  autorUsuario: {
    id: 'user-123',
    nombre: 'Usuario Test',
    email: 'user@test.com',
    imagenPerfil: null,
  },
  autorOrganizacion: null,
};
```

### Usuario Autenticado Mock
```typescript
const mockAuthenticatedRequest = {
  user: {
    id: 'user-123',
    tipo: 'USUARIO',
    email: 'user@example.com',
    rol: 'USER',
    external: false
  }
} as AuthenticateRequest;
```

### Organización Autenticada Mock
```typescript
const mockOrgAuthenticatedRequest = {
  user: {
    id: 'org-123',
    tipo: 'ONG',
    email: 'org@example.com',
    rol: 'ORGANIZATION',
    external: false
  }
} as AuthenticateRequest;
```

## Casos de Prueba Cubiertos

### Controller (20 pruebas)

#### iniciarChat (6 pruebas)
- ✅ Usuario iniciando chat con organización
- ✅ ONG iniciando chat con usuario (proporcionando userId)
- ✅ Error cuando ONG no proporciona userId
- ✅ Error cuando ONG intenta iniciar chat por otra organización
- ✅ Error para tipos de usuario no autorizados

#### getChatsDeUsuario (3 pruebas)
- ✅ Usuario autorizado obteniendo sus chats
- ✅ Error cuando no-usuario intenta acceder
- ✅ Error cuando usuario intenta ver chats de otro

#### getChatsDeOrganizacion (3 pruebas)
- ✅ Organización autorizada obteniendo sus chats
- ✅ Error cuando no-organización intenta acceder
- ✅ Error cuando organización intenta ver chats de otra

#### getMensajesDeChat (2 pruebas)
- ✅ Obtención de mensajes con acceso autorizado
- ✅ Manejo de ForbiddenException del servicio

#### getUsuariosConEstado (3 pruebas)
- ✅ ONG obteniendo usuarios con query de búsqueda
- ✅ ONG obteniendo usuarios sin query
- ✅ Error cuando no-ONG intenta acceder

#### getOrganizacionesConEstado (3 pruebas)
- ✅ Usuario obteniendo organizaciones con query
- ✅ Usuario obteniendo organizaciones sin query
- ✅ Error cuando no-usuario intenta acceder

### Service (22 pruebas)

#### iniciarChat (2 pruebas)
- ✅ Retorno de chat existente si ya existe
- ✅ Creación de nuevo chat si no existe

#### getChatsDeUsuario (2 pruebas)
- ✅ Chats con información de autor normalizada
- ✅ Manejo de chats sin último mensaje

#### getChatDeOrganizacion (1 prueba)
- ✅ Chats de organización con información de autor

#### getMensajesDeChat (2 pruebas)
- ✅ Mensajes normalizados con tipos de autor
- ✅ Manejo de mensajes sin autor

#### getChatPorId (2 pruebas)
- ✅ Retorno de chat encontrado
- ✅ NotFoundException cuando chat no existe

#### verificarAccesoAlChat (4 pruebas)
- ✅ Acceso permitido para usuario autorizado
- ✅ Acceso permitido para ONG autorizada
- ✅ ForbiddenException para acceso no autorizado
- ✅ NotFoundException para chat inexistente

#### crearMensaje (2 pruebas)
- ✅ Creación de mensaje desde usuario
- ✅ Creación de mensaje desde organización

#### getUsuariosConEstado (3 pruebas)
- ✅ Usuarios con estado de conexión y filtro
- ✅ Array vacío cuando no hay usuarios
- ✅ Filtrado de IDs nulos

#### getOrganizacionesConEstado (3 pruebas)
- ✅ Organizaciones con estado de conexión
- ✅ Array vacío cuando no hay organizaciones
- ✅ Manejo de solicitudes con caso nulo

## Validaciones de Autorización

### Tipos de Usuario
- **USUARIO**: Puede acceder a sus propios chats y buscar organizaciones
- **ONG**: Puede acceder a sus propios chats y buscar usuarios
- **Otros tipos**: Rechazados con ForbiddenException

### Validaciones de Acceso
- **Identidad**: Los usuarios solo pueden acceder a sus propios recursos
- **Pertenencia**: Los chats verifican que el usuario pertenezca al chat
- **Existencia**: Verificación de que los recursos existen antes de acceder

## Buenas Prácticas

1. **Aislamiento**: Cada prueba es independiente y limpia sus mocks
2. **Descriptivas**: Nombres de pruebas claros que explican el escenario
3. **Mocks Específicos**: Uso de mocks apropiados para cada dependencia
4. **Cobertura Completa**: Casos exitosos, errores HTTP y edge cases
5. **Autorización**: Pruebas exhaustivas de todos los escenarios de autorización

## Agregar Nuevas Pruebas

Para agregar nuevas pruebas:

1. Identifica el método a probar
2. Crea un `describe` block para el método
3. Escribe pruebas para casos exitosos y de error
4. Usa mocks apropiados para las dependencias
5. Verifica llamadas a mocks y valores de retorno

### Ejemplo para un nuevo método:
```typescript
describe('nuevoMetodo', () => {
  it('should handle success case', async () => {
    // Arrange
    const mockData = { id: 'test-id' };
    mockChatService.nuevoMetodo.mockResolvedValue(mockData);

    // Act
    const result = await controller.nuevoMetodo('param');

    // Assert
    expect(result).toEqual(mockData);
    expect(service.nuevoMetodo).toHaveBeenCalledWith('param');
  });

  it('should handle authorization error', async () => {
    // Arrange
    const req = {
      user: { id: 'wrong-user', tipo: 'USUARIO' },
    } as AuthenticateRequest;

    // Act & Assert
    await expect(controller.nuevoMetodo('param', req))
      .rejects.toThrow(new ForbiddenException('No autorizado'));
  });
});
```

## Resultados de las Pruebas

Actualmente todas las pruebas pasan:
- **Service**: 22 pruebas ✅
- **Controller**: 20 pruebas ✅
- **Total**: 42 pruebas ✅

Las pruebas cubren todos los endpoints del módulo de chat incluyendo:
- Autenticación y autorización
- Manejo de errores específicos
- Casos edge y validaciones de datos
- Integración con servicios externos (PrismaService, ChatConnectionService)

## Notas de Implementación

### Manejo de Tipos de Usuario
El módulo chat maneja diferentes tipos de usuario (`USUARIO`, `ONG`) con lógica específica:
- Los usuarios pueden iniciar chats directamente
- Las organizaciones requieren especificar el `usuarioId` al iniciar chats
- Cada tipo tiene endpoints específicos para sus necesidades

### Gestión de Estado de Conexión
El servicio integra con `ChatConnectionService` para proporcionar información en tiempo real sobre el estado de conexión de usuarios y organizaciones.

### Normalización de Datos
Los mensajes y chats incluyen lógica de normalización para unificar la información de autor independientemente de si es usuario u organización.

### Seguridad
Todas las operaciones incluyen validaciones de autorización exhaustivas para prevenir acceso no autorizado a chats y mensajes privados.
