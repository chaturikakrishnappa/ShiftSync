import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { api } from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function Requests() {
  const [employees, setEmployees] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [toUserId, setToUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === 'manager') {
      api.get('/users/employees').then((r) => setEmployees(r.data));
    }
  }, [user]);
  return (
    <div>
      <Nav />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Shift Swap</h2>
          <div className="space-y-2">
            <input value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} placeholder="Assignment ID" className="border rounded px-3 py-2 w-full" />
            <input value={toUserId} onChange={(e) => setToUserId(e.target.value)} placeholder="To User ID" className="border rounded px-3 py-2 w-full" />
            <button
              onClick={async () => {
                await api.post('/requests/swap', { assignmentId, toUserId });
                alert('Swap requested');
              }}
              className="bg-indigo-600 text-white px-3 py-2 rounded"
            >
              Request Swap
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Leave Request</h2>
          <div className="space-y-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded px-3 py-2 w-full" />
            <button
              onClick={async () => {
                await api.post('/requests/leave', { startDate, endDate });
                alert('Leave requested');
              }}
              className="bg-indigo-600 text-white px-3 py-2 rounded"
            >
              Request Leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
