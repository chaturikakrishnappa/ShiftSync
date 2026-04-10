import Nav from '../components/Nav';
import { useSocket } from '../hooks/useSocket';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    if (!socket) return;
    const handler = (p) => setAlerts((a) => [...a, `Reminder for assignment ${p.assignmentId}`]);
    socket.on('reminder', handler);
    return () => socket.off('reminder', handler);
  }, [socket]);
  return (
    <div>
      <Nav />
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        {alerts.map((a, i) => (
          <div key={i} className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-2">{a}</div>
        ))}
        <p className="text-gray-700">Welcome to ShiftSync.</p>
      </div>
    </div>
  );
}
