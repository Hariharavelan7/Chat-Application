import { User } from './user.entity';
export declare class Message {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    isRead: boolean;
    createdAt: Date;
    sender: User;
    receiver: User;
}
