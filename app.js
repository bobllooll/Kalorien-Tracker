// Importiere das offizielle Google AI SDK für den Browser
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
// Importiere Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

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

// Analytics sicher initialisieren (verhindert Absturz bei deaktivierten Cookies/IndexedDB)
let analytics;
isSupported().then(supported => {
    if (supported) analytics = getAnalytics(app);
}).catch(console.error);

const cameraInput = document.getElementById('cameraInput');
const imagePreview = document.getElementById('imagePreview');
const analysisModal = document.getElementById('analysisModal');
const closeAnalysisBtn = document.getElementById('closeAnalysisBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const calcProfileBtn = document.getElementById('calcProfileBtn');
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
const scanInManualBtn = document.getElementById('scanInManualBtn');
const productSearchInput = document.getElementById('productSearchInput');
const productSearchBtn = document.getElementById('productSearchBtn');
const searchResults = document.getElementById('searchResults');
const manualName = document.getElementById('manualName');
const manualAmount = document.getElementById('manualAmount');
const manualUnit = document.getElementById('manualUnit');
const quickAmountsContainer = document.getElementById('quickAmountsContainer');
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
// Neue Profil Felder
const profileGoal = document.getElementById('profileGoal');
const profileWeight = document.getElementById('profileWeight');
const profileHeight = document.getElementById('profileHeight');
const profileAge = document.getElementById('profileAge');
const profileGender = document.getElementById('profileGender');
const profileActivity = document.getElementById('profileActivity');
const goalInputs = { cal: document.getElementById('goalCalories'), p: document.getElementById('goalProtein'), f: document.getElementById('goalFat'), c: document.getElementById('goalCarbs'), w: document.getElementById('goalWater') };
const infoIconBtn = document.getElementById('infoIconBtn');
const infoText = document.getElementById('infoText');
// Rezepte Elemente
const recipesBtn = document.getElementById('recipesBtn');
const recipesModal = document.getElementById('recipesModal');
const closeRecipesBtn = document.getElementById('closeRecipesBtn');
const recipesList = document.getElementById('recipesList');
const createNewRecipeBtn = document.getElementById('createNewRecipeBtn');
const createRecipeModal = document.getElementById('createRecipeModal');
const closeCreateRecipeBtn = document.getElementById('closeCreateRecipeBtn');
const saveNewRecipeBtn = document.getElementById('saveNewRecipeBtn');
const recipeInputs = { name: document.getElementById('recipeName'), cal: document.getElementById('recipeCalories'), p: document.getElementById('recipeProtein'), f: document.getElementById('recipeFat'), c: document.getElementById('recipeCarbs') };


const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const installAppBtn = document.getElementById('installAppBtn');
// Scanner Elemente
const scannerModal = document.getElementById('scannerModal');
const closeScannerBtn = document.getElementById('closeScannerBtn');
const barcodeResultModal = document.getElementById('barcodeResultModal');
const closeBarcodeResultBtn = document.getElementById('closeBarcodeResultBtn');
const barcodeProductName = document.getElementById('barcodeProductName');
const barcode100gInfo = document.getElementById('barcode100gInfo');
const barcodeWeight = document.getElementById('barcodeWeight');
const barcodeCalculatedStats = document.getElementById('barcodeCalculatedStats');
const saveBarcodeEntryBtn = document.getElementById('saveBarcodeEntryBtn');
// Wasser Elemente
const waterCurrentDisplay = document.getElementById('waterCurrent');
const waterGoalDisplay = document.getElementById('waterGoal');
const addWaterBtn = document.getElementById('addWaterBtn');
const removeWaterBtn = document.getElementById('removeWaterBtn');
const bottleContainer = document.querySelector('.bottle-container');

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
    close: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    water: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#64d2ff"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
};

// Globale Variablen für User-Daten
let currentUser = null;
let API_KEY = null; // Wird aus Firebase geladen
let OPENAI_API_KEY = null; // Wird aus Firebase geladen
let calorieHistory = { entries: [] }; // Lokaler Cache der Daten
let userGoals = { calories: 2500, protein: 150, fat: 80, carbs: 300, water: 2500 }; // Standardwerte
let userRecipes = []; // Lokaler Cache der Rezepte

