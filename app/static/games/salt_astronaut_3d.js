const $ = (id) => document.getElementById(id);
const worlds = {
  mercury: { name: "Mercur", g: 3.7, color: 0xa39b89 },
  venus: { name: "Venus", g: 8.87, color: 0xd6ad6c },
  earth: { name: "Pământ", g: 9.81, color: 0x2f78b4 },
  mars: { name: "Marte", g: 3.71, color: 0xc87852 },
  jupiter: { name: "Jupiter", g: 25.92, color: 0xcda681, giant: true },
  saturn: { name: "Saturn", g: 11.19, color: 0xd4bf85, giant: true },
  uranus: { name: "Uranus", g: 9.01, color: 0x72c9d5, giant: true },
  neptune: { name: "Neptun", g: 11.27, color: 0x4260b4, giant: true },
  moon: { name: "Lună (satelit)", g: 1.62, color: 0xaab2c0 },
};
let world = "earth",
  velocity = 3,
  mass = 60,
  flight = null,
  elapsed = 0;
let results = {},
  prediction = null;
let renderer, scene, camera, astronaut, ground, observer, canvas2D, context;
let yaw = 0.15,
  tilt = 0.25,
  distance = 19;
function jumpStats(v, g) {
  return { height: (v * v) / (2 * g), duration: (2 * v) / g };
}
function jumpHeight(v, g, time) {
  return Math.max(0, v * time - 0.5 * g * time * time);
}
$("concept").textContent = "Aceeași săritură, altă gravitație";
$("intro").textContent =
  "Astronautul pornește de fiecare dată cu aceeași viteză verticală. Alege o lume, apasă „Sari” și compară înălțimea și timpul până la aterizare.";
$("modelNote").innerHTML =
  'Model fără atmosferă, cu gravitație constantă și aceeași viteză inițială. În realitate, efortul astronautului nu garantează aceeași viteză de lansare. Masa influențează greutatea, dar nu traiectoria pentru aceeași viteză. Timpul animației este timpul modelului. Luna este un satelit. Pe Jupiter, Saturn, Uranus și Neptun, platforma este imaginară: nu există o suprafață solidă accesibilă. Pentru acestea folosim gravitația medie la nivelul atmosferic de 1 bar, conform fișelor NASA; ignorăm atmosfera și rotația. <a href="https://nssdc.gsfc.nasa.gov/planetary/planetfact.html" target="_blank" rel="noopener">Valori aproximative: NASA GSFC</a>.';
$("controls").innerHTML =
  `<label for="world">Locul săriturii</label><select id="world">${Object.entries(
    worlds,
  )
    .map(([key, w]) => `<option value="${key}">${w.name}</option>`)
    .join(
      "",
    )}</select><label for="velocity">Viteză inițială: <b id="velocityValue"></b></label><input id="velocity" type="range" min="1" max="5" step=".5" value="3"><label for="mass">Masa astronautului: <b id="massValue"></b></label><input id="mass" type="range" min="30" max="100" step="10" value="60"><p class="muted">Schimbarea vitezei începe o comparație nouă. Schimbă masa pentru a observa ce rămâne la fel.</p>`;
$("missionCount").textContent = "PROVOCARE · 8 PLANETE + LUNA";
$("missionTitle").textContent = "Unde va sări mai sus?";
$("missionText").textContent =
  "Fă o predicție pentru toate lumile. Testează cel puțin Pământul, Luna și Marte; celelalte planete pot fi explorate oricând.";
