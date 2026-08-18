import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Bot,
  User,
  Headphones,
  Clock,
  Lock,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { pick, types } from 'react-native-document-picker';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';

// ─── Multilingual Dictionary ──────────────────────────────────────────────────
const TRANSLATIONS: any = {
  ar: {
    title: 'مركز الدعم الذكي',
    subtitle_ai: 'مساعد Yalla VTC الذكي (AI)',
    subtitle_waiting: 'بانتظار رد خدمة العملاء 🟡',
    subtitle_human: 'خدمة العملاء مباشرة 🎧',
    subtitle_closed: 'محادثة مغلقة 🔴',
    type_message_placeholder: 'اكتب سؤالك هنا...',
    send_btn: 'إرسال',
    waiting_notice: 'تم تحويل المحادثة إلى أحد ممثلي خدمة العملاء. سيتم الرد عليك في أقرب وقت دون الحاجة لإعادة إرسال رسالتك.',
    closed_notice: 'تم إغلاق هذه المحادثة. يمكنك بدء محادثة جديدة في أي وقت.',
    suggested_prompts_title: 'الأسئلة السريعة الافتراضية:',
    prompt_docs: '📄 رفع الوثائق',
    prompt_wallet: '💰 شحن المحفظة',
    prompt_rides: '🚗 طلبات المدينة',
    prompt_commission: '% اقتطاع العمولة',
    prompt_tiers: '💎 مستويات السائق',
    prompt_cargo: '📦 الشحن والنقل',
    prompt_intercity: '🗺️ رحلات المدن',
    prompt_vehicle: '🚘 معلومات المركبة',
    prompt_rejection: 'سبب رفض وثيقتي',
  },
  fr: {
    title: 'Centre de Support IA',
    subtitle_ai: 'Assistant IA Yalla VTC',
    subtitle_waiting: 'En attente du service client 🟡',
    subtitle_human: 'Support Client Direct 🎧',
    subtitle_closed: 'Conversation Fermée 🔴',
    type_message_placeholder: 'Posez votre question ici...',
    send_btn: 'Envoyer',
    waiting_notice: 'Votre demande a été transférée au service client. Un agent vous répondra sous peu.',
    closed_notice: 'Cette conversation est fermée. Vous pouvez en démarrer une nouvelle.',
    suggested_prompts_title: 'Questions rapides suggérées :',
    prompt_docs: '📄 Envoyer les documents',
    prompt_wallet: '💰 Recharger le solde',
    prompt_rides: '🚗 Courses en ville',
    prompt_commission: '% Commission',
    prompt_tiers: '💎 Niveaux Chauffeur',
    prompt_cargo: '📦 Fret & Transport',
    prompt_intercity: '🗺️ Intervilles',
    prompt_vehicle: 'Mon Véhicule',
    prompt_rejection: 'Motif de refus document',
  },
  en: {
    title: 'AI Support Center',
    subtitle_ai: 'Yalla VTC AI Assistant',
    subtitle_waiting: 'Awaiting Customer Support 🟡',
    subtitle_human: 'Live Customer Support 🎧',
    subtitle_closed: 'Conversation Closed 🔴',
    type_message_placeholder: 'Type your question here...',
    send_btn: 'Send',
    waiting_notice: 'Your message has been transferred to customer support. An agent will reply shortly.',
    closed_notice: 'This conversation is closed. You can start a new one anytime.',
    suggested_prompts_title: 'Quick suggested questions:',
    prompt_docs: '📄 Upload Documents',
    prompt_wallet: '💰 Wallet Top-Up',
    prompt_rides: '🚗 City Rides',
    prompt_commission: '% Commission Rate',
    prompt_tiers: '💎 Driver Tiers',
    prompt_cargo: '📦 Cargo & Freight',
    prompt_intercity: '🗺️ Intercity Trips',
    prompt_vehicle: '🚘 My Vehicle',
    prompt_rejection: 'Document Rejection Reason',
  },
  es: {
    title: 'Centro de Soporte IA',
    subtitle_ai: 'Asistente IA Yalla VTC',
    subtitle_waiting: 'Esperando Atención al Cliente 🟡',
    subtitle_human: 'Soporte En Vivo 🎧',
    subtitle_closed: 'Conversación Cerrada 🔴',
    type_message_placeholder: 'Escriba su pregunta aquí...',
    send_btn: 'Enviar',
    waiting_notice: 'Su solicitud ha sido transferida a atención al cliente. Le responderemos pronto.',
    closed_notice: 'Esta conversación está cerrada. Puede iniciar una nueva.',
    suggested_prompts_title: 'Preguntas sugeridas:',
    prompt_docs: '📄 Subir Documentos',
    prompt_wallet: '💰 Recargar Monedero',
    prompt_rides: '🚗 Viajes de Ciudad',
    prompt_commission: '% Comisión',
    prompt_tiers: '💎 Niveles de Chófer',
    prompt_cargo: '📦 Carga y Transporte',
    prompt_intercity: '🗺️ Interurbano',
    prompt_vehicle: '🚘 Mi Vehículo',
    prompt_rejection: 'Motivo de rechazo',
  },
};

