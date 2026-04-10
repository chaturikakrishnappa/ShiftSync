import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
  const { user } = useAuth();
  const ref = useRef(null);
  useEffect(() => {
    if (!user) return;
    const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const s = io(url, { withCredentials: true, auth: { userId: user.id } });
    ref.current = s;
    s.emit('joinBusiness', user.businessId);
    return () => s.close();
  }, [user]);
  return ref.current;
}

