/* eslint-env browser */
/* eslint-disable import/prefer-default-export */

export function getCssVar(name, el = document.documentElement) {
  return getComputedStyle(el)
    .getPropertyValue(name);
}

/* eslint-disable no-extend-native */
/**
 * Calculates ISO week number of given date
 * @see https://stackoverflow.com/a/6117889
 * @author RobG <https://stackoverflow.com/users/257182/robg>
 * @returns Week Number
 */
Date.prototype.getISOWeek = function getISOWeek() {
  /* eslint-enable no-extend-native */

  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return weekNo;
};

/**
 * Constructor Function to generate the start date object
 * of an ISO Week (Monday) through ISO Week Number
 * @see https://stackoverflow.com/a/16591175
 * @author Elle <https://stackoverflow.com/users/1837457/elle>
 * @param {int} w Number of ISO Week
 * @param {int} y Number of Year
 * @returns Date Object of beginning of week (Monday)
 */
Date.fromISOWeek = function fromISOWeek(w, y) {
  const simple = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
};
