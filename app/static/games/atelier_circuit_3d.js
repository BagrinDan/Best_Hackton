const $ = (id) => document.getElementById(id);
const configs = {
  series: {
    name: "în serie",
    text: "B1 → B2: același curent trece prin ambele. Scoaterea unuia oprește tot circuitul.",
    positions: {
      battery: [-5, 0],
      switch: [-2.5, -3],
      b1: [-2, 3],
      b2: [2, 3],
    },
  },
  parallel: {
    name: "în paralel",
    text: "B1 ∥ B2: două ramuri cu aceeași tensiune. Scoaterea unui bec lasă celălalt în funcțiune.",
    positions: { battery: [-5, 0], switch: [-2.5, -3], b1: [0, 3], b2: [0, 0] },
  },
  mixed: {
    name: "mixt",
    text: "B1 → (B2 ∥ B3): B1 este comun. Scoaterea lui oprește tot; B2 și B3 au ramuri independente.",
    positions: {
      battery: [-5, 0],
      switch: [-2.5, -3],
      b1: [2.5, -3],
      b2: [0, 3],
      b3: [0, 0],
    },
  },
};
const states = Object.fromEntries(
  Object.keys(configs).map((key) => [
    key,
    { mounted: [], closed: false, voltage: 6 },
  ]),
);
let mode = "series",
  selected = "battery";
let renderer, camera, scene, root, observer;
let groups = [],
  lamps = {},
  flowParticles = [];
let flowTime = 0,
  previousFrame = null;
let yaw = 0,
  tilt = 1.05;
const state = () => states[mode];
const keys = () => Object.keys(configs[mode].positions);
const label = (key) =>
  key === "battery"
    ? "🔋 Baterie"
    : key === "switch"
      ? "⏻ Întrerupător"
      : "💡 " + key.toUpperCase();
