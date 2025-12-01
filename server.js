require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Render (y otros hosts) te dan el puerto en process.env.PORT
const PORT = process.env.PORT || 3000;

// CONTRASEÑA DEL ADMINISTRADOR OCULTA
const ADMIN_PASSWORD = "Javito2025";

const wifiFile = path.join(__dirname, "wifi.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadWifi() {
  try {
    const data = fs.readFileSync(wifiFile, "utf8");
    return JSON.parse(data);
  } catch {
    // Si no existe wifi.json o está mal, devolvemos un valor por defecto
    return { ssid: "DulceHora_WiFi", password: "cafe2025" };
  }
}

// Obtener la wifi actual (para la página pública)
app.get("/api/wifi", (req, res) => {
  res.json(loadWifi());
});

// Cambiar la wifi (desde admin, con PIN)
app.post("/api/wifi", (req, res) => {
  const { adminPassword, ssid, password } = req.body;

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD no está configurado en el servidor" });
  }

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "PIN incorrecto" });
  }

  if (!ssid || !password) {
    return res.status(400).json({ error: "Faltan datos (ssid o password)" });
  }

  const newWifi = { ssid, password };
  fs.writeFileSync(wifiFile, JSON.stringify(newWifi, null, 2), "utf8");

  res.json({ ok: true, wifi: newWifi });
});

// Verificar PIN de admin (para mostrar el panel)
app.post("/api/check-admin", (req, res) => {
  const { adminPassword } = req.body;

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD no está configurado en el servidor" });
  }

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "PIN incorrecto" });
  }

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
