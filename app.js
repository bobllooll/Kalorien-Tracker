// Importiere das offizielle Google AI SDK für den Browser
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
// Importiere Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendEmailVerification, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { firebaseConfig } from "./config.js";

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics Logik (wird erst nach Zustimmung geladen)
let analytics;
async function initAnalytics() {
    try {
        const supported = await isSupported();
        if (supported) analytics = getAnalytics(app);
    } catch (e) {
        console.error("Analytics init failed", e);
    }
}

const appLoadingScreen = document.getElementById('appLoadingScreen');
const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
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
const saveManualAsRecipeBtn = document.getElementById('saveManualAsRecipeBtn');
const scanInManualBtn = document.getElementById('scanInManualBtn');
const productSearchInput = document.getElementById('productSearchInput');
const productSearchBtn = document.getElementById('productSearchBtn');
const aiTextEstimateBtn = document.getElementById('aiTextEstimateBtn');
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
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const authError = document.getElementById('authError');
const openProfileBtn = document.getElementById('openProfileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileGeminiKey = document.getElementById('profileGeminiKey');
const profileOpenAIKey = document.getElementById('profileOpenAIKey');
// Neue Profil Felder
const apiUsageDisplay = document.getElementById('apiUsageDisplay');
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
// Legal & Cookies
const legalModal = document.getElementById('legalModal');
const openLegalBtn = document.getElementById('openLegalBtn');
const closeLegalBtn = document.getElementById('closeLegalBtn');
const cookieBanner = document.getElementById('cookieBanner');
const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
const declineCookiesBtn = document.getElementById('declineCookiesBtn');

const hybridModeToggle = document.getElementById('hybridModeToggle');
const hybridInfoBtn = document.getElementById('hybridInfoBtn');
const hybridInfoText = document.getElementById('hybridInfoText');

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
    fire: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#bf5af2"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`,
    protein: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#3498db"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 19.86 21.29 21.29 19.86 19.86 18.43 22 16.29z"/></svg>`,
    fat: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#f1c40f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>`,
    carbs: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#2ecc71"><path d="M17 5v12c0 2.76-2.24 5-5 5s-5-2.24-5-5V4c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1h2v-1c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2z"/></svg>`,
    bulb: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#ffd60a"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/></svg>`,
    robot: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#888"><path d="M12 2c-5.33 0-8 2.67-8 8v6c0 5.33 2.67 8 8 8s8-2.67 8-8v-6c0-5.33-2.67-8-8-8zm0 2c4.27 0 6 2.13 6 6v6c0 3.87-1.73 6-6 6s-6-2.13-6-6v-6c0-3.87 1.73-6 6-6zm-2.5 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>`,
    trash: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    chevron: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17 16.59 8.59 18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
    close: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    water: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#bf5af2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
};

// Globale Variablen für User-Daten
let currentUser = null;
let API_KEY = null; // Wird aus Firebase geladen
let OPENAI_API_KEY = null; // Wird aus Firebase geladen
let calorieHistory = { entries: [] }; // Lokaler Cache der Daten
let userGoals = { calories: 2500, protein: 150, fat: 80, carbs: 300, water: 2500 }; // Standardwerte
let userRecipes = []; // Lokaler Cache der Rezepte
let apiUsage = { date: '', count: 0 }; // API Nutzung Zähler

let currentAiResult = null; // Globaler Zwischenspeicher für das aktuelle KI-Ergebnis
let selectedFiles = [];
let currentDate = new Date();
let html5QrCode = null; // Scanner Instanz
let currentBarcodeData = null; // Zwischenspeicher für gefundenes Produkt
let currentManualBase = null; // Zwischenspeicher für manuelle Suche (Basis 100g)

// --- MODAL & HISTORY MANAGEMENT (Zurück-Button Logik) ---
const openModalsStack = [];

/**
 * Öffnet ein Modal und fügt es dem Browser-Verlauf hinzu.
 * Der Zurück-Button schließt es dann wieder.
 */
function openModal(modalElement) {
    if (modalElement.classList.contains('hidden')) {
        modalElement.classList.remove('hidden');
        openModalsStack.push(modalElement);
        document.body.classList.add('no-scroll'); // Scrollen sperren
        // Fügt einen Eintrag in die History hinzu
        history.pushState({ modalOpen: true, id: modalElement.id }, '');
    }
}

/**
 * Schließt das oberste Modal (simuliert Zurück-Button).
 * Dies löst das 'popstate' Event aus, welches das Modal tatsächlich schließt.
 */
function closeModal() {
    if (openModalsStack.length > 0) {
        history.back();
    }
}

// Reagiert auf den Browser-Zurück-Button (oder closeModal Aufruf)
window.addEventListener('popstate', () => {
    const modal = openModalsStack.pop();
    if (modal) {
        modal.classList.add('hidden');
        
        // Spezialfall: Scanner stoppen, wenn Scanner-Modal geschlossen wird
        if (modal.id === 'scannerModal') {
            stopCamera();
        }
    }

    // Wenn keine Modals mehr offen sind, Scrollen wieder erlauben
    if (openModalsStack.length === 0) {
        document.body.classList.remove('no-scroll');
    }
});

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
        
        // Lade-Screen ausblenden (mit kurzer Verzögerung für Smoothness)
        setTimeout(() => appLoadingScreen.classList.add('fade-out-screen'), 300);
        
    } else {
        // User ist ausgeloggt
        currentUser = null;
        openProfileBtn.textContent = "👤"; // Reset auf Icon
        authScreen.classList.remove('hidden');
        appContent.classList.add('hidden');
        calorieHistory = { entries: [] };
        
        // Auch hier Lade-Screen wegnehmen, damit man sich einloggen kann
        setTimeout(() => appLoadingScreen.classList.add('fade-out-screen'), 300);
    }
});

