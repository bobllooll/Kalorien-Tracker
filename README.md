# 🥗 NutriScan AI - Kalorien Tracker

Eine moderne Progressive Web App (PWA) zum Tracken von Ernährung mittels künstlicher Intelligenz. Die App erkennt Gerichte auf Fotos, scannt Barcodes und synchronisiert alle Daten in der Cloud.

![App Screenshot](icon.svg)

## ✨ Features

*   📸 **AI Foto-Analyse:** Mach ein Foto von deinem Essen und lass dir Kalorien & Makros von Google Gemini oder GPT-4o schätzen.
*   🔍 **Barcode Scanner:** Integrierter Scanner für verpackte Lebensmittel (via OpenFoodFacts).
*   ☁️ **Cloud Sync:** Speicherung aller Daten, Rezepte und Einstellungen in Google Firebase.
*   📱 **Mobile First:** Fühlt sich auf dem Handy an wie eine native App (installierbar).
*   📊 **Statistiken:** Tagesziele für Kalorien, Protein, Fett, Carbs und Wasser.
*   🔐 **Datenschutz:** API-Keys werden verschlüsselt lokal auf dem Gerät gespeichert.

## 🚀 Installation & Einrichtung

Da es sich um eine reine Web-App (HTML/CSS/JS) handelt, ist keine komplexe Installation (wie `npm install`) nötig. Du brauchst nur einen Webserver und ein Firebase-Projekt.

### 1. Code herunterladen
Klone dieses Repository oder lade es als ZIP herunter:
```bash
git clone https://github.com/DEIN_USERNAME/nutriscan-ai.git
```

### 2. Firebase Datenbank erstellen (Kostenlos)
Damit der Login und die Datenspeicherung funktionieren, brauchst du ein eigenes Firebase-Projekt.

1.  Gehe auf die Firebase Console und klicke auf **"Projekt hinzufügen"**.
2.  Gib dem Projekt einen Namen (z.B. `kalorien-tracker`).
3.  Google Analytics kannst du deaktivieren (optional).
4.  **Authentication einrichten:**
    *   Gehe im Menü auf "Build" -> "Authentication".
    *   Klicke auf "Get started".
    *   Wähle **"E-Mail/Passwort"** als Sign-in method und aktiviere den ersten Schalter ("Email/Password"). Speichern.
5.  **Datenbank einrichten:**
    *   Gehe im Menü auf "Build" -> "Firestore Database".
    *   Klicke auf "Create database".
    *   Wähle einen Standort (z.B. `eur3` für Europa).
    *   Wähle **"Start in test mode"** (für den Anfang am einfachsten).
6.  **App registrieren & Config holen:**
    *   Klicke auf das Zahnrad neben "Project Overview" -> "Project settings".
    *   Scrolle nach unten zu "Your apps" und klicke auf das Web-Icon (`</>`).
    *   Gib der App einen Namen und klicke "Register app".
    *   Du siehst nun einen Code-Block mit `const firebaseConfig = { ... };`. **Kopiere den Inhalt zwischen den geschweiften Klammern.**

### 3. Konfiguration anpassen
Öffne die Datei `config.js` in deinem Projektordner und füge deine kopierten Firebase-Daten ein:

```javascript
// config.js
export const firebaseConfig = {
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_PROJEKT.firebaseapp.com",
  projectId: "DEIN_PROJEKT_ID",
  storageBucket: "DEIN_PROJEKT.firebasestorage.app",
  messagingSenderId: "DEINE_SENDER_ID",
  appId: "DEINE_APP_ID",
  measurementId: "OPTIONAL"
};
```

### 4. App starten
Du kannst die `index.html` nicht einfach per Doppelklick öffnen (wegen Sicherheitsrichtlinien moderner Browser). Du brauchst einen lokalen Server.

**Empfehlung (VS Code):**
1.  Installiere die Erweiterung **"Live Server"**.
2.  Rechtsklick auf `index.html` -> **"Open with Live Server"**.

Alternativ mit Python:
```bash
python -m http.server 8000
```
Öffne dann `http://localhost:8000` im Browser.

## 🔑 API Keys (In der App)

Damit die KI-Funktionen (Bilderkennung) funktionieren, benötigt die App API-Keys. Diese werden **nicht** im Code hinterlegt, sondern vom Nutzer direkt in der App eingetragen:

1.  Starte die App und registriere dich.
2.  Klicke oben rechts auf das Profil-Icon (👤).
3.  Trage deinen **Google Gemini API Key** ein (Kostenlos hier erhältlich: Google AI Studio).
4.  (Optional) Trage einen OpenAI API Key ein, wenn du GPT-4o nutzen möchtest.
5.  Klicke auf "Speichern".

## 📱 Als App installieren (iOS/Android)

**iOS (Safari):**
Tippe auf den "Teilen"-Button -> "Zum Home-Bildschirm".

**Android (Chrome):**
Tippe auf die drei Punkte -> "App installieren" oder nutze den Button in der App.

## ⚖️ Lizenz

Dieses Projekt ist Open Source. Du kannst es für private Zwecke frei nutzen und anpassen.

---
Entwickelt mit ❤️ und viel Kaffee.