function calculate(type, mounted, closed, voltage) {
  const names = type === "mixed" ? ["b1", "b2", "b3"] : ["b1", "b2"];
  const currents = Object.fromEntries(names.map((key) => [key, 0]));
  let total = 0,
    resistance = Infinity;
  if (closed && mounted.includes("battery") && mounted.includes("switch")) {
    if (type === "series" && names.every((key) => mounted.includes(key))) {
      resistance = 40;
      total = voltage / resistance;
      names.forEach((key) => (currents[key] = total));
    } else if (type !== "series") {
      const branches = (type === "mixed" ? ["b2", "b3"] : names).filter((key) =>
        mounted.includes(key),
      );
      if (branches.length && (type !== "mixed" || mounted.includes("b1"))) {
        resistance = 20 / branches.length + (type === "mixed" ? 20 : 0);
        total = voltage / resistance;
        branches.forEach((key) => (currents[key] = total / branches.length));
        if (type === "mixed") currents.b1 = total;
      }
    }
  }
  return { total, resistance, currents };
}
function message(text) {
  $("feedback").textContent = text;
}
function activate(key) {
  if (state().mounted.includes(key)) {
    state().mounted = state().mounted.filter((part) => part !== key);
    selected = key;
    message(label(key) + " scos.");
  } else if (selected === key) {
    state().mounted.push(key);
    selected = keys().find((part) => !state().mounted.includes(part)) || null;
    message(
      label(key) +
        " montat. " +
        (selected
          ? "Urmează " + label(selected) + "."
          : "Acum închide întrerupătorul."),
    );
  } else {
    message("Selectează " + label(key) + " pentru acest suport.");
    return;
  }
  render();
}
function paths() {
  const lines = [
    [
      [-5, -3],
      [-5, 3],
      [5, 3],
      [5, -3],
      [-5, -3],
    ],
  ];
  if (mode !== "series")
    lines.push([
      [-3, 3],
      [-3, 0],
      [5, 0],
    ]);
  return lines;
}
function flowRoutes(result) {
  if (!result.total) return [];
  const outer = [
    [-5, 3],
    [5, 3],
    [5, -3],
    [-5, -3],
    [-5, 3],
  ];
  const middle = [
    [-5, 3],
    [-3, 3],
    [-3, 0],
    [5, 0],
    [5, -3],
    [-5, -3],
    [-5, 3],
  ];
  if (mode === "series") return [{ path: outer, current: result.total }];
  const topKey = mode === "mixed" ? "b2" : "b1";
  const middleKey = mode === "mixed" ? "b3" : "b2";
  return [
    { path: outer, current: result.currents[topKey] },
    { path: middle, current: result.currents[middleKey] },
  ].filter((route) => route.current > 0);
}
function pointOnRoute(path, fraction) {
  const lengths = path
    .slice(1)
    .map((point, i) =>
      Math.hypot(point[0] - path[i][0], point[1] - path[i][1]),
    );
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = (((fraction % 1) + 1) % 1) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const t = remaining / lengths[i];
      return [
        path[i][0] + (path[i + 1][0] - path[i][0]) * t,
        path[i][1] + (path[i + 1][1] - path[i][1]) * t,
      ];
    }
    remaining -= lengths[i];
  }
}
function render() {
  const s = state(),
    result = calculate(mode, s.mounted, s.closed, s.voltage);
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === mode);
    button.setAttribute("aria-pressed", button.dataset.mode === mode);
  });
  $("assemblyTitle").textContent = "Asamblează circuitul " + configs[mode].name;
  $("description").textContent = configs[mode].text;
  $("parts").innerHTML = keys()
    .map(
      (key) =>
        `<button data-key="${key}" class="${selected === key ? "active" : ""}" ${s.mounted.includes(key) ? "disabled" : ""}>${label(key)}</button>`,
    )
    .join("");
  $("parts")
    .querySelectorAll("button")
    .forEach(
      (button) =>
        (button.onclick = () => {
          selected = button.dataset.key;
          render();
          message(
            label(selected) + " selectat. Apasă pe suportul corespunzător.",
          );
        }),
    );
  $("slots").innerHTML = keys()
    .map(
      (key) =>
        `<button data-key="${key}">${s.mounted.includes(key) ? "✓" : "+"} ${label(key)}</button>`,
    )
    .join("");
  $("slots")
    .querySelectorAll("button")
    .forEach((button) => (button.onclick = () => activate(button.dataset.key)));
  $("steps").innerHTML =
    keys()
      .map(
        (key) =>
          `<li class="${s.mounted.includes(key) ? "done" : ""}">${s.mounted.includes(key) ? "✓ " : ""}Montează ${label(key)}</li>`,
      )
      .join("") +
    `<li class="${s.closed && s.mounted.includes("switch") ? "done" : ""}">Închide întrerupătorul</li>`;
  $("voltage").value = s.voltage;
  $("voltageValue").textContent = s.voltage + " V";
  $("switch").disabled = !s.mounted.includes("switch");
  $("switch").textContent = s.closed
    ? "Închis · Deschide întrerupătorul"
    : "Deschis · Închide întrerupătorul";
  $("meters").innerHTML =
    `Curent total: <b>${result.total.toFixed(3)} A</b><br>R echivalentă: <b>${Number.isFinite(result.resistance) ? result.resistance.toFixed(1) + " Ω" : "∞ Ω"}</b><hr>` +
    Object.entries(result.currents)
      .map(
        ([key, current]) =>
          `${key.toUpperCase()}: ${current.toFixed(3)} A · ${(current * 20).toFixed(2)} V · ${(current * current * 20).toFixed(3)} W`,
      )
      .join("<br>");
  if (renderer) render3D(result);
  else render2D(result);
}
function render2D(result) {
  let svg = $("diagram");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "diagram";
    svg.setAttribute("viewBox", "-650 -450 1300 900");
    $("view").prepend(svg);
  }
  svg.innerHTML =
    paths()
      .map(
        (path) =>
          `<polyline points="${path.map(([x, y]) => `${x * 100},${-y * 100}`).join(" ")}" fill="none" stroke="#6edbb9" stroke-width="8"/>`,
      )
      .join("") +
    keys()
      .map((key) => {
        const [x, y] = configs[mode].positions[key];
        return `<g data-key="${key}" style="cursor:pointer"><rect x="${x * 100 - 85}" y="${-y * 100 - 45}" width="170" height="90" rx="12" fill="${result.currents[key] ? "#8a6427" : "#ffffff"}" stroke="#acc2db" stroke-width="3"/><text x="${x * 100}" y="${-y * 100 + 7}" text-anchor="middle" fill="#0b2545" font-size="22">${state().mounted.includes(key) ? "✓" : "+"} ${label(key)}</text></g>`;
      })
      .join("");
  flowRoutes(result).forEach((route) => {
    const trajectory = route.path
      .map(([x, y], i) => `${i ? "L" : "M"} ${x * 100} ${-y * 100}`)
      .join(" ");
    const duration = 1 / (0.06 + route.current * 0.15);
    for (let i = 0; i < 12; i++) {
      svg.insertAdjacentHTML(
        "beforeend",
        `<circle r="7" fill="#ffdc79" pointer-events="none"><animateMotion dur="${duration}s" begin="${(-duration * i) / 12}s" repeatCount="indefinite" path="${trajectory}"/></circle>`,
      );
    }
  });
  svg
    .querySelectorAll("[data-key]")
    .forEach(
      (element) => (element.onclick = () => activate(element.dataset.key)),
    );
}
function addFlow3D(result) {
  flowRoutes(result).forEach((route) => {
    for (let i = 0; i < 16; i++) {
      const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd56e }),
      );
      root.add(particle);
      flowParticles.push({ particle, route, offset: i / 16 });
    }
  });
  Object.entries(lamps).forEach(([key, lamp]) => {
    const intensity = Math.min(result.currents[key] ** 2 * 20, 2);
    if (!intensity) return;
    const light = new THREE.PointLight(0xffbd50, intensity, 4);
    lamp.parent.add(light);
    light.position.set(0, 1, 0);
  });
}
function setCamera() {
  camera.position.set(
    Math.sin(yaw) * Math.cos(tilt) * 16,
    Math.sin(tilt) * 16,
    Math.cos(yaw) * Math.cos(tilt) * 16,
  );
  camera.lookAt(0, 0, 0);
}
function render3D(result) {
  while (root.children.length) {
    const child = root.children[0];
    root.remove(child);
    child.traverse((item) => {
      if (item.geometry) item.geometry.dispose();
      if (item.material) {
        if (item.material.map) item.material.map.dispose();
        item.material.dispose();
      }
    });
  }
  groups = [];
  lamps = {};
  flowParticles = [];
  const box = (parent, w, h, d, color, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color }),
    );
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  box(root, 12, 0.2, 8, 0xdce8fa);
  paths().forEach((path) =>
    root.add(
      new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          path.map(([x, z]) => new THREE.Vector3(x, 0.25, z)),
        ),
        new THREE.LineBasicMaterial({ color: 0x6edbb9 }),
      ),
    ),
  );
  keys().forEach((key) => {
    const group = new THREE.Group();
    group.userData.key = key;
    const [x, z] = configs[mode].positions[key];
    group.position.set(x, 0.3, z);
    box(group, 1.8, 0.15, 1.2, 0x2f5d9b);
    if (state().mounted.includes(key)) {
      if (key === "battery") box(group, 0.8, 0.6, 1, 0x5bd5a6, 0, 0.35, 0);
      else if (key === "switch") {
        const lever = box(group, 1.2, 0.12, 0.3, 0xffd16b, 0, 0.3, 0);
        lever.rotation.z = state().closed ? 0 : -0.5;
      } else {
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.45, 20, 16),
          new THREE.MeshStandardMaterial({
            color: 0xffecc1,
            emissive: result.currents[key] ? 0xffbc45 : 0x000000,
            emissiveIntensity: Math.min(
              (result.currents[key] ** 2 * 20) / 0.5,
              2,
            ),
          }),
        );
        lamp.position.y = 0.65;
        group.add(lamp);
        lamps[key] = lamp;
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const c = canvas.getContext("2d");
    c.fillStyle = "#eef3fc";
    c.fillRect(0, 0, 256, 64);
    c.fillStyle = "#0b2545";
    c.font = "22px sans-serif";
    c.textAlign = "center";
    c.fillText(
      key === "battery"
        ? "Baterie"
        : key === "switch"
          ? "Întrerupător"
          : key.toUpperCase(),
      128,
      40,
    );
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }),
    );
    sprite.position.y = 1.35;
    sprite.scale.set(1.9, 0.48, 1);
    group.add(sprite);
    root.add(group);
    groups.push(group);
  });
  addFlow3D(result);
}
function init3D() {
  if (typeof THREE === "undefined") return;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6eefc);
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  root = new THREE.Group();
  scene.add(root, new THREE.AmbientLight(0xffffff, 0.9));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(4, 10, 4);
  scene.add(light);
  $("view").prepend(renderer.domElement);
  const resize = () => {
    const w = $("view").clientWidth,
      h = $("view").clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  observer = new ResizeObserver(resize);
  observer.observe($("view"));
  resize();
  setCamera();
  let start, last, moved;
  renderer.domElement.onpointerdown = (event) => {
    start = last = [event.clientX, event.clientY];
    moved = false;
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  renderer.domElement.onpointermove = (event) => {
    if (!last) return;
    if (Math.hypot(event.clientX - start[0], event.clientY - start[1]) > 6)
      moved = true;
    if (moved) {
      yaw -= (event.clientX - last[0]) * 0.008;
      tilt = Math.max(
        0.3,
        Math.min(1.5, tilt + (event.clientY - last[1]) * 0.008),
      );
      setCamera();
    }
    last = [event.clientX, event.clientY];
  };
  renderer.domElement.onpointerup = (event) => {
    const click = last && !moved;
    last = null;
    if (!click) return;
    const r = renderer.domElement.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    scene.updateMatrixWorld(true);
    ray.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - r.left) / r.width) * 2 - 1,
        (-(event.clientY - r.top) / r.height) * 2 + 1,
      ),
      camera,
    );
    const hit = ray.intersectObjects(groups, true)[0];
    if (!hit) return;
    let object = hit.object;
    while (object && object.userData.key === undefined) object = object.parent;
    if (object) activate(object.userData.key);
  };
  renderer.domElement.onpointercancel = () => (last = null);
  function frame(time) {
    requestAnimationFrame(frame);
    const delta =
      previousFrame === null ? 0 : Math.min((time - previousFrame) / 1000, 0.1);
    previousFrame = time;
    flowTime += delta;
    flowParticles.forEach(({ particle, route, offset }) => {
      const [x, z] = pointOnRoute(
        route.path,
        offset + flowTime * (0.06 + route.current * 0.15),
      );
      particle.position.set(x, 0.42, z);
    });
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
}
document.querySelectorAll("[data-mode]").forEach(
  (button) =>
    (button.onclick = () => {
      mode = button.dataset.mode;
      selected = keys().find((key) => !state().mounted.includes(key)) || null;
      render();
      message(
        "Circuit " +
          configs[mode].name +
          " selectat. Urmează pașii de asamblare.",
      );
    }),
);
$("auto").onclick = () => {
  state().mounted = keys();
  selected = null;
  render();
  message("Asamblare completă. Închide întrerupătorul.");
};
$("reset").onclick = () => {
  state().mounted = [];
  state().closed = false;
  selected = "battery";
  render();
  message("Montează bateria pentru a începe.");
};
$("switch").onclick = () => {
  state().closed = !state().closed;
  render();
};
$("voltage").oninput = () => {
  state().voltage = Number($("voltage").value);
  render();
};
$("camera").onclick = () => {
  yaw = 0;
  tilt = 1.05;
  if (renderer) setCamera();
};
try {
  init3D();
} catch (error) {
  if (observer) observer.disconnect();
  if (renderer) {
    renderer.domElement.remove();
    renderer.dispose();
  }
  renderer = null;
}
render();