// Login
loginBtn.addEventListener('click', async () => {
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    authError.textContent = "";
    
    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!email || !password) {
        authError.textContent = "Bitte E-Mail und Passwort eingeben.";
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
        return;
    }

    try {
        loginBtn.textContent = "Verbinde...";
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 2FA Check: Ist die E-Mail bestätigt?
        if (!userCredential.user.emailVerified) {
            await signOut(auth); // Sofort wieder ausloggen
            authError.textContent = "Bitte bestätige erst deine E-Mail Adresse (Link im Posteingang).";
            return;
        }
        
        // Schlüssel aus Passwort ableiten und speichern
        loginBtn.textContent = "Entschlüssle...";
        // Kleiner Timeout, damit der Browser das UI rendern kann (PBKDF2 blockiert kurz)
        await new Promise(r => setTimeout(r, 50));
        
        const key = await deriveKeyFromPassword(password, userCredential.user.uid);
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
        } else if (error.code === 'auth/invalid-email') {
            authError.textContent = "Ungültige E-Mail Adresse.";
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

    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!email || !password) {
        authError.textContent = "Bitte E-Mail und Passwort eingeben.";
        registerBtn.disabled = false;
        return;
    }

    // reCAPTCHA v3 Ausführung
    registerBtn.textContent = "Prüfe Sicherheit...";
    
    try {
        // Wir warten auf das reCAPTCHA Token (Client-Side Check)
        await new Promise((resolve) => {
            grecaptcha.ready(() => {
                grecaptcha.execute('6LdGe08sAAAAAPsA5RKV2qXbUWFScBJhUQZRS-0K', {action: 'submit'}).then(resolve);
            });
        });

        registerBtn.textContent = "Erstelle Konto...";
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // E-Mail Verifizierung senden
        await sendEmailVerification(userCredential.user);
        
        // Schlüssel generieren (damit er existiert), aber NICHT einloggen lassen
        const key = await deriveKeyFromPassword(password, userCredential.user.uid);
        // Wir speichern den Key hier NICHT im LocalStorage, da der User sich erst verifizieren muss
        
        // Sofort ausloggen
        await signOut(auth);

        showToast(`Link an ${email} gesendet!`, "success");
        authError.textContent = "Bestätigungs-Link gesendet. Bitte E-Mail freischalten, dann einloggen.";
        
    } catch (error) {
        console.error(error);
        authError.textContent = "Fehler: " + error.message;
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = originalText;
    }
});

// Passwort vergessen
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async () => {
        const email = authEmail.value.trim();
        if (!email) {
            authError.textContent = "Bitte gib deine E-Mail-Adresse oben ein.";
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            showToast("Reset-Link gesendet!", "success");
            authError.textContent = "Prüfe deinen Posteingang (auch Spam).";
        } catch (e) {
            console.error(e);
            authError.textContent = "Fehler: " + e.message;
        }
    });
}

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
    localStorage.removeItem('app_encryption_key'); // Schlüssel aus Sicherheit entfernen
    closeModal(); // Profil schließen
});

// --- PROFIL & DATEN LOGIK ---

