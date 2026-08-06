/**
 * Official Yalla VTC Knowledge Base Engine & AI Guardrails
 * Contains structured Knowledge Base across AR, FR, EN, ES
 */

export interface KBAnswer {
  category: string;
  matchedKey: string;
  ar: string;
  fr: string;
  en: string;
  es: string;
}

export const SENSITIVE_KEYWORDS = [
  'hack', 'hacking', 'exploit', 'bypass', 'api key', 'apikey', 'database', 'db access',
  'sql', 'injection', 'threat', 'fraud', 'cheat', 'blackmail', 'tamper', 'token', 'admin password',
  'اختراق', 'ثغرة', 'احتيال', 'تهديد', 'ابتزاز', 'مفاتيح', 'قاعدة البيانات', 'تعديل النظام',
];

/**
 * Exact transfer notice requested by the user:
 * - Sends exactly ONE message
 * - Explains clearly that AI cannot answer accurately
 * - Transferred to human customer support representative
 * - Asks driver to wait for reply inside the app
 * - AI then STOPS replying completely and stays SILENT
 */
export const HANDOFF_TRANSFER_NOTICE: Record<string, string> = {
  ar: 'شكراً لتواصلك معنا.\n\nلا أستطيع تقديم إجابة دقيقة على هذا الطلب.\n\nتم تحويل محادثتك إلى أحد ممثلي خدمة العملاء، وسيتم الرد عليك في أقرب وقت ممكن.\n\nلا حاجة لإعادة إرسال الرسالة، يمكنك انتظار الرد داخل هذه المحادثة.',
  fr: "Merci de nous avoir contactés.\n\nJe ne peux pas fournir une réponse exacte à cette demande.\n\nVotre conversation a été transférée à un représentant du service client, et vous recevrez une réponse dans les plus brefs délais.\n\nInutile de renvoyer votre message, vous pouvez patienter directement dans cette conversation.",
  en: 'Thank you for contacting us.\n\nI cannot provide an exact answer for this request.\n\nYour conversation has been transferred to a customer support representative, and we will get back to you as soon as possible.\n\nThere is no need to resend your message, you can wait for a reply inside this conversation.',
  es: 'Gracias por contactarnos.\n\nNo puedo proporcionar una respuesta precisa a esta solicitud.\n\nSu conversación ha sido transferida a un representante de atención al cliente y se le responderá lo antes posible.\n\nNo es necesario reenviar su mensaje, puede esperar la respuesta dentro de esta conversación.',
};

