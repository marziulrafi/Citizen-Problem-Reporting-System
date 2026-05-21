import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { notificationService } from "../api/notificationService";
import { useAuth } from "../context/useAuth";

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const refreshNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationService.getAll();
      setItems(res?.data?.notifications || []);
      setUnread(res?.data?.unreadCount ?? 0);
    } catch {
      setItems([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    if (!user) return;
    let active = true;

    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getAll();
        if (!active) return;
        setItems(res?.data?.notifications || []);
        setUnread(res?.data?.unreadCount ?? 0);
      } catch {
        if (!active) return;
        setItems([]);
        setUnread(0);
      }
    };

    fetchNotifications();
    const t = setInterval(fetchNotifications, 60000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [user]);

  if (!user) return null;

  const markRead = async (id) => {
    await notificationService.markRead(id);
    await refreshNotifications();
  };

  const markAll = async () => {
    await notificationService.markAllRead();
    await refreshNotifications();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-100 z-50 text-gray-900">
            <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white">
              <span className="font-semibold text-sm">Notifications</span>
              {unread > 0 && (
                <button type="button" onClick={markAll} className="text-xs text-green-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {items.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
            ) : (
              <ul>
                {items.map((n) => (
                  <li
                    key={n._id}
                    className={`border-b border-gray-50 p-3 text-sm ${n.isRead ? "bg-white" : "bg-green-50"}`}
                  >
                    <p className="font-semibold text-gray-800">{n.title}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{n.message}</p>
                    {n.issue && (
                      <Link
                        to={`/problem/${n.issue._id || n.issue}`}
                        onClick={() => {
                          if (!n.isRead) markRead(n._id);
                          setOpen(false);
                        }}
                        className="text-xs text-green-600 hover:underline mt-1 inline-block"
                      >
                        View issue →
                      </Link>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