async function loadUserData() {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Hilfsfunktion: Entschlüsseln oder Originalwert nehmen (Abwärtskompatibilität)
        const smartDecrypt = async (val) => {
            if (!val) return '';
            // Nur versuchen zu entschlüsseln, wenn es wie unser Format aussieht (Hex:Hex)
            if (typeof val === 'string' && val.includes(':')) {
                const decrypted = await decryptText(val);
                return decrypted || val; 
            }
            return val; // Alter Wert (Klartext)
        };

        // API Keys setzen (unterstützt jetzt auch alte Klartext-Keys)
        API_KEY = await smartDecrypt(data.geminiKey);
        OPENAI_API_KEY = await smartDecrypt(data.openaiKey);

        // Hilfsfunktion zum Entschlüsseln von JSON-Daten
        const decryptJSON = async (encryptedVal, fallback) => {
            if (typeof encryptedVal === 'string') {
                const json = await smartDecrypt(encryptedVal);
                try { return json ? JSON.parse(json) : fallback; } 
                catch (e) { console.error("Parse Error", e); return fallback; }
            }
            return encryptedVal || fallback; // Fallback für alte, unverschlüsselte Daten (Objekte)
        };

        calorieHistory = await decryptJSON(data.history, { entries: [] });
        userGoals = await decryptJSON(data.goals, { calories: 2500, protein: 150, fat: 80, carbs: 300, water: 2500 });
        userRecipes = await decryptJSON(data.recipes, []);
        
        // Profile Data laden (auch verschlüsselt)
        const loadedProfileData = await decryptJSON(data.profileData, {});

        // API Nutzung laden
        if (data.apiUsage) {
            const today = toISODateString(new Date());
            if (data.apiUsage.date === today) {
                apiUsage = data.apiUsage;
            } else {
                apiUsage = { date: today, count: 0 }; // Neuer Tag, Reset
            }
        }
        updateApiUsageDisplay();

        // Profil-Daten für Berechnung füllen (falls vorhanden)
        if (loadedProfileData) {
            profileGoal.value = loadedProfileData.goal || 'maintain';
            profileWeight.value = loadedProfileData.weight || '';
            profileHeight.value = loadedProfileData.height || '';
            profileAge.value = loadedProfileData.age || '';
            profileGender.value = loadedProfileData.gender || 'male';
            profileActivity.value = loadedProfileData.activity || '1.2';
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

async function saveUserData(saveKeys = false) {
    if (!currentUser) return;

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

    const dataToSave = {
        // Alles verschlüsseln! (JSON String -> Encrypt -> Hex String)
        history: await encryptText(JSON.stringify(calorieHistory)),
        goals: await encryptText(JSON.stringify(newGoals)),
        profileData: await encryptText(JSON.stringify(profileData)),
        recipes: await encryptText(JSON.stringify(userRecipes)),
        apiUsage: apiUsage // API Nutzung bleibt lesbar für Limits/Admin
    };

    // Keys nur speichern, wenn explizit angefordert (verhindert Überschreiben durch Auto-Save)
    if (saveKeys) {
        dataToSave.geminiKey = await encryptText(API_KEY);
        dataToSave.openaiKey = await encryptText(OPENAI_API_KEY);
    }

    await setDoc(doc(db, "users", currentUser.uid), dataToSave, { merge: true });
}

// Profil UI Events
openProfileBtn.addEventListener('click', () => openModal(profileModal));
closeProfileBtn.addEventListener('click', () => closeModal());

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

    await saveUserData(true); // WICHTIG: Hier true übergeben, damit Keys gespeichert werden
    updateStatsUI(); // UI sofort aktualisieren
    showToast("Profil gespeichert!", "success");
    closeModal(); // Profil schließen
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

if (hybridInfoBtn) {
    hybridInfoBtn.addEventListener('click', () => hybridInfoText.classList.toggle('hidden'));
}

// Event Listener für Bildauswahl
function handleImageSelection(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        selectedFiles = Array.from(files);
        imagePreviewContainer.innerHTML = ''; // Vorherige Bilder löschen

        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-thumb';
                imagePreviewContainer.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
        openModal(analysisModal);
    }
    // Input zurücksetzen, damit das 'change' Event auch feuert, 
    // wenn man danach direkt ein neues Foto macht
    event.target.value = '';
}

cameraInput.addEventListener('change', handleImageSelection);
if (galleryInput) galleryInput.addEventListener('change', handleImageSelection);

// Event Listener für den Analyse-Button
analyzeBtn.addEventListener('click', async function() {
    if (!selectedFiles || selectedFiles.length === 0) return;

    // UI Feedback: Laden starten
    showLoading("Analysiere Bild...");
    
    analysisModal.classList.add('hidden'); // Karte ausblenden während Analyse
    // resultArea.classList.add('hidden'); // Lassen wir sichtbar für smootheren Übergang
    // resultArea.innerHTML = ''; // Nicht sofort löschen

    const userText = descriptionInput.value;
    const useHybridMode = hybridModeToggle.checked;

    console.group("📸 START AI ANALYSIS");
    console.log("📥 INPUTS:", { 
        userText: userText, 
        hybridMode: useHybridMode,
        imageCount: selectedFiles.length 
    });

    if (!API_KEY) {
        showToast("Bitte API Key im Profil hinterlegen!", "error");
        openModal(profileModal);
        hideLoading();
        // analysisModal wieder öffnen? War ja gerade zu.
        console.groupEnd();
        return;
    }

    try {
        // 1. Bilder komprimieren
        loadingText.textContent = "Optimiere Bilder...";
        const base64Images = await Promise.all(selectedFiles.map(file => compressImage(file, 800, 0.7)));
        const finalMimeType = 'image/jpeg';
        console.log(`🖼️ ${base64Images.length} Images compressed.`);

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
        2. Benenne das GERICHT als Ganzes. Falls mehrere Bilder verschiedene Dinge zeigen, fasse sie zusammen.
        3. Analysiere ALLE sichtbaren Komponenten auf den Bildern.
        4. Achte auf Mengenangaben im Nutzertext (z.B. "3 Stück", "2 Teller", "Hälfte").
        5. Falls du eine konkrete Marke oder Produktverpackung erkennst, fülle das Feld "productSearchQuery" mit dem genauen Produktnamen (z.B. "Vemondo Veganer Käse"). Sonst null.
        ${useHybridMode ? '6. HYBRID-MODUS AKTIV: Der Nutzer möchte einen Datenbank-Abgleich. Versuche besonders genau, Marken oder Produktnamen zu erkennen und in "productSearchQuery" einzutragen.' : ''}
        
        Gib mir ein JSON-Objekt zurück mit:
        - isFood (Boolean, true wenn Essen/Trinken, sonst false)
        - name (String, kurzer Name des Gerichts)
        - productSearchQuery (String, Suchbegriff für Datenbank falls Markenprodukt, sonst null)
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

        console.log("📝 PROMPT:", prompt);

        // 4. Modelle nacheinander testen
        for (const strategy of strategies) {
            if (jsonResponse) break; // Schon erfolgreich

            try {
                loadingText.textContent = `Frage KI (${strategy.model})...`;
                console.log(`Versuche Modell: ${strategy.model}...`);
                console.time(`AI Request (${strategy.model})`);
                incrementApiUsage(); // API Aufruf zählen

                if (strategy.type === 'gemini') {
                    const model = genAI.getGenerativeModel({ 
                        model: strategy.model,
                        generationConfig: { responseMimeType: "application/json" }
                    });

                    // Content Array für Gemini bauen (Prompt + alle Bilder)
                    const content = [prompt];
                    base64Images.forEach(b64 => {
                        content.push({ inlineData: { data: b64, mimeType: finalMimeType } });
                    });

                    const result = await model.generateContent(content);

                    const text = result.response.text();
                    console.log("📨 RAW RESPONSE:", text);
                    jsonResponse = safeJsonParse(text);
                    usedModelName = strategy.model;

                } else if (strategy.type === 'openai') {
                    if (!OPENAI_API_KEY) {
                        console.log("Überspringe GPT-4o (Kein API Key)");
                        continue;
                    }
                    const openAiRes = await callOpenAI(base64Images, prompt);
                    console.log("📨 RAW RESPONSE (OpenAI):", openAiRes);
                    jsonResponse = openAiRes;
                    usedModelName = strategy.model;
                }
                console.timeEnd(`AI Request (${strategy.model})`);

            } catch (error) {
                console.warn(`Fehler mit ${strategy.model}:`, error);
                console.timeEnd(`AI Request (${strategy.model})`);
                lastError = error;
            }
        }

        if (!jsonResponse) {
            throw new Error(`Alle Modelle fehlgeschlagen. Letzter Fehler: ${lastError?.message}`);
        }

        console.log("✅ PARSED JSON (Initial):", jsonResponse);

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
            openModal(analysisModal); // Karte wieder zeigen damit man es nochmal versuchen kann
            console.groupEnd();
            return;
        }

        // --- HYBRID SCAN LOGIK: Datenbank-Check ---
        if (useHybridMode) {
            console.group("🔄 HYBRID CHECK");
            if (jsonResponse.productSearchQuery) {
                try {
                    showLoading(`Datenbank-Check: "${jsonResponse.productSearchQuery}"...`);
                    
                    let offData;
                    try {
                        // Versuch 1: Alte API (Bessere Treffer)
                        const offRes = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(jsonResponse.productSearchQuery)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,nutriments`, {
                            headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
                        });
                        offData = await offRes.json();
                        console.log("📦 OFF API V1 Result:", offData);
                    } catch (e) {
                        // Versuch 2: Neue API (Fallback)
                        console.warn("Fallback auf API V2 für Hybrid-Check");
                        const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(jsonResponse.productSearchQuery)}&page_size=1&fields=product_name,nutriments`, {
                            headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
                        });
                        offData = await offRes.json();
                        console.log("📦 OFF API V2 Result:", offData);
                    }

                    if (offData.products && offData.products.length > 0) {
                        const p = offData.products[0];
                        // Prüfen ob wir brauchbare Nährwerte haben
                        if (p.nutriments && p.nutriments['energy-kcal_100g']) {
                            const dbInfo = {
                                name: p.product_name,
                                calories_100g: p.nutriments['energy-kcal_100g'],
                                protein_100g: p.nutriments.proteins_100g || 0,
                                fat_100g: p.nutriments.fat_100g || 0,
                                carbs_100g: p.nutriments.carbohydrates_100g || 0
                            };

                            console.log("💎 FOUND DB INFO:", dbInfo);
                            showLoading("Optimiere mit echten Werten...");

                            // ZWEITER KI-AUFRUF: Mit echten Daten verfeinern
                            incrementApiUsage(); // Zählt als zweiter Aufruf
                            
                            // Context aus Schritt 1 vorbereiten
                            const step1Amount = jsonResponse.amount || 1;
                            const step1Weight = jsonResponse.ingredients ? jsonResponse.ingredients.reduce((acc, i) => acc + (i.weight || 0), 0) : 0;

                            const refinePrompt = `
                                CONTEXT FROM STEP 1 (Visual Estimate):
                                - User/AI identified: "${jsonResponse.name}"
                                - Visual Amount: ${step1Amount} (piece/serving)
                                - Estimated Weight: ${step1Weight}g

                                DATABASE MATCH:
                                - Name: ${dbInfo.name}
                                - Values per 100g: ${dbInfo.calories_100g} kcal, ${dbInfo.protein_100g} P, ${dbInfo.fat_100g} F, ${dbInfo.carbs_100g} C.

                                AUFGABE:
                                1. SCHAU DIR DAS BILD NOCHMAL GENAU AN.
                                2. Nutze die Datenbank-Werte für das identifizierte Produkt.
                                3. Berechne die Nährwerte für GENAU EINE (1) Portion/Stück.
                                
                                WICHTIG - GEMISCHTE TELLER:
                                Falls das Bild noch ANDERE Lebensmittel enthält (z.B. Schnitzel neben dem Riegel), die NICHT Teil des Datenbank-Produkts sind:
                                - Schätze diese visuell und ADDIERE sie zu den Werten.
                                - Erwähne dies im Reasoning (z.B. "Werte für Duplo (DB) + geschätztes Schnitzel").
                                
                                Gib mir ein JSON-Objekt zurück mit folgendem Format (keine Strings bei Zahlen!):
                                {
                                    "name": "${dbInfo.name}", // Ggf. anpassen wenn gemischt
                                    "amount": ${step1Amount},
                                    "calories": (Number, Wert für 1 Stück/Portion),
                                    "protein": (Number, Wert für 1 Stück/Portion),
                                    "fat": (Number, Wert für 1 Stück/Portion),
                                    "carbs": (Number, Wert für 1 Stück/Portion),
                                    "reasoning": "Erklärung der Berechnung..."
                                }
                                Antworte NUR mit validem JSON.
                            `;

                            console.log("📝 REFINE PROMPT:", refinePrompt);

                            let refinedJson = null;
                            // Wir nutzen das gleiche Modell wie beim ersten erfolgreichen Versuch
                            if (usedModelName.includes('gpt')) {
                                refinedJson = await callOpenAI(base64Images, refinePrompt);
                            } else {
                                const model = genAI.getGenerativeModel({ model: usedModelName, generationConfig: { responseMimeType: "application/json" }});
                                
                                const content = [refinePrompt];
                                base64Images.forEach(b64 => content.push({ inlineData: { data: b64, mimeType: finalMimeType } }));
                                
                                const result = await model.generateContent(content);
                                const text = result.response.text();
                                console.log("📨 REFINE RAW RESPONSE:", text);
                                refinedJson = safeJsonParse(text);
                            }

                            if (refinedJson) {
                                // WICHTIG: Zutaten aus Schritt 1 retten und anpassen!
                                if (jsonResponse.ingredients && jsonResponse.ingredients.length > 0) {
                                    refinedJson.ingredients = jsonResponse.ingredients;
                                    
                                    // Skalierungsfaktor berechnen (Verhältnis: Neue Kcal / Alte Kcal)
                                    const oldCal = jsonResponse.calories || 1;
                                    const newCal = refinedJson.calories || 0;
                                    
                                    if (oldCal > 0 && newCal > 0) {
                                        const ratio = newCal / oldCal;
                                        refinedJson.ingredients.forEach(ing => {
                                            ing.weight = (ing.weight || 0) * ratio;
                                            ing.calories = (ing.calories || 0) * ratio;
                                            ing.protein = (ing.protein || 0) * ratio;
                                            ing.fat = (ing.fat || 0) * ratio;
                                            ing.carbs = (ing.carbs || 0) * ratio;
                                        });
                                    }
                                }

                                jsonResponse = refinedJson; // Das verbesserte Ergebnis übernehmen
                                jsonResponse.isDbVerified = true; // Markierung für UI
                                console.log("✨ REFINED JSON:", refinedJson);
                                showToast("Mit Datenbank-Werten verbessert!", "success");
                            }
                        } else {
                            showToast("Produkt gefunden, aber keine Nährwerte.", "info");
                        }
                    } else {
                        showToast("Produkt nicht in Datenbank gefunden.", "info");
                    }
                } catch (dbError) {
                    console.warn("Datenbank-Verfeinerung fehlgeschlagen (Fallback auf reine KI):", dbError);
                    showToast("Datenbank-Fehler (Offline?)", "error");
                }
            } else {
                showToast("Keine Marke erkannt - Hybrid übersprungen.", "info");
            }
            console.groupEnd();
        }

        // Datum und Zeitstempel hinzufügen, damit wir die Historie nach Tagen sortieren können
        const now = new Date();
        jsonResponse.date = currentDate.toISOString().split('T')[0]; // Zum aktuell angezeigten Tag hinzufügen
        jsonResponse.timestamp = now.getTime();
        
        // Ergebnis anzeigen (ausgelagert in Funktion für Wiederverwendbarkeit)
        renderAiResult(jsonResponse, usedModelName);

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
        openModal(analysisModal); // Karte wieder zeigen
    } finally {
        hideLoading();
        console.groupEnd();
    }
});