const getTr = (key: string, lang: string) =>
  TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['ar']?.[key] ?? key;

export interface MessageItem {
  id: string;
  senderType: 'DRIVER' | 'AI' | 'HUMAN_AGENT';
  senderName?: string;
  content: string;
  isSystemNotice?: boolean;
  createdAt: string;
}

export const SupportChatScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();

  const isRTL = i18n.language === 'ar';
  const lang = (i18n.language || 'ar').slice(0, 2);
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight ?? 0);

  const conversationIdParam = route.params?.conversationId;
  const initialCategoryParam = route.params?.category;

  const [conversationId, setConversationId] = useState<string | null>(conversationIdParam || null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [status, setStatus] = useState<'AI_ACTIVE' | 'WAITING_HUMAN' | 'HUMAN_RESPONDED' | 'CLOSED'>('AI_ACTIVE');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');

  const scrollViewRef = useRef<ScrollView>(null);

  // Suggested prompts
  const PROMPTS = [
    getTr('prompt_docs', lang),
    getTr('prompt_wallet', lang),
    getTr('prompt_rides', lang),
    getTr('prompt_commission', lang),
    getTr('prompt_tiers', lang),
    getTr('prompt_cargo', lang),
    getTr('prompt_intercity', lang),
    getTr('prompt_vehicle', lang),
    getTr('prompt_rejection', lang),
  ];

  // Fetch or create conversation
  const loadConversation = useCallback(async () => {
    try {
      if (conversationId) {
        const res = await api.get(`/support/conversations/${conversationId}`);
        if (res.data) {
          setMessages(res.data.messages || []);
          setStatus(res.data.status || 'AI_ACTIVE');
        }
      } else {
        // Create new conversation
        const res = await api.post('/support/conversations', {
          driverId: 'drv-default-1',
          language: lang,
          category: initialCategoryParam || 'GENERAL',
        });
        if (res.data) {
          setConversationId(res.data.id);
          setMessages(res.data.messages || []);
          setStatus(res.data.status || 'AI_ACTIVE');
        }
      }
    } catch (err) {
      console.log('[SupportChat] Error loading conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, initialCategoryParam, lang]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message handler
  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || sending) return;

    setInputText('');
    setSending(true);

    // Optimistic local add
    const tempDriverMsg: MessageItem = {
      id: 'temp-' + Date.now(),
      senderType: 'DRIVER',
      senderName: 'أنت',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempDriverMsg]);
    scrollToBottom();

    try {
      let activeConvId = conversationId;
      if (!activeConvId) {
        const createRes = await api.post('/support/conversations', {
          driverId: 'drv-default-1',
          language: lang,
          category: initialCategoryParam || 'GENERAL',
          initialMessage: text,
        });
        activeConvId = createRes.data.id;
        setConversationId(activeConvId);
        setMessages(createRes.data.messages || []);
        setStatus(createRes.data.status || 'AI_ACTIVE');
        setSending(false);
        return;
      }

      const res = await api.post(`/support/conversations/${activeConvId}/messages`, {
        senderType: 'DRIVER',
        content: text,
      });

      if (res.data?.conversation) {
        setMessages(res.data.conversation.messages || []);
        setStatus(res.data.conversation.status || 'AI_ACTIVE');
      }
    } catch (err) {
      console.log('[SupportChat] Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle photo selection from gallery
  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'صورة_مرفقة.jpg';
        handleSend(`📷 [${lang === 'fr' ? 'Photo jointe' : lang === 'en' ? 'Attached Photo' : 'صورة مرفقة'}]: ${fileName}`);
      }
    } catch (err) {
      console.log('[SupportChat] Image picker error:', err);
    }
  };

  // Handle document selection
  const handlePickDocument = async () => {
    try {
      const res = await pick({
        type: [types.pdf, types.images, types.docx],
      });

      if (res && res[0]) {
        const doc = res[0];
        const docName = doc.name || 'مستند_مرفق.pdf';
        handleSend(`📎 [${lang === 'fr' ? 'Document joint' : lang === 'en' ? 'Attached Document' : 'مستند مرفق'}]: ${docName}`);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.log('[SupportChat] Document picker error:', err);
      }
    }
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  // ── Status Strip config ──────────────────────────────────────────────────
  const getStatusConfig = () => {
    if (status === 'WAITING_HUMAN') return {
      dot: '🟡',
      bg: 'rgba(245,158,11,0.13)',
      border: '#F59E0B',
      color: '#D97706',
      icon: <Clock size={15} color="#D97706" />,
      label: lang === 'fr' ? 'En attente du service client — vos messages sont transmis à l\'équipe de support.'
           : lang === 'en' ? 'Awaiting customer support — your messages are saved for the agent.'
           : lang === 'es' ? 'Esperando atención — sus mensajes están guardados para el agente.'
           : 'بانتظار خدمة العملاء — رسائلك محفوظة وسيطلع عليها الموظف عند الرد.',
    };
    if (status === 'HUMAN_RESPONDED') return {
      dot: '🔵',
      bg: 'rgba(59,130,246,0.12)',
      border: '#3B82F6',
      color: '#2563EB',
      icon: <Headphones size={15} color="#2563EB" />,
      label: lang === 'fr' ? 'Un conseiller client vous répond maintenant — conversation directe.'
           : lang === 'en' ? 'A support agent is now chatting with you — live conversation.'
           : lang === 'es' ? 'Un agente de soporte está hablando con usted ahora.'
           : 'يتحدث معك الآن أحد موظفي خدمة العملاء — محادثة مباشرة.',
    };
    if (status === 'CLOSED') return {
      dot: '🔴',
      bg: 'rgba(239,68,68,0.10)',
      border: '#EF4444',
      color: '#DC2626',
      icon: <Lock size={15} color="#DC2626" />,
      label: lang === 'fr' ? 'Conversation fermée. Démarrez-en une nouvelle depuis le centre d\'aide.'
           : lang === 'en' ? 'Conversation closed. Start a new one from the Help Center.'
           : lang === 'es' ? 'Conversación cerrada. Inicie una nueva desde el centro de ayuda.'
           : 'تم إغلاق المحادثة. يمكنك بدء محادثة جديدة من مركز المساعدة.',
    };
    // AI_ACTIVE
    return {
      dot: '🟢',
      bg: 'rgba(34,197,94,0.10)',
      border: '#22C55E',
      color: '#16A34A',
      icon: <Bot size={15} color="#16A34A" />,
      label: lang === 'fr' ? 'Assistant IA actif — réponses automatiques instantanées.'
           : lang === 'en' ? 'AI Assistant active — instant automatic replies.'
           : lang === 'es' ? 'Asistente IA activo — respuestas automáticas instantáneas.'
           : 'المساعد الذكي متصل — يرد على أسئلتك تلقائياً وفوراً.',
    };
  };

  const statusCfg = getStatusConfig();

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* ── Clean Header Bar ─────────────────────────────────────── */}
      <View style={[
        styles.header,
        { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: topPadding },
        isRTL && styles.headerRTL,
      ]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Chevron size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              {getTr('title', lang)}
            </Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>



      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {/* Messages ScrollView */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatScroll}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => {
              const isDriver = msg.senderType === 'DRIVER';
              const isAI = msg.senderType === 'AI';
              const isHumanAgent = msg.senderType === 'HUMAN_AGENT';

              if (msg.isSystemNotice) {
                return (
                  <View key={msg.id} style={[styles.handoffCard, { backgroundColor: colors.surfaceAlt, borderColor: '#F59E0B' }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Headphones size={18} color="#F59E0B" />
                      <Text style={[styles.handoffTitle, { color: '#F59E0B' }]}>
                        {isRTL ? 'تحويل إلى خدمة العملاء 🎧' : 'Transferred to Customer Support 🎧'}
                      </Text>
                    </View>
                    <Text style={[styles.handoffBody, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {msg.content}
                    </Text>
                  </View>
                );
              }

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.msgRow,
                    isDriver ? styles.msgRowDriver : styles.msgRowOther,
                    isRTL && (isDriver ? { flexDirection: 'row-reverse' } : { flexDirection: 'row' }),
                  ]}
                >
                  {/* Sender Avatar */}
                  <View style={[
                    styles.msgAvatar,
                    isDriver
                      ? { backgroundColor: colors.primary }
                      : isHumanAgent
                      ? { backgroundColor: '#22C55E' }
                      : { backgroundColor: colors.surfaceAlt },
                  ]}>
                    {isDriver ? (
                      <User size={16} color="#FFF" />
                    ) : isHumanAgent ? (
                      <Headphones size={16} color="#FFF" />
                    ) : (
                      <Bot size={16} color={colors.primary} />
                    )}
                  </View>

                  {/* Bubble */}
                  <View style={[
                    styles.bubble,
                    isDriver
                      ? [styles.bubbleDriver, { backgroundColor: colors.primary }]
                      : isHumanAgent
                      ? [styles.bubbleHuman, { backgroundColor: colors.surface, borderColor: '#22C55E' }]
                      : [styles.bubbleAI, { backgroundColor: colors.surface, borderColor: colors.border }],
                  ]}>
                    {!isDriver && (
                      <Text style={[styles.senderName, { color: isHumanAgent ? '#22C55E' : colors.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {isHumanAgent ? '🎧 خدمة العملاء' : '🤖 مساعد Yalla VTC الذكي'}
                      </Text>
                    )}
                    <Text style={[
                      styles.msgText,
                      { color: isDriver ? '#FFFFFF' : colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                    ]}>
                      {msg.content}
                    </Text>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: isRTL ? 'flex-start' : 'flex-end', gap: 4, marginTop: 4 }]}>
                      <Text style={[
                        styles.msgTime,
                        { color: isDriver ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                      ]}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {isDriver && (
                        <Text style={{ fontSize: 10, color: status === 'HUMAN_RESPONDED' ? '#60A5FA' : 'rgba(255,255,255,0.85)' }}>
                          {status === 'HUMAN_RESPONDED' ? '👁' : status === 'WAITING_HUMAN' ? '✔✔' : '✔'}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* ── Handoff Info Card inside Chat Stream (WAITING_HUMAN) ─── */}
            {status === 'WAITING_HUMAN' && (
              <View style={[styles.infoBannerCard, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFBEB', borderColor: '#F59E0B' }]}>
                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[styles.infoIconBg, { backgroundColor: '#F59E0B' }]}>
                    <Headphones size={18} color="#FFF" />
                  </View>
                  <Text style={[styles.infoBannerTitle, { color: isDarkMode ? '#FBBF24' : '#B45309', textAlign: isRTL ? 'right' : 'left' }]}>
                    {lang === 'fr' ? 'Transféré au Service Client 🎧' : lang === 'en' ? 'Transferred to Customer Support 🎧' : lang === 'es' ? 'Transferido a Soporte 🎧' : 'تم تحويل محادثتك إلى فريق خدمة العملاء 🎧'}
                  </Text>
                </View>

                <Text style={[styles.infoBannerBody, { color: isDarkMode ? '#E2E8F0' : '#451A03', textAlign: isRTL ? 'right' : 'left' }]}>
                  {lang === 'fr'
                    ? 'Vous pouvez envoyer des détails ou documents supplémentaires. Le conseiller les consultera dès réception.'
                    : lang === 'en'
                    ? 'You can continue sending extra details or documents. The support agent will view them upon replying.'
                    : lang === 'es'
                    ? 'Puede seguir enviando detalles o documentos. El agente los verá al responder.'
                    : 'يمكنك متابعة إرسال أي تفاصيل أو مستندات إضافية، وسيطلع عليها موظف الدعم فور استلام المحادثة.'}
                </Text>

                <View style={[styles.expectedTimeBadge, { backgroundColor: 'rgba(245,158,11,0.18)' }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Clock size={14} color="#D97706" />
                  <Text style={[styles.expectedTimeText, { color: '#B45309' }]}>
                    {lang === 'fr' ? 'Temps de réponse estimé : < 15 min' : lang === 'en' ? 'Expected response time: < 15 min' : lang === 'es' ? 'Tiempo estimado: < 15 min' : '⏱️ وقت الرد المتوقع: أقل من 15 دقيقة'}
                  </Text>
                </View>
              </View>
            )}

            {sending && (
              <View style={[styles.msgRow, styles.msgRowOther, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={[styles.msgAvatar, { backgroundColor: colors.surfaceAlt }]}>
                  <Bot size={16} color={colors.primary} />
                </View>
                <View style={[styles.bubble, styles.bubbleAI, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Suggested Prompts Pills (AI_ACTIVE only) ───────────────── */}
        {status === 'AI_ACTIVE' && (
          <View style={[styles.promptsWrap, { borderTopColor: colors.border }]}>
            <Text style={[styles.promptsLabel, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {getTr('suggested_prompts_title', lang)}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptsScroll}>
              {PROMPTS.map((promptText, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  style={[styles.promptPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSend(promptText.replace(/^[\p{Emoji}\s]+/u, ''))}
                >
                  <Text style={[styles.promptPillTxt, { color: colors.textPrimary }]}>{promptText}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Input Bar: visible for all states EXCEPT CLOSED ─────────── */}
        {status !== 'CLOSED' && (
          <View style={[
            styles.inputBar,
            { backgroundColor: colors.surface, borderTopColor: colors.border },
            isRTL && styles.inputBarRTL,
          ]}>
            {/* Attachment buttons */}
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={handlePickImage}
              activeOpacity={0.7}
            >
              <ImageIcon size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attachBtn}
              onPress={handlePickDocument}
              activeOpacity={0.7}
            >
              <Paperclip size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TextInput
              style={[styles.input, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={
                status === 'WAITING_HUMAN'
                  ? (lang === 'fr' ? 'Ajoutez des précisions pour le conseiller...'
                   : lang === 'en' ? 'Add more details for the agent...'
                   : lang === 'es' ? 'Añada detalles para el agente...'
                   : 'أضف تفاصيل إضافية للموظف...')
                  : status === 'HUMAN_RESPONDED'
                  ? (lang === 'fr' ? 'Répondez au conseiller client...'
                   : lang === 'en' ? 'Reply to the support agent...'
                   : lang === 'es' ? 'Responda al agente de soporte...'
                   : 'رد على موظف خدمة العملاء...')
                  : getTr('type_message_placeholder', lang)
              }
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim().length > 0 ? colors.primary : colors.surfaceAlt },
              ]}
              disabled={inputText.trim().length === 0 || sending}
              onPress={() => handleSend()}
            >
              <Send size={18} color={inputText.trim().length > 0 ? '#FFF' : colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Closed notice footer ─────────────────────────────────────── */}
        {status === 'CLOSED' && (
          <View style={[styles.closedBar, { backgroundColor: colors.surfaceAlt, borderTopColor: colors.border }]}>
            <Lock size={16} color={colors.textMuted} />
            <Text style={[styles.closedBarText, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
              {getTr('closed_notice', lang)}
            </Text>
          </View>
        )}

      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },


  // ── Messages ──────────────────────────────────────────────────────────────
  chatScroll: { padding: 16, paddingBottom: 24, gap: 14 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 4 },
  msgRowDriver: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },

  msgAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 16 },
  bubbleDriver: { borderBottomRightRadius: 2 },
  bubbleAI: { borderWidth: 1, borderBottomLeftRadius: 2 },
  bubbleHuman: { borderWidth: 1, borderBottomLeftRadius: 2 },

  senderName: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 9.5 },

  // ── Handoff Notice Card & Info Banner ─────────────────────────────────────
  handoffCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginVertical: 8 },
  handoffTitle: { fontSize: 13, fontWeight: '800' },
  handoffBody: { fontSize: 12.5, lineHeight: 18 },

  infoBannerCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  infoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  infoBannerBody: {
    fontSize: 12.5,
    lineHeight: 19,
    marginBottom: 12,
  },
  expectedTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expectedTimeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Prompt Pills ──────────────────────────────────────────────────────────
  promptsWrap: { paddingVertical: 10, borderTopWidth: 1 },
  promptsLabel: { fontSize: 11, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  promptsScroll: { paddingHorizontal: 16, gap: 8 },
  promptPill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  promptPillTxt: { fontSize: 12, fontWeight: '600' },

  // ── Input Bar ─────────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 10,
  },
  inputBarRTL: { flexDirection: 'row-reverse' },
  attachBtn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, minHeight: 40, maxHeight: 100, fontSize: 14 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },

  // ── Closed Bar Footer ─────────────────────────────────────────────────────
  closedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  closedBarText: { flex: 1, fontSize: 12.5, fontWeight: '500', lineHeight: 18 },
});

export default SupportChatScreen;
