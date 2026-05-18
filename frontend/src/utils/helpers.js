import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  return format(new Date(date), 'hh:mm a');
};

export const timeAgo = (date) => {
  if (!date) return 'N/A';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getAppointmentLabel = (date) => {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return formatDate(d);
};

export const getStatusColor = (status) => {
  const map = {
    Pending: 'badge-pending',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
    'No-Show': 'badge-rejected'
  };
  return map[status] || 'badge-pending';
};

export const getAvatarUrl = (avatar, name) => {
  if (avatar) return avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=1d4ed8&color=fff&bold=true&size=128`;
};

export const truncate = (str, n = 60) =>
  str && str.length > n ? str.substring(0, n) + '...' : str;

export const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};