let selectedFile = null;
let currentDate = new Date();
let html5QrCode = null; // Scanner Instanz
let currentBarcodeData = null; // Zwischenspeicher für gefundenes Produkt
let currentManualBase = null; // Zwischenspeicher für manuelle Suche (Basis 100g)

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
        if (data.goals) {
            userGoals = data.goals;
        }
        if (data.recipes) {
            userRecipes = data.recipes;
        }
        // Profil-Daten für Berechnung füllen (falls vorhanden)
        if (data.profileData) {
            profileGoal.value = data.profileData.goal || 'maintain';
            profileWeight.value = data.profileData.weight || '';
            profileHeight.value = data.profileData.height || '';
            profileAge.value = data.profileData.age || '';
            profileGender.value = data.profileData.gender || 'male';
            profileActivity.value = data.profileData.activity || '1.2';
        }
        
        // Profil-Inputs füllen
        profileGeminiKey.value = API_KEY;
        profileOpenAIKey.value = OPENAI_API_KEY;
        goalInputs.cal.value = userGoals.calories;
        goalInputs.p.value = userGoals.protein;
        goalInputs.f.value = userGoals.fat;
        goalInputs.c.value = userGoals.carbs;
        goalInputs.w.value = userGoals.water || 2500;
    }
}

async function saveUserData() {
    if (!currentUser) return;
    
    const encryptedGemini = await encryptText(API_KEY);
    const encryptedOpenAI = await encryptText(OPENAI_API_KEY);

    // Ziele aus Inputs lesen
    const newGoals = {
        calories: Math.round(parseFloat(goalInputs.cal.value)) || 2500,
        protein: Math.round(parseFloat(goalInputs.p.value)) || 150,
        fat: Math.round(parseFloat(goalInputs.f.value)) || 80,
        carbs: Math.round(parseFloat(goalInputs.c.value)) || 300,
        water: Math.round(parseFloat(goalInputs.w.value)) || 2500
    };

    const profileData = {
        goal: profileGoal.value,
        weight: profileWeight.value,
        height: profileHeight.value,
        age: profileAge.value,
        gender: profileGender.value,
        activity: profileActivity.value
    };

    // Speichert ALLES (Keys + History) in Firebase
    await setDoc(doc(db, "users", currentUser.uid), {
        geminiKey: encryptedGemini,
        openaiKey: encryptedOpenAI,
        history: calorieHistory,
        goals: newGoals,
        profileData: profileData,
        recipes: userRecipes
    }, { merge: true });
}

// Profil UI Events
openProfileBtn.addEventListener('click', () => profileModal.classList.remove('hidden'));
closeProfileBtn.addEventListener('click', () => profileModal.classList.add('hidden'));

saveProfileBtn.addEventListener('click', async () => {
    API_KEY = profileGeminiKey.value.trim();
    OPENAI_API_KEY = profileOpenAIKey.value.trim();
    
    // Lokale Ziele sofort updaten für UI
    userGoals = {
        calories: Math.round(parseFloat(goalInputs.cal.value)) || 2500,
        protein: Math.round(parseFloat(goalInputs.p.value)) || 150,
        fat: Math.round(parseFloat(goalInputs.f.value)) || 80,
        carbs: Math.round(parseFloat(goalInputs.c.value)) || 300,
        water: Math.round(parseFloat(goalInputs.w.value)) || 2500
    };

    await saveUserData();
    updateStatsUI(); // UI sofort aktualisieren
    showToast("Profil gespeichert!", "success");
    profileModal.classList.add('hidden');
});

// Automatische Berechnung (Mifflin-St Jeor Formel)
calcProfileBtn.addEventListener('click', () => {
    const weight = parseFloat(profileWeight.value);
    const height = parseFloat(profileHeight.value);
    const age = parseFloat(profileAge.value);
    const gender = profileGender.value;
    const activity = parseFloat(profileActivity.value);
    const goal = profileGoal.value;

    if (!weight || !height || !age) {
        showToast("Bitte Gewicht, Größe und Alter ausfüllen.", "error");
        return;
    }

    // 1. Grundumsatz (BMR)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;

    // 2. Gesamtumsatz (TDEE)
    let tdee = bmr * activity;

    // 3. Ziel-Anpassung
    if (goal === 'lose') tdee -= 500; // Defizit
    if (goal === 'gain') tdee += 300; // Überschuss

    // 4. Makro-Verteilung (Faustformeln)
    // Protein: 2g pro kg (bei Diät/Aufbau wichtig), sonst 1.5g
    const protein = weight * (goal === 'maintain' ? 1.6 : 2.0);
    // Fett: 0.8g pro kg
    const fat = weight * 0.8;
    // Carbs: Der Rest der Kalorien
    const carbs = (tdee - (protein * 4) - (fat * 9)) / 4;

    // Werte in Inputs schreiben
    goalInputs.cal.value = Math.round(tdee);
    goalInputs.p.value = Math.round(protein);
    goalInputs.f.value = Math.round(fat);
    goalInputs.c.value = Math.round(carbs);
    
    // Wasserbedarf: ca. 35ml pro kg Körpergewicht
    goalInputs.w.value = Math.round(weight * 35);
});

