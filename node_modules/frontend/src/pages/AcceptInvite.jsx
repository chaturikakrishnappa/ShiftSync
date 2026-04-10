import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AcceptInvite() {
  const { acceptInvite } = useAuth();
  const qs = new URLSearchParams(useLocation().search);
  const [email, setEmail] = useState(qs.get('email') || '');
  const [token, setToken] = useState(qs.get('token') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await acceptInvite({ token, email, password });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed');
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-gray-800">Accept Invite</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded px-3 py-2 w-full" />
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Invite Token" className="border rounded px-3 py-2 w-full" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Set Password" className="border rounded px-3 py-2 w-full" />
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded w-full">Activate</button>
      </form>
    </div>
  );
}