$("next").hidden = false;
$("next").textContent = "Verifică predicția";
function renderPrediction() {
  $("answers").innerHTML = Object.entries(worlds)
    .map(
      ([key, w]) =>
        `<button data-world="${key}" class="${prediction === key ? "active" : ""}">${w.name}</button>`,
    )
    .join("");
  $("answers")
    .querySelectorAll("button")
    .forEach(
      (button) =>
        (button.onclick = () => {
          prediction = button.dataset.world;
          renderPrediction();
          $("feedback").textContent =
            "Predicție: " +
            worlds[prediction].name +
            ". Testează lumile disponibile.";
        }),
    );
}
function update(height = 0) {
  const w = worlds[world],
    stats = jumpStats(velocity, w.g);
  $("velocityValue").textContent = velocity.toFixed(1) + " m/s";
  $("massValue").textContent = mass + " kg";
  $("sceneStatus").textContent =
    w.name + " · " + (flight ? "În aer" : "Pregătit pentru salt");
  $("metrics").innerHTML =
    `Înălțime acum: <b>${height.toFixed(2)} m</b><br>Timp: ${elapsed.toFixed(2)} s<br>Masă: ${mass} kg · Greutate: ${(mass * w.g).toFixed(1)} N<br>g ≈ ${w.g} m/s²${w.giant ? '<br><span class="muted">Platformă imaginară · gravitație la 1 bar, fără atmosferă în simulare.</span>' : ""}<hr><b>Sărituri încheiate · v₀ = ${velocity.toFixed(1)} m/s</b><br>` +
    Object.entries(worlds)
      .map(([key, value]) =>
        results[key]
          ? `${value.name}: <b>${results[key].height.toFixed(2)} m</b> · ${results[key].duration.toFixed(2)} s`
          : `${value.name}: netestat`,
      )
      .join("<br>");
  for (const id of ["world", "velocity", "mass"])
    $(id).disabled = Boolean(flight);
  $("play").disabled = Boolean(flight);
  $("play").textContent = flight ? "Salt în desfășurare…" : "🚀 Sari";
  if (renderer) {
    astronaut.position.y = height;
    ground.material.color.setHex(w.color);
  } else draw2D(height);
}
$("world").onchange = () => {
  world = $("world").value;
  elapsed = 0;
  update();
};
$("velocity").oninput = () => {
  velocity = Number($("velocity").value);
  results = {};
  elapsed = 0;
  $("feedback").textContent =
    "Viteză schimbată: testează din nou lumile disponibile.";
  update();
};
$("mass").oninput = () => {
  mass = Number($("mass").value);
  update();
};
$("play").onclick = () => {
  flight = {
    world,
    velocity,
    g: worlds[world].g,
    startedAt: performance.now(),
  };
  elapsed = 0;
  update();
};
$("reset").onclick = () => {
  flight = null;
  elapsed = 0;
  results = {};
  prediction = null;
  renderPrediction();
  update();
  $("feedback").textContent = "Experiment resetat. Fă o predicție nouă.";
};
$("next").onclick = () => {
  if (!prediction) {
    $("feedback").textContent =
      "Alege mai întâi unde crezi că astronautul sare cel mai sus.";
    return;
  }
  if (!["earth", "moon", "mars", prediction].every((key) => results[key])) {
    $("feedback").textContent =
      "Testează Pământul, Luna și Marte cu aceeași viteză inițială. Dacă ai ales altă planetă în predicție, testeaz-o și pe ea.";
    return;
  }
  const highest = Object.keys(results).reduce(
    (best, key) => (results[key].height > results[best].height ? key : best),
    "earth",
  );
  $("feedback").textContent =
    prediction === highest
      ? "✓ Corect! Pe Lună, gravitația mai mică permite o săritură mai înaltă și mai lungă. Masa rămâne aceeași; greutatea se schimbă."
      : "Rezultatele arată cea mai mare înălțime pe " +
        worlds[highest].name +
        ". Pentru aceeași viteză inițială: h = v₀² / (2g). Încearcă o predicție nouă.";
};
function setCamera() {
  camera.position.set(
    Math.sin(yaw) * Math.cos(tilt) * distance,
    3 + Math.sin(tilt) * distance,
    Math.cos(yaw) * Math.cos(tilt) * distance,
  );
  camera.lookAt(0, 3, 0);
}
function init3D() {
  if (typeof THREE === "undefined") return false;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6eefc);
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(4, 10, 5);
  scene.add(light);
  ground = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 0.25, 64),
    new THREE.MeshStandardMaterial({ color: worlds.earth.color }),
  );
  ground.position.y = -0.125;
  scene.add(ground);
  astronaut = new THREE.Group();
  scene.add(astronaut);
  function box(w, h, d, x, y, z, color) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
    );
    mesh.position.set(x, y, z);
    astronaut.add(mesh);
  }
  box(0.7, 0.8, 0.45, 0, 0.98, 0, 0xffffff);
  box(0.5, 0.65, 0.3, 0, 1, -0.36, 0xf6c445);
  for (const sign of [-1, 1]) {
    box(0.22, 0.6, 0.22, sign * 0.22, 0.4, 0, 0xffffff);
    box(0.32, 0.16, 0.45, sign * 0.22, 0.08, 0.08, 0x2f5d9b);
    box(0.22, 0.62, 0.22, sign * 0.52, 1, 0, 0xffffff);
  }
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.37, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff }),
  );
  helmet.position.y = 1.65;
  astronaut.add(helmet);
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.29, 24, 16),
    new THREE.MeshStandardMaterial({
      color: 0x0b2545,
      metalness: 0.4,
      roughness: 0.2,
    }),
  );
  visor.scale.set(1, 0.7, 0.4);
  visor.position.set(0, 1.65, 0.28);
  astronaut.add(visor);
  const ruler = new THREE.Group();
  scene.add(ruler);
  for (let i = 0; i <= 8; i++) {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.025, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x5f6f8c }),
    );
    tick.position.set(2, i, 0);
    ruler.add(tick);
  }
  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2, 0, 0),
      new THREE.Vector3(2, 8, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0x5f6f8c }),
  );
  scene.add(axis);
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
      0.05,
      Math.min(0.8, tilt + (event.clientY - previous[1]) * 0.008),
    );
    previous = [event.clientX, event.clientY];
    setCamera();
  };
  renderer.domElement.onpointerup = renderer.domElement.onpointercancel = () =>
    (previous = null);
  renderer.domElement.onwheel = (event) => {
    event.preventDefault();
    distance = Math.max(14, Math.min(26, distance + event.deltaY * 0.01));
    setCamera();
  };
  return true;
}
function init2D() {
  canvas2D = document.createElement("canvas");
  context = canvas2D.getContext("2d");
  $("view").appendChild(canvas2D);
  $("renderStatus").textContent = "Vedere 2D · același model fizic";
}
function draw2D(height) {
  const w = $("view").clientWidth,
    h = $("view").clientHeight;
  canvas2D.width = w;
  canvas2D.height = h;
  const scale = Math.min(h / 12, w / 12);
  context.fillStyle = "#e6eefc";
  context.fillRect(0, 0, w, h);
  context.fillStyle = "#" + worlds[world].color.toString(16);
  context.fillRect(0, h - 40, w, 40);
  const x = w / 2,
    y = h - 40 - height * scale;
  context.fillStyle = "white";
  context.fillRect(x - 18, y - 60, 36, 40);
  context.beginPath();
  context.arc(x, y - 76, 19, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#0b2545";
  context.fillRect(x - 14, y - 83, 28, 13);
  context.fillRect(x - 15, y - 20, 9, 20);
  context.fillRect(x + 6, y - 20, 9, 20);
}
$("camera").onclick = () => {
  yaw = 0.15;
  tilt = 0.25;
  distance = 19;
  if (renderer) setCamera();
};
let enabled = false;
try {
  enabled = init3D();
} catch (error) {
  if (observer) observer.disconnect();
  if (renderer) {
    renderer.domElement.remove();
    renderer.dispose();
  }
  renderer = null;
}
if (!enabled) init2D();
renderPrediction();
update();
function animate(time) {
  requestAnimationFrame(animate);
  if (flight) {
    elapsed = Math.max(0, (time - flight.startedAt) / 1000);
    const stats = jumpStats(flight.velocity, flight.g);
    if (elapsed >= stats.duration) {
      elapsed = stats.duration;
      results[flight.world] = stats;
      flight = null;
      update(0);
      $("feedback").textContent =
        "Aterizare! Rezultatul este salvat. Alege altă lume pentru comparație.";
    } else update(jumpHeight(flight.velocity, flight.g, elapsed));
  }
  if (renderer) renderer.render(scene, camera);
}
requestAnimationFrame(animate);