// Info Icon Toggle
if (infoIconBtn) {
    infoIconBtn.addEventListener('click', () => infoText.classList.toggle('hidden'));
}

// Event Listener für Bildauswahl
cameraInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            // Neue Logik: Karte anzeigen statt nur Bild
            analysisModal.classList.remove('hidden');
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
    
    analysisModal.classList.add('hidden'); // Karte ausblenden während Analyse
    // resultArea.classList.add('hidden'); // Lassen wir sichtbar für smootheren Übergang
    // resultArea.innerHTML = ''; // Nicht sofort löschen

    const userText = descriptionInput.value;

    if (!API_KEY) {
        showToast("Bitte API Key im Profil hinterlegen!", "error");
        profileModal.classList.remove('hidden');
        hideLoading();
        analysisModal.classList.remove('hidden'); // Karte wieder zeigen bei Fehler
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
        let currentAiResult = null; // Zwischenspeicher für Rezept-Speicherung

        // 3. Prompt definieren
        const prompt = `Du bist ein professioneller Ernährungsberater. Deine Aufgabe ist es, die Kalorien dieses Gerichts extrem präzise zu schätzen.
        
        WICHTIG:
        1. Prüfe, ob es sich um ein Lebensmittel handelt. Wenn nicht, setze "isFood" auf false.
        2. Benenne das GERICHT als Ganzes (z.B. "Spaghetti Bolognese" statt "Nudeln, Soße, Fleisch"). Der Name muss kurz und prägnant sein.
        3. Analysiere die Zutaten einzeln.
        4. Achte auf Mengenangaben im Nutzertext (z.B. "3 Stück", "2 Teller", "Hälfte").
        
        Gib mir ein JSON-Objekt zurück mit:
        - isFood (Boolean, true wenn Essen/Trinken, sonst false)
        - name (String, kurzer Name des Gerichts)
        - amount (Number, Anzahl der Portionen/Stück basierend auf Nutzerinfo. Standard ist 1)
        - calories (Number, Kalorien für EINE Portion/Stück (nicht Gesamt, falls amount > 1))
        - protein (Number, Protein für EINE Portion/Stück)
        - fat (Number, Fett für EINE Portion/Stück)
        - carbs (Number, Kohlenhydrate für EINE Portion/Stück)
        - ingredients (Array von Objekten, jede Zutat hat:
            - name (String)
            - weight (Number, geschätztes Gewicht in Gramm für EINE Portion)
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

                    const responseText = result.response.text();
                    // Markdown entfernen und Whitespace trimmen, um JSON-Fehler zu vermeiden
                    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                    jsonResponse = JSON.parse(cleanedText);
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
            analysisModal.classList.remove('hidden'); // Karte wieder zeigen damit man es nochmal versuchen kann
            return;
        }

        // Datum und Zeitstempel hinzufügen, damit wir die Historie nach Tagen sortieren können
        const now = new Date();
        jsonResponse.date = currentDate.toISOString().split('T')[0]; // Zum aktuell angezeigten Tag hinzufügen
        jsonResponse.timestamp = now.getTime();
        
        // Originalwerte sichern für Skalierung
        const originalCalories = jsonResponse.calories;
        const originalProtein = jsonResponse.protein;
        const originalFat = jsonResponse.fat;
        const originalCarbs = jsonResponse.carbs;

        currentAiResult = jsonResponse; // Speichern für Rezept-Button

        // Initial amount (Standard 1, falls KI nichts gefunden hat)
        const initialAmount = jsonResponse.amount || 1;

        // Ergebnis anzeigen (Editierbar)
        resultArea.innerHTML = `
            <h3>${jsonResponse.name}</h3>
            
            <div style="background: #1c1c1e; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #333;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px; color: #888; display: block; margin-bottom: 5px;">Kcal pro Stk.</label>
                        <input type="number" id="aiBaseCalories" value="${Math.round(jsonResponse.calories)}" style="width: 100%; background: #000; border: 1px solid #333; padding: 10px; border-radius: 8px; color: #ff5722; font-weight: bold; text-align: center; font-size: 18px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px; color: #888; display: block; margin-bottom: 5px;">Anzahl</label>
                        <input type="number" id="aiAmount" value="${initialAmount}" style="width: 100%; background: #000; border: 1px solid #333; padding: 10px; border-radius: 8px; color: white; font-weight: bold; text-align: center; font-size: 18px;">
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #aaa; padding-top: 10px; border-top: 1px solid #333;">
                    <span>Gesamt: <strong id="aiTotalDisplay" style="color: white;">${Math.round(jsonResponse.calories * initialAmount)}</strong> kcal</span>
                    <span>P: <span id="aiProtDisplay">${Math.round(jsonResponse.protein * initialAmount)}</span>g</span>
                    <span>F: <span id="aiFatDisplay">${Math.round(jsonResponse.fat * initialAmount)}</span>g</span>
                    <span>K: <span id="aiCarbsDisplay">${Math.round(jsonResponse.carbs * initialAmount)}</span>g</span>
                </div>
            </div>

            <p style="margin-top: 10px; font-size: 0.9em; color: #ccc; background: #2c2c2e; padding: 10px; border-radius: 8px; border: 1px solid #333;">${icons.bulb} ${jsonResponse.reasoning || 'Keine Details verfügbar'}</p>
            <p style="margin-top: 15px; font-size: 0.8em; color: #666;">${icons.robot} Genutzt: ${usedModelName}</p>
            
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button id="confirmAiEntryBtn" class="primary-btn" style="flex: 2;">Hinzufügen</button>
                <button id="saveAiRecipeBtn" class="secondary-btn" style="flex: 1; border-color: #9c27b0; color: #e1bee7; padding: 0; display: flex; align-items: center; justify-content: center;">📖</button>
            </div>
        `;
        resultArea.classList.remove('hidden');

        // Elemente referenzieren
        const aiBaseCaloriesInput = document.getElementById('aiBaseCalories');
        const aiAmountInput = document.getElementById('aiAmount');
        const aiTotalDisplay = document.getElementById('aiTotalDisplay');
        const aiProtDisplay = document.getElementById('aiProtDisplay');
        const aiFatDisplay = document.getElementById('aiFatDisplay');
        const aiCarbsDisplay = document.getElementById('aiCarbsDisplay');

        // Update Funktion für Live-Berechnung
        function updateAiCalculations() {
            const baseCal = parseFloat(aiBaseCaloriesInput.value) || 0;
            const amount = parseFloat(aiAmountInput.value) || 1;
            
            // Verhältnis zur Original-Schätzung berechnen
            const ratio = originalCalories > 0 ? (baseCal / originalCalories) : 1;
            
            const totalCal = baseCal * amount;
            const totalP = originalProtein * ratio * amount;
            const totalF = originalFat * ratio * amount;
            const totalC = originalCarbs * ratio * amount;

            aiTotalDisplay.textContent = Math.round(totalCal);
            aiProtDisplay.textContent = Math.round(totalP);
            aiFatDisplay.textContent = Math.round(totalF);
            aiCarbsDisplay.textContent = Math.round(totalC);
        }

        aiBaseCaloriesInput.addEventListener('input', updateAiCalculations);
        aiAmountInput.addEventListener('input', updateAiCalculations);

        // Hinzufügen Button
        document.getElementById('confirmAiEntryBtn').addEventListener('click', () => {
             const baseCal = parseFloat(aiBaseCaloriesInput.value) || 0;
             const amount = parseFloat(aiAmountInput.value) || 1;
             
             const ratio = originalCalories > 0 ? (baseCal / originalCalories) : 1;
             
             // Werte im Objekt aktualisieren
             jsonResponse.calories = baseCal * amount;
             jsonResponse.protein = originalProtein * ratio * amount;
             jsonResponse.fat = originalFat * ratio * amount;
             jsonResponse.carbs = originalCarbs * ratio * amount;
             
             // Zutaten auch skalieren, damit die Summen stimmen
             if (jsonResponse.ingredients) {
                 jsonResponse.ingredients.forEach(ing => {
                     ing.calories = ing.calories * ratio * amount;
                     ing.protein = ing.protein * ratio * amount;
                     ing.fat = ing.fat * ratio * amount;
                     ing.carbs = ing.carbs * ratio * amount;
                     // Gewicht skaliert nur mit Menge (Annahme: Kalorienänderung ändert Dichte nicht)
                     ing.weight = ing.weight * amount; 
                 });
             }

             saveToHistory(jsonResponse);
             renderHistory();
             updateStatsUI();
             
             resultArea.innerHTML = ''; // Aufräumen
             resultArea.classList.add('hidden');
             showToast("Eintrag hinzugefügt!", "success");
        });

        // Event Listener für den neuen Rezept-Button
        document.getElementById('saveAiRecipeBtn').addEventListener('click', () => {
            // Wir speichern die aktuell eingestellten Basis-Werte als Rezept
            const baseCal = parseFloat(aiBaseCaloriesInput.value) || 0;
            const ratio = originalCalories > 0 ? (baseCal / originalCalories) : 1;

            const recipe = {
                id: Date.now().toString(),
                name: currentAiResult.name,
                calories: Math.round(baseCal),
                protein: Math.round(originalProtein * ratio),
                fat: Math.round(originalFat * ratio),
                carbs: Math.round(originalCarbs * ratio)
            };
            userRecipes.push(recipe);
            saveUserData();
            showToast(`"${recipe.name}" gespeichert!`, "success");
        });

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
        analysisModal.classList.remove('hidden'); // Karte wieder zeigen
    } finally {
        hideLoading();
    }
});

// Fehlender Listener für das Schließen des Analyse-Modals
closeAnalysisBtn.addEventListener('click', () => {
    analysisModal.classList.add('hidden');
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
    let currentCal = 0, currentP = 0, currentF = 0, currentC = 0, currentWater = 0;
    
    if (history.entries) {
        history.entries.forEach(entry => {
            // Nur Einträge vom aktuell ausgewählten Tag zählen
            if (entry.date === dateString) {
                currentCal += entry.calories || 0;
                currentP += entry.protein || 0;
                currentF += entry.fat || 0;
                currentC += entry.carbs || 0;
                currentWater += entry.waterMl || 0;
            }
        });
    }
    
    // Ziele (Hardcoded für jetzt)
    const goalCal = userGoals.calories || 2500;
    const goalP = userGoals.protein || 150;
    const goalF = userGoals.fat || 80;
    const goalC = userGoals.carbs || 300;
    const goalWater = userGoals.water || 2500;
    
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

    // Wasser UI Update
    waterCurrentDisplay.textContent = currentWater;
    waterGoalDisplay.textContent = goalWater;
    
    // Flaschen-Logik: Berechnen wie viele Flaschen wir brauchen
    // Wir zeigen immer mindestens eine an.
    // Wenn voll (>= goal), zeigen wir die nächste leere an (+1).
    const numBottles = Math.max(1, Math.floor(currentWater / goalWater) + 1);
    
    // Container leeren und neu aufbauen (einfachste Lösung für Konsistenz)
    bottleContainer.innerHTML = '';

    for (let i = 0; i < numBottles; i++) {
        const bottleDiv = document.createElement('div');
        bottleDiv.className = 'bottle';
        
        // Wenn nur eine Flasche da ist, zeigen wir sie groß an
        if (numBottles === 1) {
            bottleDiv.classList.add('large');
        }
        
        const fillDiv = document.createElement('div');
        fillDiv.className = 'water-fill';
        
        // Füllstand für DIESE spezifische Flasche berechnen
        // Beispiel: Ziel 2500. Aktuell 2700.
        // Flasche 0 (i=0): 2700 - 0 = 2700 -> max 2500 -> 100%
        // Flasche 1 (i=1): 2700 - 2500 = 200 -> 200/2500 -> 8%
        let amountInBottle = currentWater - (i * goalWater);
        // Begrenzen zwischen 0 und Ziel
        amountInBottle = Math.max(0, Math.min(amountInBottle, goalWater));
        
        const pct = (amountInBottle / goalWater) * 100;
        fillDiv.style.height = `${pct}%`;
        
        bottleDiv.appendChild(fillDiv);
        bottleContainer.appendChild(bottleDiv);
    }

    // Minus-Button deaktivieren, wenn Wasser <= 0
    if (currentWater <= 0) {
        removeWaterBtn.disabled = true;
    } else {
        removeWaterBtn.disabled = false;
    }
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
        .filter(entry => !entry.waterMl) // Wasser-Einträge aus der Liste ausblenden (nur im Widget sichtbar)
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
                    <span class="ing-unit">${ing.unit || 'g'}</span>
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

// --- PRODUKTSUCHE LOGIK ---
productSearchBtn.addEventListener('click', async () => {
    const query = productSearchInput.value.trim();
    if (!query) return;

    productSearchBtn.textContent = "⏳";
    searchResults.innerHTML = '';
    searchResults.style.display = 'block';

    try {
        // Suche in Open Food Facts
        // Zurück zur V1 API (cgi/search.pl), da diese auch Marken (z.B. Vemondo) findet. V2 sucht nur im Namen.
        const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,image_front_small_url,image_small_url`);
        const data = await response.json();

        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                const name = product.product_name || "Unbekannt";
                const kcal = product.nutriments['energy-kcal_100g'] || 0;
                const imgUrl = product.image_front_small_url || product.image_small_url;
                
                // Bild anzeigen oder Platzhalter, wenn keins da ist
                div.innerHTML = `
                    ${imgUrl ? `<img src="${imgUrl}" class="search-result-img" loading="lazy">` : '<div class="search-result-img placeholder">🍽️</div>'}
                    <div>
                        <div style="font-weight: 600;">${name}</div>
                        <div style="color:#888; font-size: 12px;">${Math.round(kcal)} kcal / 100g</div>
                    </div>
                `;
                
                div.addEventListener('click', () => {
                    // Felder füllen
                    manualName.value = name;
                    manualAmount.value = 100;
                    manualUnit.value = 'g';
                    
                    // Basiswerte speichern (für automatische Berechnung)
                    currentManualBase = {
                        calories: kcal,
                        protein: product.nutriments.proteins_100g || 0,
                        fat: product.nutriments.fat_100g || 0,
                        carbs: product.nutriments.carbohydrates_100g || 0
                    };

                    manualCalories.value = kcal; // Basis 100g
                    manualProtein.value = product.nutriments.proteins_100g || 0;
                    manualFat.value = product.nutriments.fat_100g || 0;
                    manualCarbs.value = product.nutriments.carbohydrates_100g || 0;
                    
                    // Liste ausblenden
                    searchResults.style.display = 'none';
                    // Hinweis: User muss jetzt nur noch Menge anpassen (Standard ist hier 100g Werte)
                });
                searchResults.appendChild(div);
            });
        } else {
            searchResults.innerHTML = '<div class="search-result-item" style="color: #ff453a;">Nichts gefunden.</div>';
        }
    } catch (e) {
        console.error(e);
        searchResults.innerHTML = '<div class="search-result-item" style="color: #ff453a;">Fehler bei der Suche.</div>';
    } finally {
        productSearchBtn.textContent = "Go";
    }
});

