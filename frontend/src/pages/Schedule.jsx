import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { api } from '../api/http';
import { useAuth } from '../context/AuthContext';

function getWeekId(date) {
  const d = new Date(date);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export default function Schedule() {
  const [weekId, setWeekId] = useState(getWeekId(new Date()));
  const [data, setData] = useState({ shifts: [], assignments: [] });
  const { user } = useAuth();
  useEffect(() => {
    api.get('/shifts/week', { params: { weekId } }).then((r) => setData(r.data));
  }, [weekId]);
  return (
    <div>
      <Nav />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Schedule</h1>
          {user?.role === 'manager' && (
            <>
              <button
                onClick={async () => {
                  await api.post('/shifts/publish', { weekId });
                  alert('Published');
                }}
                className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded"
              >
                Publish
              </button>
              <button
                onClick={async () => {
                  await api.post('/shifts/auto', { weekId });
                  alert('Auto-scheduled');
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
              >
                AI Auto
              </button>
            </>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.shifts.map((s) => (
            <div key={s._id} className="border rounded p-3">
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-gray-600">{s.shiftDate} {s.startTime}-{s.endTime}</div>
              <div className="text-xs">Status: {s.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

