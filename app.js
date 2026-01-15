// Importiere das offizielle Google AI SDK für den Browser
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
// Importiere Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// --- FIREBASE KONFIGURATION ---
// 1. Gehe auf console.firebase.google.com
// 2. Erstelle ein Projekt -> Web App
// 3. Kopiere deine Config hier rein:
const firebaseConfig = {
  apiKey: "AIzaSyAfuvS4T_B74D2dCkOVHOArMC8SEm72zKQ",
  authDomain: "kalorientracker-9e36f.firebaseapp.com",
  projectId: "kalorientracker-9e36f",
  storageBucket: "kalorientracker-9e36f.firebasestorage.app",
  messagingSenderId: "500128515431",
  appId: "1:500128515431:web:abef4c94dea165cbb49bc2",
  measurementId: "G-JDNQ4G8X0K"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

const cameraInput = document.getElementById('cameraInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultArea = document.getElementById('resultArea');
const descriptionInput = document.getElementById('descriptionInput');
const dailyStats = document.getElementById('dailyStats');
const historyList = document.getElementById('historyList');
const prevDayBtn = document.getElementById('prevDayBtn');
const nextDayBtn = document.getElementById('nextDayBtn');
const currentDateDisplay = document.getElementById('currentDateDisplay');
const toggleManualEntryBtn = document.getElementById('toggleManualEntryBtn');
const manualEntryForm = document.getElementById('manualEntryForm');
const closeManualEntryBtn = document.getElementById('closeManualEntryBtn');
const saveManualEntryBtn = document.getElementById('saveManualEntryBtn');
const manualName = document.getElementById('manualName');
const manualCalories = document.getElementById('manualCalories');
const manualProtein = document.getElementById('manualProtein');
const manualFat = document.getElementById('manualFat');
const manualCarbs = document.getElementById('manualCarbs');
// Auth & Profil Elemente
const authScreen = document.getElementById('auth-screen');
const appContent = document.getElementById('app-content');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const authError = document.getElementById('authError');
const openProfileBtn = document.getElementById('openProfileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileGeminiKey = document.getElementById('profileGeminiKey');
const profileOpenAIKey = document.getElementById('profileOpenAIKey');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const installAppBtn = document.getElementById('installAppBtn');

// SVG Icons Definition
const icons = {
    fire: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#ff5722"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`,
    protein: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#3498db"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 19.86 21.29 21.29 19.86 19.86 18.43 22 16.29z"/></svg>`,
    fat: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#f1c40f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>`,
    carbs: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#2ecc71"><path d="M17 5v12c0 2.76-2.24 5-5 5s-5-2.24-5-5V4c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1h2v-1c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2z"/></svg>`,
    bulb: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#ffd60a"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>`,
    robot: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#888"><path d="M12 2c-5.33 0-8 2.67-8 8v6c0 5.33 2.67 8 8 8s8-2.67 8-8v-6c0-5.33-2.67-8-8-8zm0 2c4.27 0 6 2.13 6 6v6c0 3.87-1.73 6-6 6s-6-2.13-6-6v-6c0-3.87 1.73-6 6-6zm-2.5 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>`,
    trash: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    chevron: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17 16.59 8.59 18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
    close: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
};

// Globale Variablen für User-Daten
let currentUser = null;
let API_KEY = null; // Wird aus Firebase geladen
let OPENAI_API_KEY = null; // Wird aus Firebase geladen
let calorieHistory = { entries: [] }; // Lokaler Cache der Daten

let selectedFile = null;
let currentDate = new Date();

// --- AUTHENTIFIZIERUNG LOGIK ---

// Prüfen ob eingeloggt
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Sicherheits-Check: Haben wir den Verschlüsselungs-Key?
        // Falls nicht (z.B. neues Gerät aber Session noch aktiv), müssen wir neu einloggen,
        // um den Key aus dem Passwort abzuleiten.
        if (!localStorage.getItem('app_encryption_key')) {
            await signOut(auth);
            return;
        }

        // User ist eingeloggt
        currentUser = user;
        
        // Initialien aus E-Mail generieren
        if (user.email) {
            const namePart = user.email.split('@')[0];
            const parts = namePart.split(/[._-]/); // Trennung bei Punkt, Unterstrich, Bindestrich
            // Entweder Anfangsbuchstaben der ersten zwei Teile (z.B. max.mustermann -> MM)
            // Oder die ersten zwei Buchstaben (z.B. max -> MA)
            const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]) : namePart.substring(0, 2);
            openProfileBtn.textContent = initials.toUpperCase();
        }

        authScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
        
        // Daten laden
        await loadUserData();
        updateUIForDate();
    } else {
        // User ist ausgeloggt
        currentUser = null;
        openProfileBtn.textContent = "👤"; // Reset auf Icon
        authScreen.classList.remove('hidden');
        appContent.classList.add('hidden');
        calorieHistory = { entries: [] };
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    authError.textContent = "";
    
    try {
        loginBtn.textContent = "Verbinde...";
        const userCredential = await signInWithEmailAndPassword(auth, authEmail.value, authPassword.value);
        
        // Schlüssel aus Passwort ableiten und speichern
        loginBtn.textContent = "Entschlüssle...";
        // Kleiner Timeout, damit der Browser das UI rendern kann (PBKDF2 blockiert kurz)
        await new Promise(r => setTimeout(r, 50));
        
        const key = await deriveKeyFromPassword(authPassword.value, userCredential.user.uid);
        const exported = await crypto.subtle.exportKey("jwk", key);
        localStorage.setItem('app_encryption_key', JSON.stringify(exported));
        
        // Daten neu laden (falls onAuthStateChanged zu schnell war)
        loginBtn.textContent = "Lade Daten...";
        await loadUserData();
        updateUIForDate();
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            authError.textContent = "Die Zugangsdaten stimmen nicht.";
        } else if (error.code === 'auth/too-many-requests') {
            authError.textContent = "Zu viele Versuche. Bitte warte kurz.";
        } else {
            authError.textContent = "Anmeldung fehlgeschlagen. Bitte prüfe deine Internetverbindung.";
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});