// --- QUICK AMOUNT LOGIK ---
if (quickAmountsContainer) {
    quickAmountsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-amt-btn')) {
            manualAmount.value = e.target.dataset.value;
            updateManualMacros(); // Neuberechnung auslösen
        }
    });
}

if (manualUnit) {
    manualUnit.addEventListener('change', () => {
        const unit = manualUnit.value;
        let values = [];
        // Intelligente Vorschläge je nach Einheit
        if (unit === 'Stk.') values = [1, 2, 3, 5];
        else values = [100, 250, 500, 1000];
        
        quickAmountsContainer.innerHTML = values.map(v => 
            `<button class="quick-amt-btn" data-value="${v}">${v}</button>`
        ).join('');
    });
}

// Automatische Berechnung bei Mengenänderung
manualAmount.addEventListener('input', updateManualMacros);

function updateManualMacros() {
    if (!currentManualBase) return; // Nur berechnen, wenn ein Produkt aus der Suche gewählt wurde
    const amount = parseFloat(manualAmount.value) || 0;
    const factor = amount / 100;
    
    manualCalories.value = Math.round(currentManualBase.calories * factor);
    manualProtein.value = Math.round(currentManualBase.protein * factor);
    manualFat.value = Math.round(currentManualBase.fat * factor);
    manualCarbs.value = Math.round(currentManualBase.carbs * factor);
}

