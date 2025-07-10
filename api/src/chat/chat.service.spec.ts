import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatConnectionService } from './chat-connection.service';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: PrismaService;
  let connectionService: ChatConnectionService;

  const mockPrismaService = {
    chat: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    mensaje: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    organizacion: {
      findMany: jest.fn(),
    },
    donacion: {
      findMany: jest.fn(),
    },
    solicitudDeAdopcion: {
      findMany: jest.fn(),
    },
  };

  const mockConnectionService = {
    isUserConnected: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ChatConnectionService,
          useValue: mockConnectionService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    prisma = module.get<PrismaService>(PrismaService);
    connectionService = module.get<ChatConnectionService>(ChatConnectionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('iniciarChat', () => {
    it('should return existing chat if one already exists', async () => {
      // Arrange
      const usuarioId = 'user-123';
      const organizacionId = 'org-123';
      const existingChat = {
        id: 'chat-123',
        usuarioId,
        organizacionId,
        createdAt: new Date(),
      };

      mockPrismaService.chat.findFirst.mockResolvedValue(existingChat);

      // Act
      const result = await service.iniciarChat(usuarioId, organizacionId);

      // Assert
      expect(prisma.chat.findFirst).toHaveBeenCalledWith({
        where: { usuarioId, organizacionId },
      });
      expect(result).toEqual({
        ok: true,
        mensaje: 'Ya existe un chat entre este usuario y esta organización',
        chat: existingChat,
      });
    });

    it('should create new chat if none exists', async () => {
      // Arrange
      const usuarioId = 'user-456';
      const organizacionId = 'org-456';
      const newChat = {
        id: 'chat-456',
        usuarioId,
        organizacionId,
        createdAt: new Date(),
      };

      mockPrismaService.chat.findFirst.mockResolvedValue(null);
      mockPrismaService.chat.create.mockResolvedValue(newChat);

      // Act
      const result = await service.iniciarChat(usuarioId, organizacionId);

      // Assert
      expect(prisma.chat.findFirst).toHaveBeenCalledWith({
        where: { usuarioId, organizacionId },
      });
      expect(prisma.chat.create).toHaveBeenCalledWith({
        data: { usuarioId, organizacionId },
      });
      expect(result).toEqual({
        ok: true,
        mensaje: 'Chat iniciado correctamente',
        chat: newChat,
      });
    });
  });

  describe('getChatsDeUsuario', () => {
    it('should return user chats with author information', async () => {
      // Arrange
      const usuarioId = 'user-123';
      const mockChats = [
        {
          id: 'chat-1',
          usuarioId,
          organizacionId: 'org-1',
          organizacion: {
            id: 'org-1',
            nombre: 'ONG Test',
            email: 'ong@test.com',
            imagenPerfil: null,
          },
          ultimoMensaje: {
            id: 'msg-1',
            contenido: 'Hola',
            enviado_en: new Date(),
            autorUsuario: { id: 'user-123', nombre: 'Usuario Test' },
            autorOrganizacion: null,
          },
        },
      ];

      mockPrismaService.chat.findMany.mockResolvedValue(mockChats);

      // Act
      const result = await service.getChatsDeUsuario(usuarioId);

      // Assert
      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: { usuarioId },
        include: {
          organizacion: {
            select: {
              id: true,
              nombre: true,
              email: true,
              imagenPerfil: true,
            },
          },
          ultimoMensaje: {
            select: {
              id: true,
              contenido: true,
              enviado_en: true,
              autorUsuario: {
                select: { id: true, nombre: true },
              },
              autorOrganizacion: {
                select: { id: true, nombre: true },
              },
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.chats[0].ultimoMensaje?.autor).toEqual({
        id: 'user-123',
        nombre: 'Usuario Test',
        tipo: 'USUARIO',
      });
    });

    it('should handle chats without last message', async () => {
      // Arrange
      const usuarioId = 'user-123';
      const mockChats = [
        {
          id: 'chat-1',
          usuarioId,
          organizacionId: 'org-1',
          organizacion: {
            id: 'org-1',
            nombre: 'ONG Test',
            email: 'ong@test.com',
            imagenPerfil: null,
          },
          ultimoMensaje: null,
        },
      ];

      mockPrismaService.chat.findMany.mockResolvedValue(mockChats);

      // Act
      const result = await service.getChatsDeUsuario(usuarioId);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.chats[0].ultimoMensaje).toBeNull();
    });
  });

  describe('getChatDeOrganizacion', () => {
    it('should return organization chats with author information', async () => {
      // Arrange
      const organizacionId = 'org-123';
      const mockChats = [
        {
          id: 'chat-1',
          usuarioId: 'user-1',
          organizacionId,
          usuario: {
            id: 'user-1',
            nombre: 'Usuario Test',
            imagenPerfil: null,
            email: 'user@test.com',
          },
          ultimoMensaje: {
            id: 'msg-1',
            contenido: 'Hola',
            enviado_en: new Date(),
            autorUsuario: null,
            autorOrganizacion: { id: 'org-123', nombre: 'ONG Test' },
          },
        },
      ];

      mockPrismaService.chat.findMany.mockResolvedValue(mockChats);

      // Act
      const result = await service.getChatDeOrganizacion(organizacionId);

      // Assert
      expect(prisma.chat.findMany).toHaveBeenCalledWith({
        where: { organizacionId },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              imagenPerfil: true,
              email: true,
            },
          },
          ultimoMensaje: {
            select: {
              id: true,
              contenido: true,
              enviado_en: true,
              autorUsuario: {
                select: { id: true, nombre: true },
              },
              autorOrganizacion: {
                select: { id: true, nombre: true },
              },
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.chats[0].ultimoMensaje?.autor).toEqual({
        id: 'org-123',
        nombre: 'ONG Test',
        tipo: 'ONG ',
      });
    });
  });

  describe('getMensajesDeChat', () => {
    it('should return normalized messages with author information', async () => {
      // Arrange
      const chatId = 'chat-123';
      const mockMessages = [
        {
          id: 'msg-1',
          contenido: 'Hola',
          enviado_en: new Date(),
          autorUsuario: {
            id: 'user-1',
            nombre: 'Usuario',
            email: 'user@test.com',
            imagenPerfil: null,
          },
          autorOrganizacion: null,
        },
        {
          id: 'msg-2',
          contenido: 'Hola usuario',
          enviado_en: new Date(),
          autorUsuario: null,
          autorOrganizacion: {
            id: 'org-1',
            nombre: 'ONG',
            email: 'ong@test.com',
            imagenPerfil: null,
          },
        },
      ];

      mockPrismaService.mensaje.findMany.mockResolvedValue(mockMessages);

      // Act
      const result = await service.getMensajesDeChat(chatId);

      // Assert
      expect(prisma.mensaje.findMany).toHaveBeenCalledWith({
        where: { chatId },
        orderBy: { enviado_en: 'asc' },
        include: {
          autorUsuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              imagenPerfil: true,
            },
          },
          autorOrganizacion: {
            select: {
              id: true,
              nombre: true,
              email: true,
              imagenPerfil: true,
            },
          },
        },
      });

      expect(result.ok).toBe(true);
      expect(result.mensajes[0].autor?.tipo).toBe('USUARIO');
      expect(result.mensajes[1].autor?.tipo).toBe('ONG');
    });

    it('should handle messages without author', async () => {
      // Arrange
      const chatId = 'chat-123';
      const mockMessages = [
        {
          id: 'msg-1',
          contenido: 'Mensaje huérfano',
          enviado_en: new Date(),
          autorUsuario: null,
          autorOrganizacion: null,
        },
      ];

      mockPrismaService.mensaje.findMany.mockResolvedValue(mockMessages);

      // Act
      const result = await service.getMensajesDeChat(chatId);

      // Assert
      expect(result.ok).toBe(true);
      expect(result.mensajes[0].autor).toBeNull();
    });
  });

  describe('getChatPorId', () => {
    it('should return chat when found', async () => {
      // Arrange
      const chatId = 'chat-123';
      const mockChat = {
        id: chatId,
        usuarioId: 'user-123',
        organizacionId: 'org-123',
      };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);

      // Act
      const result = await service.getChatPorId(chatId);

      // Assert
      expect(prisma.chat.findUnique).toHaveBeenCalledWith({
        where: { id: chatId },
      });
      expect(result).toEqual(mockChat);
    });

    it('should throw NotFoundException when chat not found', async () => {
      // Arrange
      const chatId = 'nonexistent-chat';
      mockPrismaService.chat.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getChatPorId(chatId)).rejects.toThrow(
        new NotFoundException('Chat no encontrado')
      );
    });
  });

  describe('verificarAccesoAlChat', () => {
    it('should allow USUARIO access to their chat', async () => {
      // Arrange
      const chatId = 'chat-123';
      const usuarioToken = { id: 'user-123', tipo: 'USUARIO' };
      const mockChat = {
        id: chatId,
        usuarioId: 'user-123',
        organizacionId: 'org-123',
      };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);

      // Act
      const result = await service.verificarAccesoAlChat(chatId, usuarioToken);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should allow ONG access to their chat', async () => {
      // Arrange
      const chatId = 'chat-123';
      const usuarioToken = { id: 'org-123', tipo: 'ONG' };
      const mockChat = {
        id: chatId,
        usuarioId: 'user-123',
        organizacionId: 'org-123',
      };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);

      // Act
      const result = await service.verificarAccesoAlChat(chatId, usuarioToken);

      // Assert
      expect(result).toEqual(mockChat);
    });

    it('should throw ForbiddenException when user has no access', async () => {
      // Arrange
      const chatId = 'chat-123';
      const usuarioToken = { id: 'user-456', tipo: 'USUARIO' };
      const mockChat = {
        id: chatId,
        usuarioId: 'user-123',
        organizacionId: 'org-123',
      };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);

      // Act & Assert
      await expect(service.verificarAccesoAlChat(chatId, usuarioToken)).rejects.toThrow(
        new ForbiddenException('No tiene acceso a este chat')
      );
    });

    it('should throw NotFoundException when chat does not exist', async () => {
      // Arrange
      const chatId = 'nonexistent-chat';
      const usuarioToken = { id: 'user-123', tipo: 'USUARIO' };

      mockPrismaService.chat.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verificarAccesoAlChat(chatId, usuarioToken)).rejects.toThrow(
        new NotFoundException('Chat no encontrado')
      );
    });
  });

  describe('crearMensaje', () => {
    it('should create message from user', async () => {
      // Arrange
      const chatId = 'chat-123';
      const autorId = 'user-123';
      const contenido = 'Hola mundo';

      const mockChat = { id: chatId, usuarioId: 'user-123', organizacionId: 'org-123' };
      const mockUser = { id: 'user-123', nombre: 'Usuario Test' };
      const mockMessage = {
        id: 'msg-123',
        contenido,
        autorUsuario: {
          id: 'user-123',
          nombre: 'Usuario Test',
          email: 'user@test.com',
          imagenPerfil: null,
        },
        autorOrganizacion: null,
      };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.mensaje.create.mockResolvedValue(mockMessage);
      mockPrismaService.chat.update.mockResolvedValue({});

      // Act
      const result = await service.crearMensaje(chatId, autorId, contenido);

      // Assert
      expect(prisma.mensaje.create).toHaveBeenCalledWith({
        data: {
          contenido,
          chat: { connect: { id: chatId } },
          autorUsuario: { connect: { id: autorId } },
        },
        include: {
          autorUsuario: {
            select: { id: true, nombre: true, email: true, imagenPerfil: true },
          },
          autorOrganizacion: {
            select: { id: true, nombre: true, email: true, imagenPerfil: true },
          },
        },
      });

      expect(prisma.chat.update).toHaveBeenCalledWith({
        where: { id: chatId },
        data: { ultimoMensajeId: 'msg-123' },
      });

      expect(result.autor).toEqual(mockMessage.autorUsuario);
    });

    it('should create message from organization', async () => {
      // Arrange
      const chatId = 'chat-123';
      const autorId = 'org-123';
      const contenido = 'Hola usuario';

      const mockChat = { id: chatId, usuarioId: 'user-123', organizacionId: 'org-123' };
      const mockMessage = {
        id: 'msg-123',
        contenido,
        autorUsuario: null,
        autorOrganizacion: {
          id: 'org-123',
          nombre: 'ONG Test',
          email: 'ong@test.com',
          imagenPerfil: null,
        },
      };

      mockPrismaService.chat.findUnique.mockResolvedValue(mockChat);
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.mensaje.create.mockResolvedValue(mockMessage);
      mockPrismaService.chat.update.mockResolvedValue({});

      // Act
      const result = await service.crearMensaje(chatId, autorId, contenido);

      // Assert
      expect(prisma.mensaje.create).toHaveBeenCalledWith({
        data: {
          contenido,
          chat: { connect: { id: chatId } },
          autorOrganizacion: { connect: { id: autorId } },
        },
        include: {
          autorUsuario: {
            select: { id: true, nombre: true, email: true, imagenPerfil: true },
          },
          autorOrganizacion: {
            select: { id: true, nombre: true, email: true, imagenPerfil: true },
          },
        },
      });

      expect(result.autor).toEqual(mockMessage.autorOrganizacion);
    });
  });

  describe('getUsuariosConEstado', () => {
    it('should return users with connection status', async () => {
      // Arrange
      const nombre = 'test';
      const ongId = 'org-123';

      const mockDonadores = [{ usuarioId: 'user-1' }, { usuarioId: 'user-2' }];
      const mockSolicitudes = [{ usuarioId: 'user-2' }, { usuarioId: 'user-3' }];
      const mockUsuarios = [
        {
          id: 'user-1',
          nombre: 'Usuario 1',
          email: 'user1@test.com',
          imagenPerfil: null,
        },
        {
          id: 'user-2',
          nombre: 'Usuario Test',
          email: 'user2@test.com',
          imagenPerfil: null,
        },
      ];

      mockPrismaService.donacion.findMany.mockResolvedValue(mockDonadores);
      mockPrismaService.solicitudDeAdopcion.findMany.mockResolvedValue(mockSolicitudes);
      mockPrismaService.usuario.findMany.mockResolvedValue(mockUsuarios);
      mockConnectionService.isUserConnected.mockReturnValue(false);

      // Act
      const result = await service.getUsuariosConEstado(nombre, ongId);

      // Assert
      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['user-1', 'user-2', 'user-3'] },
          nombre: {
            contains: nombre,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          imagenPerfil: true,
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0].conectado).toBe(false);
    });

    it('should return empty array when no users found', async () => {
      // Arrange
      const ongId = 'org-123';

      mockPrismaService.donacion.findMany.mockResolvedValue([]);
      mockPrismaService.solicitudDeAdopcion.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getUsuariosConEstado(undefined, ongId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should filter null userIds', async () => {
      // Arrange
      const ongId = 'org-123';
      const mockDonadores = [{ usuarioId: 'user-1' }, { usuarioId: null }];

      mockPrismaService.donacion.findMany.mockResolvedValue(mockDonadores);
      mockPrismaService.solicitudDeAdopcion.findMany.mockResolvedValue([]);
      mockPrismaService.usuario.findMany.mockResolvedValue([]);

      // Act
      await service.getUsuariosConEstado(undefined, ongId);

      // Assert
      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['user-1'] },
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          imagenPerfil: true,
        },
      });
    });
  });

  describe('getOrganizacionesConEstado', () => {
    it('should return organizations with connection status', async () => {
      // Arrange
      const nombre = 'fundacion';
      const usuarioId = 'user-123';

      const mockDonaciones = [{ organizacionId: 'org-1' }];
      const mockSolicitudes = [
        {
          casoAdopcion: {
            caso: {
              ongId: 'org-2',
            },
          },
        },
      ];
      const mockOrganizaciones = [
        {
          id: 'org-1',
          nombre: 'Fundación Test',
          email: 'fundacion@test.com',
          imagenPerfil: null,
        },
      ];

      mockPrismaService.donacion.findMany.mockResolvedValue(mockDonaciones);
      mockPrismaService.solicitudDeAdopcion.findMany.mockResolvedValue(mockSolicitudes);
      mockPrismaService.organizacion.findMany.mockResolvedValue(mockOrganizaciones);
      mockConnectionService.isUserConnected.mockReturnValue(true);

      // Act
      const result = await service.getOrganizacionesConEstado(nombre, usuarioId);

      // Assert
      expect(prisma.organizacion.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['org-1', 'org-2'] },
          nombre: {
            contains: nombre,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          nombre: true,
          email: true,
          imagenPerfil: true,
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].conectado).toBe(true);
    });

    it('should return empty array when no organizations found', async () => {
      // Arrange
      const usuarioId = 'user-123';

      mockPrismaService.donacion.findMany.mockResolvedValue([]);
      mockPrismaService.solicitudDeAdopcion.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getOrganizacionesConEstado(undefined, usuarioId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle solicitudes with null caso', async () => {
      // Arrange
      const usuarioId = 'user-123';
      const mockSolicitudes = [
        {
          casoAdopcion: null,
        },
      ];

      mockPrismaService.donacion.findMany.mockResolvedValue([]);
      mockPrismaService.solicitudDeAdopcion.findMany.mockResolvedValue(mockSolicitudes);

      // Act
      const result = await service.getOrganizacionesConEstado(undefined, usuarioId);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