// Registrieren
registerBtn.addEventListener('click', async () => {
    const originalText = registerBtn.textContent;
    registerBtn.disabled = true;
    authError.textContent = "";

    try {
        registerBtn.textContent = "Erstelle Konto...";
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail.value, authPassword.value);
        
        // Schlüssel aus Passwort ableiten und speichern
        registerBtn.textContent = "Verschlüssle...";
        await new Promise(r => setTimeout(r, 50));

        const key = await deriveKeyFromPassword(authPassword.value, userCredential.user.uid);
        const exported = await crypto.subtle.exportKey("jwk", key);
        localStorage.setItem('app_encryption_key', JSON.stringify(exported));
    } catch (error) {
        console.error(error);
        if (error.code === 'auth/email-already-in-use') {
            authError.textContent = "Diese E-Mail wird schon verwendet.";
        } else if (error.code === 'auth/weak-password') {
            authError.textContent = "Das Passwort ist zu schwach (min. 6 Zeichen).";
        } else {
            authError.textContent = "Registrierung hat nicht geklappt.";
        }
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = originalText;
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
    localStorage.removeItem('app_encryption_key'); // Schlüssel aus Sicherheit entfernen
    profileModal.classList.add('hidden');
});

// --- PROFIL & DATEN LOGIK ---

async function loadUserData() {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // API Keys setzen
        API_KEY = await decryptText(data.geminiKey || '');
        OPENAI_API_KEY = await decryptText(data.openaiKey || '');
        // Historie laden
        if (data.history) {
            calorieHistory = data.history;
        }
        
        // Profil-Inputs füllen
        profileGeminiKey.value = API_KEY;
        profileOpenAIKey.value = OPENAI_API_KEY;
    }
}

async function saveUserData() {
    if (!currentUser) return;
    
    const encryptedGemini = await encryptText(API_KEY);
    const encryptedOpenAI = await encryptText(OPENAI_API_KEY);

    // Speichert ALLES (Keys + History) in Firebase
    await setDoc(doc(db, "users", currentUser.uid), {
        geminiKey: encryptedGemini,
        openaiKey: encryptedOpenAI,
        history: calorieHistory
    }, { merge: true });
}

// Profil UI Events
openProfileBtn.addEventListener('click', () => profileModal.classList.remove('hidden'));
closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));

saveProfileBtn.addEventListener('click', async () => {
    API_KEY = profileGeminiKey.value.trim();
    OPENAI_API_KEY = profileOpenAIKey.value.trim();
    await saveUserData();
    alert("Profil gespeichert!");
    profileModal.classList.add('hidden');
});