scanInManualBtn.addEventListener('click', () => {
    manualEntryForm.classList.add('hidden');
    scannerModal.classList.remove('hidden');
    startCamera();
});

saveManualEntryBtn.addEventListener('click', () => {
    const name = manualName.value.trim();
    const amount = parseFloat(manualAmount.value) || 1;
    const unit = manualUnit.value || 'g';
    const calories = parseFloat(manualCalories.value) || 0;
    const protein = parseFloat(manualProtein.value) || 0;
    const fat = parseFloat(manualFat.value) || 0;
    const carbs = parseFloat(manualCarbs.value) || 0;

    if (!name || calories <= 0) {
        showToast("Bitte Name und Kalorien angeben.", "error");
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
            weight: amount,
            unit: unit,
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
    manualAmount.value = '';
    manualUnit.value = 'g';
    manualCalories.value = '';
    manualProtein.value = '';
    manualFat.value = '';
    manualCarbs.value = '';
    currentManualBase = null; // Reset
    manualEntryForm.classList.add('hidden');
});

// --- REZEPTE LOGIK ---

recipesBtn.addEventListener('click', () => {
    renderRecipes();
    recipesModal.classList.remove('hidden');
});

closeRecipesBtn.addEventListener('click', () => recipesModal.classList.add('hidden'));

createNewRecipeBtn.addEventListener('click', () => {
    // Felder leeren
    recipeInputs.name.value = '';
    recipeInputs.cal.value = '';
    recipeInputs.p.value = '';
    recipeInputs.f.value = '';
    recipeInputs.c.value = '';
    createRecipeModal.classList.remove('hidden');
});

closeCreateRecipeBtn.addEventListener('click', () => createRecipeModal.classList.add('hidden'));

saveNewRecipeBtn.addEventListener('click', () => {
    const name = recipeInputs.name.value.trim();
    if (!name) return showToast("Bitte einen Namen eingeben.", "error");

    const newRecipe = {
        id: Date.now().toString(),
        name: name,
        calories: parseFloat(recipeInputs.cal.value) || 0,
        protein: parseFloat(recipeInputs.p.value) || 0,
        fat: parseFloat(recipeInputs.f.value) || 0,
        carbs: parseFloat(recipeInputs.c.value) || 0
    };

    userRecipes.push(newRecipe);
    saveUserData();
    renderRecipes();
    createRecipeModal.classList.add('hidden');
});

function renderRecipes() {
    recipesList.innerHTML = '';
    if (!userRecipes || userRecipes.length === 0) {
        recipesList.innerHTML = '<p style="color: #666; text-align: center; margin-top: 20px;">Noch keine Rezepte gespeichert.</p>';
        return;
    }

    userRecipes.forEach((recipe, index) => {
        const div = document.createElement('div');
        div.className = 'recipe-item';
        div.innerHTML = `
            <div>
                <div style="font-weight: bold; color: white;">${recipe.name}</div>
                <div style="font-size: 12px; color: #aaa;">${Math.round(recipe.calories)} kcal • P:${Math.round(recipe.protein)} F:${Math.round(recipe.fat)} K:${Math.round(recipe.carbs)}</div>
            </div>
            <button class="delete-btn" style="color: #ff453a;">${icons.trash}</button>
        `;

        // Klick auf das Rezept -> Hinzufügen zum Tag
        div.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                // Löschen
                e.stopPropagation();
                if(confirm(`Rezept "${recipe.name}" wirklich löschen?`)) {
                    userRecipes.splice(index, 1);
                    saveUserData();
                    renderRecipes();
                }
                return;
            }
            // Hinzufügen Logik (als manueller Eintrag)
            addRecipeToDay(recipe);
        });
        recipesList.appendChild(div);
    });
}