/**
 * Zeigt das KI-Ergebnis an und aktiviert die Interaktionen (Editieren, Hinzufügen)
 */
function renderAiResult(jsonResponse, usedModelName) {
        // Werte bereinigen (verhindert NaN/undefined Fehler)
        jsonResponse.calories = parseFloat(jsonResponse.calories) || 0;
        jsonResponse.protein = parseFloat(jsonResponse.protein) || 0;
        jsonResponse.fat = parseFloat(jsonResponse.fat) || 0;
        jsonResponse.carbs = parseFloat(jsonResponse.carbs) || 0;
        jsonResponse.amount = parseFloat(jsonResponse.amount) || 1;
        jsonResponse.name = jsonResponse.name || "Unbekanntes Gericht";

        // Originalwerte sichern für Skalierung
        const originalCalories = jsonResponse.calories;
        const originalProtein = jsonResponse.protein;
        const originalFat = jsonResponse.fat;
        const originalCarbs = jsonResponse.carbs;
        const initialAmount = jsonResponse.amount;
        const displayName = jsonResponse.name;

        currentAiResult = jsonResponse; // Speichern für Rezept-Button

        // Badge für Datenbank-Verifizierung
        const verifiedBadge = jsonResponse.isDbVerified ? 
            `<div style="display: inline-flex; align-items: center; gap: 4px; background: rgba(48, 209, 88, 0.15); color: #30d158; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 10px; border: 1px solid rgba(48, 209, 88, 0.3);">
                <span>✓</span> Datenbank-geprüft
             </div>` : '';

        // Ergebnis anzeigen (Editierbar)
        resultArea.innerHTML = `
            ${verifiedBadge}
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <h3 style="margin: 0; flex: 1; line-height: 1.3;">${displayName}</h3>
                <button id="editProductBtn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #bf5af2; cursor: pointer; padding: 8px; margin-left: 10px; display: flex; align-items: center; justify-content: center;">
                    ✎
                </button>
            </div>
            
            <div style="background: #1c1c1e; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #333;">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px; color: #888; display: block; margin-bottom: 5px;">Kcal pro Stk.</label>
                        <input type="number" id="aiBaseCalories" value="${Math.round(originalCalories)}" style="width: 100%; background: #000; border: 1px solid #333; padding: 10px; border-radius: 8px; color: #bf5af2; font-weight: bold; text-align: center; font-size: 18px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px; color: #888; display: block; margin-bottom: 5px;">Anzahl</label>
                        <input type="number" id="aiAmount" value="${initialAmount}" style="width: 100%; background: #000; border: 1px solid #333; padding: 10px; border-radius: 8px; color: white; font-weight: bold; text-align: center; font-size: 18px;">
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #aaa; padding-top: 10px; border-top: 1px solid #333;">
                    <span>Gesamt: <strong id="aiTotalDisplay" style="color: white;">${Math.round(originalCalories * initialAmount)}</strong> kcal</span>
                    <span>P: <span id="aiProtDisplay">${Math.round(originalProtein * initialAmount)}</span>g</span>
                    <span>F: <span id="aiFatDisplay">${Math.round(originalFat * initialAmount)}</span>g</span>
                    <span>K: <span id="aiCarbsDisplay">${Math.round(originalCarbs * initialAmount)}</span>g</span>
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

        // Event Listener für Korrektur (Stift-Icon)
        document.getElementById('editProductBtn').addEventListener('click', async () => {
            const newName = prompt("Produktname korrigieren (z.B. Marke hinzufügen):", jsonResponse.name);
            if (!newName || newName === jsonResponse.name) return;

            if (!selectedFiles || selectedFiles.length === 0) {
                showToast("Originalbild nicht mehr verfügbar.", "error");
                return;
            }

            showLoading(`Suche "${newName}"...`);
            try {
                // 1. Suche in Open Food Facts
                const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(newName)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,nutriments`;
                const offRes = await fetch(offUrl, {
                    headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
                });
                const offData = await offRes.json();

                if (offData.products && offData.products.length > 0) {
                    const p = offData.products[0];
                    if (p.nutriments && p.nutriments['energy-kcal_100g']) {
                        const dbInfo = {
                            name: p.product_name,
                            calories_100g: p.nutriments['energy-kcal_100g'],
                            protein_100g: p.nutriments.proteins_100g || 0,
                            fat_100g: p.nutriments.fat_100g || 0,
                            carbs_100g: p.nutriments.carbohydrates_100g || 0
                        };

                        showLoading("Optimiere mit neuen Werten...");
                        const base64Images = await Promise.all(selectedFiles.map(f => compressImage(f, 800, 0.7)));
                        
                        // Prompt für die Neuberechnung
                        const refinePrompt = `
                            Ich habe das Produkt in der Datenbank gefunden!
                            Name: ${dbInfo.name}
                            Echte Nährwerte pro 100g:
                            - Kalorien: ${dbInfo.calories_100g} kcal
                            - Protein: ${dbInfo.protein_100g} g
                            - Fett: ${dbInfo.fat_100g} g
                            - Kohlenhydrate: ${dbInfo.carbs_100g} g

                            AUFGABE:
                            1. Schätze anhand des Bildes NUR die Menge (Gewicht in Gramm) der gezeigten Portion.
                            2. Berechne die TOTALEN Werte für diese Portion basierend auf den 100g-Werten oben.
                            3. Gib das JSON im exakt gleichen Format wie vorher zurück.
                            4. Setze 'reasoning' auf: "Manuelle Korrektur: Werte für ${dbInfo.name} aus Datenbank übernommen."
                        `;

                        // Wir nutzen hier standardmäßig Gemini für die Korrektur
                        incrementApiUsage(); // Zählt als Aufruf
                        const genAI = new GoogleGenerativeAI(API_KEY);
                        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" }});
                        
                        const content = [refinePrompt];
                        base64Images.forEach(b64 => content.push({ inlineData: { data: b64, mimeType: 'image/jpeg' } }));
                        
                        const result = await model.generateContent(content);
                        const text = result.response.text();
                        const refinedJson = safeJsonParse(text);

                        refinedJson.isDbVerified = true;
                        refinedJson.date = new Date().toISOString().split('T')[0];
                        refinedJson.timestamp = new Date().getTime();

                        renderAiResult(refinedJson, "Gemini (Korrektur)");
                        showToast("Produkt korrigiert!", "success");
                    } else {
                        showToast("Produkt gefunden, aber keine Nährwerte.", "error");
                    }
                } else {
                    showToast("Produkt nicht in Datenbank gefunden.", "error");
                }
            } catch (e) {
                console.error(e);
                showToast("Fehler bei der Korrektur.", "error");
            } finally {
                hideLoading();
            }
        });
}

