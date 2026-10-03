const $ = (id) => document.getElementById(id);
const phases = {
  solid: {
    title: "Solid · ordine și vibrație",
    text: "Particulele sunt apropiate și ordonate. Ele vibrează în jurul unor poziții de echilibru, fără să se deplaseze liber prin recipient.",
    observation:
      "Încălzește solidul: vibrațiile devin mai ample. Urma galbenă rămâne în jurul aceleiași poziții.",
  },
  liquid: {
    title: "Lichid · vecini în schimbare",
    text: "Particulele sunt apropiate, dar se pot deplasa unele pe lângă altele. Lichidul se adaptează formei recipientului și ocupă partea sa inferioară.",
    observation:
      "Urmărește particula galbenă: își schimbă vecinii, fără să umple tot recipientul.",
  },
  gas: {
    title: "Gaz · mișcare liberă",
    text: "Particulele sunt mai depărtate și se deplasează în tot volumul disponibil. Ciocnirile cu pereții schimbă direcția mișcării.",
    observation:
      "Compară 100 K cu 600 K: la temperatură mai mare, particulele traversează recipientul mai repede.",
  },
};
const missions = [
  {
    phase: "solid",
    title: "Privește un solid",
    text: "Selectează Solid și observă particula galbenă. Cum se mișcă?",
    choices: [
      "Vibrează în jurul unei poziții fixe.",
      "Traversează tot recipientul.",
      "Este complet nemișcată la orice temperatură.",
    ],
    answer: 0,
    explanation:
      "În modelul solidului, particulele vibrează în jurul pozițiilor de echilibru.",
  },
  {
    phase: "liquid",
    title: "Descoperă lichidul",
    text: "Selectează Lichid. Ce diferență observi față de solid?",
    choices: [
      "Particulele rămân pe locuri fixe.",
      "Particulele își schimbă vecinii, rămânând apropiate.",
      "Particulele dispar.",
    ],
    answer: 1,
    explanation: "Particulele lichidului se deplasează unele pe lângă altele.",
  },
  {
    phase: "gas",
    title: "Încălzește gazul",
    text: "Selectează Gaz, observă 100 K, apoi 600 K. Ce se schimbă?",
    choices: [
      "La încălzire, mișcarea devine mai lentă.",
      "Numărul particulelor se dublează.",
      "Viteza caracteristică a particulelor crește.",
    ],
    answer: 2,
    explanation:
      "În acest model, viteza caracteristică este proporțională cu rădăcina temperaturii absolute.",
  },
];
let phase = "solid",
  temperature = 300,
  paused = false,
  simulationTime = 0;
let particles = [],
  trail = [],
  mission = 0,
  solved = false,
  seen = new Set(["solid"]),
  gasCold = false,
  gasHot = false;
let renderer,
  scene,
  camera,
  cloud,
  trailLine,
  observer,
  fallbackCanvas,
  context2D;
let yaw = 0.25,
  tilt = 0.3,
  distance = 15;
