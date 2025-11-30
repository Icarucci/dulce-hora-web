// Guardamos acá el PIN válido para reutilizarlo al guardar
let adminPasswordGuardado = "";

// Cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const wifiForm = document.getElementById("wifiForm");

  // Manejar login
  loginForm.addEventListener("submit", manejarLogin);

  // Manejar guardado de WiFi
  wifiForm.addEventListener("submit", guardarWifi);
});

// Paso 1: validar PIN contra el servidor
async function manejarLogin(event) {
  event.preventDefault();

  const loginPinInput = document.getElementById("loginPin");
  const loginMessage = document.getElementById("loginMessage");
  const pin = loginPinInput.value.trim();

  if (!pin) {
    loginMessage.textContent = "Ingresá el PIN.";
    loginMessage.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/api/check-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminPassword: pin }),
    });

    if (!res.ok) {
      loginMessage.textContent = "PIN incorrecto.";
      loginMessage.style.color = "red";
      return;
    }

    // Si el PIN es correcto:
    adminPasswordGuardado = pin; // lo guardamos para usar después

    loginMessage.textContent = "";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("configSection").style.display = "block";

    // Cargar configuración actual de WiFi
    await cargarWifiActual();
  } catch (err) {
    console.error(err);
    loginMessage.textContent = "Error de conexión con el servidor.";
    loginMessage.style.color = "red";
  }
}

// Paso 2: cargar valores de WiFi actual al entrar al panel
async function cargarWifiActual() {
  try {
    const res = await fetch("/api/wifi");
    if (!res.ok) return;

    const data = await res.json();
    document.getElementById("ssid").value = data.ssid || "";
    // Si no querés mostrar la contraseña actual, dejá el campo vacío:
    // document.getElementById("password").value = "";
  } catch (err) {
    console.error(err);
  }
}

// Paso 3: guardar nueva WiFi
async function guardarWifi(event) {
  event.preventDefault();

  const ssid = document.getElementById("ssid").value.trim();
  const password = document.getElementById("password").value.trim();
  const mensaje = document.getElementById("mensaje");

  if (!ssid || !password) {
    mensaje.textContent = "Completá nombre de red y contraseña.";
    mensaje.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/api/wifi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ssid,
        password,
        adminPassword: adminPasswordGuardado,
      }),
    });

    if (res.ok) {
      mensaje.textContent = "WiFi actualizada correctamente.";
      mensaje.style.color = "green";
      // Si querés limpiar el campo contraseña luego de guardar:
      // document.getElementById("password").value = "";
    } else if (res.status === 401) {
      mensaje.textContent = "PIN inválido. Volvé a entrar al panel.";
      mensaje.style.color = "red";
      // Volver a login:
      document.getElementById("configSection").style.display = "none";
      document.getElementById("loginSection").style.display = "block";
    } else {
      mensaje.textContent = "Error al guardar la WiFi.";
      mensaje.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    mensaje.textContent = "Error de conexión con el servidor.";
    mensaje.style.color = "red";
  }
}