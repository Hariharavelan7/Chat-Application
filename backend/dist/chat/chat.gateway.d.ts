import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    server: Server;
    private connectedUsers;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoin(data: {
        userId: number;
    }, client: Socket): Promise<void>;
    handleMessage(data: {
        content: string;
        senderId: number;
        receiverId: number;
    }, client: Socket): Promise<void>;
    handleGetMessages(data: {
        userId1: number;
        userId2: number;
    }, client: Socket): Promise<void>;
    handleMarkAsRead(data: {
        senderId: number;
        receiverId: number;
    }, client: Socket): Promise<void>;
}
