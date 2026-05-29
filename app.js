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

// Haupt-DOM Elemente (Bestand)
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
const goalInputs = { 
    cal: document.getElementById('goalCalories'), 
    p: document.getElementById('goalProtein'), 
    f: document.getElementById('goalFat'), 
    c: document.getElementById('goalCarbs'), 
    w: document.getElementById('goalWater') 
};
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
const recipeInputs = { 
    name: document.getElementById('recipeName'), 
    cal: document.getElementById('recipeCalories'), 
    p: document.getElementById('recipeProtein'), 
    f: document.getElementById('recipeFat'), 
    c: document.getElementById('recipeCarbs') 
};

// Legal & Cookies
const legalModal = document.getElementById('legalModal');
const openLegalBtn = document.getElementById('openLegalBtn');
const closeLegalBtn = document.getElementById('closeLegalBtn');
const cookieBanner = document.getElementById('cookieBanner');
const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');
const declineCookiesBtn = document.getElementById('declineCookiesBtn');

// Tutorial
const tutorialModal = document.getElementById('tutorialModal');
const openTutorialBtn = document.getElementById('openTutorialBtn');
const closeTutorialBtn = document.getElementById('closeTutorialBtn');
const finishTutorialBtn = document.getElementById('finishTutorialBtn');

// Update Modal
const updateModal = document.getElementById('updateModal');
const refreshAppBtn = document.getElementById('refreshAppBtn');

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
const bottleContainer = document.getElementById('bottleContainer');
const waterFill = document.getElementById('waterFill');
const waterQuickAdd500 = document.getElementById('waterQuickAdd500');
const waterQuickAdd750 = document.getElementById('waterQuickAdd750');

// NEU: Elemente für das Premium Upgrade & Tab Routing
const tabDashboard = document.getElementById('tab-dashboard');
const tabScan = document.getElementById('tab-scan');
const tabRecipes = document.getElementById('tab-recipes');
const tabProfile = document.getElementById('tab-profile');
const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const streakCountDisplay = document.getElementById('streakCountDisplay');
const quickAddScroll = document.getElementById('quickAddScroll');
const exportDataBtn = document.getElementById('exportDataBtn');
const confettiCanvas = document.getElementById('confetti-canvas');

