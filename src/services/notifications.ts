/**
 * Dynamic Notification Center Service for Campus OS
 * Stores, dispatches, and persists notifications across sessions and roles.
 */

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: "info" | "success" | "warning" | "destructive";
  read: boolean;
  targetRole?: "all" | "admin" | "faculty" | "student";
}

const STORAGE_KEY = "campusos_notifications_v1";

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Attendance Warning",
    message: "15 students in Computer Science are below the mandatory 75% attendance threshold.",
    time: "10m ago",
    timestamp: Date.now() - 10 * 60 * 1000,
    type: "warning",
    read: false,
    targetRole: "admin",
  },
  {
    id: "notif-2",
    title: "Fee Receipt Generated",
    message: "Tuition installment received from Aarav Sharma (USN: 1SI22CS001).",
    time: "25m ago",
    timestamp: Date.now() - 25 * 60 * 1000,
    type: "success",
    read: false,
    targetRole: "all",
  },
  {
    id: "notif-3",
    title: "New Admission Application",
    message: "Application #app-12 received for ECE branch awaiting administrative approval.",
    time: "1h ago",
    timestamp: Date.now() - 60 * 60 * 1000,
    type: "info",
    read: false,
    targetRole: "admin",
  },
  {
    id: "notif-4",
    title: "Mid-Term Examination Schedule",
    message: "Semester End Exam timetable draft has been uploaded to the academic calendar.",
    time: "3h ago",
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    type: "info",
    read: true,
    targetRole: "all",
  },
];

function getStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotifications));
      return initialNotifications;
    }
    return JSON.parse(raw);
  } catch {
    return initialNotifications;
  }
}

function saveNotifications(notifications: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("campusos_notifications_updated"));
  } catch (e) {
    console.warn("Unable to save notifications", e);
  }
}

export function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function getNotifications(userRole?: string): NotificationItem[] {
  const all = getStoredNotifications();
  if (!userRole) return all;
  return all.filter(n => !n.targetRole || n.targetRole === "all" || n.targetRole === userRole);
}

export function addNotification(data: {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "destructive";
  targetRole?: "all" | "admin" | "faculty" | "student";
}) {
  const all = getStoredNotifications();
  const newItem: NotificationItem = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: data.title,
    message: data.message,
    time: "Just now",
    timestamp: Date.now(),
    type: data.type || "info",
    read: false,
    targetRole: data.targetRole || "all",
  };

  saveNotifications([newItem, ...all.slice(0, 49)]); // keep latest 50
  return newItem;
}

export function markAsRead(id: string) {
  const all = getStoredNotifications();
  const updated = all.map(n => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllAsRead(userRole?: string) {
  const all = getStoredNotifications();
  const updated = all.map(n => {
    if (!userRole || n.targetRole === "all" || n.targetRole === userRole) {
      return { ...n, read: true };
    }
    return n;
  });
  saveNotifications(updated);
}

export function clearNotifications(userRole?: string) {
  const all = getStoredNotifications();
  if (!userRole) {
    saveNotifications([]);
    return;
  }
  const remaining = all.filter(n => n.targetRole && n.targetRole !== "all" && n.targetRole !== userRole);
  saveNotifications(remaining);
}

export function subscribeToNotifications(callback: () => void): () => void {
  window.addEventListener("campusos_notifications_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("campusos_notifications_updated", callback);
    window.removeEventListener("storage", callback);
  };
}
