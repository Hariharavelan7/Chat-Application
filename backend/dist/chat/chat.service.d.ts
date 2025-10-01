import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
export declare class ChatService {
    private messageRepository;
    private userRepository;
    constructor(messageRepository: Repository<Message>, userRepository: Repository<User>);
    saveMessage(content: string, senderId: number, receiverId: number): Promise<Message>;
    getMessages(userId1: number, userId2: number): Promise<Message[]>;
    getAllUsers(): Promise<User[]>;
    markMessagesAsRead(senderId: number, receiverId: number): Promise<void>;
    getUnreadCounts(userId: number): Promise<{
        [senderId: number]: number;
    }>;
}