// SVG Icons Definition
const icons = {
    fire: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#f59e0b"><path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`,
    protein: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#3b82f6"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 19.86 21.29 21.29 19.86 19.86 18.43 22 16.29z"/></svg>`,
    fat: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#f59e0b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><circle cx="12" cy="12" r="5"/></svg>`,
    carbs: `<svg class="icon-svg" viewBox="0 0 24 24" style="color:#22c55e"><path d="M17 5v12c0 2.76-2.24 5-5 5s-5-2.24-5-5V4c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2v1h2v-1c0-1.1.9-2 2-2h1c1.1 0 2 .9 2 2z"/></svg>`,
    bulb: `💡`,
    robot: `🤖`,
    trash: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    chevron: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17 16.59 8.59 18 10l-6 6-6-6 1.41-1.41z"/></svg>`,
    close: `<svg class="icon-svg icon-small" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    water: `💧`
};

// Globale Variablen für User-Daten
let currentUser = null;
let API_KEY = null;
let OPENAI_API_KEY = null;
let calorieHistory = { entries: [] };
let userGoals = { calories: 2500, protein: 150, fat: 80, carbs: 300, water: 2500 };
let userRecipes = [];
let apiUsage = { date: '', count: 0 };

let currentAiResult = null;
let selectedFiles = [];
let currentDate = new Date();
let html5QrCode = null;
let currentBarcodeData = null;
let currentManualBase = null;

// Ziel-Alert Trigger um Confetti nur 1x pro Tag zu zünden
let goalAlertsTriggered = {
    calories: false,
    water: false,
    date: ''
};

// --- MODAL & OVERLAY MANAGEMENT ( stack-basiert ) ---
const openModalsStack = [];

function openModal(modalElement) {
    if (!modalElement) return;
    if (modalElement.classList.contains('hidden') || modalElement.style.display === 'none') {
        modalElement.classList.remove('hidden');
        modalElement.style.display = 'block';
        
        // Prüfe, ob es ein Overlay gibt (neue modal-overlay-bg Struktur)
        const overlay = document.getElementById(modalElement.id + 'Overlay');
        if (overlay) {
            overlay.style.display = 'block';
        }
        
        openModalsStack.push(modalElement);
        document.body.classList.add('no-scroll');
        history.pushState({ modalOpen: true, id: modalElement.id }, '');
    }
}

function closeModal() {
    if (openModalsStack.length > 0) {
        history.back();
    }
}

window.addEventListener('popstate', () => {
    const modal = openModalsStack.pop();
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        
        const overlay = document.getElementById(modal.id + 'Overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        if (modal.id === 'scannerModal') {
            stopCamera();
        }
    }
    if (openModalsStack.length === 0) {
        document.body.classList.remove('no-scroll');
    }
});

// Close Button Event Listeners für Overlays
const overlayCloseBtns = [
    { btn: 'closeAnalysisBtn', modal: 'analysisModal' },
    { btn: 'closeScannerBtn', modal: 'scannerModal' },
    { btn: 'closeBarcodeResultBtn', modal: 'barcodeResultModal' },
    { btn: 'closeCreateRecipeBtn', modal: 'createRecipeModal' },
    { btn: 'closeLegalBtn', modal: 'legalModal' },
    { btn: 'closeTutorialBtn', modal: 'tutorialModal' }
];

overlayCloseBtns.forEach(item => {
    const btnEl = document.getElementById(item.btn);
    if (btnEl) {
        btnEl.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }
});

// --- TAB ROUTER LOGIK ---
function switchTab(tabName, triggerVibration = true) {
    tabDashboard.classList.remove('active');
    tabScan.classList.remove('active');
    tabRecipes.classList.remove('active');
    tabProfile.classList.remove('active');
    
    navItems.forEach(item => item.classList.remove('active'));
    
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) activeTab.classList.add('active');
    
    const activeNavItem = document.querySelector(`.bottom-nav .nav-item[data-tab="${tabName}"]`);
    if (activeNavItem) activeNavItem.classList.add('active');
    
    if (triggerVibration) {
        vibrateSubtle();
    }
    
    if (tabName === 'dashboard') {
        updateUIForDate();
    } else if (tabName === 'recipes') {
        renderRecipes();
    }
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        switchTab(targetTab, true);
    });
});

if (openProfileBtn) {
    openProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTab('profile', true);
    });
}

// Redirects für Legacy Buttons auf Tabs
if (recipesBtn) {
    recipesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTab('recipes', true);
    });
}
if (toggleManualEntryBtn) {
    toggleManualEntryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        switchTab('scan', true);
        setTimeout(() => {
            const formContainer = document.getElementById('manualEntryFormContainer');
            if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });
}

// --- HAPTISCHES FEEDBACK ---
function vibrateSubtle() {
    try {
        if (navigator.vibrate) navigator.vibrate(12);
    } catch (e) {
        // Ignoriere Browser-Interventionen laut Sicherheitsrichtlinien
    }
}
function vibrateSuccess() {
    try {
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
    } catch (e) {
        // Ignoriere
    }
}
function vibrateError() {
    try {
        if (navigator.vibrate) navigator.vibrate(250);
    } catch (e) {
        // Ignoriere
    }
}

document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.nav-item') || e.target.closest('.quick-add-chip') || e.target.closest('.history-header')) {
        vibrateSubtle();
    }
});

// --- GOAL CONFETTI ENGINE ---
let confettiActive = false;
let confettiParticles = [];

class ConfettiParticle {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * -canvasHeight - 20;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 8 - 4;
        this.size = Math.random() * 7 + 5;
        this.color = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a1a1aa', '#ffffff'][Math.floor(Math.random() * 6)];
        this.speedY = Math.random() * 3.5 + 2.5;
        this.speedX = Math.random() * 2 - 1;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

function triggerConfetti() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    confettiParticles = [];
    for (let i = 0; i < 120; i++) {
        confettiParticles.push(new ConfettiParticle(confettiCanvas.width, confettiCanvas.height));
    }
    
    if (!confettiActive) {
        confettiActive = true;
        animateConfetti(confettiCanvas, ctx);
    }
}

function animateConfetti(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = 0;
    
    confettiParticles.forEach(p => {
        p.update();
        if (p.y < canvas.height + 20) {
            p.draw(ctx);
            active++;
        }
    });
    
    if (active > 0 && confettiActive) {
        requestAnimationFrame(() => animateConfetti(canvas, ctx));
    } else {
        confettiActive = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function checkGoalAchieved(currentCal, goalCal, currentWater, goalWater) {
    const todayStr = toISODateString(new Date());
    if (goalAlertsTriggered.date !== todayStr) {
        goalAlertsTriggered = { calories: false, water: false, date: todayStr };
    }
    
    if (currentCal >= goalCal && goalCal > 0 && !goalAlertsTriggered.calories) {
        goalAlertsTriggered.calories = true;
        triggerConfetti();
        vibrateSuccess();
        showToast("Glückwunsch! Du hast dein Kalorienziel erreicht! 🎯", "success");
    }
    
    if (currentWater >= goalWater && goalWater > 0 && !goalAlertsTriggered.water) {
        goalAlertsTriggered.water = true;
        triggerConfetti();
        vibrateSuccess();
        showToast("Super! Du hast dein tägliches Wasserziel erreicht! 💧", "success");
    }
}

// --- LOCAL SEARCH CACHING ---
const SEARCH_CACHE_PREFIX = "nutriscan_search_cache_";

function getCachedSearchResults(query) {
    const cached = localStorage.getItem(SEARCH_CACHE_PREFIX + query.toLowerCase().trim());
    if (cached) {
        try {
            const data = JSON.parse(cached);
            if (Date.now() - data.timestamp < 86400000) { // 24 Stunden Gültigkeit
                return data.results;
            }
        } catch (e) {
            console.error("Cache read error", e);
        }
    }
    return null;
}

function setCachedSearchResults(query, results) {
    try {
        localStorage.setItem(SEARCH_CACHE_PREFIX + query.toLowerCase().trim(), JSON.stringify({
            timestamp: Date.now(),
            results: results
        }));
    } catch (e) {
        console.error("Cache write error", e);
    }
}

// --- AUTHENTIFIZIERUNG LOGIK ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (!localStorage.getItem('app_encryption_key')) {
            await signOut(auth);
            return;
        }
        currentUser = user;
        if (user.email) {
            const namePart = user.email.split('@')[0];
            const parts = namePart.split(/[._-]/);
            const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]) : namePart.substring(0, 2);
            openProfileBtn.textContent = initials.toUpperCase();
        }
        authScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
        
        await loadUserData();
        updateUIForDate();
        setTimeout(() => appLoadingScreen.classList.add('fade-out-screen'), 300);

        if (!API_KEY) {
            setTimeout(() => openModal(tutorialModal), 1000);
        }
    } else {
        currentUser = null;
        openProfileBtn.textContent = "👤";
        authScreen.classList.remove('hidden');
        appContent.classList.add('hidden');
        calorieHistory = { entries: [] };
        setTimeout(() => appLoadingScreen.classList.add('fade-out-screen'), 300);
    }
});

loginBtn.addEventListener('click', async () => {
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    authError.textContent = "";
    
    const email = authEmail.value.trim();
    const password = authPassword.value;

    if (!email || !password) {
        authError.textContent = "Bitte E-Mail und Passwort eingeben.";
        loginBtn.disabled = false;
        return;
    }

    try {
        loginBtn.textContent = "Verbinde...";
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        if (!userCredential.user.emailVerified && !email.toLowerCase().endsWith('@hanneken.cloud')) {
            await signOut(auth);
            authError.textContent = "Bitte bestätige erst deine E-Mail Adresse (Link im Posteingang).";
            return;
        }
        
        loginBtn.textContent = "Entschlüssle...";
        await new Promise(r => setTimeout(r, 50));
        
        const key = await deriveKeyFromPassword(password, userCredential.user.uid);
        const exported = await crypto.subtle.exportKey("jwk", key);
        localStorage.setItem('app_encryption_key', JSON.stringify(exported));
        
        loginBtn.textContent = "Lade Daten...";
        await loadUserData();
        updateUIForDate();
    } catch (error) {
        console.error(error);
        vibrateError();
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            authError.textContent = "Die Zugangsdaten stimmen nicht.";
        } else if (error.code === 'auth/invalid-email') {
            authError.textContent = "Ungültige E-Mail Adresse.";
        } else if (error.code === 'auth/network-request-failed') {
            authError.innerHTML = "Verbindung fehlgeschlagen.<br>⚠️ Verbindung blockiert? Mobile Daten versuchen.";
        } else {
            authError.textContent = "Anmeldung fehlgeschlagen. Bitte Internetverbindung prüfen.";
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});

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

    if (email.toLowerCase().endsWith('@hanneken.cloud')) {
        authError.textContent = "Diese Domain ist für die öffentliche Registrierung gesperrt.";
        registerBtn.disabled = false;
        return;
    }

    registerBtn.textContent = "Prüfe Sicherheit...";
    if (typeof grecaptcha === 'undefined') {
        authError.textContent = "Sicherheitsdienst nicht geladen. Bitte Seite neu laden.";
        registerBtn.disabled = false;
        registerBtn.textContent = originalText;
        return;
    }
    
    try {
        await new Promise((resolve) => {
            grecaptcha.ready(() => {
                grecaptcha.execute('6LdGe08sAAAAAPsA5RKV2qXbUWFScBJhUQZRS-0K', {action: 'submit'}).then(resolve);
            });
        });

        registerBtn.textContent = "Erstelle Konto...";
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await deriveKeyFromPassword(password, userCredential.user.uid);
        await signOut(auth);

        showToast(`Bestätigung gesendet an ${email}!`, "success");
        authError.textContent = "Bestätigungs-Link gesendet. Bitte E-Mail freischalten, dann einloggen.";
    } catch (error) {
        vibrateError();
        if (error.code === 'auth/email-already-in-use') {
            authError.textContent = "Diese E-Mail wird schon verwendet.";
        } else if (error.code === 'auth/weak-password') {
            authError.textContent = "Das Passwort ist zu schwach (min. 6 Zeichen).";
        } else if (error.code === 'auth/admin-restricted-operation') {
            authError.textContent = "Aktuell nur für ausgewählte Benutzer.";
        } else {
            authError.textContent = "Registrierung fehlgeschlagen: " + error.message;
        }
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = originalText;
    }
});

if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', async () => {
        const email = authEmail.value.trim();
        if (!email) {
            authError.textContent = "Bitte gib deine E-Mail-Adresse oben ein.";
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            showToast("Passwort zurückgesetzt!", "success");
            authError.textContent = "Prüfe deinen Posteingang.";
        } catch (e) {
            vibrateError();
            authError.textContent = "Fehler: " + e.message;
        }
    });
}

logoutBtn.addEventListener('click', () => {
    signOut(auth);
    localStorage.removeItem('app_encryption_key');
    switchTab('dashboard');
});

// --- PROFIL & DATEN LOGIK ---
async function loadUserData() {
    if (!currentUser) return;
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        
        const smartDecrypt = async (val) => {
            if (!val) return '';
            if (typeof val === 'string' && val.includes(':')) {
                return (await decryptText(val)) || val;
            }
            return val;
        };

        API_KEY = await smartDecrypt(data.geminiKey);
        OPENAI_API_KEY = await smartDecrypt(data.openaiKey);

        const decryptJSON = async (encryptedVal, fallback) => {
            if (typeof encryptedVal === 'string') {
                const json = await smartDecrypt(encryptedVal);
                try { return json ? JSON.parse(json) : fallback; } 
                catch (e) { console.error("Parse Error", e); return fallback; }
            }
            return encryptedVal || fallback;
        };

        calorieHistory = await decryptJSON(data.history, { entries: [] });
        userGoals = await decryptJSON(data.goals, { calories: 2500, protein: 150, fat: 80, carbs: 300, water: 2500 });
        userRecipes = await decryptJSON(data.recipes, []);
        
        const loadedProfileData = await decryptJSON(data.profileData, {});

        if (data.apiUsage) {
            const today = toISODateString(new Date());
            if (data.apiUsage.date === today) {
                apiUsage = data.apiUsage;
            } else {
                apiUsage = { date: today, count: 0 };
            }
        }
        updateApiUsageDisplay();

        if (loadedProfileData) {
            profileGoal.value = loadedProfileData.goal || 'maintain';
            profileWeight.value = loadedProfileData.weight || '';
            profileHeight.value = loadedProfileData.height || '';
            profileAge.value = loadedProfileData.age || '';
            profileGender.value = loadedProfileData.gender || 'male';
            profileActivity.value = loadedProfileData.activity || '1.2';
        }
        
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
        history: await encryptText(JSON.stringify(calorieHistory)),
        goals: await encryptText(JSON.stringify(newGoals)),
        profileData: await encryptText(JSON.stringify(profileData)),
        recipes: await encryptText(JSON.stringify(userRecipes)),
        apiUsage: apiUsage
    };

    if (saveKeys) {
        dataToSave.geminiKey = await encryptText(API_KEY);
        dataToSave.openaiKey = await encryptText(OPENAI_API_KEY);
    }

    await setDoc(doc(db, "users", currentUser.uid), dataToSave, { merge: true });
}

saveProfileBtn.addEventListener('click', async () => {
    API_KEY = profileGeminiKey.value.trim();
    OPENAI_API_KEY = profileOpenAIKey.value.trim();
    
    userGoals = {
        calories: Math.round(parseFloat(goalInputs.cal.value)) || 2500,
        protein: Math.round(parseFloat(goalInputs.p.value)) || 150,
        fat: Math.round(parseFloat(goalInputs.f.value)) || 80,
        carbs: Math.round(parseFloat(goalInputs.c.value)) || 300,
        water: Math.round(parseFloat(goalInputs.w.value)) || 2500
    };

    await saveUserData(true);
    updateStatsUI();
    showToast("Profil und Ziele aktualisiert!", "success");
    switchTab('dashboard');
});

calcProfileBtn.addEventListener('click', () => {
    const weight = parseFloat(profileWeight.value);
    const height = parseFloat(profileHeight.value);
    const age = parseFloat(profileAge.value);
    const gender = profileGender.value;
    const activity = parseFloat(profileActivity.value);
    const goal = profileGoal.value;

    if (!weight || !height || !age) {
        showToast("Bitte Gewicht, Größe und Alter eintragen.", "error");
        return;
    }

    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += (gender === 'male') ? 5 : -161;
    let tdee = bmr * activity;

    if (goal === 'lose') tdee -= 500;
    if (goal === 'gain') tdee += 300;

    const protein = weight * (goal === 'maintain' ? 1.6 : 2.0);
    const fat = weight * 0.8;
    const carbs = (tdee - (protein * 4) - (fat * 9)) / 4;

    goalInputs.cal.value = Math.round(tdee);
    goalInputs.p.value = Math.round(protein);
    goalInputs.f.value = Math.round(fat);
    goalInputs.c.value = Math.round(carbs);
    goalInputs.w.value = Math.round(weight * 35);
    
    showToast("Bedarf berechnet! Drücke jetzt 'Ziele speichern'.", "info");
});

if (infoIconBtn) {
    infoIconBtn.addEventListener('click', () => infoText.classList.toggle('hidden'));
}
if (hybridInfoBtn) {
    hybridInfoBtn.addEventListener('click', () => hybridInfoText.classList.toggle('hidden'));
}

// --- ERNÄHRUNGSDATEN EXPORTIEREN ---
if (exportDataBtn) {
    exportDataBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            history: calorieHistory,
            goals: userGoals,
            recipes: userRecipes
        }, null, 2));
        
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `nutriscan_export_${toISODateString(new Date())}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Ernährungsdaten erfolgreich exportiert!", "success");
    });
}