export const KNOWLEDGE_BASE: KBAnswer[] = [
  // 1. Documents
  {
    category: 'DOCUMENTS',
    matchedKey: 'documents',
    ar: 'رفع الوثائق يتم الانتقال إلى القائمة الجانبية ⬅️ الوثائق. يجب أن تكون الصور واضحة بجميع الزوايا الأربع وبدقة جيدة. الوثائق المطلوبة هي: البطاقة الوطنية، رخصة السياقة، البطاقة الرمادية، الفحص التقني، وشهادة التأمين.',
    fr: 'Pour télécharger vos documents, allez dans le Menu ⬅️ Documents. Assurez-vous que les 4 coins du document sont bien visibles et lisibles. Documents requis: CIN, Permis de conduire, Carte grise, Visite technique et Assurance.',
    en: 'To upload documents, go to Side Menu ⬅️ Documents. Ensure all 4 corners are clearly visible. Required docs: National ID, Driver License, Registration (Carte Grise), Technical Inspection, and Insurance.',
    es: 'Para subir documentos, vaya al Menú ⬅️ Documentos. Asegúrese de que las 4 esquinas sean legibles. Documentos requeridos: DNI, Carné de conducir, Tarjeta de circulación, Inspección técnica y Seguro.',
  },
  // 2. Rejection reasons
  {
    category: 'DOCUMENTS',
    matchedKey: 'rejection',
    ar: 'في حال رفض الوثيقة، تظهر خانة الملاحظات باللون الأحمر تبيّن السبب (مثلاً: صورة غير واضحة، وثيقة منتهية الصلاحية). اضغط على الوثيقة المرفوضة وإلتقط صورة جديدة واضحة ثم اضغط إرسال للمراجعة.',
    fr: 'En cas de refus d’un document, une note rouge indique le motif (ex: photo floue, document expiré). Cliquez sur le document refusé, reprenez une photo claire et soumettez-la.',
    en: 'If a document is rejected, a red notice specifies the reason (e.g., blurry photo, expired document). Tap the rejected item, take a clear photo, and resubmit.',
    es: 'Si se rechaza un documento, una nota roja indica el motivo (ej: foto borrosa, caducado). Toque el documento rechazado, tome una foto clara y vuelva a enviarlo.',
  },
  // 3. Wallet
  {
    category: 'WALLET',
    matchedKey: 'wallet',
    ar: 'لشحن المحفظة، افتح الملف الشخصي ⬅️ المحفظة والدفع ⬅️ شحن الرصيد. يمكنك الشحن عن طريق البطاقة البنكية أو التعبئة المباشرة. يتم تحديث رصيدك فوراً في التطبيق.',
    fr: 'Pour recharger votre portefeuille, ouvrez Profil ⬅️ Portefeuille & Paiement ⬅️ Recharger. Vous pouvez recharger par carte bancaire ou recharge directe. Le solde est mis à jour instantanément.',
    en: 'To top up your wallet, open Profile ⬅️ Wallet & Payment ⬅️ Top Up. You can pay via credit card or direct top-up. Balance is updated instantly.',
    es: 'Para recargar su saldo, abra Perfil ⬅️ Monedero y Pago ⬅️ Recargar. Puede pagar con tarjeta o recarga directa. El saldo se actualiza al instante.',
  },
  // 4. Commission
  {
    category: 'COMMISSION',
    matchedKey: 'commission',
    ar: 'عمولة Yalla VTC هي 8.4% + ضريبة 1.48% (الإجمالي 9.88%). يتم اقتطاع العمولة تلقائياً من رصيد المحفظة عند إكمال كل رحلة ناجحة. سائقو مستوى Premier يتمتعون بتخفيض خاص في العمولة.',
    fr: 'La commission Yalla VTC est de 8,4% + 1,48% de taxe (Total 9,88%). Elle est prélevée automatiquement de votre portefeuille après chaque course. Les chauffeurs Premier bénéficient d’une réduction.',
    en: 'Yalla VTC commission is 8.4% + 1.48% tax (Total 9.88%). It is automatically deducted from your wallet after each completed ride. Premier drivers enjoy reduced commission rates.',
    es: 'La comisión de Yalla VTC es 8.4% + 1.48% de impuesto (Total 9.88%). Se deduce automáticamente del monedero tras cada viaje. Chóferes Premier obtienen descuento.',
  },
  // 5. Driver Tiers
  {
    category: 'TIERS',
    matchedKey: 'tiers',
    ar: 'مستويات السائقين في Yalla VTC هي Silver و Gold و Premier 💎. عند إكمال 30 رحلة أسبوعياً ترتقي إلى مستوى Premier، لتحصل على أولوية 3 ثوانٍ في استقبال الطلبات وخفض في نسبة العمولة.',
    fr: 'Les niveaux sont Silver, Gold et Premier 💎. Complétez 30 courses par semaine pour atteindre Premier et bénéficier de 3 secondes de priorité sur les demandes et d’une commission réduite.',
    en: 'Driver tiers are Silver, Gold, and Premier 💎. Complete 30 rides per week to reach Premier for a 3-second request priority and lower commission fees.',
    es: 'Los niveles son Silver, Gold y Premier 💎. Complete 30 viajes por semana para alcanzar Premier y obtener 3 segundos de prioridad y menor comisión.',
  },
  // 6. Freight Cargo
  {
    category: 'FREIGHT',
    matchedKey: 'freight',
    ar: 'خدمة 📦 الشحن والنقل مخصصة للشاحنات والسيارات النفعية (Fourgon). يمكنك تفعيل استقبال بضائع الأثاث، الأجهزة، والمواد التجارية مع تحديد نوع وسعة مركبتك من شاشة الشحن والنقل.',
    fr: 'Le service 📦 Fret & Transport est réservé aux utilitaires et camions. Vous pouvez recevoir des demandes de transport de meubles, d’appareils ou de marchandises selon votre type de véhicule.',
    en: 'The 📦 Freight & Cargo service is dedicated to trucks and utility vans. You can accept furniture, commercial goods, or heavy cargo based on your vehicle capacity.',
    es: 'El servicio 📦 Carga y Transporte está destinado a furgonetas y camiones. Puede aceptar mudanzas, mercancías y paquetes según la capacidad de su vehículo.',
  },
  // 7. Intercity Trips
  {
    category: 'INTERCITY',
    matchedKey: 'intercity',
    ar: 'الرحلات بين المدن تسمح لك بنشر رحلات مجدولة بين مدن المغرب أو استقبال طلبات المسافرين بأسعار ممتازة. تتطلب الاشتراك الأسبوعي أو توفر رصيد كافٍ في المحفظة.',
    fr: 'Les trajets intervilles vous permettent de publier des trajets entre villes marocaines ou d’accepter des réservations de passagers. Nécessite un abonnement ou un solde suffisant.',
    en: 'Intercity trips allow you to publish scheduled journeys between Moroccan cities or accept passenger bookings. Requires active subscription or sufficient wallet balance.',
    es: 'Los viajes interurbanos le permiten publicar rutas entre ciudades de Marruecos o aceptar reservas. Requiere suscripción activa o saldo suficiente.',
  },
  // 8. Vehicle info
  {
    category: 'VEHICLE',
    matchedKey: 'vehicle',
    ar: 'لتغيير معلومات المركبة، افتح القائمة الجانبية ⬅️ مركبتي. يمكنك تغيير العلامة التجارية، الموديل، وسنة التصنيع. تغير نوع المركبة يخضع لمراجعة إدارة المنصة.',
    fr: 'Pour modifier votre véhicule, allez dans le Menu ⬅️ Mon Véhicule. Vous pouvez mettre à jour la marque, le modèle et l’année. Les changements de catégorie nécessitent validation.',
    en: 'To edit vehicle info, open Side Menu ⬅️ My Vehicle. You can update make, model, and year. Vehicle category changes require admin approval.',
    es: 'Para cambiar la información del vehículo, abra Menú ⬅️ Mi Vehículo. Puede actualizar marca, modelo y año. Cambios de tipo requieren revisión.',
  },
  // 9. Earnings & Payouts
  {
    category: 'PAYOUTS',
    matchedKey: 'payouts',
    ar: 'يتم احتساب أرباحك تلقائياً بعد كل رحلة. يمكنك الاطلاع على تفاصيل أرباحك من الملف الشخصي ⬅️ الأرباح، كما يمكنك تقديم طلب سحب رصيد حسابك إلى حسابك البنكي أو RIB.',
    fr: 'Vos gains sont calculés automatiquement après chaque course. Consultez les détails dans Profil ⬅️ Gains. Vous pouvez demander le virement de vos gains vers votre RIB bancaire.',
    en: 'Earnings are calculated automatically after each ride. View details under Profile ⬅️ Earnings. You can request payouts directly to your bank account RIB.',
    es: 'Sus ganancias se calculan automáticamente. Consulte detalles en Perfil ⬅️ Ganancias. Puede solicitar transferencias a su cuenta bancaria RIB.',
  },
  // 10. Account / Password
  {
    category: 'ACCOUNT',
    matchedKey: 'account',
    ar: 'لتحديث معلوماتك الشخصية أو كلمة المرور، افتح الملف الشخصي ⬅️ المعلومات الشخصية. في حال نسيت كلمة المرور، يمكنك الضغط على (نسيت كلمة المرور) في شاشة الدخول لاستلام رمز OTP عبر SMS.',
    fr: 'Pour modifier vos informations ou mot de passe, allez dans Profil ⬅️ Informations personnelles. En cas d’oubli, utilisez (Mot de passe oublié) sur l’écran de connexion pour recevoir un code OTP.',
    en: 'To update personal info or password, go to Profile ⬅️ Personal Info. If you forgot your password, use (Forgot Password) on login to receive an OTP code via SMS.',
    es: 'Para actualizar datos o contraseña, vaya a Perfil ⬅️ Información Personal. Si la olvidó, use (Olvidé mi contraseña) en inicio de sesión para recibir OTP por SMS.',
  },
];

