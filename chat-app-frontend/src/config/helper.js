export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);

  const isToday = now.toDateString() === past.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    yesterday.toDateString() === past.toDateString();

  if (isToday) {
    return past.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (isYesterday) {
    return "Yesterday";
  }

  return past.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}


export function formatDayLabel(date) {
  const now = new Date();
  const past = new Date(date);

  const isToday = now.toDateString() === past.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    yesterday.toDateString() === past.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return past.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function isNewGroup(prevMsg, currMsg, gapMinutes = 1) {
  if (!prevMsg || prevMsg.sender !== currMsg.sender) return true;
  const diff = new Date(currMsg.timestamp) - new Date(prevMsg.timestamp);
  return diff > gapMinutes * 60 * 1000;
}