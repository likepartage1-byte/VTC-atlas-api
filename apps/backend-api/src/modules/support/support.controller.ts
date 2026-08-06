import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('conversations')
  async getDriverConversations(@Query('driverId') driverId: string) {
    return this.supportService.getDriverConversations(driverId || 'default');
  }

  @Get('conversations/:id')
  async getConversationDetail(@Param('id') id: string) {
    return this.supportService.getConversationDetail(id);
  }

  @Post('conversations')
  async createConversation(@Body() dto: {
    driverId: string;
    driverName?: string;
    driverPhone?: string;
    language?: string;
    category?: string;
    initialMessage?: string;
    deviceInfo?: any;
    appVersion?: string;
    osVersion?: string;
  }) {
    return this.supportService.createConversation(dto);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: { senderType: 'DRIVER' | 'HUMAN_AGENT'; senderName?: string; content: string },
  ) {
    return this.supportService.sendMessage(id, dto);
  }

  @Post('conversations/:id/close')
  async closeConversation(@Param('id') id: string) {
    return this.supportService.closeConversation(id);
  }
}
