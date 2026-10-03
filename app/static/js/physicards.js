$("faq").innerHTML = FAQ.map(
  (f) => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`,
).join("");
go("home");