// --- SCAN & ANALYSE LOGIK ---
function handleImageSelection(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        selectedFiles = Array.from(files);
        imagePreviewContainer.innerHTML = '';

        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-thumb';
                img.style.width = '70px';
                img.style.height = '70px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                imagePreviewContainer.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
        openModal(analysisModal);
    }
    event.target.value = '';
}

cameraInput.addEventListener('change', handleImageSelection);
if (galleryInput) galleryInput.addEventListener('change', handleImageSelection);

analyzeBtn.addEventListener('click', async function() {
    if (!selectedFiles || selectedFiles.length === 0) return;

    showLoading("Analysiere Bild...");
    
    // modal schließen während Analyse
    const overlay = document.getElementById('analysisModalOverlay');
    if (overlay) overlay.style.display = 'none';
    analysisModal.classList.add('hidden');
    analysisModal.style.display = 'none';
    
    const userText = descriptionInput.value;
    const useHybridMode = hybridModeToggle.checked;

    if (!API_KEY) {
        showToast("Bitte API Key im Profil hinterlegen!", "error");
        switchTab('profile');
        hideLoading();
        return;
    }

    try {
        loadingText.textContent = "Optimiere Bilder...";
        const base64Images = await Promise.all(selectedFiles.map(file => compressImage(file, 800, 0.7)));
        const finalMimeType = 'image/jpeg';

        const genAI = new GoogleGenerativeAI(API_KEY);
        const strategies = [
            { type: 'gemini', model: 'gemini-2.5-flash' },
            { type: 'openai', model: 'gpt-4o' },
            { type: 'gemini', model: 'gemini-2.5-flash-lite' }
        ];
        
        let jsonResponse = null;
        let usedModelName = "";
        let lastError = null;

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

        for (const strategy of strategies) {
            if (jsonResponse) break;
            try {
                loadingText.textContent = `Frage KI (${strategy.model})...`;
                incrementApiUsage();

                if (strategy.type === 'gemini') {
                    const model = genAI.getGenerativeModel({ 
                        model: strategy.model,
                        generationConfig: { responseMimeType: "application/json" }
                    });

                    const content = [prompt];
                    base64Images.forEach(b64 => {
                        content.push({ inlineData: { data: b64, mimeType: finalMimeType } });
                    });

                    const result = await model.generateContent(content);
                    const text = result.response.text();
                    jsonResponse = safeJsonParse(text);
                    usedModelName = strategy.model;
                } else if (strategy.type === 'openai') {
                    if (!OPENAI_API_KEY) continue;
                    const openAiRes = await callOpenAI(base64Images, prompt);
                    jsonResponse = openAiRes;
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

        if (jsonResponse.isFood === false) {
            resultArea.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <div style="font-size: 50px; margin-bottom: 15px;">🚫</div>
                    <h3>Kein Essen erkannt</h3>
                    <p style="color: var(--text-secondary); margin-top: 10px;">Das sieht nicht nach einem Gericht aus.<br>Es wurde nichts gespeichert.</p>
                </div>
            `;
            resultArea.classList.remove('hidden');
            hideLoading();
            openModal(analysisModal);
            return;
        }

        // --- HYBRID SCAN DATABASE CHECK ---
        if (useHybridMode && jsonResponse.productSearchQuery) {
            try {
                showLoading(`Datenbank-Check: "${jsonResponse.productSearchQuery}"...`);
                let offData;
                try {
                    const offRes = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(jsonResponse.productSearchQuery)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,nutriments`, {
                        headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
                    });
                    offData = await offRes.json();
                } catch (e) {
                    const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/search?search_terms=${encodeURIComponent(jsonResponse.productSearchQuery)}&page_size=1&fields=product_name,nutriments`, {
                        headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
                    });
                    offData = await offRes.json();
                }

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

                        showLoading("Optimiere mit echten Werten...");
                        incrementApiUsage();
                        
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
                                "name": "${dbInfo.name}",
                                "amount": ${step1Amount},
                                "calories": (Number, Wert für 1 Stück/Portion),
                                "protein": (Number, Wert für 1 Stück/Portion),
                                "fat": (Number, Wert für 1 Stück/Portion),
                                "carbs": (Number, Wert für 1 Stück/Portion),
                                "reasoning": "Erklärung der Berechnung..."
                            }
                            Antworte NUR mit validem JSON.
                        `;

                        let refinedJson = null;
                        if (usedModelName.includes('gpt')) {
                            refinedJson = await callOpenAI(base64Images, refinePrompt);
                        } else {
                            const model = genAI.getGenerativeModel({ model: usedModelName, generationConfig: { responseMimeType: "application/json" }});
                            const content = [refinePrompt];
                            base64Images.forEach(b64 => content.push({ inlineData: { data: b64, mimeType: finalMimeType } }));
                            const result = await model.generateContent(content);
                            refinedJson = safeJsonParse(result.response.text());
                        }

                        if (refinedJson) {
                            if (jsonResponse.ingredients && jsonResponse.ingredients.length > 0) {
                                refinedJson.ingredients = jsonResponse.ingredients;
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
                            jsonResponse = refinedJson;
                            jsonResponse.isDbVerified = true;
                            showToast("Mit Datenbank-Werten optimiert!", "success");
                        }
                    }
                }
            } catch (dbError) {
                console.warn("Datenbank-Abgleich fehlgeschlagen, nutze reine KI:", dbError);
            }
        }

        jsonResponse.date = toISODateString(currentDate);
        jsonResponse.timestamp = new Date().getTime();
        renderAiResult(jsonResponse, usedModelName);

    } catch (error) {
        console.error(error);
        vibrateError();
        let title = "Fehler bei der Analyse";
        let message = error.message;
        let icon = "⚠️";

        if (message.includes('429') || message.includes('quota') || message.includes('exhausted')) {
            title = "API Limit erreicht";
            message = "Die Anfragen deines kostenlosen API Keys sind aufgebraucht. Morgen geht es wieder.";
            icon = "⏳";
        } else if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
            title = "Verbindungsproblem";
            message = "KI konnte nicht erreicht werden. Schul-WLAN? Versuche mobile Daten.";
            icon = "📡";
        }

        resultArea.innerHTML = `
            <div style="text-align: center; padding: 25px;">
                <div style="font-size: 40px; margin-bottom: 12px;">${icon}</div>
                <h3 style="color: var(--accent-red); margin-bottom: 8px;">${title}</h3>
                <p style="color: var(--text-secondary); line-height: 1.5; font-size:13px;">${message}</p>
            </div>
        `;
        resultArea.classList.remove('hidden');
    } finally {
        hideLoading();
    }
});

