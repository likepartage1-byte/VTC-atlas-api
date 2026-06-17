import { EventEmitter } from 'events';
import Redis from 'ioredis';

// محاكاة إرسال حدث من داخل النظام
async function triggerFakeRide() {
  const rideId = `fake-ride-${Date.now().toString().slice(-4)}`;
  console.log(`🎬 Triggering Fake Ride Request: ${rideId}`);
  
  // في نظامنا، الـ DispatchEngine يستمع لحدث Ride.StatusChanged
  // لكن للتبسيط في هذا الـ Harness، سنقوم باستدعاء منطق البحث مباشرة أو عبر Redis
  
  const redis = new Redis('redis://localhost:6379');
  
  // البحث عن أقرب السائقين (نفس منطق السيرفر)
  const nearby = await redis.georadius('geo:drivers:available', -7.5898, 33.5731, 5, 'km');
  
  console.log(`🎯 Found ${nearby.length} nearby drivers for ride ${rideId}`);
  
  // ملاحظة: التشغيل الحقيقي يحتاج لاتصال بـ EventEmitter الخاص بـ NestJS
  // سأترك هذا السكريبت كـ 'Trigger Concept' أو يمكن استخدامه عبر تفعيل الـ API
}

triggerFakeRide();
