"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        console.log('Client connected:', client.id);
    }
    handleDisconnect(client) {
        console.log('Client disconnected:', client.id);
        for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === client.id) {
                this.connectedUsers.delete(userId);
                break;
            }
        }
    }
    async handleJoin(data, client) {
        this.connectedUsers.set(data.userId, client.id);
        console.log(`User ${data.userId} joined chat`);
    }
    async handleMessage(data, client) {
        try {
            console.log('Received message:', data);
            const message = await this.chatService.saveMessage(data.content, data.senderId, data.receiverId);
            console.log('Message saved to database:', message);
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            console.log('Receiver socket ID:', receiverSocketId);
            console.log('Connected users:', this.connectedUsers);
            if (receiverSocketId) {
                console.log('Sending message to receiver:', receiverSocketId);
                this.server.to(receiverSocketId).emit('newMessage', {
                    id: message.id,
                    content: message.content,
                    senderId: message.senderId,
                    receiverId: message.receiverId,
                    createdAt: message.createdAt,
                });
            }
            else {
                console.log('Receiver not connected');
            }
            console.log('Sending confirmation to sender:', client.id);
            client.emit('messageSent', {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                createdAt: message.createdAt,
            });
        }
        catch (error) {
            console.error('Error sending message:', error);
            client.emit('error', { message: 'Failed to send message' });
        }
    }
    async handleGetMessages(data, client) {
        try {
            const messages = await this.chatService.getMessages(data.userId1, data.userId2);
            await this.chatService.markMessagesAsRead(data.userId2, data.userId1);
            client.emit('messages', messages);
        }
        catch (error) {
            client.emit('error', { message: 'Failed to get messages' });
        }
    }
    async handleMarkAsRead(data, client) {
        try {
            await this.chatService.markMessagesAsRead(data.senderId, data.receiverId);
            const senderSocketId = this.connectedUsers.get(data.senderId);
            if (senderSocketId) {
                this.server.to(senderSocketId).emit('messagesRead', {
                    receiverId: data.receiverId,
                });
            }
        }
        catch (error) {
            console.error('Error marking messages as read:', error);
            client.emit('error', { message: 'Failed to mark messages as read' });
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('getMessages'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetMessages", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkAsRead", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: 'http://localhost:4200',
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map