// Fehlender Listener für das Schließen des Analyse-Modals
closeAnalysisBtn.addEventListener('click', () => {
    closeModal();
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
        ${createChart(currentCal, goalCal, '#bf5af2', 'Kcal', 'xlarge')}
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
    openModal(manualEntryForm);
});

closeManualEntryBtn.addEventListener('click', () => {
    closeModal();
});

// --- PRODUKTSUCHE LOGIK ---
productSearchBtn.addEventListener('click', async () => {
    const query = productSearchInput.value.trim();
    if (!query) return;
    console.log("🔎 MANUAL SEARCH:", query);

    // Original-Inhalt sichern und Lade-Animation anzeigen
    const originalBtnContent = productSearchBtn.innerHTML;
    productSearchBtn.innerHTML = `<svg class="icon-svg spin-anim" viewBox="0 0 24 24"><path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4z"/></svg>`;
    productSearchBtn.disabled = true; // Mehrfachklicks verhindern
    
    searchResults.innerHTML = '';
    searchResults.style.display = 'block';

    try {
        let data;
        try {
            // Versuch 1: Alte API (Bessere Ergebnisse für Marken, aber oft CORS-Probleme)
            const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,image_front_small_url,image_small_url`, {
                headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
            });
            data = await response.json();
            console.log("📦 SEARCH RESULT (V1):", data);
        } catch (e) {
            console.warn("Fallback auf API V2 wegen Fehler:", e);
            // Versuch 2: Neue API V2 (Stabiler, aber manchmal weniger Treffer)
            const response = await fetch(`https://world.openfoodfacts.org/api/v2/search?search_terms=${query}&page_size=5&fields=product_name,nutriments,image_front_small_url,image_small_url`, {
                headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
            });
            data = await response.json();
            console.log("📦 SEARCH RESULT (V2):", data);
        }

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
        // Button wiederherstellen
        productSearchBtn.innerHTML = originalBtnContent;
        productSearchBtn.disabled = false;
    }
});