const COUNT = 64;
function speedFactor(value) {
  return Math.sqrt(value / 300);
}
function boundsFor(type) {
  return { x: 3.7, z: 3.7, minY: -3.5, maxY: type === "liquid" ? -0.3 : 3.5 };
}
function seedParticles() {
  particles = [];
  trail = [];
  simulationTime = 0;
  for (let i = 0; i < COUNT; i++) {
    const anchor = {
      x: ((i % 4) - 1.5) * 1.45,
      y: (Math.floor(i / 16) - 1.5) * 1.45,
      z: ((Math.floor(i / 4) % 4) - 1.5) * 1.45,
    };
    const b = boundsFor(phase);
    const position =
      phase === "solid"
        ? { ...anchor }
        : {
            x: anchor.x * 1.35,
            y:
              phase === "liquid"
                ? -3.2 + Math.floor(i / 16) * 0.8
                : anchor.y * 1.35,
            z: anchor.z * 1.35,
          };
    let velocity = {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1,
    };
    const length = Math.hypot(velocity.x, velocity.y, velocity.z) || 1;
    for (const axis of ["x", "y", "z"]) velocity[axis] /= length;
    particles.push({ ...position, anchor, velocity, offset: i * 1.83 });
  }
  if (cloud) updateMeshes();
}
function stepModel(dt) {
  const factor = speedFactor(temperature);
  simulationTime += dt;
  const bounds = boundsFor(phase);
  for (const p of particles) {
    if (phase === "solid") {
      const amplitude = 0.09 * factor;
      p.x = p.anchor.x + amplitude * Math.sin(simulationTime * 7 + p.offset);
      p.y =
        p.anchor.y + amplitude * Math.sin(simulationTime * 8 + p.offset * 2);
      p.z = p.anchor.z + amplitude * Math.cos(simulationTime * 6 + p.offset);
    } else {
      const speed = (phase === "gas" ? 2.3 : 0.8) * factor;
      for (const axis of ["x", "y", "z"])
        p[axis] += p.velocity[axis] * speed * dt;
      for (const [axis, min, max] of [
        ["x", -bounds.x, bounds.x],
        ["y", bounds.minY, bounds.maxY],
        ["z", -bounds.z, bounds.z],
      ]) {
        if (p[axis] < min) {
          p[axis] = min;
          p.velocity[axis] = Math.abs(p.velocity[axis]);
        }
        if (p[axis] > max) {
          p[axis] = max;
          p.velocity[axis] = -Math.abs(p.velocity[axis]);
        }
      }
    }
  }
  // Equal-mass, schematic collisions prevent moving particles from passing through one another.
  if (phase !== "solid")
    for (let i = 0; i < particles.length; i++)
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i],
          b = particles[j],
          dx = b.x - a.x,
          dy = b.y - a.y,
          dz = b.z - a.z;
        const length = Math.hypot(dx, dy, dz);
        if (length <= 0 || length >= 0.48) continue;
        const normal = { x: dx / length, y: dy / length, z: dz / length };
        const relative =
          (b.velocity.x - a.velocity.x) * normal.x +
          (b.velocity.y - a.velocity.y) * normal.y +
          (b.velocity.z - a.velocity.z) * normal.z;
        for (const axis of ["x", "y", "z"]) {
          const correction = (0.48 - length) / 2;
          a[axis] -= normal[axis] * correction;
          b[axis] += normal[axis] * correction;
          if (relative < 0) {
            a.velocity[axis] += relative * normal[axis];
            b.velocity[axis] -= relative * normal[axis];
          }
        }
      }
  if (phase !== "solid")
    for (const p of particles) {
      p.x = Math.max(-bounds.x, Math.min(bounds.x, p.x));
      p.y = Math.max(bounds.minY, Math.min(bounds.maxY, p.y));
      p.z = Math.max(-bounds.z, Math.min(bounds.z, p.z));
    }
  if (particles.length) {
    trail.push({ x: particles[0].x, y: particles[0].y, z: particles[0].z });
    if (trail.length > 180) trail.shift();
  }
}
function updateUI() {
  document.querySelectorAll("[data-phase]").forEach((button) => {
    button.classList.toggle("active", button.dataset.phase === phase);
    button.setAttribute("aria-pressed", button.dataset.phase === phase);
  });
  $("phaseTitle").textContent = phases[phase].title;
  $("phaseLabel").textContent = phases[phase].title;
  $("explanation").textContent = phases[phase].text;
  $("observation").textContent = phases[phase].observation;
  $("temperatureValue").textContent = temperature + " K";
  $("speed").textContent = speedFactor(temperature).toFixed(2) + "×";
  $("pause").textContent = paused ? "▶ Continuă" : "⏸ Pauză";
}
function showMission() {
  const m = missions[mission];
  solved = false;
  $("next").hidden = true;
  $("missionCount").textContent =
    "MISIUNEA " + (mission + 1) + " / " + missions.length;
  $("missionTitle").textContent = m.title;
  $("missionText").textContent = m.text;
  $("answers").innerHTML = m.choices
    .map((choice, index) => `<button data-answer="${index}">${choice}</button>`)
    .join("");
  $("answers")
    .querySelectorAll("button")
    .forEach(
      (button) =>
        (button.onclick = () =>
          answerMission(Number(button.dataset.answer), button)),
    );
}
function answerMission(index, button) {
  const m = missions[mission];
  if (!seen.has(m.phase)) {
    $("feedback").textContent =
      "Explorează mai întâi modul " + phases[m.phase].title + ".";
    return;
  }
  if (m.phase === "gas" && (!gasCold || !gasHot)) {
    $("feedback").textContent =
      "Compară mai întâi gazul la 100 K și la 600 K, cu simularea pornită.";
    return;
  }
  if (index !== m.answer) {
    button.classList.add("wrong");
    $("feedback").textContent = "Mai observă particulele și încearcă din nou.";
    return;
  }
  solved = true;
  button.classList.add("correct");
  $("answers")
    .querySelectorAll("button")
    .forEach((item) => (item.disabled = true));
  $("feedback").textContent =
    "✓ Corect! " +
    m.explanation +
    (mission === missions.length - 1
      ? " Ai terminat toate misiunile. Poți continua să experimentezi."
      : "");
  $("next").hidden = mission === missions.length - 1;
}
function setCamera() {
  camera.position.set(
    Math.sin(yaw) * Math.cos(tilt) * distance,
    Math.sin(tilt) * distance,
    Math.cos(yaw) * Math.cos(tilt) * distance,
  );
  camera.lookAt(0, 0, 0);
}
function updateMeshes() {
  cloud.children.forEach((mesh, index) => {
    const p = particles[index];
    mesh.position.set(p.x, p.y, p.z);
  });
  if (trailLine) {
    scene.remove(trailLine);
    trailLine.geometry.dispose();
    trailLine.material.dispose();
    trailLine = null;
  }
  if ($("trails").checked && trail.length > 1) {
    trailLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(
        trail.map((p) => new THREE.Vector3(p.x, p.y, p.z)),
      ),
      new THREE.LineBasicMaterial({ color: 0xd69c15 }),
    );
    scene.add(trailLine);
  }
}
function init3D() {
  if (typeof THREE === "undefined") return false;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6eefc);
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(3, 8, 5);
  scene.add(light);
  const box = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 8, 8)),
    new THREE.LineBasicMaterial({ color: 0x7d9abd }),
  );
  scene.add(box);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.MeshStandardMaterial({ color: 0xdce8fa, side: THREE.DoubleSide }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -4;
  scene.add(floor);
  cloud = new THREE.Group();
  scene.add(cloud);
  for (let i = 0; i < COUNT; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 16, 12),
      new THREE.MeshStandardMaterial({
        color: i === 0 ? 0xf6c445 : 0x2f5d9b,
        roughness: 0.35,
      }),
    );
    cloud.add(mesh);
  }
  $("view").appendChild(renderer.domElement);
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
  let previous = null;
  renderer.domElement.onpointerdown = (event) => {
    previous = [event.clientX, event.clientY];
    renderer.domElement.setPointerCapture(event.pointerId);
  };
  renderer.domElement.onpointermove = (event) => {
    if (!previous) return;
    yaw -= (event.clientX - previous[0]) * 0.008;
    tilt = Math.max(
      -0.8,
      Math.min(1.3, tilt + (event.clientY - previous[1]) * 0.008),
    );
    previous = [event.clientX, event.clientY];
    setCamera();
  };
  renderer.domElement.onpointerup = renderer.domElement.onpointercancel = () =>
    (previous = null);
  renderer.domElement.onwheel = (event) => {
    event.preventDefault();
    distance = Math.max(10, Math.min(25, distance + event.deltaY * 0.01));
    setCamera();
  };
  return true;
}
function initFallback() {
  $("renderLabel").textContent = "Vedere 2D · același model";
  fallbackCanvas = document.createElement("canvas");
  context2D = fallbackCanvas.getContext("2d");
  $("view").appendChild(fallbackCanvas);
}
function drawFallback() {
  const width = $("view").clientWidth,
    height = $("view").clientHeight;
  if (fallbackCanvas.width !== width || fallbackCanvas.height !== height) {
    fallbackCanvas.width = width;
    fallbackCanvas.height = height;
  }
  context2D.fillStyle = "#e6eefc";
  context2D.fillRect(0, 0, width, height);
  const scale = Math.min(width, height) * 0.095,
    project = (p) => [
      width / 2 + p.x * scale + p.z * scale * 0.22,
      height / 2 - p.y * scale + p.z * scale * 0.1,
    ];
  context2D.strokeStyle = "#7d9abd";
  context2D.strokeRect(
    width / 2 - 4 * scale,
    height / 2 - 4 * scale,
    8 * scale,
    8 * scale,
  );
  if ($("trails").checked && trail.length) {
    context2D.beginPath();
    trail.forEach((p, i) => {
      const [x, y] = project(p);
      if (i) context2D.lineTo(x, y);
      else context2D.moveTo(x, y);
    });
    context2D.strokeStyle = "#d69c15";
    context2D.stroke();
  }
  particles.forEach((p, i) => {
    const [x, y] = project(p);
    context2D.beginPath();
    context2D.arc(x, y, 0.23 * scale, 0, Math.PI * 2);
    context2D.fillStyle = i === 0 ? "#f6c445" : "#2f5d9b";
    context2D.fill();
  });
}
document.querySelectorAll("[data-phase]").forEach(
  (button) =>
    (button.onclick = () => {
      phase = button.dataset.phase;
      seen.add(phase);
      seedParticles();
      updateUI();
    }),
);
$("temperature").oninput = () => {
  temperature = Number($("temperature").value);
  updateUI();
};
$("pause").onclick = () => {
  paused = !paused;
  updateUI();
};
$("reset").onclick = () => seedParticles();
$("camera").onclick = () => {
  yaw = 0.25;
  tilt = 0.3;
  distance = 15;
  if (renderer) setCamera();
};
$("next").onclick = () => {
  if (!solved || mission >= missions.length - 1) return;
  mission++;
  showMission();
  $("feedback").textContent = "Observă simularea pentru următoarea misiune.";
};
let enabled3D = false;
try {
  enabled3D = init3D();
} catch (error) {
  if (observer) observer.disconnect();
  if (renderer) {
    renderer.domElement.remove();
    renderer.dispose();
  }
  renderer = null;
  cloud = null;
}
if (!enabled3D) initFallback();
seedParticles();
updateUI();
showMission();
let previousTime = null;
function animate(time) {
  requestAnimationFrame(animate);
  const dt =
    previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.035);
  previousTime = time;
  if (!paused) {
    stepModel(dt);
    if (phase === "gas" && temperature === 100) gasCold = true;
    if (phase === "gas" && temperature === 600) gasHot = true;
  }
  if (enabled3D) {
    updateMeshes();
    renderer.render(scene, camera);
  } else drawFallback();
}
requestAnimationFrame(animate);
