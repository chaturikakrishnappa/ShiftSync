import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { api } from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function Attendance() {
  const [report, setReport] = useState([]);
  const { user } = useAuth();
  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    api
      .get('/attendance/report', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      })
      .then((r) => setReport(r.data));
  }, []);
  return (
    <div>
      <Nav />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Attendance</h1>
          <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/attendance/export`} className="bg-gray-800 text-white px-3 py-1 rounded">
            Export CSV
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2 border">User</th>
                <th className="text-left p-2 border">Clock In</th>
                <th className="text-left p-2 border">Clock Out</th>
                <th className="text-left p-2 border">Late</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r._id}>
                  <td className="p-2 border">{r.userId}</td>
                  <td className="p-2 border">{r.clockInTime ? new Date(r.clockInTime).toLocaleString() : '-'}</td>
                  <td className="p-2 border">{r.clockOutTime ? new Date(r.clockOutTime).toLocaleString() : '-'}</td>
                  <td className="p-2 border">{r.late ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