// --- NEU: AI TEXT SCHÄTZUNG ---
aiTextEstimateBtn.addEventListener('click', async () => {
    const query = productSearchInput.value.trim();
    if (!query) return showToast("Bitte ein Gericht eingeben.", "error");
    
    if (!API_KEY) return showToast("API Key fehlt (siehe Profil).", "error");

    showLoading("KI schätzt Portion & Werte...");
    
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" }});
        
        const prompt = `
            Du bist ein Ernährungsberater. Schätze die Nährwerte für: "${query}".
            1. Gehe von einer realistischen Standardportion aus (z.B. ganzer Döner = 350g, 1 Apfel = 150g).
            2. Berücksichtige Modifikationen im Text genau (z.B. "ohne Soße" -> weniger Kalorien/Fett).
            
            Antworte mit JSON:
            {
                "name": "Kurzer Name des Gerichts",
                "weight": 350, // Geschätztes Gewicht der Portion in Gramm
                "calories": 700, // Gesamtkalorien für dieses Gewicht
                "protein": 30,
                "fat": 20,
                "carbs": 80
            }
        `;
        
        const result = await model.generateContent(prompt);
        const json = safeJsonParse(result.response.text());
        
        // Formular füllen
        manualName.value = json.name;
        manualAmount.value = json.weight;
        manualUnit.value = 'g';
        
        // Basis für Neuberechnung setzen (auf 100g normieren, damit Änderung der Menge funktioniert)
        const factor = (json.weight || 100) / 100;
        currentManualBase = {
            calories: json.calories / factor,
            protein: json.protein / factor,
            fat: json.fat / factor,
            carbs: json.carbs / factor
        };
        
        // Felder setzen
        manualCalories.value = Math.round(json.calories);
        manualProtein.value = Math.round(json.protein);
        manualFat.value = Math.round(json.fat);
        manualCarbs.value = Math.round(json.carbs);
        
        searchResults.style.display = 'none'; // Suchergebnisse ausblenden falls offen
        showToast("Werte geschätzt!", "success");
        
    } catch (e) {
        console.error(e);
        showToast("Fehler bei der KI-Schätzung.", "error");
    } finally {
        hideLoading();
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
    // Wir schließen das manuelle Formular nicht zwingend, wir legen den Scanner drüber (Stack)
    openModal(scannerModal);
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

    console.log("💾 SAVING MANUAL ENTRY:", manualEntry);
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
    closeModal(); // Schließt das manuelle Formular
});

