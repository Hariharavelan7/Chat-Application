import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { ChatService, Message } from '../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h3>Chat Application</h3>
        <div>
          Welcome, {{ currentUser?.name }}!
          <button 
            class="btn btn-secondary btn-sm ms-3" 
            (click)="logout()"
            style="cursor: pointer; padding: 0.5rem 1rem; background-color: #6c757d; color: white; border: none; border-radius: 4px;"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div class="d-flex flex-grow-1">
        <!-- User List -->
        <div class="user-list">
          <h5>Users</h5>
          <div *ngIf="users.length === 0" class="text-muted">Loading users...</div>
          <div
            *ngFor="let user of users"
            class="user-item"
            [class.active]="selectedUser?.id === user.id"
            (click)="selectUser(user)"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-bold">{{ user.name }}</div>
                <div class="small text-muted">{{ user.email }}</div>
              </div>
              <div *ngIf="unreadCounts[user.id] > 0" class="unread-badge">
                {{ unreadCounts[user.id] }}
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="flex-grow-1 d-flex flex-column">
          <div *ngIf="!selectedUser" class="d-flex align-items-center justify-content-center h-100">
            <div class="text-center text-muted">
              <h4>Select a user to start chatting</h4>
              <p>Choose someone from the user list to begin your conversation</p>
            </div>
          </div>

          <div *ngIf="selectedUser" class="d-flex flex-column h-100">
            <!-- Chat Header -->
            <div class="bg-light p-3 border-bottom">
              <h5 class="mb-0">Chatting with {{ selectedUser.name }}</h5>
              <small class="text-muted">{{ selectedUser.email }}</small>
            </div>

            <!-- Messages -->
            <div class="chat-messages" #messagesContainer>
              <div *ngIf="messages.length === 0" class="text-center text-muted">
                No messages yet. Start the conversation!
              </div>
              <div
                *ngFor="let message of messages"
                class="message"
                [class.sent]="message.senderId === currentUser?.id"
                [class.received]="message.senderId !== currentUser?.id"
              >
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time small text-muted">
                  {{ formatTime(message.createdAt) }}
                </div>
              </div>
            </div>

            <!-- Message Input -->
            <div class="message-input">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  placeholder="Type your message..."
                  [(ngModel)]="newMessage"
                  (keyup.enter)="sendMessage()"
                  [disabled]="!selectedUser"
                />
                <button
                  class="btn btn-primary"
                  type="button"
                  (click)="sendMessage()"
                  [disabled]="!newMessage.trim() || !selectedUser"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unread-badge {
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      min-width: 24px;
    }
    
    .user-item {
      padding: 12px;
      border-bottom: 1px solid #eee;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .user-item:hover {
      background-color: #f8f9fa;
    }
    
    .user-item.active {
      background-color: #e3f2fd;
      border-left: 3px solid #2196f3;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  users: User[] = [];
  selectedUser: User | null = null;
  messages: Message[] = [];
  newMessage = '';
  unreadCounts: { [senderId: number]: number } = {};
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      // Join chat
      this.chatService.joinChat(this.currentUser.id);
      
      // Set up socket listeners
      this.setupSocketListeners();
      
      // Load users (this will also restore last selected user)
      this.loadUsers();
      
      // Load unread counts
      this.loadUnreadCounts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.chatService.disconnect();
  }

  private loadUsers(): void {
    const sub = this.chatService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users.filter(user => user.id !== this.currentUser?.id);
        // After users are loaded, try to restore last selected user
        this.restoreLastSelectedUser();
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private loadUnreadCounts(): void {
    const sub = this.chatService.getUnreadCounts().subscribe({
      next: (counts) => {
        console.log('Loaded unread counts:', counts);
        this.unreadCounts = counts;
      },
      error: (error) => {
        console.error('Error loading unread counts:', error);
      }
    });
    this.subscriptions.push(sub);
  }

  private setupSocketListeners(): void {
    console.log('Setting up socket listeners for user:', this.currentUser?.id);
    
    // Listen for new messages (from other users)
    const newMessageSub = this.chatService.onNewMessage().subscribe((message: Message) => {
      console.log('Received new message:', message);
      if (this.selectedUser && 
          ((message.senderId === this.currentUser?.id && message.receiverId === this.selectedUser.id) ||
           (message.senderId === this.selectedUser.id && message.receiverId === this.currentUser?.id))) {
        console.log('Adding message to chat:', message);
        this.messages.push(message);
        this.scrollToBottom();
      }
      
      // Update unread counts when a new message arrives
      this.loadUnreadCounts();
    });
    this.subscriptions.push(newMessageSub);

    // Listen for message sent confirmation (our own messages)
    const messageSentSub = this.chatService.onMessageSent().subscribe((message: Message) => {
      console.log('Message sent confirmation:', message);
      if (this.selectedUser && 
          ((message.senderId === this.currentUser?.id && message.receiverId === this.selectedUser.id) ||
           (message.senderId === this.selectedUser.id && message.receiverId === this.currentUser?.id))) {
        console.log('Adding sent message to chat:', message);
        this.messages.push(message);
        this.scrollToBottom();
      }
    });
    this.subscriptions.push(messageSentSub);

    // Listen for messages response (when loading conversation history)
    const messagesSub = this.chatService.onMessages().subscribe((messages: Message[]) => {
      console.log('Received messages from socket:', messages);
      this.messages = messages;
      this.scrollToBottom();
    });
    this.subscriptions.push(messagesSub);

    // Listen for messages read notification
    const messagesReadSub = this.chatService.onMessagesRead().subscribe((data) => {
      console.log('Messages read notification:', data);
      
      // If the event includes updated unread counts, use them directly
      if (data.unreadCounts) {
        console.log('Updating unread counts from server:', data.unreadCounts);
        this.unreadCounts = data.unreadCounts;
      } else {
        // Fallback: only reload unread counts if we're not currently viewing this conversation
        // This prevents overriding our optimistic update when we're actively viewing the chat
        if (!this.selectedUser || this.selectedUser.id !== data.receiverId) {
          this.loadUnreadCounts();
        }
      }
    });
    this.subscriptions.push(messagesReadSub);

    // Listen for error messages
    const errorSub = this.chatService.onError().subscribe((error) => {
      console.error('Socket error:', error);
    });
    this.subscriptions.push(errorSub);
  }

  selectUser(user: User): void {
    console.log('Selecting user:', user);
    
    // If switching to a different user, reload unread counts to ensure accuracy
    if (this.selectedUser && this.selectedUser.id !== user.id) {
      this.loadUnreadCounts();
    }
    
    this.selectedUser = user;
    this.messages = [];
    this.newMessage = '';
    
    // Save selected user to sessionStorage
    sessionStorage.setItem('lastSelectedUserId', user.id.toString());
    
    if (this.currentUser) {
      console.log('Loading messages for conversation between', this.currentUser.id, 'and', user.id);
      this.loadMessagesForUser(user);
      
      // Mark messages as read when user opens the conversation
      this.chatService.markAsRead(user.id, this.currentUser.id);
      
      // Clear unread count for this user immediately (optimistic update)
      this.unreadCounts[user.id] = 0;
    }
  }

  private loadMessagesForUser(user: User): void {
    if (this.currentUser) {
      this.chatService.getMessagesFromSocket(this.currentUser.id, user.id);
    }
  }

  private restoreLastSelectedUser(): void {
    const lastSelectedUserId = sessionStorage.getItem('lastSelectedUserId');
    if (lastSelectedUserId && this.users.length > 0) {
      const user = this.users.find(u => u.id.toString() === lastSelectedUserId);
      if (user) {
        console.log('Restoring last selected user:', user);
        this.selectedUser = user;
        this.loadMessagesForUser(user);
      }
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedUser && this.currentUser) {
      console.log('Sending message:', {
        content: this.newMessage.trim(),
        senderId: this.currentUser.id,
        receiverId: this.selectedUser.id
      });
      this.chatService.sendMessage(
        this.newMessage.trim(),
        this.currentUser.id,
        this.selectedUser.id
      );
      this.newMessage = '';
    }
  }

  logout(): void {
    console.log('Logout button clicked');
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 100);
  }
}

