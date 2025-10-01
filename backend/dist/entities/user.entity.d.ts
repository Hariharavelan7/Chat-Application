import { Message } from './message.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    sentMessages: Message[];
    receivedMessages: Message[];
}