function addRecipeToDay(recipe) {
    const entry = {
        name: recipe.name,
        date: toISODateString(currentDate),
        timestamp: new Date().getTime(),
        calories: recipe.calories,
        protein: recipe.protein,
        fat: recipe.fat,
        carbs: recipe.carbs,
        ingredients: [{
            name: recipe.name,
            weight: 1,
            unit: 'Portion',
            calories: recipe.calories,
            protein: recipe.protein,
            fat: recipe.fat,
            carbs: recipe.carbs
        }],
        reasoning: "Aus Rezepten",
        expanded: false
    };
    saveToHistory(entry);
    updateUIForDate();
    recipesModal.classList.add('hidden');
    showToast(`"${recipe.name}" hinzugefügt!`, "success");
}

// --- WASSER TRACKING LOGIK ---
addWaterBtn.addEventListener('click', () => {
    addWaterEntry(250); // 250ml Glas
});

removeWaterBtn.addEventListener('click', () => {
    // Aktuellen Wasserstand berechnen, um nicht ins Minus zu gehen
    const history = calorieHistory;
    const dateString = toISODateString(currentDate);
    let currentWater = 0;
    if (history.entries) {
        history.entries.forEach(entry => {
            if (entry.date === dateString) {
                currentWater += entry.waterMl || 0;
            }
        });
    }

    // Nur so viel abziehen, wie da ist (max 250ml)
    const amountToRemove = Math.min(currentWater, 250);
    if (amountToRemove > 0) {
        addWaterEntry(-amountToRemove);
    }
});

