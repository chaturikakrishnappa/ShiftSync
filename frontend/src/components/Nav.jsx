import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between bg-gray-900 text-white px-4 py-3">
      <div className="font-semibold">ShiftSync</div>
      <nav className="flex gap-3 text-sm">
        {user?.role === 'manager' && <Link to="/register-invite" className="hover:underline">Invite</Link>}
        <Link to="/" className="hover:underline">Dashboard</Link>
        <Link to="/schedule" className="hover:underline">Schedule</Link>
        <Link to="/attendance" className="hover:underline">Attendance</Link>
        <Link to="/requests" className="hover:underline">Requests</Link>
        <Link to="/notices" className="hover:underline">Notices</Link>
      </nav>
      <div className="flex items-center gap-3">
        <span className="text-xs">{user?.name}</span>
        <button onClick={logout} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded">Logout</button>
      </div>
    </div>
  );
}