// --- KI-RESULTAT DYNAMISCH RENDERN ( MIT REGELN & SLIDERN ) ---
function renderAiResult(jsonResponse, usedModelName) {
    jsonResponse.calories = parseFloat(jsonResponse.calories) || 0;
    jsonResponse.protein = parseFloat(jsonResponse.protein) || 0;
    jsonResponse.fat = parseFloat(jsonResponse.fat) || 0;
    jsonResponse.carbs = parseFloat(jsonResponse.carbs) || 0;
    jsonResponse.amount = parseFloat(jsonResponse.amount) || 1;
    jsonResponse.name = jsonResponse.name || "Unbekanntes Gericht";

    const displayName = jsonResponse.name;
    const initialAmount = jsonResponse.amount;
    currentAiResult = jsonResponse;

    // Sichere Dreisatz-Basiswerte pro 1 Gramm Zutatenspeicher
    if (jsonResponse.ingredients) {
        jsonResponse.ingredients.forEach(ing => {
            const w = parseFloat(ing.weight) || 100;
            ing.basePerGram = {
                calories: (parseFloat(ing.calories) || 0) / w,
                protein: (parseFloat(ing.protein) || 0) / w,
                fat: (parseFloat(ing.fat) || 0) / w,
                carbs: (parseFloat(ing.carbs) || 0) / w
            };
        });
    }

    const verifiedBadge = jsonResponse.isDbVerified ? 
        `<div style="display: inline-flex; align-items: center; gap: 4px; background: var(--accent-green-bg); color: var(--accent-green); padding: 6px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-bottom: 15px; border: 1px solid rgba(34, 197, 94, 0.3);">
            ✓ Datenbank-geprüft (Hybrid)
         </div>` : '';

    // HTML Zutaten-Slider Loop
    let ingredientsListHtml = '';
    if (jsonResponse.ingredients && jsonResponse.ingredients.length > 0) {
        ingredientsListHtml = jsonResponse.ingredients.map((ing, ingIdx) => {
            const estWeight = Math.round(ing.weight);
            const minWeight = Math.max(10, Math.round(estWeight * 0.1));
            const maxWeight = Math.round(estWeight * 3);
            
            return `
                <div class="slider-ingredient-box">
                    <div class="slider-ing-header">
                        <span class="slider-ing-title">${ing.name}</span>
                        <span class="slider-ing-badge" id="ing-badge-${ingIdx}">${estWeight}<span>g</span></span>
                    </div>
                    <input type="range" class="slider-range-input ing-weight-slider" 
                           data-idx="${ingIdx}" min="${minWeight}" max="${maxWeight}" value="${estWeight}">
                    <div class="slider-ing-macros" id="ing-macros-${ingIdx}">
                        <span>${Math.round(ing.calories)} kcal</span>
                        <span>P: ${Math.round(ing.protein)}g • F: ${Math.round(ing.fat)}g • C: ${Math.round(ing.carbs)}g</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    resultArea.innerHTML = `
        ${verifiedBadge}
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <h3 style="margin: 0; font-family:'Outfit',sans-serif; font-size:18px; line-height: 1.3;">${displayName}</h3>
            <button id="editProductBtn" style="background: rgba(255,255,255,0.06); border: 1px solid var(--glass-border); border-radius: 12px; color: var(--accent-purple); cursor: pointer; padding: 8px 12px; font-size:12px; font-weight:700;">
                ✎ Name
            </button>
        </div>
        
        <div style="margin-bottom: 20px;">
            <div style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:10px;">Portionen/Zutaten anpassen (Slider):</div>
            ${ingredientsListHtml || '<p style="color:var(--text-muted); font-size:12px;">Keine einzelnen Zutaten erkannt.</p>'}
        </div>
        
        <div class="glass-card" style="padding: 16px; margin-bottom: 20px; border-color:var(--accent-purple-glow); background: rgba(191, 90, 242, 0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 12px; font-weight:700; color: var(--text-secondary);">Gesamtsumme Mahlzeit:</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <label style="font-size: 11px; color: var(--text-muted); font-weight:600;">Menge:</label>
                    <input type="number" id="aiAmount" value="${initialAmount}" step="0.5" style="width: 55px; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 5px; border-radius: 8px; color: white; font-weight: bold; text-align: center; font-size: 13px;">
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: end;">
                <div>
                    <div style="font-family:'Outfit',sans-serif; font-size: 32px; font-weight: 800; color: var(--accent-purple); line-height:1;" id="aiTotalDisplay">${Math.round(jsonResponse.calories * initialAmount)}</div>
                    <span style="font-size: 10px; color: var(--text-muted); font-weight:700; text-transform:uppercase;">Kalorien (kcal)</span>
                </div>
                <div style="text-align: right; font-size: 12px; color: var(--text-secondary); font-weight:600; line-height:1.6;">
                    <div>P: <span id="aiProtDisplay" style="color:white; font-weight:700;">${Math.round(jsonResponse.protein * initialAmount)}</span>g</div>
                    <div>F: <span id="aiFatDisplay" style="color:white; font-weight:700;">${Math.round(jsonResponse.fat * initialAmount)}</span>g</div>
                    <div>K: <span id="aiCarbsDisplay" style="color:white; font-weight:700;">${Math.round(jsonResponse.carbs * initialAmount)}</span>g</div>
                </div>
            </div>
        </div>

        <p style="margin-top: 10px; font-size: 0.85em; color: var(--text-secondary); background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid var(--glass-border); line-height:1.4;">💡 ${jsonResponse.reasoning || 'Keine Details verfügbar'}</p>
        <p style="margin-top: 15px; font-size: 0.75em; color: var(--text-muted); font-weight:600;">🤖 Modell: ${usedModelName}</p>
        
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="confirmAiEntryBtn" class="primary-btn" style="flex: 2;">Mahlzeit eintragen</button>
            <button id="saveAiRecipeBtn" class="secondary-btn" style="flex: 1; border-color: var(--accent-purple-glow); color: var(--accent-purple); display:flex; align-items:center; justify-content:center;" title="Als Rezept speichern">📖 +</button>
        </div>
    `;
    resultArea.classList.remove('hidden');
    resultArea.scrollIntoView({ behavior: 'smooth' });

    // Slider-Elemente fangen & Recalculate Hooks binden
    const sliders = resultArea.querySelectorAll('.ing-weight-slider');
    const aiAmountInput = document.getElementById('aiAmount');
    const aiTotalDisplay = document.getElementById('aiTotalDisplay');
    const aiProtDisplay = document.getElementById('aiProtDisplay');
    const aiFatDisplay = document.getElementById('aiFatDisplay');
    const aiCarbsDisplay = document.getElementById('aiCarbsDisplay');

    function updateOverallUI() {
        const amount = parseFloat(aiAmountInput.value) || 1;
        let sumCal = 0, sumP = 0, sumF = 0, sumC = 0;
        
        if (jsonResponse.ingredients && jsonResponse.ingredients.length > 0) {
            jsonResponse.ingredients.forEach(ing => {
                sumCal += ing.calories;
                sumP += ing.protein;
                sumF += ing.fat;
                sumC += ing.carbs;
            });
            
            // Zurück in das Hauptobjekt schreiben
            jsonResponse.calories = sumCal;
            jsonResponse.protein = sumP;
            jsonResponse.fat = sumF;
            jsonResponse.carbs = sumC;
        } else {
            sumCal = jsonResponse.calories;
            sumP = jsonResponse.protein;
            sumF = jsonResponse.fat;
            sumC = jsonResponse.carbs;
        }

        aiTotalDisplay.textContent = Math.round(sumCal * amount);
        aiProtDisplay.textContent = Math.round(sumP * amount);
        aiFatDisplay.textContent = Math.round(sumF * amount);
        aiCarbsDisplay.textContent = Math.round(sumC * amount);
    }

    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            const idx = parseInt(slider.getAttribute('data-idx'));
            const newW = parseFloat(slider.value);
            const ing = jsonResponse.ingredients[idx];
            
            // Dreisatz Berechnung
            ing.weight = newW;
            ing.calories = ing.basePerGram.calories * newW;
            ing.protein = ing.basePerGram.protein * newW;
            ing.fat = ing.basePerGram.fat * newW;
            ing.carbs = ing.basePerGram.carbs * newW;
            
            // UI Update Zutat
            const badge = document.getElementById(`ing-badge-${idx}`);
            if (badge) badge.innerHTML = `${Math.round(newW)}<span>g</span>`;
            
            const macros = document.getElementById(`ing-macros-${idx}`);
            if (macros) {
                macros.innerHTML = `
                    <span>${Math.round(ing.calories)} kcal</span>
                    <span>P: ${Math.round(ing.protein)}g • F: ${Math.round(ing.fat)}g • C: ${Math.round(ing.carbs)}g</span>
                `;
            }
            
            updateOverallUI();
        });
    });

    aiAmountInput.addEventListener('input', updateOverallUI);

    document.getElementById('confirmAiEntryBtn').addEventListener('click', () => {
        const amount = parseFloat(aiAmountInput.value) || 1;
        
        // Summen final anpassen und multiplizieren
        if (jsonResponse.ingredients && jsonResponse.ingredients.length > 0) {
            jsonResponse.ingredients.forEach(ing => {
                ing.weight = ing.weight * amount;
                ing.calories = ing.calories * amount;
                ing.protein = ing.protein * amount;
                ing.fat = ing.fat * amount;
                ing.carbs = ing.carbs * amount;
            });
        }
        
        jsonResponse.calories = jsonResponse.calories * amount;
        jsonResponse.protein = jsonResponse.protein * amount;
        jsonResponse.fat = jsonResponse.fat * amount;
        jsonResponse.carbs = jsonResponse.carbs * amount;

        saveToHistory(jsonResponse);
        updateUIForDate();
        
        resultArea.innerHTML = '';
        resultArea.classList.add('hidden');
        showToast("Gericht erfolgreich eingetragen!", "success");
        switchTab('dashboard');
    });

    document.getElementById('saveAiRecipeBtn').addEventListener('click', () => {
        const recipe = {
            id: Date.now().toString(),
            name: jsonResponse.name,
            calories: Math.round(jsonResponse.calories),
            protein: Math.round(jsonResponse.protein),
            fat: Math.round(jsonResponse.fat),
            carbs: Math.round(jsonResponse.carbs)
        };
        userRecipes.push(recipe);
        saveUserData();
        showToast(`"${recipe.name}" als Rezept gespeichert!`, "success");
    });

    document.getElementById('editProductBtn').addEventListener('click', async () => {
        const newName = prompt("Gericht-Name korrigieren:", jsonResponse.name);
        if (!newName || newName === jsonResponse.name) return;

        if (!selectedFiles || selectedFiles.length === 0) {
            showToast("Originalbild nicht mehr im Cache.", "error");
            return;
        }

        showLoading(`Suche nach "${newName}"...`);
        try {
            const offUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(newName)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,nutriments`;
            const offRes = await fetch(offUrl, { headers: { "User-Agent": "NutriScanAI - Web - v1.0" } });
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

                    showLoading("Passe Mengen neu an...");
                    const base64Images = await Promise.all(selectedFiles.map(f => compressImage(f, 800, 0.7)));
                    
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

                    incrementApiUsage();
                    const genAI = new GoogleGenerativeAI(API_KEY);
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" }});
                    
                    const content = [refinePrompt];
                    base64Images.forEach(b64 => content.push({ inlineData: { data: b64, mimeType: 'image/jpeg' } }));
                    const result = await model.generateContent(content);
                    
                    const refinedJson = safeJsonParse(result.response.text());
                    refinedJson.isDbVerified = true;
                    refinedJson.date = toISODateString(currentDate);
                    refinedJson.timestamp = new Date().getTime();

                    renderAiResult(refinedJson, "Gemini (Korrektur)");
                    showToast("Produkt erfolgreich überschrieben!", "success");
                } else {
                    showToast("Produkt gefunden, aber keine Nährwerte.", "error");
                }
            } else {
                showToast("Produkt nicht in der Datenbank.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Fehler bei der Korrektur.", "error");
        } finally {
            hideLoading();
        }
    });
}