// --- NEU: MANUELLEN EINTRAG ALS REZEPT SPEICHERN ---
saveManualAsRecipeBtn.addEventListener('click', () => {
    const name = manualName.value.trim();
    const calories = parseFloat(manualCalories.value) || 0;
    const protein = parseFloat(manualProtein.value) || 0;
    const fat = parseFloat(manualFat.value) || 0;
    const carbs = parseFloat(manualCarbs.value) || 0;

    if (!name || calories <= 0) {
        showToast("Bitte Name und Kalorien angeben.", "error");
        return;
    }

    const newRecipe = {
        id: Date.now().toString(),
        name: name,
        calories: calories,
        protein: protein,
        fat: fat,
        carbs: carbs
    };

    userRecipes.push(newRecipe);
    saveUserData();
    showToast(`"${name}" als Rezept gespeichert!`, "success");
});

// --- REZEPTE LOGIK ---

recipesBtn.addEventListener('click', () => {
    renderRecipes();
    openModal(recipesModal);
});

closeRecipesBtn.addEventListener('click', () => closeModal());

createNewRecipeBtn.addEventListener('click', () => {
    // Felder leeren
    recipeInputs.name.value = '';
    recipeInputs.cal.value = '';
    recipeInputs.p.value = '';
    recipeInputs.f.value = '';
    recipeInputs.c.value = '';
    openModal(createRecipeModal);
});