/**
 * AI Query Matcher
 */
export function queryKnowledgeBase(query: string, lang: string): { type: 'SENSITIVE' | 'KB_FOUND' | 'UNKNOWN'; responseText: string; category?: string } {
  const qClean = query.toLowerCase().trim();

  // Check sensitive guardrails
  const isSensitive = SENSITIVE_KEYWORDS.some(kw => qClean.includes(kw));
  if (isSensitive) {
    return {
      type: 'SENSITIVE',
      responseText: HANDOFF_TRANSFER_NOTICE[lang] || HANDOFF_TRANSFER_NOTICE['ar'],
    };
  }

  // Match KB entry
  for (const item of KNOWLEDGE_BASE) {
    if (
      qClean.includes(item.matchedKey) ||
      (item.category === 'DOCUMENTS' && (qClean.includes('وثائق') || qClean.includes('document') || qClean.includes('رفع') || qClean.includes('upload'))) ||
      (item.category === 'WALLET' && (qClean.includes('محفظة') || qClean.includes('شحن') || qClean.includes('wallet') || qClean.includes('solde') || qClean.includes('topup'))) ||
      (item.category === 'COMMISSION' && (qClean.includes('عمولة') || qClean.includes('نسبة') || qClean.includes('commission') || qClean.includes('tax'))) ||
      (item.category === 'TIERS' && (qClean.includes('مستوى') || qClean.includes('premier') || qClean.includes('gold') || qClean.includes('tier') || qClean.includes('مستويات'))) ||
      (item.category === 'FREIGHT' && (qClean.includes('شحن') || qClean.includes('نقل') || qClean.includes('شاحنة') || qClean.includes('fret') || qClean.includes('freight'))) ||
      (item.category === 'INTERCITY' && (qClean.includes('مدن') || qClean.includes('intercity') || qClean.includes('intervilles') || qClean.includes('بين المدن'))) ||
      (item.category === 'VEHICLE' && (qClean.includes('سيارة') || qClean.includes('مركبة') || qClean.includes('vehicule') || qClean.includes('car'))) ||
      (item.category === 'PAYOUTS' && (qClean.includes('أرباح') || qClean.includes('سحب') || qClean.includes('gains') || qClean.includes('payout') || qClean.includes('استلام'))) ||
      (item.category === 'ACCOUNT' && (qClean.includes('حساب') || qClean.includes('كلمة المرور') || qClean.includes('password') || qClean.includes('compte')))
    ) {
      const resp = (item as any)[lang] || item.ar;
      return {
        type: 'KB_FOUND',
        responseText: resp,
        category: item.category,
      };
    }
  }

  // Not matched -> Trigger Human Handoff with the exact official transfer notice
  return {
    type: 'UNKNOWN',
    responseText: HANDOFF_TRANSFER_NOTICE[lang] || HANDOFF_TRANSFER_NOTICE['ar'],
  };
}