function saveToHistory(data) {
    if (!calorieHistory.entries) calorieHistory.entries = [];
    calorieHistory.entries.push(data);
    saveUserData();
}

// --- TABELLE & WIDGETS RENDERN ---
function updateStatsUI() {
    const history = calorieHistory;
    const dateString = toISODateString(currentDate);
    
    let currentCal = 0, currentP = 0, currentF = 0, currentC = 0, currentWater = 0;
    
    if (history.entries) {
        history.entries.forEach(entry => {
            if (entry.date === dateString) {
                currentCal += entry.calories || 0;
                currentP += entry.protein || 0;
                currentF += entry.fat || 0;
                currentC += entry.carbs || 0;
                currentWater += entry.waterMl || 0;
            }
        });
    }
    
    const goalCal = userGoals.calories || 2500;
    const goalP = userGoals.protein || 150;
    const goalF = userGoals.fat || 80;
    const goalC = userGoals.carbs || 300;
    const goalWater = userGoals.water || 2500;
    
    // Confetti & Toast zünden wenn Ziel punktgenau oder überschritten
    checkGoalAchieved(currentCal, goalCal, currentWater, goalWater);

    const createChart = (current, goal, color, label, sizeClass = '') => {
        const pct = Math.min((current / goal) * 100, 100);
        const dashOffset = 100 - pct;

        return `
            <div class="macro-item">
                <div class="radial-chart ${sizeClass}">
                    <svg viewBox="0 0 36 36">
                        <path class="chart-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="chart-stroke" 
                              stroke-dasharray="100, 100" 
                              stroke-dashoffset="${dashOffset}" 
                              stroke="${color}" 
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span>${Math.round(current)}</span>
                </div>
                <span>${label}</span>
            </div>
        `;
    };

    dailyStats.innerHTML = `
        ${createChart(currentCal, goalCal, '#ffffff', 'Kcal', 'xlarge')}
        <div class="macro-row">
            ${createChart(currentP, goalP, '#3b82f6', 'Protein')}
            ${createChart(currentF, goalF, '#f59e0b', 'Fett')}
            ${createChart(currentC, goalC, '#22c55e', 'Carbs')}
        </div>
    `;

    // Wasser UI Update
    waterCurrentDisplay.textContent = currentWater;
    waterGoalDisplay.textContent = goalWater;
    
    const pct = Math.min((currentWater / goalWater) * 100, 100);
    waterFill.style.height = `${pct}%`;

    removeWaterBtn.disabled = currentWater <= 0;

    // Wochenübersicht und Streaks mitrendern
    renderWeeklyChart();
    updateStreakDisplay();
}