function addWaterEntry(amount) {
    const now = new Date();
    const entry = {
        name: "Wasser",
        date: toISODateString(currentDate),
        timestamp: now.getTime(),
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        waterMl: amount,
        ingredients: [],
        reasoning: "Wasser Tracker",
        expanded: false
    };

    saveToHistory(entry);
    updateUIForDate();
}

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

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    if (type === 'success') icon = '✅';
    else if (type === 'error') icon = '❌';
    else icon = 'ℹ️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    
    container.appendChild(toast);

    // Nach 3 Sekunden entfernen
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.remove();
        });
    }, 3000);
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

// --- BARCODE SCANNER LOGIK ---

closeScannerBtn.addEventListener('click', () => {
    stopCamera();
    scannerModal.classList.add('hidden');
});

function startCamera() {
    // Prüfen ob Bibliothek geladen ist
    if (!window.Html5Qrcode) {
        showToast("Scanner lädt noch...", "info");
        return;
    }

    html5QrCode = new Html5Qrcode("reader");
    
    // Dynamisches Seitenverhältnis für Vollbild auf Handys
    // Wir nutzen window.innerWidth / window.innerHeight, um das Kamerabild an den Screen anzupassen
    const aspectRatio = window.innerWidth / window.innerHeight;
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: aspectRatio };
    
    // Kamera starten (Rückkamera bevorzugt)
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
    .catch(err => {
        console.error("Kamera Fehler:", err);
        showToast("Kamera-Fehler: Berechtigung prüfen.", "error");
        scannerModal.classList.add('hidden');
    });
}

