
export function getNumberOfDaysInCurrentMonth() {
  let dt = new Date();
  return new Date(dt.getFullYear(), dt.getMonth(), 0).getDate();
}

export function getDaysInMonth(month: any, year: any) {
  var date = new Date(Date.UTC(year, month, 1));
  var days = [];
  while (date.getUTCMonth() === month) {
    days.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

