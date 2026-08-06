import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { queryKnowledgeBase, HANDOFF_TRANSFER_NOTICE } from './knowledge-base';

// In-Memory store for fast demo & fallback if DB Prisma model is migrating
interface LocalMessage {
  id: string;
  conversationId: string;
  senderType: 'DRIVER' | 'AI' | 'HUMAN_AGENT';
  senderName?: string;
  content: string;
  isSystemNotice?: boolean;
  createdAt: string;
}

export interface LocalConversation {
  id: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  language: string;
  status: 'AI_ACTIVE' | 'WAITING_HUMAN' | 'HUMAN_RESPONDED' | 'CLOSED';
  category?: string;
  subject?: string;
  deviceInfo?: any;
  appVersion?: string;
  osVersion?: string;
  lastMessageText: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages: LocalMessage[];
}

@Injectable()
export class SupportService {
  private conversationsMap = new Map<string, LocalConversation>();

  constructor() {
    // Seed dummy conversation if empty for testing
    this.seedInitialData();
  }

  private seedInitialData() {
    const demoId = 'conv-demo-101';
    this.conversationsMap.set(demoId, {
      id: demoId,
      driverId: 'drv-default-1',
      driverName: 'خالد (Driver)',
      driverPhone: '+212600000000',
      language: 'ar',
      status: 'AI_ACTIVE',
      category: 'GENERAL',
      subject: 'استفسار عن طريقة شحن المحفظة',
      deviceInfo: { brand: 'OPPO', model: 'CPH2531' },
      appVersion: '1.4.2',
      osVersion: 'Android 14',
      lastMessageText: 'أهلاً بك! كيف يمكنني مساعدتك اليوم بخصوص Yalla VTC؟',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-1',
          conversationId: demoId,
          senderType: 'AI',
          senderName: 'مساعد Yalla VTC الذكي',
          content: 'أهلاً بك! أنا مساعد Yalla VTC الذكي. كيف يمكنني مساعدتك اليوم؟',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    });
  }

