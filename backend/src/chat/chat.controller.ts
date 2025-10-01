import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getAllUsers() {
    return this.chatService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-counts')
  async getUnreadCounts(@Request() req) {
    const userId = req.user.id;
    return this.chatService.getUnreadCounts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-read')
  async markMessagesAsRead(@Request() req, @Body() body: { senderId: number }) {
    const receiverId = req.user.id;
    const { senderId } = body;
    await this.chatService.markMessagesAsRead(senderId, receiverId);
    return { success: true };
  }
}