closeCreateRecipeBtn.addEventListener('click', () => closeModal());

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
    closeModal(); // Schließt createRecipeModal
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
                userRecipes.splice(index, 1);
                saveUserData();
                renderRecipes();
                showToast(`Rezept "${recipe.name}" gelöscht`, "info");
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
    closeModal(); // Schließt recipesModal
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

// --- LEGAL & COOKIES LOGIK ---
if (openLegalBtn) openLegalBtn.addEventListener('click', () => openModal(legalModal));
if (closeLegalBtn) closeLegalBtn.addEventListener('click', () => closeModal());

// Cookie Banner Check
const cookieStatus = localStorage.getItem('cookiesAccepted');

if (!cookieStatus) {
    // Kurze Verzögerung für Animation
    setTimeout(() => cookieBanner.classList.remove('hidden'), 1000);
} else if (cookieStatus === 'true') {
    // Wenn bereits akzeptiert, Analytics starten
    initAnalytics();
}

if (acceptCookiesBtn) acceptCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    initAnalytics(); // Analytics nachträglich starten
    cookieBanner.classList.add('hidden');
});

if (declineCookiesBtn) declineCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'essential'); // Nur Essenzielle
    // Analytics wird NICHT gestartet
    cookieBanner.classList.add('hidden');
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
 * Erhöht den API-Nutzungszähler und speichert ihn
 */
function incrementApiUsage() {
    const today = toISODateString(new Date());
    if (apiUsage.date !== today) {
        apiUsage = { date: today, count: 0 };
    }
    apiUsage.count++;
    updateApiUsageDisplay();
    saveUserData().catch(console.error); // Im Hintergrund speichern
}

function updateApiUsageDisplay() {
    if (apiUsageDisplay) {
        apiUsageDisplay.textContent = `Heute: ${apiUsage.count}`;
        // Warnfarbe ab 15 Anfragen (da Limit oft bei ~20 liegt)
        apiUsageDisplay.style.color = apiUsage.count >= 15 ? '#ff453a' : '#888';
    }
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
async function callOpenAI(base64Images, promptText) {
    // Content Array bauen
    const content = [{ type: "text", text: promptText }];
    
    base64Images.forEach(b64 => {
        content.push({
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${b64}`
            }
        });
    });

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
                    content: content
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
    const responseContent = data.choices[0].message.content;
    return JSON.parse(responseContent);
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
        navigator.serviceWorker.register('./sw.js').then(reg => {
            // Update Check
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // Neues Update verfügbar!
                            showToast("⚠️ UPDATE VERFÜGBAR!", "info");
                            // Modal oder Alert anzeigen mit der gewünschten Nachricht
                            setTimeout(() => {
                                alert("Ein neues Update ist verfügbar!\n\nBitte lösche den Browser-Cache für diese Seite oder installiere die App neu, um Fehler zu vermeiden.");
                                window.location.reload();
                            }, 1000);
                        }
                    }
                };
            };
        });
    });
}

// --- BARCODE SCANNER LOGIK ---

closeScannerBtn.addEventListener('click', () => {
    stopCamera();
    closeModal();
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
        closeModal();
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
    closeModal(); // Scanner schließen
    showLoading("Suche Produkt...");

    try {
        // Open Food Facts API abfragen
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`, {
            headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
        });
        const data = await response.json();
    console.log("📦 BARCODE API RESULT:", data);

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
    openModal(barcodeResultModal);
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

closeBarcodeResultBtn.addEventListener('click', () => closeModal());

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

    console.log("💾 SAVING BARCODE ENTRY:", entry);
    saveToHistory(entry);
    renderHistory();
    updateStatsUI();
    closeModal();
});

/**
 * Hilfsfunktion: Sicheres JSON Parsing
 * Versucht, JSON aus einem Text zu extrahieren, auch wenn Markdown oder Müll drumherum ist.
 */
function safeJsonParse(text) {
    try {
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e);
        console.log("Raw Text:", text);
        throw new Error("KI-Antwort konnte nicht verarbeitet werden (Ungültiges JSON).");
    }
}