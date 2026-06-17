import { io } from 'socket.io-client';
import * as jwt from 'jsonwebtoken';

const SECRET = 'atlas_platform_secure_key_2026_production';
const SOCKET_URL = 'http://localhost:3000';

const CHAOS_LEVEL = 0.2; // 20% من السائقين سيتعرضون للفوضى

console.log('🌪️ Starting Safe Chaos Runner...');

/**
 * 1. محاكي "السباق العنيف" (Race Chaos)
 * اختبار القبول المتزامن لـ 50 سائق على نفس الرحلة
 */
async function simulateAcceptRace(rideId: string) {
  console.log(`⚔️ Injecting Race Condition Chaos for Ride: ${rideId}`);
  
  const drivers = Array.from({ length: 50 }).map((_, i) => ({
    userId: `race-driver-${i}`,
    role: 'DRIVER'
  }));

  const connections = drivers.map(d => {
    const token = jwt.sign(d, SECRET);
    return io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
  });

  // الانتظار حتى يتصل الجميع
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('🚀 FIRE! 50 drivers accepting simultaneously...');
  
  connections.forEach((socket, i) => {
    socket.emit('ride_accept_attempt', { rideId }, (res: any) => {
      if (res.status === 'success') {
        console.log(`🏆 WINNER: Driver ${i}`);
      }
    });
  });

  // تنظيف الاتصالات بعد 5 ثوانٍ
  setTimeout(() => connections.forEach(s => s.disconnect()), 5000);
}

/**
 * 2. محاكي "فوضى الاتصال" (Socket Breaker)
 * فصل وإعادة وصل عشوائية
 */
function socketBreaker(sockets: any[]) {
  setInterval(() => {
    const targetIndex = Math.floor(Math.random() * sockets.length);
    const socket = sockets[targetIndex];
    
    if (socket.connected) {
      console.log(`🔌 Chaos: Force Disconnecting Socket ${targetIndex}`);
      socket.disconnect();
      
      // إعادة الوصل بعد وقت عشوائي
      setTimeout(() => {
        console.log(`🔄 Chaos: Reconnecting Socket ${targetIndex}`);
        socket.connect();
      }, Math.random() * 5000);
    }
  }, 3000);
}

// يمكن استدعاء المحاكاة يدوياً أو برمجياً
// simulateAcceptRace('test-ride-chaos-101');