function stopCamera() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.error("Stop failed", err));
    }
}

function onScanFailure(error) {
    // Rauschen ignorieren, passiert oft wenn kein Code im Bild ist
}

async function onScanSuccess(decodedText, decodedResult) {
    // Scan stoppen
    stopCamera();
    scannerModal.classList.add('hidden');
    showLoading("Suche Produkt...");

    try {
        // Open Food Facts API abfragen
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`);
        const data = await response.json();

        if (data.status === 1) {
            const p = data.product;
            
            // Relevante Daten extrahieren (Fallback auf 0 wenn nicht vorhanden)
            currentBarcodeData = {
                name: p.product_name || "Unbekanntes Produkt",
                calories100: p.nutriments['energy-kcal_100g'] || 0,
                protein100: p.nutriments.proteins_100g || 0,
                fat100: p.nutriments.fat_100g || 0,
                carbs100: p.nutriments.carbohydrates_100g || 0
            };

            showBarcodeResultModal();
        } else {
            showToast("Produkt nicht gefunden.", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Fehler beim Abrufen der Daten.", "error");
    } finally {
        hideLoading();
    }
}

function showBarcodeResultModal() {
    barcodeProductName.textContent = currentBarcodeData.name;
    barcode100gInfo.textContent = `${Math.round(currentBarcodeData.calories100)} kcal / 100g`;
    barcodeWeight.value = 100; // Reset auf 100g
    updateBarcodeStats(); // Initiale Berechnung
    barcodeResultModal.classList.remove('hidden');
}

function updateBarcodeStats() {
    const weight = parseFloat(barcodeWeight.value) || 0;
    const factor = weight / 100;
    
    const cal = Math.round(currentBarcodeData.calories100 * factor);
    const p = Math.round(currentBarcodeData.protein100 * factor);
    const f = Math.round(currentBarcodeData.fat100 * factor);
    const c = Math.round(currentBarcodeData.carbs100 * factor);

    barcodeCalculatedStats.innerHTML = `
        <div style="font-size: 24px; font-weight: bold; margin-bottom: 10px;">${cal} kcal</div>
        <div style="display: flex; justify-content: center; gap: 15px; font-size: 14px; color: #aaa;">
            <span>P: ${p}g</span>
            <span>F: ${f}g</span>
            <span>K: ${c}g</span>
        </div>
    `;
}

barcodeWeight.addEventListener('input', updateBarcodeStats);

closeBarcodeResultBtn.addEventListener('click', () => barcodeResultModal.classList.add('hidden'));

saveBarcodeEntryBtn.addEventListener('click', () => {
    const weight = parseFloat(barcodeWeight.value) || 0;
    if (weight <= 0) return;

    const factor = weight / 100;
    const entry = {
        name: currentBarcodeData.name,
        date: toISODateString(currentDate),
        timestamp: new Date().getTime(),
        calories: currentBarcodeData.calories100 * factor,
        protein: currentBarcodeData.protein100 * factor,
        fat: currentBarcodeData.fat100 * factor,
        carbs: currentBarcodeData.carbs100 * factor,
        ingredients: [{
            name: currentBarcodeData.name,
            weight: weight,
            calories: currentBarcodeData.calories100 * factor,
            protein: currentBarcodeData.protein100 * factor,
            fat: currentBarcodeData.fat100 * factor,
            carbs: currentBarcodeData.carbs100 * factor
        }],
        reasoning: "Barcode Scan",
        expanded: false
    };

    saveToHistory(entry);
    renderHistory();
    updateStatsUI();
    barcodeResultModal.classList.add('hidden');
});