let wifiVisible = false; // estado inicial

async function toggleWifi() {
  const wifiBox = document.getElementById("wifiBox");
  const wifiBtn = document.getElementById("wifiBtn");

  // Si actualmente está visible → ocultar
  if (wifiVisible) {
    wifiBox.style.display = "none";
    wifiBtn.textContent = "Mostrar WiFi del día";
    wifiVisible = false;
    return;
  }

  // Si está oculto → cargar datos y mostrar
  const res = await fetch("/api/wifi");
  const data = await res.json();

  document.getElementById("wifiTexto").innerText =
    `📶 WiFi: ${data.ssid}\n🔑 Contraseña: ${data.password}`;

  wifiBox.style.display = "block";
  wifiBtn.textContent = "Ocultar WiFi";
  wifiVisible = true;
}