function renderWeeklyChart() {
    const history = calorieHistory;
    const goalCal = userGoals.calories || 2500;
    
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    
    const dailySums = days.map(d => {
        const dateStr = toISODateString(d);
        let sum = 0;
        if (history.entries) {
            history.entries.forEach(entry => {
                if (entry.date === dateStr) {
                    sum += entry.calories || 0;
                }
            });
        }
        return {
            dateStr,
            dayLabel: d.toLocaleDateString('de-DE', { weekday: 'short' }),
            sum: Math.round(sum),
            isToday: dateStr === toISODateString(today)
        };
    });
    
    const maxVal = Math.max(goalCal, ...dailySums.map(d => d.sum), 1);
    const limitLinePct = (goalCal / maxVal) * 100;
    const chartLimitLine = document.getElementById('chartLimitLine');
    if (chartLimitLine) {
        chartLimitLine.style.bottom = `${limitLinePct}%`;
    }
    
    dailySums.forEach((dayData, idx) => {
        const wrapper = document.getElementById(`bar-day-${idx}`);
        const fill = document.getElementById(`bar-fill-${idx}`);
        
        if (wrapper && fill) {
            const label = wrapper.querySelector('.week-day-label');
            if (label) label.textContent = dayData.dayLabel;
            
            const heightPct = (dayData.sum / maxVal) * 100;
            fill.style.height = `${Math.max(4, heightPct)}%`;
            fill.setAttribute('data-val', dayData.sum);
            
            fill.className = 'week-bar';
            if (dayData.sum > 0) {
                if (dayData.sum > goalCal) {
                    fill.classList.add('overfilled');
                } else {
                    fill.classList.add('filled');
                }
            }
            
            if (dayData.isToday) {
                wrapper.classList.add('today');
            } else {
                wrapper.classList.remove('today');
            }
        }
    });
}

function calculateStreak() {
    if (!calorieHistory || !calorieHistory.entries || calorieHistory.entries.length === 0) return 0;
    
    const trackedDates = new Set();
    calorieHistory.entries.forEach(entry => {
        if (entry.date) trackedDates.add(entry.date);
    });
    
    const todayStr = toISODateString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toISODateString(yesterday);
    
    if (!trackedDates.has(todayStr) && !trackedDates.has(yesterdayStr)) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    if (!trackedDates.has(todayStr) && trackedDates.has(yesterdayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
        const checkStr = toISODateString(checkDate);
        if (trackedDates.has(checkStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function updateStreakDisplay() {
    const streak = calculateStreak();
    if (streakCountDisplay) {
        streakCountDisplay.textContent = streak;
    }
}

function renderHistory() {
    const history = calorieHistory;
    const dateString = toISODateString(currentDate);
    historyList.innerHTML = '';

    if (!history.entries || history.entries.length === 0) return;

    const entriesForDate = history.entries
        .map((entry, index) => ({ ...entry, originalIndex: index }))
        .filter(entry => entry.date === dateString)
        .filter(entry => !entry.waterMl)
        .sort((a, b) => b.timestamp - a.timestamp);

    entriesForDate.forEach((entry) => {
        const realIndex = entry.originalIndex;
        const isExpanded = entry.expanded || false;
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
                        <div style="font-size: 10px; color: var(--text-muted); margin-bottom: 2px;"><sup>Eintrag</sup> • ${dateLabel}</div>
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

historyList.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        e.stopPropagation();
        deleteEntry(deleteBtn.dataset.index);
        return;
    }

    const deleteIngBtn = e.target.closest('.delete-ing-btn');
    if (deleteIngBtn) {
        e.stopPropagation();
        deleteIngredient(deleteIngBtn.dataset.entryIndex, deleteIngBtn.dataset.ingIndex);
        return;
    }

    const header = e.target.closest('.history-header');
    if (header) {
        toggleEntry(header.dataset.index);
    }
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

prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateUIForDate();
});

nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateUIForDate();
});

// --- PRODUKTSUCHE & LOCAL-CACHE LOGIK ---
productSearchBtn.addEventListener('click', async () => {
    const query = productSearchInput.value.trim();
    if (!query) return;

    const originalBtn = productSearchBtn.innerHTML;
    productSearchBtn.innerHTML = `⏳`;
    productSearchBtn.disabled = true;
    
    searchResults.innerHTML = '';
    searchResults.style.display = 'block';

    const renderResults = (products) => {
        if (products && products.length > 0) {
            products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'search-result-item';
                const name = product.product_name || "Unbekannt";
                const kcal = product.nutriments['energy-kcal_100g'] || 0;
                const imgUrl = product.image_front_small_url || product.image_small_url;
                
                div.innerHTML = `
                    ${imgUrl ? `<img src="${imgUrl}" class="search-result-img" loading="lazy">` : '<div class="search-result-img placeholder">🍽️</div>'}
                    <div>
                        <div style="font-weight: 700; font-size:13px; color:white;">${name}</div>
                        <div style="color:var(--text-secondary); font-size: 11px; margin-top:2px;">${Math.round(kcal)} kcal / 100g</div>
                    </div>
                `;
                
                div.addEventListener('click', () => {
                    manualName.value = name;
                    manualAmount.value = 100;
                    manualUnit.value = 'g';
                    
                    currentManualBase = {
                        calories: kcal,
                        protein: product.nutriments.proteins_100g || 0,
                        fat: product.nutriments.fat_100g || 0,
                        carbs: product.nutriments.carbohydrates_100g || 0
                    };

                    manualCalories.value = kcal;
                    manualProtein.value = product.nutriments.proteins_100g || 0;
                    manualFat.value = product.nutriments.fat_100g || 0;
                    manualCarbs.value = product.nutriments.carbohydrates_100g || 0;
                    
                    searchResults.style.display = 'none';
                    showToast(`"${name}" ausgewählt!`, "success");
                });
                searchResults.appendChild(div);
            });
        } else {
            searchResults.innerHTML = '<div class="search-result-item" style="color: var(--accent-red);">Nichts gefunden.</div>';
        }
    };

    // 1. Versuche aus Cache zu laden
    const cached = getCachedSearchResults(query);
    if (cached) {
        renderResults(cached);
        productSearchBtn.innerHTML = originalBtn;
        productSearchBtn.disabled = false;
        return;
    }

    // 2. Netzwerk-Request ausführen
    try {
        let data;
        try {
            const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,image_front_small_url,image_small_url`, {
                headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
            });
            data = await res.json();
        } catch (e) {
            const res = await fetch(`https://world.openfoodfacts.org/api/v2/search?search_terms=${query}&page_size=5&fields=product_name,nutriments,image_front_small_url,image_small_url`, {
                headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
            });
            data = await res.json();
        }

        renderResults(data.products);
        if (data.products && data.products.length > 0) {
            setCachedSearchResults(query, data.products);
        }
    } catch (e) {
        console.error(e);
        searchResults.innerHTML = '<div class="search-result-item" style="color: var(--accent-red);">Suche fehlgeschlagen.</div>';
    } finally {
        productSearchBtn.innerHTML = originalBtn;
        productSearchBtn.disabled = false;
    }
});

