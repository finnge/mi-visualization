/* eslint-env browser */

export default function getCssVar(name, el = document.documentElement) {
  return getComputedStyle(el)
    .getPropertyValue(name);
}
