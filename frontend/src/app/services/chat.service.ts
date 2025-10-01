import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000';
  private socket: Socket;

  constructor(private http: HttpClient) {
    // Create a unique socket connection for each tab
    const sessionId = sessionStorage.getItem('sessionId') || 'default';
    this.socket = io('http://localhost:3000', {
      query: { sessionId }
    });
    
    // Add connection debugging
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id, 'Session:', sessionId);
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getMessages(userId1: number, userId2: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages/${userId1}/${userId2}`);
  }

  getUnreadCounts(): Observable<{ [senderId: number]: number }> {
    return this.http.get<{ [senderId: number]: number }>(`${this.apiUrl}/unread-counts`);
  }

  markMessagesAsRead(senderId: number): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/mark-read`, { senderId });
  }

  // Socket.IO methods
  joinChat(userId: number): void {
    this.socket.emit('join', { userId });
  }

  sendMessage(content: string, senderId: number, receiverId: number): void {
    this.socket.emit('sendMessage', { content, senderId, receiverId });
  }

  onNewMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('newMessage', (message: Message) => {
        console.log('Socket received newMessage:', message);
        observer.next(message);
      });
    });
  }

  onMessageSent(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('messageSent', (message: Message) => {
        console.log('Socket received messageSent:', message);
        observer.next(message);
      });
    });
  }

  onMessages(): Observable<Message[]> {
    return new Observable(observer => {
      this.socket.on('messages', (messages: Message[]) => {
        observer.next(messages);
      });
    });
  }

  onError(): Observable<{ message: string }> {
    return new Observable(observer => {
      this.socket.on('error', (error: { message: string }) => {
        observer.next(error);
      });
    });
  }

  getMessagesFromSocket(userId1: number, userId2: number): void {
    this.socket.emit('getMessages', { userId1, userId2 });
  }

  markAsRead(senderId: number, receiverId: number): void {
    this.socket.emit('markAsRead', { senderId, receiverId });
  }

  onMessagesRead(): Observable<{ receiverId: number }> {
    return new Observable(observer => {
      this.socket.on('messagesRead', (data: { receiverId: number }) => {
        console.log('Socket received messagesRead:', data);
        observer.next(data);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}

