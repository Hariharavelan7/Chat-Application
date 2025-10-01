import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async saveMessage(content: string, senderId: number, receiverId: number): Promise<Message> {
    const message = this.messageRepository.create({
      content,
      senderId,
      receiverId,
    });

    return this.messageRepository.save(message);
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId1 AND message.receiverId = :userId2) OR (message.senderId = :userId2 AND message.receiverId = :userId1)',
        { userId1, userId2 },
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'email', 'name', 'createdAt'],
    });
  }

  async markMessagesAsRead(senderId: number, receiverId: number): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('senderId = :senderId AND receiverId = :receiverId AND isRead = false', {
        senderId,
        receiverId,
      })
      .execute();
  }

  async getUnreadCounts(userId: number): Promise<{ [senderId: number]: number }> {
    const unreadMessages = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.senderId, COUNT(*) as count')
      .where('message.receiverId = :userId AND message.isRead = false', { userId })
      .groupBy('message.senderId')
      .getRawMany();

    const unreadCounts: { [senderId: number]: number } = {};
    unreadMessages.forEach((item) => {
      unreadCounts[item.senderId] = parseInt(item.count);
    });

    return unreadCounts;
  }
}

