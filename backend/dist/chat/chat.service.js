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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../entities/message.entity");
const user_entity_1 = require("../entities/user.entity");
let ChatService = class ChatService {
    constructor(messageRepository, userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }
    async saveMessage(content, senderId, receiverId) {
        const message = this.messageRepository.create({
            content,
            senderId,
            receiverId,
        });
        return this.messageRepository.save(message);
    }
    async getMessages(userId1, userId2) {
        return this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)', { userId1, userId2 })
            .orderBy('message.createdAt', 'ASC')
            .getMany();
    }
    async getAllUsers() {
        return this.userRepository.find({
            select: ['id', 'email', 'name', 'createdAt'],
        });
    }
    async markMessagesAsRead(senderId, receiverId) {
        await this.messageRepository
            .createQueryBuilder()
            .update(message_entity_1.Message)
            .set({ isRead: true })
            .where('senderId = :senderId AND receiverId = :receiverId AND isRead = false', {
            senderId,
            receiverId,
        })
            .execute();
    }
    async getUnreadCounts(userId) {
        const unreadMessages = await this.messageRepository
            .createQueryBuilder('message')
            .select('message.senderId, COUNT(*) as count')
            .where('message.receiverId = :userId AND message.isRead = false', { userId })
            .groupBy('message.senderId')
            .getRawMany();
        const unreadCounts = {};
        unreadMessages.forEach((item) => {
            unreadCounts[item.senderId] = parseInt(item.count);
        });
        return unreadCounts;
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map