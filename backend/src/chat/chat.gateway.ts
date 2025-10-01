import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>();

  constructor(private chatService: ChatService) {}

  async handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Remove user from connected users map
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.connectedUsers.set(data.userId, client.id);
    console.log(`User ${data.userId} joined chat`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { content: string; senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('Received message:', data);
      
      // Save message to database
      const message = await this.chatService.saveMessage(
        data.content,
        data.senderId,
        data.receiverId,
      );

      console.log('Message saved to database:', message);

      // Get receiver's socket ID
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      console.log('Receiver socket ID:', receiverSocketId);
      console.log('Connected users:', this.connectedUsers);
      
      if (receiverSocketId) {
        // Send message to receiver
        console.log('Sending message to receiver:', receiverSocketId);
        this.server.to(receiverSocketId).emit('newMessage', {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          createdAt: message.createdAt,
        });
      } else {
        console.log('Receiver not connected');
      }

      // Send confirmation back to sender
      console.log('Sending confirmation to sender:', client.id);
      client.emit('messageSent', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        createdAt: message.createdAt,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() data: { userId1: number; userId2: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const messages = await this.chatService.getMessages(data.userId1, data.userId2);
      
      // Mark messages as read when user opens the conversation
      await this.chatService.markMessagesAsRead(data.userId2, data.userId1);
      
      client.emit('messages', messages);
    } catch (error) {
      client.emit('error', { message: 'Failed to get messages' });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.markMessagesAsRead(data.senderId, data.receiverId);
      
      // Get updated unread counts for the sender
      const senderUnreadCounts = await this.chatService.getUnreadCounts(data.senderId);
      
      // Notify the sender that their messages have been read with updated counts
      const senderSocketId = this.connectedUsers.get(data.senderId);
      if (senderSocketId) {
        this.server.to(senderSocketId).emit('messagesRead', {
          receiverId: data.receiverId,
          unreadCounts: senderUnreadCounts,
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      client.emit('error', { message: 'Failed to mark messages as read' });
    }
  }
}

