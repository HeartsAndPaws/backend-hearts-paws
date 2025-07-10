import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthenticateRequest } from 'src/common/interfaces/authenticated-request.interface';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  const mockChatService = {
    iniciarChat: jest.fn(),
    getChatsDeUsuario: jest.fn(),
    getChatDeOrganizacion: jest.fn(),
    verificarAccesoAlChat: jest.fn(),
    getMensajesDeChat: jest.fn(),
    getUsuariosConEstado: jest.fn(),
    getOrganizacionesConEstado: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('iniciarChat', () => {
    it('should allow USUARIO to start chat with organization', async () => {
      // Arrange
      const body = { organizacionId: 'org-123' };
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      const mockResult = {
        ok: true,
        mensaje: 'Chat iniciado correctamente',
        chat: { id: 'chat-123', usuarioId: 'user-123', organizacionId: 'org-123' },
      };

      mockChatService.iniciarChat.mockResolvedValue(mockResult);

      // Act
      const result = await controller.iniciarChat(body, req);

      // Assert
      expect(service.iniciarChat).toHaveBeenCalledWith('user-123', 'org-123');
      expect(result).toEqual(mockResult);
    });

    it('should allow ONG to start chat with user when providing userId', async () => {
      // Arrange
      const body = { organizacionId: 'org-123' };
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
        body: { usuarioId: 'user-456' },
      } as any;

      const mockResult = {
        ok: true,
        mensaje: 'Chat iniciado correctamente',
        chat: { id: 'chat-456', usuarioId: 'user-456', organizacionId: 'org-123' },
      };

      mockChatService.iniciarChat.mockResolvedValue(mockResult);

      // Act
      const result = await controller.iniciarChat(body, req);

      // Assert
      expect(service.iniciarChat).toHaveBeenCalledWith('user-456', 'org-123');
      expect(result).toEqual(mockResult);
    });

    it('should throw ForbiddenException when ONG tries to start chat without userId', async () => {
      // Arrange
      const body = { organizacionId: 'org-123' };
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
        body: {},
      } as any;

      // Act & Assert
      await expect(controller.iniciarChat(body, req)).rejects.toThrow(
        new ForbiddenException('Debe proporcionar el ID del usuario')
      );
    });

    it('should throw ForbiddenException when ONG tries to start chat for another organization', async () => {
      // Arrange
      const body = { organizacionId: 'org-456' };
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
        body: { usuarioId: 'user-456' },
      } as any;

      // Act & Assert
      await expect(controller.iniciarChat(body, req)).rejects.toThrow(
        new ForbiddenException('No puedes iniciar un chat por otra organizacion')
      );
    });

    it('should throw ForbiddenException for unauthorized user types', async () => {
      // Arrange
      const body = { organizacionId: 'org-123' };
      const req = {
        user: { id: 'admin-123', tipo: 'ADMIN' },
      } as any;

      // Act & Assert
      await expect(controller.iniciarChat(body, req)).rejects.toThrow(
        new ForbiddenException('No autorizado para iniciar chats')
      );
    });
  });

  describe('getChatsDeUsuario', () => {
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

    it('should throw ForbiddenException when non-USUARIO tries to access', async () => {
      // Arrange
      const usuarioId = 'user-123';
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
      } as AuthenticateRequest;

      // Act & Assert
      await expect(controller.getChatsDeUsuario(usuarioId, req)).rejects.toThrow(
        new ForbiddenException('Solo los usuarios pueden acceder a esta ruta')
      );
    });

    it('should throw ForbiddenException when user tries to access another user chats', async () => {
      // Arrange
      const usuarioId = 'user-456';
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      // Act & Assert
      await expect(controller.getChatsDeUsuario(usuarioId, req)).rejects.toThrow(
        new ForbiddenException('No puedes ver los chats de otro usuario')
      );
    });
  });

  describe('getChatsDeOrganizacion', () => {
    it('should return organization chats when authorized', async () => {
      // Arrange
      const organizacionId = 'org-123';
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
      } as AuthenticateRequest;

      const mockResult = {
        ok: true,
        chats: [
          {
            id: 'chat-1',
            usuarioId: 'user-123',
            organizacionId: 'org-123',
            usuario: { id: 'user-123', nombre: 'Usuario Test' },
          },
        ],
      };

      mockChatService.getChatDeOrganizacion.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getChatsDeOrganizacion(organizacionId, req);

      // Assert
      expect(service.getChatDeOrganizacion).toHaveBeenCalledWith(organizacionId);
      expect(result).toEqual(mockResult);
    });

    it('should throw ForbiddenException when non-ONG tries to access', async () => {
      // Arrange
      const organizacionId = 'org-123';
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      // Act & Assert
      await expect(controller.getChatsDeOrganizacion(organizacionId, req)).rejects.toThrow(
        new ForbiddenException('Solo las organizaciones pueden acceder a esta ruta')
      );
    });

    it('should throw ForbiddenException when organization tries to access another organization chats', async () => {
      // Arrange
      const organizacionId = 'org-456';
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
      } as AuthenticateRequest;

      // Act & Assert
      await expect(controller.getChatsDeOrganizacion(organizacionId, req)).rejects.toThrow(
        new ForbiddenException('No puedes ver los chats de otra organizacion')
      );
    });
  });

  describe('getMensajesDeChat', () => {
    it('should return chat messages when user has access', async () => {
      // Arrange
      const chatId = 'chat-123';
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      const mockMessages = {
        ok: true,
        mensajes: [
          {
            id: 'msg-1',
            contenido: 'Hola',
            enviado_en: new Date(),
            autor: { id: 'user-123', nombre: 'Usuario', tipo: 'USUARIO' },
          },
        ],
      };

      mockChatService.verificarAccesoAlChat.mockResolvedValue(true);
      mockChatService.getMensajesDeChat.mockResolvedValue(mockMessages);

      // Act
      const result = await controller.getMensajesDeChat(chatId, req);

      // Assert
      expect(service.verificarAccesoAlChat).toHaveBeenCalledWith(chatId, req.user);
      expect(service.getMensajesDeChat).toHaveBeenCalledWith(chatId);
      expect(result).toEqual(mockMessages);
    });

    it('should handle service throwing ForbiddenException', async () => {
      // Arrange
      const chatId = 'chat-123';
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      mockChatService.verificarAccesoAlChat.mockRejectedValue(
        new ForbiddenException('No tiene acceso a este chat')
      );

      // Act & Assert
      await expect(controller.getMensajesDeChat(chatId, req)).rejects.toThrow(
        new ForbiddenException('No tiene acceso a este chat')
      );
    });
  });

  describe('getUsuariosConEstado', () => {
    it('should return users with status when called by ONG', async () => {
      // Arrange
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
      } as AuthenticateRequest;
      const query = 'test';

      const mockResult = [
        {
          id: 'user-1',
          nombre: 'Usuario Test',
          email: 'test@test.com',
          imagenPerfil: null,
          conectado: false,
        },
      ];

      mockChatService.getUsuariosConEstado.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getUsuariosConEstado(req, query);

      // Assert
      expect(service.getUsuariosConEstado).toHaveBeenCalledWith(query, 'org-123');
      expect(result).toEqual(mockResult);
    });

    it('should work without query parameter', async () => {
      // Arrange
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
      } as AuthenticateRequest;

      const mockResult = [];
      mockChatService.getUsuariosConEstado.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getUsuariosConEstado(req);

      // Assert
      expect(service.getUsuariosConEstado).toHaveBeenCalledWith(undefined, 'org-123');
      expect(result).toEqual(mockResult);
    });

    it('should throw ForbiddenException when non-ONG tries to access', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      // Act & Assert
      await expect(controller.getUsuariosConEstado(req)).rejects.toThrow(
        new ForbiddenException('Solo las organizaciones pueden acceder a esta ruta')
      );
    });
  });

  describe('getOrganizacionesConEstado', () => {
    it('should return organizations with status when called by USUARIO', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;
      const query = 'fundacion';

      const mockResult = [
        {
          id: 'org-1',
          nombre: 'Fundación Test',
          email: 'fundacion@test.com',
          imagenPerfil: null,
          conectado: true,
        },
      ];

      mockChatService.getOrganizacionesConEstado.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getOrganizacionesConEstado(req, query);

      // Assert
      expect(service.getOrganizacionesConEstado).toHaveBeenCalledWith(query, 'user-123');
      expect(result).toEqual(mockResult);
    });

    it('should work without query parameter', async () => {
      // Arrange
      const req = {
        user: { id: 'user-123', tipo: 'USUARIO' },
      } as AuthenticateRequest;

      const mockResult = [];
      mockChatService.getOrganizacionesConEstado.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getOrganizacionesConEstado(req);

      // Assert
      expect(service.getOrganizacionesConEstado).toHaveBeenCalledWith(undefined, 'user-123');
      expect(result).toEqual(mockResult);
    });

    it('should throw ForbiddenException when non-USUARIO tries to access', async () => {
      // Arrange
      const req = {
        user: { id: 'org-123', tipo: 'ONG' },
      } as AuthenticateRequest;

      // Act & Assert
      await expect(controller.getOrganizacionesConEstado(req)).rejects.toThrow(
        new ForbiddenException('Solo los usuarios pueden acceder a esta ruta')
      );
    });
  });
});
