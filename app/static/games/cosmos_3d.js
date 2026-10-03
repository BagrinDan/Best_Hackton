const $ = (id) => document.getElementById(id);
const game = document.body.dataset.game;
const planets = {
  earth: { name: "Pământ", g: 9.81, color: 0x2f78b4 },
  moon: { name: "Lună (satelit)", g: 1.62, color: 0xaab2c0 },
  mars: { name: "Marte", g: 3.71, color: 0xc87852 },
  mercury: { name: "Mercur", g: 3.7, color: 0xa39b89 },
};
const lessons = {
  gravity: {
    title: "Masa și greutatea",
    intro:
      "Masa se măsoară în kilograme și rămâne aceeași. Greutatea este o forță: dinamometrul o măsoară în newtoni.",
    note: "Valori aproximative ale accelerației gravitaționale. Platforma reprezintă simbolic locul măsurării; mărimile corpurilor cerești nu sunt la scară. Arcul dinamometrului are k = 1000 N/m. Luna este un satelit, nu o planetă.",
    missions: [
      [
        "Schimbă lumea",
        "Alege aceeași masă pe Pământ și pe Lună. Ce rămâne constant?",
        ["Masa în kilograme.", "Greutatea în newtoni.", "Gravitația."],
        0,
        "Masa nu se schimbă; greutatea depinde de g.",
      ],
      [
        "Greutate mai mică",
        "Pentru același corp, unde este greutatea mai mică?",
        ["Pe Pământ.", "Pe Lună.", "Este identică peste tot."],
        1,
        "Luna are o accelerație gravitațională mai mică.",
      ],
      [
        "Calculează",
        "Alege 10 kg pe Pământ. Aproximativ ce indică dinamometrul?",
        ["10 N.", "981 N.", "98,1 N."],
        2,
        "G = 10 × 9,81 = 98,1 N.",
      ],
    ],
  },
  eclipse: {
    title: "Lumina și umbrele",
    intro:
      "Mută Luna în jurul Pământului. Când corpurile sunt aliniate, umbra poate produce o eclipsă. Folosește butoanele de aliniere, apoi înclină orbita.",
    note: "Dimensiunile, distanțele și umbrele sunt schematice. Soarele se află în stânga. Înclinarea orbitei este exagerată pentru vizibilitate. Nu sunt calculate durata, penumbra, eclipsele inelare sau vizibilitatea de la un oraș. Nu privi Soarele direct; simularea nu este un ghid de observație.",
    missions: [
      [
        "Eclipsă de Soare",
        "Apasă „Aliniere solară”. Cine se află la mijloc?",
        ["Luna.", "Soarele.", "Pământul."],
        0,
        "Luna se află între Soare și Pământ și aruncă o umbră pe Pământ.",
      ],
      [
        "Eclipsă de Lună",
        "Apasă „Aliniere lunară”. A cui umbră ajunge pe Lună?",
        ["Umbra Lunii.", "Umbra Pământului.", "Umbra Soarelui."],
        1,
        "Pământul se află între Soare și Lună.",
      ],
      [
        "De ce nu în fiecare lună?",
        "Activează orbita înclinată și încearcă ambele alinieri. De ce nu apare o eclipsă la fiecare revoluție?",
        [
          "Luna nu se mișcă.",
          "Soarele se stinge.",
          "Orbita Lunii este înclinată.",
        ],
        2,
        "De obicei, Luna trece deasupra sau dedesubtul alinierii necesare.",
      ],
    ],
  },
  day: {
    title: "Rotația Pământului",
    intro:
      "Punctul galben este un oraș imaginar de la ecuator. Rotește Pământul și observă când orașul intră în lumină sau în întuneric.",
    note: "Model ecuatorial, fără înclinarea axei: nu simulează anotimpurile sau ziua polară. Un tur reprezintă aproximativ 24 de ore, comprimate în animație. Soarele este fix în stânga, iar jumătatea îndreptată spre el este iluminată. Continentele desenate sunt illustrative.",
    missions: [
      [
        "De unde vine ziua?",
        "Rotește orașul către Soare. De ce este zi?",
        [
          "Orașul este pe partea luminată.",
          "Pământul produce lumină.",
          "Luna aprinde orașul.",
        ],
        0,
        "Lumina Soarelui ajunge la partea Pământului orientată spre el.",
      ],
      [
        "De ce vine noaptea?",
        "Rotește orașul pe partea opusă. Ce produce alternanța zi/noapte?",
        [
          "Mișcarea norilor.",
          "Rotația Pământului în jurul axei.",
          "Schimbarea masei.",
        ],
        1,
        "Rotația duce același loc din lumină în întuneric și înapoi.",
      ],
      [
        "Un ciclu complet",
        "Apasă „Pornește animația”. Cât durează aproximativ un ciclu zi/noapte pe Pământ?",
        ["O lună.", "Un an.", "24 de ore."],
        2,
        "O zi solară durează aproximativ 24 de ore.",
      ],
    ],
  },
};
let planet = "earth",
  mass = 10,
  angle = 180,
  inclined = false,
  running = false,
  mission = 0,
  solved = false;