// Event Listener für Bildauswahl
cameraInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            analyzeBtn.disabled = false; // Button aktivieren
        }
        
        reader.readAsDataURL(file);
    }
    // Input zurücksetzen, damit das 'change' Event auch feuert, 
    // wenn man danach direkt ein neues Foto macht
    event.target.value = '';
});

// Event Listener für den Analyse-Button
analyzeBtn.addEventListener('click', async function() {
    if (!selectedFile) return;

    // UI Feedback: Laden starten
    showLoading("Analysiere Bild...");
    
    // resultArea.classList.add('hidden'); // Lassen wir sichtbar für smootheren Übergang
    // resultArea.innerHTML = ''; // Nicht sofort löschen

    const userText = descriptionInput.value;

    if (!API_KEY) {
        alert("Bitte hinterlege erst deinen Gemini API Key im Profil!");
        profileModal.classList.remove('hidden');
        hideLoading();
        return;
    }

    try {
        // 1. Bild komprimieren (nur einmal nötig)
        loadingText.textContent = "Optimiere Bild...";
        const base64Data = await compressImage(selectedFile, 800, 0.7);
        const finalMimeType = 'image/jpeg';

        // SDK initialisieren
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // 2. Strategie für Modelle: Erst Gemini Flash, dann GPT-4o, dann Gemini Flash Lite
        const strategies = [
            { type: 'gemini', model: 'gemini-2.5-flash' },
            { type: 'openai', model: 'gpt-4o' },
            { type: 'gemini', model: 'gemini-2.5-flash-lite' }
        ];
        
        let jsonResponse = null;
        let usedModelName = "";
        let lastError = null;

        // 3. Prompt definieren
        const prompt = `Du bist ein professioneller Ernährungsberater. Deine Aufgabe ist es, die Kalorien dieses Gerichts extrem präzise zu schätzen.
        
        WICHTIG:
        1. Prüfe, ob es sich um ein Lebensmittel handelt. Wenn nicht, setze "isFood" auf false.
        2. Benenne das GERICHT als Ganzes (z.B. "Spaghetti Bolognese" statt "Nudeln, Soße, Fleisch"). Der Name muss kurz und prägnant sein.
        3. Analysiere die Zutaten einzeln.
        
        Gib mir ein JSON-Objekt zurück mit:
        - isFood (Boolean, true wenn Essen/Trinken, sonst false)
        - name (String, kurzer Name des Gerichts)
        - ingredients (Array von Objekten, jede Zutat hat:
            - name (String)
            - weight (Number, geschätztes Gewicht in Gramm)
            - calories (Number, Kalorien NUR für dieses Gewicht)
            - protein (Number)
            - fat (Number)
            - carbs (Number)
        )
        - reasoning (String, kurze Erklärung)
        
        ${userText ? 'Wichtige Zusatzinfo vom Nutzer: ' + userText : ''}`;

        // 4. Modelle nacheinander testen
        for (const strategy of strategies) {
            if (jsonResponse) break; // Schon erfolgreich

            try {
                loadingText.textContent = `Frage KI (${strategy.model})...`;
                console.log(`Versuche Modell: ${strategy.model}...`);

                if (strategy.type === 'gemini') {
                    const model = genAI.getGenerativeModel({ 
                        model: strategy.model,
                        generationConfig: { responseMimeType: "application/json" }
                    });

                    const result = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: finalMimeType
                            }
                        }
                    ]);

                    jsonResponse = JSON.parse(result.response.text());
                    usedModelName = strategy.model;

                } else if (strategy.type === 'openai') {
                    if (!OPENAI_API_KEY) {
                        console.log("Überspringe GPT-4o (Kein API Key)");
                        continue;
                    }
                    jsonResponse = await callOpenAI(base64Data, prompt);
                    usedModelName = strategy.model;
                }

            } catch (error) {
                console.warn(`Fehler mit ${strategy.model}:`, error);
                lastError = error;
            }
        }

        if (!jsonResponse) {
            throw new Error(`Alle Modelle fehlgeschlagen. Letzter Fehler: ${lastError?.message}`);
        }

        // Prüfung: Ist es überhaupt Essen?
        if (jsonResponse.isFood === false) {
            resultArea.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 50px; margin-bottom: 15px;">🚫</div>
                    <h3>Kein Essen erkannt</h3>
                    <p style="color: #888; margin-top: 10px;">Das sieht nicht nach einem Gericht aus.<br>Es wurde nichts gespeichert.</p>
                </div>
            `;
            resultArea.classList.remove('hidden');
            hideLoading();
            return;
        }

        // Datum und Zeitstempel hinzufügen, damit wir die Historie nach Tagen sortieren können
        const now = new Date();
        jsonResponse.date = currentDate.toISOString().split('T')[0]; // Zum aktuell angezeigten Tag hinzufügen
        jsonResponse.timestamp = now.getTime();
        
        // Speichern
        // Wir berechnen die Summen initial selbst, um Konsistenz zu haben
        recalculateTotals(jsonResponse);
        saveToHistory(jsonResponse);
        renderHistory();
        updateStatsUI();

        // Ergebnis anzeigen
        resultArea.innerHTML = `
            <h3>${jsonResponse.name}</h3>
            <p><strong>${icons.fire} Kalorien:</strong> ${Math.round(jsonResponse.calories)} kcal</p>
            <div style="display: flex; gap: 15px; margin-top: 10px;">
                <span>${icons.protein} P: ${Math.round(jsonResponse.protein)}g</span>
                <span>${icons.fat} F: ${Math.round(jsonResponse.fat)}g</span>
                <span>${icons.carbs} K: ${Math.round(jsonResponse.carbs)}g</span>
            </div>
            <p style="margin-top: 10px; font-size: 0.9em; color: #ccc; background: #2c2c2e; padding: 10px; border-radius: 8px; border: 1px solid #333;">${icons.bulb} ${jsonResponse.reasoning || 'Keine Details verfügbar'}</p>
            <p style="margin-top: 15px; font-size: 0.8em; color: #666;">${icons.robot} Genutzt: ${usedModelName}</p>
        `;
        resultArea.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        
        let title = "Fehler bei der Analyse";
        let message = error.message;
        let icon = "⚠️";

        // Prüfen ob es sich um ein Limit-Problem handelt (429 = Too Many Requests / Quota Exceeded)
        if (message.includes('429') || message.includes('quota') || message.includes('exhausted')) {
            title = "Tageslimit erreicht";
            message = "Die kostenlosen Anfragen für deine API-Keys sind für heute aufgebraucht. Bitte versuche es morgen wieder oder prüfe deine Keys im Profil.";
            icon = "⏳";
        }

        resultArea.innerHTML = `
            <div style="text-align: center; padding: 30px 20px;">
                <div style="font-size: 48px; margin-bottom: 15px;">${icon}</div>
                <h3 style="color: #ff453a; margin-bottom: 10px;">${title}</h3>
                <p style="color: #999; line-height: 1.5;">${message}</p>
            </div>
        `;
        resultArea.classList.remove('hidden');
    } finally {
        hideLoading();
    }
});

/**
 * Speichert das Ergebnis im LocalStorage des Browsers
 */
function saveToHistory(data) {
    // Wir nutzen jetzt die globale Variable calorieHistory statt localStorage direkt
    if (!calorieHistory.entries) calorieHistory.entries = [];
    calorieHistory.entries.push(data);
    
    // In Firebase speichern
    saveUserData();
}

/**
 * Aktualisiert die Balkenanzeige oben
 */
function updateStatsUI() {
    const history = calorieHistory;
    const dateString = toISODateString(currentDate);
    
    // Summen berechnen
    let currentCal = 0, currentP = 0, currentF = 0, currentC = 0;
    
    if (history.entries) {
        history.entries.forEach(entry => {
            // Nur Einträge vom aktuell ausgewählten Tag zählen
            if (entry.date === dateString) {
                currentCal += entry.calories || 0;
                currentP += entry.protein || 0;
                currentF += entry.fat || 0;
                currentC += entry.carbs || 0;
            }
        });
    }
    
    // Ziele (Hardcoded für jetzt)
    const goalCal = 2500;
    const goalP = 150;
    const goalF = 80;
    const goalC = 300;
    
    const createChart = (current, goal, color, label, sizeClass = '') => {
        const pct = Math.min((current / goal) * 100, 100);
        
        // SVG Logik: Kreisumfang = 100 (durch speziellen Radius 15.9155)
        // Dashoffset steuert die Füllung: 100 = leer, 0 = voll.
        const dashOffset = 100 - pct;

        return `
            <div class="macro-item">
                <div class="radial-chart ${sizeClass}">
                    <svg viewBox="0 0 36 36">
                        <!-- Hintergrund-Spur -->
                        <path class="chart-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <!-- Fortschritts-Balken mit Glow -->
                        <path class="chart-stroke" 
                              stroke-dasharray="100, 100" 
                              stroke-dashoffset="${dashOffset}" 
                              stroke="${color}" 
                              style="filter: drop-shadow(0 0 4px ${color});" 
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span>${Math.round(current)}</span>
                </div>
                <span>${label}</span>
            </div>
        `;
    };

    dailyStats.innerHTML = `
        ${createChart(currentCal, goalCal, '#ff5722', 'Kcal', 'xlarge')}
        <div class="macro-row">
            ${createChart(currentP, goalP, '#3498db', 'Protein')}
            ${createChart(currentF, goalF, '#f1c40f', 'Fett')}
            ${createChart(currentC, goalC, '#2ecc71', 'Carbs')}
        </div>
    `;
}

/**
 * Rendert die Historie-Liste mit Bearbeitungsfunktion
 */
function renderHistory() {
    const history = calorieHistory;
    const dateString = toISODateString(currentDate);
    historyList.innerHTML = '';

    if (!history.entries || history.entries.length === 0) return;

    // Filtere Einträge für das aktuelle Datum und sortiere sie (neueste zuerst)
    const entriesForDate = history.entries
        .map((entry, index) => ({ ...entry, originalIndex: index })) // Originalindex für Bearbeitung speichern
        .filter(entry => entry.date === dateString)
        .sort((a, b) => b.timestamp - a.timestamp);

    entriesForDate.forEach((entry) => {
        const realIndex = entry.originalIndex;
        const isExpanded = entry.expanded || false; // Status: aufgeklappt oder nicht
        const chevronStyle = isExpanded ? 'transform: rotate(180deg);' : '';
        const contentClass = isExpanded ? '' : 'hidden';
        const dateLabel = entry.date ? entry.date.split('-').reverse().join('.') : '';
        
        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry';
        
        let ingredientsHtml = '';
        if (entry.ingredients) {
            ingredientsHtml = entry.ingredients.map((ing, ingIndex) => `
                <div class="ingredient-row">
                    <div class="ing-name">${ing.name}</div>
                    <input type="number" class="weight-input" value="${Math.round(ing.weight)}" 
                        data-entry-index="${realIndex}" data-ing-index="${ingIndex}">
                    <span class="ing-unit">g</span>
                    <span class="ing-kcal">${Math.round(ing.calories)} kcal</span>
                    <button class="delete-ing-btn" data-entry-index="${realIndex}" data-ing-index="${ingIndex}">${icons.close}</button>
                </div>
            `).join('');
        }

        entryDiv.innerHTML = `
            <div class="history-header" data-index="${realIndex}">
                <div class="header-left">
                    <div class="toggle-icon" style="${chevronStyle}">${icons.chevron}</div>
                    <div>
                        <div style="font-size: 11px; color: #555; margin-bottom: 2px;">${dateLabel}</div>
                        <h4>${entry.name}</h4>
                    </div>
                </div>
                <div class="header-right">
                    <strong>${Math.round(entry.calories)} kcal</strong>
                    <button class="delete-btn" data-index="${realIndex}">${icons.trash}</button>
                </div>
            </div>
            
            <div class="ingredients-list ${contentClass}">
                ${ingredientsHtml}
            </div>
        `;
        historyList.appendChild(entryDiv);
    });
}

// Event Listener für Änderungen in der Historie (Gewicht ändern oder Löschen)
historyList.addEventListener('click', (e) => {
    // Ganzen Eintrag löschen
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        e.stopPropagation(); // Verhindert das Aufklappen beim Löschen
        deleteEntry(deleteBtn.dataset.index);
        return;
    }

    // Einzelne Zutat löschen
    const deleteIngBtn = e.target.closest('.delete-ing-btn');
    if (deleteIngBtn) {
        e.stopPropagation();
        deleteIngredient(deleteIngBtn.dataset.entryIndex, deleteIngBtn.dataset.ingIndex);
        return;
    }

    // Aufklappen/Zuklappen
    const header = e.target.closest('.history-header');
    if (header) {
        toggleEntry(header.dataset.index);
    }
});

prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateUIForDate();
});

nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateUIForDate();
});

toggleManualEntryBtn.addEventListener('click', () => {
    manualEntryForm.classList.toggle('hidden');
});

closeManualEntryBtn.addEventListener('click', () => {
    manualEntryForm.classList.add('hidden');
});

saveManualEntryBtn.addEventListener('click', () => {
    const name = manualName.value.trim();
    const calories = parseFloat(manualCalories.value) || 0;
    const protein = parseFloat(manualProtein.value) || 0;
    const fat = parseFloat(manualFat.value) || 0;
    const carbs = parseFloat(manualCarbs.value) || 0;

    if (!name || calories <= 0) {
        alert("Bitte gib mindestens einen Namen und Kalorien an.");
        return;
    }

    const now = new Date();

    const manualEntry = {
        name: name,
        date: toISODateString(currentDate),
        timestamp: now.getTime(),
        calories: calories,
        protein: protein,
        fat: fat,
        carbs: carbs,
        ingredients: [{
            name: name,
            weight: 1, // Gewicht ist hier nicht relevant, wir nehmen 1 Portion
            calories: calories,
            protein: protein,
            fat: fat,
            carbs: carbs,
        }],
        reasoning: "Manuell hinzugefügt",
        expanded: false
    };

    saveToHistory(manualEntry);
    updateUIForDate();

    // Formular zurücksetzen und ausblenden
    manualName.value = '';
    manualCalories.value = '';
    manualProtein.value = '';
    manualFat.value = '';
    manualCarbs.value = '';
    manualEntryForm.classList.add('hidden');
});

historyList.addEventListener('change', (e) => {
    if (e.target.classList.contains('weight-input')) {
        const entryIndex = e.target.dataset.entryIndex;
        const ingIndex = e.target.dataset.ingIndex;
        const newWeight = parseFloat(e.target.value);
        
        if (newWeight > 0) {
            updateIngredientWeight(entryIndex, ingIndex, newWeight);
        }
    }
});

function updateUIForDate() {
    updateDateDisplay();
    updateStatsUI();
    renderHistory();
}

function updateDateDisplay() {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (toISODateString(currentDate) === toISODateString(today)) {
        currentDateDisplay.textContent = "Heute";
    } else if (toISODateString(currentDate) === toISODateString(yesterday)) {
        currentDateDisplay.textContent = "Gestern";
    } else {
        currentDateDisplay.textContent = currentDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    nextDayBtn.disabled = toISODateString(currentDate) === toISODateString(today);
}

function toggleEntry(index) {
    calorieHistory.entries[index].expanded = !calorieHistory.entries[index].expanded;
    saveUserData(); // Speichern nicht vergessen (für UI Status optional, aber gut für Konsistenz)
    renderHistory();
}

function deleteEntry(index) {
    calorieHistory.entries.splice(index, 1);
    saveUserData();
    renderHistory();
    updateStatsUI();
}

function deleteIngredient(entryIndex, ingIndex) {
    let entry = calorieHistory.entries[entryIndex];
    
    // Zutat entfernen
    entry.ingredients.splice(ingIndex, 1);
    
    // Summen neu berechnen
    recalculateTotals(entry);
    
    saveUserData();
    renderHistory();
    updateStatsUI();
}

function updateIngredientWeight(entryIndex, ingIndex, newWeight) {
    let entry = calorieHistory.entries[entryIndex];
    let ingredient = entry.ingredients[ingIndex];

    // Dreisatz: Neue Kalorien = (Neues Gewicht / Altes Gewicht) * Alte Kalorien
    // Wir müssen die Basiswerte pro 1g kennen oder das Verhältnis nutzen.
    // Da wir die "Originalwerte" nicht separat speichern, nutzen wir das Verhältnis zum aktuellen Wert.
    // Besser: Wir berechnen den Faktor basierend auf dem vorherigen Wert im Array.
    
    const factor = newWeight / ingredient.weight;
    
    ingredient.weight = newWeight;
    ingredient.calories *= factor;
    ingredient.protein *= factor;
    ingredient.fat *= factor;
    ingredient.carbs *= factor;

    // Gesamtsummen des Gerichts neu berechnen
    recalculateTotals(entry);

    saveUserData();
    renderHistory(); // UI neu rendern (aktualisiert die kcal Anzeige)
    updateStatsUI(); // Balken oben aktualisieren
}

function recalculateTotals(entry) {
    if (!entry.ingredients) return;
    
    entry.calories = 0;
    entry.protein = 0;
    entry.fat = 0;
    entry.carbs = 0;

    entry.ingredients.forEach(ing => {
        entry.calories += ing.calories;
        entry.protein += ing.protein;
        entry.fat += ing.fat;
        entry.carbs += ing.carbs;
    });
}

function toISODateString(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Hilfsfunktion: Bild verkleinern und komprimieren
 * Verhindert, dass riesige Bilder den Server zum Absturz bringen.
 */
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Wir erzwingen JPEG, da dies 'quality' unterstützt und universell ist
                resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

/**
 * Hilfsfunktion: Aufruf an OpenAI GPT-4o
 */
async function callOpenAI(base64Image, promptText) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: promptText },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI Fehler: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
}

// --- VERSCHLÜSSELUNG (Client-Side) ---

// Hilfsfunktion: Hex-String zu ArrayBuffer
const hexToBuf = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
// Hilfsfunktion: ArrayBuffer zu Hex-String
const bufToHex = (buf) => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');

async function getOrCreateLocalKey() {
    let keyJwk = localStorage.getItem('app_encryption_key');
    
    if (!keyJwk) {
        // Kein Schlüssel vorhanden. Da wir ihn aus dem Passwort ableiten,
        // dürfen wir hier KEINEN zufälligen generieren.
        return null;
    }

    // Vorhandenen Schlüssel laden
    return crypto.subtle.importKey(
        "jwk",
        JSON.parse(keyJwk),
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
    );
}

async function encryptText(text) {
    if (!text) return '';
    const key = await getOrCreateLocalKey();
    if (!key) throw new Error("Verschlüsselungs-Key fehlt. Bitte neu einloggen.");
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialisierungsvektor
    const encoded = new TextEncoder().encode(text);
    
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
    );

    // Wir speichern IV + Verschlüsselten Text zusammen als Hex-String
    return bufToHex(iv) + ':' + bufToHex(encrypted);
}

async function decryptText(encryptedHex) {
    if (!encryptedHex || !encryptedHex.includes(':')) return '';
    try {
        const [ivHex, dataHex] = encryptedHex.split(':');
        const key = await getOrCreateLocalKey();
        if (!key) return ''; // Kein Key -> Keine Daten (Nutzer muss sich einloggen)
        const iv = hexToBuf(ivHex);
        const data = hexToBuf(dataHex);

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            data
        );
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.warn("Entschlüsselung fehlgeschlagen (evtl. anderer Browser/Gerät):", e);
        return ''; // Falls Entschlüsselung fehlschlägt (z.B. neues Gerät), leeren String zurückgeben
    }
}

/**
 * Leitet einen kryptografischen Schlüssel aus dem Passwort ab (PBKDF2)
 */
async function deriveKeyFromPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: enc.encode(salt),
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// --- HAPTISCHES FEEDBACK & MOBILE UX ---
// Lässt das Handy bei Interaktionen kurz vibrieren (Taptic Engine)
document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.camera-btn') || e.target.closest('.nav-btn') || e.target.closest('.history-header')) {
        if (navigator.vibrate) navigator.vibrate(10); // 10ms Vibration (sehr subtil)
    }
});

// --- UI HELPER ---
function showLoading(text = "Lade...") {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// --- PWA INSTALLATION LOGIC ---
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Verhindert, dass Chrome automatisch die Leiste unten anzeigt (wir wollen unseren eigenen Button)
    e.preventDefault();
    // Event speichern, damit wir es später auslösen können
    deferredPrompt = e;
    // Button anzeigen
    installAppBtn.classList.remove('hidden');
});

installAppBtn.addEventListener('click', async () => {
    // Button ausblenden, da der Prozess startet
    installAppBtn.classList.add('hidden');
    
    if (deferredPrompt) {
        // Installations-Prompt anzeigen
        deferredPrompt.prompt();
        // Warten auf die Entscheidung des Nutzers
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Installations-Dialog Ergebnis: ${outcome}`);
        // Event verwerfen, da es nur einmal genutzt werden kann
        deferredPrompt = null;
    }
});

window.addEventListener('appinstalled', () => {
    // Wenn installiert, Button sicherheitshalber ausblenden
    installAppBtn.classList.add('hidden');
    deferredPrompt = null;
});

// --- PWA SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}