import { io } from 'socket.io-client';
import * as jwt from 'jsonwebtoken';

const SECRET = 'atlas_platform_secure_key_2026_production';
const SOCKET_URL = 'http://localhost:3000'; // أو رابط السيرفر
const DRIVER_COUNT = 50;

console.log(`🚀 Starting Load Simulation for ${DRIVER_COUNT} drivers...`);

const drivers = Array.from({ length: DRIVER_COUNT }).map((_, i) => ({
  userId: `sim-driver-uuid-${i}`,
  phoneNumber: `+2126000000${i.toString().padStart(2, '0')}`,
  role: 'DRIVER'
}));

drivers.forEach((driver, index) => {
  const token = jwt.sign(driver, SECRET);
  
  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    console.log(`[Driver ${index}] Connected: ${socket.id}`);
    
    // 1. التحقق من الهوية
    socket.emit('identity_check', (res: any) => {
      // 2. تفعيل الجاهزية
      socket.emit('driver_set_presence', { status: 'AVAILABLE' });
    });

    // 3. كبسولة البث اللحظي (GPS Stream) مع حقن Jitter (تأخير عشوائي)
    setInterval(() => {
      if (socket.connected) {
        const jitter = Math.random() * 1500; // تأخير لغاية 1.5 ثانية
        setTimeout(() => {
          socket.emit('driver_location_update', {
            lat: 33.5731 + (Math.random() - 0.5) * 0.01,
            lng: -7.5898 + (Math.random() - 0.5) * 0.01,
            timestamp: Date.now()
          });
        }, jitter);
      }
    }, 4000);
  });

  socket.on('ride_offer', (offer: any) => {
    console.log(`[Driver ${index}] 📢 RECEIVED RIDE OFFER: ${offer.rideId}`);
    
    // محاكاة القبول السريع (أول 3 سائقين فقط يحاولون القبول)
    if (index < 3) {
      console.log(`[Driver ${index}] ⚡ Attempting to ACCEPT ride ${offer.rideId}`);
      socket.emit('ride_accept_attempt', { rideId: offer.rideId }, (res: any) => {
        console.log(`[Driver ${index}] Accept Result:`, res.status);
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Driver ${index}] Disconnected ❌`);
  });
});
