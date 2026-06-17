export enum DriverPresenceStatus {
  OFFLINE = 'OFFLINE',     // لا يرسل بيانات ولا يستقبل طلبات
  ONLINE = 'ONLINE',       // متصل بالسوكيت لكن ليس بالضرورة جاهز للعمل
  AVAILABLE = 'AVAILABLE', // جاهز لاستقبال الرحلات (الحالة الذهبية)
  BUSY = 'BUSY',           // في رحلة حالياً
}

export const DRIVER_PRESENCE_TTL = 3600; // ساعة واحدة (60 دقيقة) كحد أقصى للخمول