  /**
   * Get all conversations for a driver
   */
  async getDriverConversations(driverId: string) {
    const list: LocalConversation[] = [];
    for (const conv of this.conversationsMap.values()) {
      if (conv.driverId === driverId || driverId === 'default' || driverId === 'drv-default-1') {
        list.push(conv);
      }
    }
    return list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  /**
   * Get single conversation details with full transcript
   */
  async getConversationDetail(convId: string) {
    const conv = this.conversationsMap.get(convId);
    if (!conv) {
      throw new NotFoundException('المحادثة غير موجودة');
    }
    return conv;
  }

  /**
   * Create a new support conversation
   */
  async createConversation(dto: {
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
    const convId = 'conv-' + Date.now();
    const lang = (dto.language || 'ar').slice(0, 2);
    const driverName = dto.driverName || 'سائق Yalla VTC';

    const newConv: LocalConversation = {
      id: convId,
      driverId: dto.driverId || 'drv-default-1',
      driverName: driverName,
      driverPhone: dto.driverPhone || '+212600000000',
      language: lang,
      status: 'AI_ACTIVE',
      category: dto.category || 'GENERAL',
      subject: dto.initialMessage ? dto.initialMessage.slice(0, 40) : 'محادثة دعم جديدة',
      deviceInfo: dto.deviceInfo || { os: 'Android' },
      appVersion: dto.appVersion || '1.4.2',
      osVersion: dto.osVersion || 'Android 14',
      lastMessageText: '',
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    // Welcome greeting
    const welcomeText = lang === 'fr'
      ? "Bonjour ! Je suis l'assistant IA de Yalla VTC. Comment puis-je vous aider aujourd'hui ?"
      : lang === 'en'
      ? "Hello! I am the Yalla VTC AI Assistant. How can I help you today?"
      : lang === 'es'
      ? "¡Hola! Soy el asistente IA de Yalla VTC. ¿Cómo puedo ayudarte hoy?"
      : "أهلاً بك! أنا مساعد Yalla VTC الذكي. كيف يمكنني مساعدتك اليوم؟";

    newConv.messages.push({
      id: 'msg-init-' + Date.now(),
      conversationId: convId,
      senderType: 'AI',
      senderName: lang === 'fr' ? 'Assistant IA Yalla VTC' : 'مساعد Yalla VTC الذكي',
      content: welcomeText,
      createdAt: new Date().toISOString(),
    });

    newConv.lastMessageText = welcomeText;
    this.conversationsMap.set(convId, newConv);

    // If driver sent an initial message
    if (dto.initialMessage && dto.initialMessage.trim().length > 0) {
      await this.sendMessage(convId, {
        senderType: 'DRIVER',
        senderName: driverName,
        content: dto.initialMessage,
      });
    }

    return this.conversationsMap.get(convId);
  }

  /**
   * Send message in a conversation and process via AI/Human Support Engine
   */
  async sendMessage(convId: string, dto: {
    senderType: 'DRIVER' | 'HUMAN_AGENT';
    senderName?: string;
    content: string;
  }) {
    const conv = this.conversationsMap.get(convId);
    if (!conv) {
      throw new NotFoundException('المحادثة غير موجودة');
    }

    const nowIso = new Date().toISOString();

    // 1. Save Driver/Agent message
    const userMsg: LocalMessage = {
      id: 'msg-' + Date.now(),
      conversationId: convId,
      senderType: dto.senderType,
      senderName: dto.senderName || (dto.senderType === 'HUMAN_AGENT' ? 'فريق الدعم الفني' : conv.driverName),
      content: dto.content,
      createdAt: nowIso,
    };
    conv.messages.push(userMsg);
    conv.lastMessageText = dto.content;
    conv.lastMessageAt = nowIso;
    conv.updatedAt = nowIso;

    // 2. If Human Agent replied -> update status to HUMAN_RESPONDED
    if (dto.senderType === 'HUMAN_AGENT') {
      conv.status = 'HUMAN_RESPONDED';
      this.conversationsMap.set(convId, conv);
      return { conversation: conv, aiReplied: false };
    }

    // 3. If driver sent a message AND conversation is already WAITING_HUMAN -> AI is blocked
    if (conv.status === 'WAITING_HUMAN') {
      this.conversationsMap.set(convId, conv);
      return { conversation: conv, aiReplied: false, notice: 'بانتظار رد خدمة العملاء' };
    }

    // 4. Otherwise conversation is AI_ACTIVE -> Process query with AI Engine
    const result = queryKnowledgeBase(dto.content, conv.language);

    if (result.type === 'SENSITIVE' || result.type === 'UNKNOWN') {
      // AI Handoff to Human Agent
      conv.status = 'WAITING_HUMAN';
      if (result.category) conv.category = result.category;

      const aiHandoffMsg: LocalMessage = {
        id: 'msg-ai-handoff-' + Date.now(),
        conversationId: convId,
        senderType: 'AI',
        senderName: conv.language === 'fr' ? 'Assistant IA Yalla VTC' : 'مساعد Yalla VTC الذكي',
        content: result.responseText,
        isSystemNotice: true,
        createdAt: new Date(Date.now() + 200).toISOString(),
      };

      conv.messages.push(aiHandoffMsg);
      conv.lastMessageText = result.responseText;
      conv.lastMessageAt = aiHandoffMsg.createdAt;
      this.conversationsMap.set(convId, conv);

      console.log(`[AI SUPPORT HANDOFF] Conv ${convId} transferred to human support. Reason: ${result.type}`);

      return {
        conversation: conv,
        aiReplied: true,
        transferredToHuman: true,
        reason: result.type,
      };
    }

    // AI Found Answer in KB -> Respond directly
    const aiRespMsg: LocalMessage = {
      id: 'msg-ai-' + Date.now(),
      conversationId: convId,
      senderType: 'AI',
      senderName: conv.language === 'fr' ? 'Assistant IA Yalla VTC' : 'مساعد Yalla VTC الذكي',
      content: result.responseText,
      createdAt: new Date(Date.now() + 200).toISOString(),
    };

    conv.messages.push(aiRespMsg);
    conv.lastMessageText = result.responseText;
    conv.lastMessageAt = aiRespMsg.createdAt;
    this.conversationsMap.set(convId, conv);

    return {
      conversation: conv,
      aiReplied: true,
      transferredToHuman: false,
    };
  }

  /**
   * Admin endpoints: Close conversation
   */
  async closeConversation(convId: string) {
    const conv = this.conversationsMap.get(convId);
    if (conv) {
      conv.status = 'CLOSED';
      conv.updatedAt = new Date().toISOString();
      this.conversationsMap.set(convId, conv);
    }
    return conv;
  }
}
