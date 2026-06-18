const { io } = require('socket.io-client');
const axios = require('axios');

async function simulateGoldenPath() {
    const API_URL = 'http://localhost:3000/api';
    const WS_URL = 'http://localhost:3000';
    
    console.log('🚀 Starting Golden Path Simulation...');

    // 1. Setup Driver Socket
    const driverSocket = io(`${WS_URL}`, {
        auth: { token: 'DRIVER_TOKEN' } // Replace with a real mock token if possible
    });

    driverSocket.on('connect', () => {
        console.log('✅ Driver Connected to WebSocket');
    });

    driverSocket.on('ride_offer', async (data) => {
        console.log('🔔 DRIVER RECEIVED RIDE OFFER:', data);
        
        // Accept the ride
        try {
            const res = await axios.post(`${API_URL}/rides/accept`, {
                rideId: data.rideId
            }, {
                headers: { Authorization: 'Bearer DRIVER_TOKEN' }
            });
            console.log('✅ Driver Accepted Ride:', res.status);
        } catch (err) {
            console.error('❌ Error Accepting Ride:', err.response?.data || err.message);
        }
    });

    // 2. Passenger Requests Ride
    try {
        console.log('🚕 Passenger requesting ride...');
        const res = await axios.post(`${API_URL}/rides/request`, {
            pickupLat: 33.5731,
            pickupLng: -7.5898,
            pickupAddress: 'Casablanca, Maarif',
            dropoffLat: 33.5898,
            dropoffLng: -7.6038,
            dropoffAddress: 'Casablanca, City Center',
            serviceType: 'STANDARD'
        }, {
            headers: { Authorization: 'Bearer PASSENGER_TOKEN' }
        });
        console.log('✅ Ride Requested Successfully, ID:', res.data.id);
    } catch (err) {
        console.error('❌ Error Requesting Ride:', err.response?.data || err.message);
    }
}

simulateGoldenPath();