let renderer,
  scene,
  camera,
  objects = {},
  observer,
  fallback,
  ctx;
let yaw = 0.15,
  tilt = 0.55,
  distance = 19;
function weight(m, g) {
  return m * g;
}
function eclipseState(degrees, hasInclination) {
  const radians = (degrees * Math.PI) / 180,
    x = 2.8 * Math.cos(radians),
    z = 2.8 * Math.sin(radians),
    y = hasInclination ? 0.95 * Math.cos(radians) : 0;
  const offset = Math.hypot(y, z);
  return {
    x,
    y,
    z,
    event:
      offset < 0.35
        ? x < 0
          ? "Eclipsă de Soare"
          : "Eclipsă de Lună"
        : "Fără eclipsă",
  };
}
function daylight(degrees) {
  return Math.cos((degrees * Math.PI) / 180) < 0;
}
function controls() {
  if (game === "gravity") {
    $("controls").innerHTML =
      `<label for="planet">Corp ceresc</label><select id="planet">${Object.entries(
        planets,
      )
        .map(([key, p]) => `<option value="${key}">${p.name}</option>`)
        .join(
          "",
        )}</select><label for="mass">Masa: <b id="massValue"></b></label><input id="mass" type="range" min="1" max="100" value="10"><p class="muted">Compară același obiect, apoi modifică masa.</p>`;
    $("planet").onchange = () => {
      planet = $("planet").value;
      update();
    };
    $("mass").oninput = () => {
      mass = Number($("mass").value);
      update();
    };
    $("play").textContent = "Compară cu Luna";
  } else {
    $("controls").innerHTML =
      `<label for="angle">${game === "eclipse" ? "Poziția Lunii" : "Rotația Pământului"}: <b id="angleValue"></b></label><input id="angle" type="range" min="0" max="360" value="180">` +
      (game === "eclipse"
        ? '<div class="toolbar"><button id="solar">Aliniere solară</button><button id="lunar">Aliniere lunară</button></div><label><input id="inclined" type="checkbox"> Orbită înclinată</label>'
        : '<div class="toolbar"><button id="noon">Orașul în lumină</button><button id="midnight">Orașul în întuneric</button></div>');
    $("angle").oninput = () => {
      angle = Number($("angle").value);
      update();
    };
    if (game === "eclipse") {
      $("solar").onclick = () => {
        angle = 180;
        update();
      };
      $("lunar").onclick = () => {
        angle = 0;
        update();
      };
      $("inclined").onchange = () => {
        inclined = $("inclined").checked;
        update();
      };
    } else {
      $("noon").onclick = () => {
        angle = 180;
        update();
      };
      $("midnight").onclick = () => {
        angle = 0;
        update();
      };
    }
  }
}
function update() {
  if (game === "gravity") {
    const p = planets[planet],
      force = weight(mass, p.g);
    $("planet").value = planet;
    $("mass").value = mass;
    $("massValue").textContent = mass + " kg";
    $("sceneStatus").textContent = p.name + " · " + force.toFixed(1) + " N";
    $("metrics").innerHTML =
      `Masă: <b>${mass} kg</b><br>g ≈ ${p.g.toFixed(2)} m/s²<br>Greutate: <b>${force.toFixed(2)} N</b><br>G = m × g<br>Alungire arc: ${((force / 1000) * 100).toFixed(1)} cm`;
    if (renderer) {
      objects.planet.material.color.setHex(p.color);
      const extension = (force / 981) * 2.2;
      objects.load.position.y = 1.1 - extension;
      objects.spring.scale.y = 0.95 + extension;
      objects.spring.position.y = 2.6;
    }
  } else {
    $("angle").value = angle;
    $("angleValue").textContent = Math.round(angle) + "°";
    if (game === "eclipse") {
      const position = eclipseState(angle, inclined);
      $("sceneStatus").textContent = position.event;
      $("metrics").innerHTML =
        `<b>${position.event}</b><br>${position.event === "Eclipsă de Soare" ? "Soare → Lună → Pământ" : position.event === "Eclipsă de Lună" ? "Soare → Pământ → Lună" : "Corpurile nu sunt aliniate pentru eclipsă."}`;
      if (renderer) {
        objects.moon.position.set(position.x, position.y, position.z);
        objects.moonShadow.position.set(
          position.x + 1.65,
          position.y,
          position.z,
        );
        objects.moonShadow.visible = position.x < 0;
        objects.moon.material.color.setHex(
          position.event === "Eclipsă de Lună" ? 0xa45240 : 0xbbc4d0,
        );
      }
    } else {
      const isDay = daylight(angle);
      $("sceneStatus").textContent = isDay
        ? "Zi la orașul galben"
        : "Noapte la orașul galben";
      $("metrics").innerHTML =
        `Orașul: <b>${isDay ? "ZI" : "NOAPTE"}</b><br>Rotație: ${Math.round(angle)}°<br>Un ciclu ≈ 24 h<br>Marker galben = oraș imaginar`;
      if (renderer) objects.earth.rotation.y = (angle * Math.PI) / 180;
    }
    $("play").textContent = running ? "Pauză" : "Pornește animația";
  }
  if (!renderer) drawFallback();
}
function showMission() {
  const m = lessons[game].missions[mission];
  solved = false;
  $("next").hidden = true;
  $("missionCount").textContent = `MISIUNEA ${mission + 1} / 3`;
  $("missionTitle").textContent = m[0];
  $("missionText").textContent = m[1];
  $("answers").innerHTML = m[2]
    .map((answer, i) => `<button data-answer="${i}">${answer}</button>`)
    .join("");
  $("answers")
    .querySelectorAll("button")
    .forEach(
      (button) =>
        (button.onclick = () => {
          const correct = Number(button.dataset.answer) === m[3];
          button.classList.add(correct ? "correct" : "wrong");
          $("feedback").textContent = correct
            ? "✓ " +
              m[4] +
              (mission === 2 ? " Ai terminat! Continuă să explorezi." : "")
            : "Mai observă scena și încearcă din nou.";
          if (correct) {
            solved = true;
            $("answers")
              .querySelectorAll("button")
              .forEach((item) => (item.disabled = true));
            $("next").hidden = mission === 2;
          }
        }),
    );
}
function sphere(radius, color, x, y, z, emissive = false) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 40, 24),
    emissive
      ? new THREE.MeshBasicMaterial({ color })
      : new THREE.MeshStandardMaterial({ color, roughness: 0.8 }),
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  return mesh;
}
function line(points, color) {
  const mesh = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color }),
  );
  scene.add(mesh);
  return mesh;
}
function earthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const c = canvas.getContext("2d");
  c.fillStyle = "#4384b8";
  c.fillRect(0, 0, 512, 256);
  c.fillStyle = "#78a97a";
  for (const polygon of [
    [
      [55, 45],
      [125, 30],
      [165, 85],
      [115, 120],
      [75, 95],
    ],
    [
      [145, 125],
      [195, 135],
      [175, 225],
      [140, 180],
    ],
    [
      [250, 55],
      [330, 45],
      [385, 85],
      [305, 115],
    ],
    [
      [265, 110],
      [320, 130],
      [290, 195],
    ],
    [
      [390, 170],
      [440, 160],
      [455, 200],
      [410, 205],
    ],
  ]) {
    c.beginPath();
    polygon.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.closePath();
    c.fill();
  }
  return new THREE.CanvasTexture(canvas);
}
function init3D() {
  if (typeof THREE === "undefined") return false;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe6eefc);
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, game === "gravity" ? 0.7 : 0.13));
  const sunlight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunlight.position.set(-10, 0, 0);
  scene.add(sunlight);
  if (game === "gravity") {
    objects.planet = sphere(2.1, planets.earth.color, -3, -1.7, 0);
    const frame = new THREE.Group();
    scene.add(frame);
    const bar = (w, h, d, x, y) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: 0x2f5d9b }),
      );
      mesh.position.set(x, y, 0);
      frame.add(mesh);
    };
    bar(0.2, 6, 0.2, 3, 0);
    bar(3, 0.2, 0.2, 1.6, 2.9);
    bar(3, 0.2, 2, 2, -3);
    const curve = [];
    for (let i = 0; i <= 150; i++) {
      const t = i / 150;
      curve.push(
        new THREE.Vector3(
          0.7 + 0.22 * Math.cos(t * Math.PI * 20),
          -t,
          0.22 * Math.sin(t * Math.PI * 20),
        ),
      );
    }
    objects.spring = line(curve, 0xd69c15);
    objects.load = new THREE.Group();
    scene.add(objects.load);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: 0xf6c445 }),
    );
    body.position.x = 0.7;
    objects.load.add(body);
  } else {
    objects.sun = sphere(1.1, 0xf6c445, -7, 0, 0, true);
    objects.earth = sphere(game === "day" ? 1.8 : 1, 0xffffff, 0, 0, 0);
    objects.earth.material.map = earthTexture();
    objects.earth.material.needsUpdate = true;
    if (game === "eclipse") {
      objects.moon = sphere(0.35, 0xbbc4d0, 2.8, 0, 0);
      const orbit = [];
      for (let i = 0; i <= 100; i++) {
        const a = (i / 100) * Math.PI * 2;
        orbit.push(new THREE.Vector3(2.8 * Math.cos(a), 0, 2.8 * Math.sin(a)));
      }
      line(orbit, 0x8ca5c4);
      function shadow(radiusA, radiusB, length) {
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(radiusB, radiusA, length, 32, 1, true),
          new THREE.MeshBasicMaterial({
            color: 0x0b2545,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        mesh.rotation.z = -Math.PI / 2;
        scene.add(mesh);
        return mesh;
      }
      objects.earthShadow = shadow(1, 0.45, 4.5);
      objects.earthShadow.position.x = 2.25;
      objects.moonShadow = shadow(0.35, 0.16, 3.3);
    } else {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xf6c445 }),
      );
      marker.position.set(1.85, 0, 0);
      objects.earth.add(marker);
      line(
        [new THREE.Vector3(0, -2.6, 0), new THREE.Vector3(0, 2.6, 0)],
        0x7d9abd,
      );
    }
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
      -0.5,
      Math.min(1.4, tilt + (event.clientY - previous[1]) * 0.008),
    );
    previous = [event.clientX, event.clientY];
    setCamera();
  };
  renderer.domElement.onpointerup = renderer.domElement.onpointercancel = () =>
    (previous = null);
  renderer.domElement.onwheel = (event) => {
    event.preventDefault();
    distance = Math.max(12, Math.min(28, distance + event.deltaY * 0.01));
    setCamera();
  };
  return true;
}
function setCamera() {
  camera.position.set(
    Math.sin(yaw) * Math.cos(tilt) * distance,
    Math.sin(tilt) * distance,
    Math.cos(yaw) * Math.cos(tilt) * distance,
  );
  camera.lookAt(-1, 0, 0);
}
function initFallback() {
  fallback = document.createElement("canvas");
  ctx = fallback.getContext("2d");
  $("view").appendChild(fallback);
  $("renderStatus").textContent = "Schemă 2D · verifică internetul/WebGL";
}
function drawFallback() {
  const w = $("view").clientWidth,
    h = $("view").clientHeight;
  fallback.width = w;
  fallback.height = h;
  ctx.fillStyle = "#e6eefc";
  ctx.fillRect(0, 0, w, h);
  const scale = Math.min(w / 18, h / 10);
  function disc(x, y, r, color, name) {
    ctx.beginPath();
    ctx.arc(w / 2 + x * scale, h / 2 - y * scale, r * scale, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "#0b2545";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(name, w / 2 + x * scale, h / 2 - y * scale + r * scale + 20);
  }
  if (game === "gravity") {
    disc(
      -3,
      -1,
      2,
      "#" + planets[planet].color.toString(16).padStart(6, "0"),
      planets[planet].name,
    );
    ctx.fillStyle = "#0b2545";
    ctx.fillText(
      mass + " kg → " + weight(mass, planets[planet].g).toFixed(1) + " N",
      w * 0.7,
      h / 2,
    );
  } else {
    disc(-7, 0, 1, "#f6c445", "Soare");
    disc(0, 0, game === "day" ? 1.8 : 1, "#4384b8", "Pământ");
    if (game === "eclipse") {
      const p = eclipseState(angle, inclined);
      disc(p.x, p.z, 0.35, "#aab2c0", "Lună");
    } else {
      const a = (angle * Math.PI) / 180;
      disc(Math.cos(a) * 1.8, Math.sin(a) * 1.8, 0.12, "#f6c445", "Oraș");
      ctx.fillStyle = "#0b254577";
      ctx.fillRect(w / 2, h / 2 - 1.8 * scale, 1.8 * scale, 3.6 * scale);
    }
  }
}
$("concept").textContent = lessons[game].title;
$("intro").textContent = lessons[game].intro;
$("modelNote").textContent = lessons[game].note;
if (game === "gravity") {
  $("modelNote").insertAdjacentHTML(
    "beforeend",
    ' <a href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html" target="_blank" rel="noopener">Sursă: NASA GSFC</a>',
  );
}
controls();
$("play").onclick = () => {
  if (game === "gravity") {
    planet = planet === "moon" ? "earth" : "moon";
    update();
  } else {
    running = !running;
    update();
  }
};
$("camera").onclick = () => {
  yaw = 0.15;
  tilt = 0.55;
  distance = 19;
  if (renderer) setCamera();
};
$("reset").onclick = () => {
  planet = "earth";
  mass = 10;
  angle = 180;
  inclined = false;
  running = false;
  if ($("inclined")) $("inclined").checked = false;
  update();
};
$("next").onclick = () => {
  if (!solved || mission >= 2) return;
  mission++;
  showMission();
  $("feedback").textContent = "Explorează următoarea situație.";
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
if (!enabled) initFallback();
showMission();
update();
let previousTime = null;
function animate(time) {
  requestAnimationFrame(animate);
  const dt =
    previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
  previousTime = time;
  if (running && game !== "gravity") {
    angle = (angle + dt * (game === "day" ? 20 : 15)) % 360;
    update();
  }
  if (renderer) renderer.render(scene, camera);
}
requestAnimationFrame(animate);
