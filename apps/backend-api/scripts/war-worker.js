const { io } = require('socket.io-client');

/**
 * ATLAS WAR WORKER (Isolated Process)
 * This script runs outside NestJS to generate pure load.
 */

const args = process.argv.slice(2);
const DRIVER_COUNT = parseInt(args[0]) || 10;
const BASE_TOKEN = args[1] || ''; // Not used here, we generate per per driver
const URL = 'http://localhost:3000';

console.log(`[Worker] ⚔️ Deploying ${DRIVER_COUNT} virtual drivers to target: ${URL}`);

const sockets = [];

for (let i = 0; i < DRIVER_COUNT; i++) {
  const driverId = `worker-driver-${process.pid}-${i}`;
  
  // Note: For real tests, we would pass a list of real JWTs. 
  // For mass-socket testing, we can use a mock token or pre-generated ones.
  const socket = io(URL, {
    auth: { token: BASE_TOKEN }, // Using a master token or individual ones
    transports: ['websocket'],
    forceNew: true 
  });

  socket.on('connect', () => {
    // Start reporting location jitter
    setInterval(() => {
      if (socket.connected) {
        socket.emit('driver.location_update', { 
            lat: 33.5731 + (Math.random() - 0.5) * 0.05, 
            lng: -7.5898 + (Math.random() - 0.5) * 0.05 
        });
      }
    }, 2000 + Math.random() * 2000);
  });

  socket.on('ride.offer', (data) => {
    console.log(`[Worker] Ride offer received for ${driverId}. Accepting...`);
    setTimeout(() => {
      socket.emit('ride.accept', { rideId: data.rideId });
    }, 1000 + Math.random() * 2000);
  });

  sockets.push(socket);
}

// Keep process alive
process.on('SIGINT', () => {
  console.log('[Worker] 🕊️ Recalling all drivers...');
  sockets.forEach(s => s.disconnect());
  process.exit();
});
