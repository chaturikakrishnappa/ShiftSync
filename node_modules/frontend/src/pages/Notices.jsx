import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { api } from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function Notices() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  async function load() {
    const { data } = await api.get('/notices');
    setItems(data);
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <div>
      <Nav />
      <div className="p-6 space-y-4">
        {user?.role === 'manager' && (
          <div className="flex gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border rounded px-3 py-2 w-60" />
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="border rounded px-3 py-2 flex-1" />
            <button
              onClick={async () => {
                await api.post('/notices', { title, message });
                setTitle(''); setMessage(''); load();
              }}
              className="bg-indigo-600 text-white px-3 py-2 rounded"
            >
              Post
            </button>
          </div>
        )}
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n._id} className="border rounded p-3">
              <div className="font-semibold">{n.title}</div>
              <div className="text-gray-700">{n.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
