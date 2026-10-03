const $ = (id) => document.getElementById(id);
const ro = (n) =>
  ({
    6: "a 6-a",
    7: "a 7-a",
    8: "a 8-a",
    9: "a 9-a",
    10: "a 10-a",
    11: "a 11-a",
    12: "a 12-a",
  })[n];
const esc = (t) =>
  t.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const shuf = (a) => [...a].sort(() => Math.random() - 0.5);
const nm = (t) => {
  const [l, r] = t.split(" = ");
  return (
    l + "=" + (r && !/[\/+−()]/.test(r) ? r.split(" · ").sort().join("·") : r)
  );
};
