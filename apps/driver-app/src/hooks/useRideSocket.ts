import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useOrdersStore } from '../store/orders.store';

const SOCKET_URL = 'http://localhost:3000/rides'; // يتم تحديثه حسب السيرفر

export const useRideSocket = (driverId: string) => {
  const { addOrder, removeOrder } = useOrdersStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      query: { driverId },
    });

    // الاستماع لطلب رحلة جديد
    socket.on('ride_request_created', (newOrder) => {
      console.log('New ride received:', newOrder.id);
      addOrder(newOrder);
    });

    // حذف الطلب إذا انتهت صلاحيته أو تم إلغاؤه
    socket.on('ride_request_expired', ({ rideId }) => {
      removeOrder(rideId);
    });

    socket.on('ride_request_cancelled', ({ rideId }) => {
      removeOrder(rideId);
    });

    // حذف الطلب إذا تم تعيينه لسائق آخر
    socket.on('ride_request_assigned', ({ rideId }) => {
      removeOrder(rideId);
    });

    return () => {
      socket.disconnect();
    };
  }, [driverId]);
};