// --- AI TEXT SCHÄTZUNG ---
aiTextEstimateBtn.addEventListener('click', async () => {
    const query = productSearchInput.value.trim();
    if (!query) return showToast("Bitte Text eingeben.", "error");
    if (!API_KEY) return showToast("API Key fehlt (siehe Profil).", "error");

    showLoading("KI schätzt Portion...");
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
                "weight": 350,
                "calories": 700,
                "protein": 30,
                "fat": 20,
                "carbs": 80
            }
        `;
        
        const result = await model.generateContent(prompt);
        const json = safeJsonParse(result.response.text());
        
        manualName.value = json.name;
        manualAmount.value = json.weight;
        manualUnit.value = 'g';
        
        const factor = (json.weight || 100) / 100;
        currentManualBase = {
            calories: json.calories / factor,
            protein: json.protein / factor,
            fat: json.fat / factor,
            carbs: json.carbs / factor
        };
        
        manualCalories.value = Math.round(json.calories);
        manualProtein.value = Math.round(json.protein);
        manualFat.value = Math.round(json.fat);
        manualCarbs.value = Math.round(json.carbs);
        
        searchResults.style.display = 'none';
        showToast("Menge & Nährwerte geschätzt!", "success");
    } catch (e) {
        console.error(e);
        showToast("Schätzung fehlgeschlagen.", "error");
    } finally {
        hideLoading();
    }
});

// --- QUICK AMOUNT CHIPS ---
if (quickAmountsContainer) {
    quickAmountsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-amt-btn')) {
            manualAmount.value = e.target.dataset.value;
            updateManualMacros();
        }
    });
}
if (manualUnit) {
    manualUnit.addEventListener('change', () => {
        const unit = manualUnit.value;
        const values = unit === 'Stk.' ? [1, 2, 3, 5] : [100, 250, 500, 1000];
        quickAmountsContainer.innerHTML = values.map(v => 
            `<button class="quick-amt-btn" data-value="${v}">${v}</button>`
        ).join('');
    });
}

manualAmount.addEventListener('input', updateManualMacros);

function updateManualMacros() {
    if (!currentManualBase) return;
    const amount = parseFloat(manualAmount.value) || 0;
    const factor = amount / 100;
    
    manualCalories.value = Math.round(currentManualBase.calories * factor);
    manualProtein.value = Math.round(currentManualBase.protein * factor);
    manualFat.value = Math.round(currentManualBase.fat * factor);
    manualCarbs.value = Math.round(currentManualBase.carbs * factor);
}

scanInManualBtn.addEventListener('click', () => {
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

    const manualEntry = {
        name: name,
        date: toISODateString(currentDate),
        timestamp: new Date().getTime(),
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
            carbs: carbs
        }],
        reasoning: "Manuell hinzugefügt",
        expanded: false
    };

    saveToHistory(manualEntry);
    updateUIForDate();

    // Formular reset
    manualName.value = '';
    manualAmount.value = '';
    manualUnit.value = 'g';
    manualCalories.value = '';
    manualProtein.value = '';
    manualFat.value = '';
    manualCarbs.value = '';
    currentManualBase = null;
    
    showToast("Snack eintragen erfolgreich!", "success");
    switchTab('dashboard');
});

saveManualAsRecipeBtn.addEventListener('click', () => {
    const name = manualName.value.trim();
    const calories = parseFloat(manualCalories.value) || 0;
    const protein = parseFloat(manualProtein.value) || 0;
    const fat = parseFloat(manualFat.value) || 0;
    const carbs = parseFloat(manualCarbs.value) || 0;

    if (!name || calories <= 0) {
        return showToast("Bitte Name und Kalorien ausfüllen.", "error");
    }

    userRecipes.push({
        id: Date.now().toString(),
        name, calories, protein, fat, carbs
    });
    saveUserData();
    showToast(`"${name}" als Rezept Vorlage gespeichert!`, "success");
});

// --- REZEPTE LOGIK ---
createNewRecipeBtn.addEventListener('click', () => {
    recipeInputs.name.value = '';
    recipeInputs.cal.value = '';
    recipeInputs.p.value = '';
    recipeInputs.f.value = '';
    recipeInputs.c.value = '';
    openModal(createRecipeModal);
});

saveNewRecipeBtn.addEventListener('click', () => {
    const name = recipeInputs.name.value.trim();
    if (!name) return showToast("Namen eingeben.", "error");

    userRecipes.push({
        id: Date.now().toString(),
        name: name,
        calories: parseFloat(recipeInputs.cal.value) || 0,
        protein: parseFloat(recipeInputs.p.value) || 0,
        fat: parseFloat(recipeInputs.f.value) || 0,
        carbs: parseFloat(recipeInputs.c.value) || 0
    });
    saveUserData();
    renderRecipes();
    closeModal();
    showToast("Rezept angelegt!", "success");
});

function renderRecipes() {
    recipesList.innerHTML = '';
    if (!userRecipes || userRecipes.length === 0) {
        recipesList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 20px; font-size:12px;">Keine Rezepte gespeichert.</p>';
        return;
    }

    userRecipes.forEach((recipe, index) => {
        const div = document.createElement('div');
        div.className = 'recipe-item';
        div.innerHTML = `
            <div>
                <div style="font-weight: 700; color: white; font-size:14px;">${recipe.name}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top:2px;">${Math.round(recipe.calories)} kcal • P:${Math.round(recipe.protein)}g F:${Math.round(recipe.fat)}g K:${Math.round(recipe.carbs)}g</div>
            </div>
            <button class="delete-btn" style="color: var(--accent-red); margin-left:15px;">${icons.trash}</button>
        `;

        div.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                e.stopPropagation();
                userRecipes.splice(index, 1);
                saveUserData();
                renderRecipes();
                showToast(`Rezept "${recipe.name}" gelöscht.`, "info");
                return;
            }
            addRecipeToDay(recipe);
        });
        recipesList.appendChild(div);
    });
}

function addRecipeToDay(recipe) {
    saveToHistory({
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
    });
    updateUIForDate();
    showToast(`"${recipe.name}" eingetragen!`, "success");
    switchTab('dashboard');
}

// --- WASSER TRACKING LOGIK ---
addWaterBtn.addEventListener('click', () => {
    addWaterEntry(250);
});

removeWaterBtn.addEventListener('click', () => {
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
    const amountToRemove = Math.min(currentWater, 250);
    if (amountToRemove > 0) {
        addWaterEntry(-amountToRemove);
    }
});

// Ergänzte Schnellwahl-Tasten für Wasserbedarf
if (waterQuickAdd500) {
    waterQuickAdd500.addEventListener('click', () => {
        addWaterEntry(500);
    });
}
if (waterQuickAdd750) {
    waterQuickAdd750.addEventListener('click', () => {
        addWaterEntry(750);
    });
}

function addWaterEntry(amount) {
    saveToHistory({
        name: "Wasser",
        date: toISODateString(currentDate),
        timestamp: new Date().getTime(),
        calories: 0, protein: 0, fat: 0, carbs: 0,
        waterMl: amount,
        ingredients: [],
        reasoning: "Wasser Tracker",
        expanded: false
    });
    updateUIForDate();
}

// --- DASHBOARD QUICK ADD CHIPS CLICK LOGIK ---
if (quickAddScroll) {
    quickAddScroll.addEventListener('click', (e) => {
        const chip = e.target.closest('.quick-add-chip');
        if (!chip) return;
        
        const name = chip.getAttribute('data-name');
        const cal = parseFloat(chip.getAttribute('data-cal')) || 0;
        const p = parseFloat(chip.getAttribute('data-p')) || 0;
        const f = parseFloat(chip.getAttribute('data-f')) || 0;
        const c = parseFloat(chip.getAttribute('data-c')) || 0;
        const type = chip.getAttribute('data-type');
        
        if (type === 'water') {
            addWaterEntry(250);
            showToast("Glas Wasser (250ml) hinzugefügt! 💧", "success");
        } else {
            saveToHistory({
                name: name,
                date: toISODateString(currentDate),
                timestamp: new Date().getTime(),
                calories: cal,
                protein: p,
                fat: f,
                carbs: c,
                ingredients: [{
                    name: name,
                    weight: 1,
                    unit: 'Stk.',
                    calories: cal,
                    protein: p,
                    fat: f,
                    carbs: c
                }],
                reasoning: "Quick Add",
                expanded: false
            });
            updateUIForDate();
            showToast(`"${name}" hinzugefügt! 🍏`, "success");
        }
    });
}

// --- LEGAL & TUTORIAL MODALS ---
if (openLegalBtn) openLegalBtn.addEventListener('click', () => openModal(legalModal));
if (openTutorialBtn) openTutorialBtn.addEventListener('click', () => openModal(tutorialModal));
if (finishTutorialBtn) finishTutorialBtn.addEventListener('click', () => {
    localStorage.setItem('tutorial_seen_v1', 'true');
    closeModal();
    setTimeout(() => switchTab('profile'), 300);
});

// Cookies
const cookieStatus = localStorage.getItem('cookiesAccepted');
if (!cookieStatus) {
    setTimeout(() => cookieBanner.classList.remove('hidden'), 1000);
} else if (cookieStatus === 'true') {
    initAnalytics();
}

if (acceptCookiesBtn) acceptCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    initAnalytics();
    cookieBanner.classList.add('hidden');
});

if (declineCookiesBtn) declineCookiesBtn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'essential');
    cookieBanner.classList.add('hidden');
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
    saveUserData();
    renderHistory();
}

function deleteEntry(index) {
    calorieHistory.entries.splice(index, 1);
    saveUserData();
    renderHistory();
    updateStatsUI();
    showToast("Eintrag gelöscht.", "info");
}

function deleteIngredient(entryIndex, ingIndex) {
    let entry = calorieHistory.entries[entryIndex];
    entry.ingredients.splice(ingIndex, 1);
    recalculateTotals(entry);
    saveUserData();
    renderHistory();
    updateStatsUI();
}

function updateIngredientWeight(entryIndex, ingIndex, newWeight) {
    let entry = calorieHistory.entries[entryIndex];
    let ingredient = entry.ingredients[ingIndex];
    const factor = newWeight / ingredient.weight;
    
    ingredient.weight = newWeight;
    ingredient.calories *= factor;
    ingredient.protein *= factor;
    ingredient.fat *= factor;
    ingredient.carbs *= factor;

    recalculateTotals(entry);
    saveUserData();
    renderHistory();
    updateStatsUI();
}

function recalculateTotals(entry) {
    if (!entry.ingredients) return;
    entry.calories = 0;
    entry.protein = 0;
    entry.fat = 0;
    entry.carbs = 0;

    entry.ingredients.forEach(ing => {
        entry.calories += ing.calories || 0;
        entry.protein += ing.protein || 0;
        entry.fat += ing.fat || 0;
        entry.carbs += ing.carbs || 0;
    });
}

function toISODateString(date) {
    return date.toISOString().split('T')[0];
}

function incrementApiUsage() {
    const today = toISODateString(new Date());
    if (apiUsage.date !== today) {
        apiUsage = { date: today, count: 0 };
    }
    apiUsage.count++;
    updateApiUsageDisplay();
    saveUserData().catch(console.error);
}

function updateApiUsageDisplay() {
    if (apiUsageDisplay) {
        apiUsageDisplay.textContent = `Heute: ${apiUsage.count}`;
        apiUsageDisplay.style.color = apiUsage.count >= 15 ? 'var(--accent-red)' : 'var(--text-muted)';
    }
}

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
                resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

async function callOpenAI(base64Images, promptText) {
    const content = [{ type: "text", text: promptText }];
    base64Images.forEach(b64 => {
        content.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${b64}` }
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
            messages: [{ role: "user", content: content }],
            response_format: { type: "json_object" },
            max_tokens: 1000
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API Fehler: ${response.status}`);
    }
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

// --- SECURE CLIENT-SIDE ENCRYPTION (AES-GCM 256) ---
const hexToBuf = (hex) => new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const bufToHex = (buf) => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');

async function getOrCreateLocalKey() {
    const keyJwk = localStorage.getItem('app_encryption_key');
    if (!keyJwk) return null;
    return crypto.subtle.importKey(
        "jwk", JSON.parse(keyJwk),
        { name: "AES-GCM" }, true, ["encrypt", "decrypt"]
    );
}

async function encryptText(text) {
    if (!text) return '';
    const key = await getOrCreateLocalKey();
    if (!key) throw new Error("Verschlüsselungs-Key fehlt. Bitte neu einloggen.");
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv }, key, encoded
    );
    return bufToHex(iv) + ':' + bufToHex(encrypted);
}

async function decryptText(encryptedHex) {
    if (!encryptedHex || !encryptedHex.includes(':')) return '';
    try {
        const [ivHex, dataHex] = encryptedHex.split(':');
        const key = await getOrCreateLocalKey();
        if (!key) return '';
        const iv = hexToBuf(ivHex);
        const data = hexToBuf(dataHex);
        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv }, key, data
        );
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.warn("Decrypt error (evtl. neues Gerät/Sitzung):", e);
        return '';
    }
}

async function deriveKeyFromPassword(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(password),
        { name: "PBKDF2" }, false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2", salt: enc.encode(salt),
            iterations: 100000, hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
}

// Loading UI helper
function showLoading(text = "Lade...") {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
    
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.remove();
        });
    }, 2800);
}

// --- PWA INSTALLATION LOGIC ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installAppBtn.classList.remove('hidden');
});

installAppBtn.addEventListener('click', async () => {
    installAppBtn.classList.add('hidden');
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
    }
});

window.addEventListener('appinstalled', () => {
    installAppBtn.classList.add('hidden');
    deferredPrompt = null;
});

// SW Registration & Service Worker Cache
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            reg.onupdatefound = () => {
                const installingWorker = reg.installing;
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            if (updateModal) openModal(updateModal);
                        }
                    }
                };
            };
        });
    });
}
if (refreshAppBtn) {
    refreshAppBtn.addEventListener('click', () => {
        window.location.reload();
    });
}

// --- BARCODE SCANNER LOGIK ---
closeScannerBtn.addEventListener('click', () => {
    stopCamera();
    closeModal();
});

function startCamera() {
    if (!window.Html5Qrcode) {
        showToast("Scanner lädt noch...", "info");
        return;
    }
    html5QrCode = new Html5Qrcode("reader");
    const aspectRatio = window.innerWidth / window.innerHeight;
    const config = { fps: 12, qrbox: { width: 230, height: 230 }, aspectRatio: aspectRatio };
    
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
    .catch(err => {
        console.error("Camera access error:", err);
        showToast("Kamera-Fehler: Berechtigungen prüfen.", "error");
        closeModal();
    });
}

function stopCamera() {
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear();
        }).catch(err => console.error("Stop scanner failed", err));
    }
}

function onScanFailure(error) {}

async function onScanSuccess(decodedText) {
    stopCamera();
    closeModal();
    showLoading("Suche Produkt in Datenbank...");

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${decodedText}.json`, {
            headers: { "User-Agent": "NutriScanAI - Web - v1.0" }
        });
        const data = await response.json();

        if (data.status === 1) {
            const p = data.product;
            currentBarcodeData = {
                name: p.product_name || "Unbekanntes Produkt",
                calories100: p.nutriments['energy-kcal_100g'] || 0,
                protein100: p.nutriments.proteins_100g || 0,
                fat100: p.nutriments.fat_100g || 0,
                carbs100: p.nutriments.carbohydrates_100g || 0
            };
            showBarcodeResultModal();
        } else {
            showToast("Barcode nicht gefunden.", "error");
        }
    } catch (error) {
        console.error(error);
        showToast("Abruf fehlgeschlagen (OFF offline?).", "error");
    } finally {
        hideLoading();
    }
}

function showBarcodeResultModal() {
    barcodeProductName.textContent = currentBarcodeData.name;
    barcode100gInfo.textContent = `${Math.round(currentBarcodeData.calories100)} kcal / 100g`;
    barcodeWeight.value = 100;
    updateBarcodeStats();
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
        <div style="font-family:'Outfit',sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 8px; color: var(--accent-purple);">${cal} kcal</div>
        <div style="display: flex; justify-content: center; gap: 18px; font-size: 13px; font-weight:600; color: var(--text-secondary);">
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
    saveToHistory({
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
    });

    updateUIForDate();
    closeModal();
    showToast("Barcode Produkt hinzugefügt!", "success");
    switchTab('dashboard');
});

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
        throw new Error("KI-Antwort ungültig (Parse Error).");
    }
}

// Initiale Ausführungen
initTabRouter();

function initTabRouter() {
    // Standard Tab-Start ohne Vibration zur Umgehung von Browser-Interventionen
    switchTab('dashboard', false);
}

window.addEventListener('offline', () => {
    showToast("Offline-Modus aktiv.", "info");
});
window.addEventListener('online', () => {
    showToast("Wieder online!", "success");
});