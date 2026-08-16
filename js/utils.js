/**
 * Content OS for Doctors — Utility Helpers
 */

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function formatFullDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateForInput(dateOrString) {
  if (!dateOrString) return '';
  const d = new Date(dateOrString);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateOrString, days) {
  const d = new Date(dateOrString);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function getDaysDifference(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diffTime = b.getTime() - a.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function formatRelativeDate(isoDate) {
  if (!isoDate) return '';
  const now = new Date();
  const d = new Date(isoDate);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 14) {
    return formatDate(isoDate);
  } else if (diffDay >= 2) {
    return `${diffDay} days ago`;
  } else if (diffDay === 1) {
    return 'Yesterday';
  } else if (diffHour >= 1) {
    return `${diffHour}h ago`;
  } else if (diffMin >= 1) {
    return `${diffMin}m ago`;
  } else {
    return 'Just now';
  }
}

export async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    // Fallback for older contexts
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast('Copied to clipboard!', 'success');
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      showToast('Copy failed. Please manually select.', 'error');
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied to clipboard! Ready to paste into ChatGPT/Claude', 'success');
    return true;
  } catch (err) {
    console.error('Clipboard error:', err);
    showToast('Failed to copy. Please manually copy.', 'error');
    return false;
  }
}

export function showToast(message, type = 'success', duration = 3200) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = '';
  if (type === 'success') {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === 'error') {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  } else {
    icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <span>${icon}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Vibration for tactile feel if supported
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 200ms ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  }, duration);
}

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function truncateText(str, maxLen = 80) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen).trim() + '...';
}

// Simulated Time Travel Helpers (Testing)
let systemTimeOffsetDays = parseInt(localStorage.getItem('doctor_os_time_offset_days') || '0', 10);

export function getSystemDate() {
  const d = new Date();
  if (systemTimeOffsetDays !== 0) {
    d.setDate(d.getDate() + systemTimeOffsetDays);
  }
  return d;
}

export function getTimeShiftDays() {
  return systemTimeOffsetDays;
}

export function setTimeShiftDays(days) {
  systemTimeOffsetDays = days;
  localStorage.setItem('doctor_os_time_offset_days', String(days));
}

