import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    getAllUsers(): Promise<import("../entities/user.entity").User[]>;
    getUnreadCounts(req: any): Promise<{
        [senderId: number]: number;
    }>;
    markMessagesAsRead(req: any, body: {
        senderId: number;
    }): Promise<{
        success: boolean;
    }>;
}
