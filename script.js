/* ============================================================
   DOTA 2 ARCANE CHEST — JAVASCRIPT
   - Roulette spinning animation (CS case opening style)
   - Weighted probability selection
   - Edit mode for customizing items
   - Sound effects (Web Audio API)
   - Inventory system with localStorage
   - Auto-spin mode
   - Statistics tracking
   - Background particle animation
   ============================================================ */

/* ---------- STATE ---------- */
const state = {
  items: [],           // Item pool
  editMode: false,
  isSpinning: false,
  spinSpeed: 3,
  audioCtx: null
};

/* ---------- RARITY CONFIG ---------- */
const RARITY = {
  common: { color: '#b0b0b0', weight: 60 },
  rare: { color: '#4b7bec', weight: 25 },
  epic: { color: '#a55eea', weight: 12 },
  legendary: { color: '#f7b731', weight: 3 }
};

/* ---------- PLACEHOLDER IMAGE ---------- */
const PLACEHOLDER_IMG = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFhMWEyMCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjMwIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
const IMG_COMMON    = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFhMWEyMCIvPjxwYXRoIGQ9Ik01MCAxMCA3MCAzNSA3MCA2NSA1MCA5MCAzMCA2NSAzMCAzNSBaIiBzdHJva2U9IiNiMGIwYjAiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjEwIiBmaWxsPSIjYjBiMGIwIi8+PC9zdmc+';
const IMG_EPIC      = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFhMWEyMCIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMTAgOTAsNTAgNTAsOTAgMTAsNTAiIHN0cm9rZT0iI2E1NWVlYSIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+PHBvbHlnb24gcG9pbnRzPSI1MCwyNSA3NSw1MCA1MCw3NSAyNSw1MCIgZmlsbD0iI2E1NWVlYSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+';
const IMG_LEGENDARY = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzFhMWEyMCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjM1IiBzdHJva2U9IiNmN2I3MzEiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIvPjxwb2x5Z29uIHBvaW50cz0iNTAsMTUgNjAsMzUgODAsMzUgNjUsNTAgNzUsNzAgNTAsNTUgMjUsNzAgMzUsNTAgMjAsMzUgNDAsMzUiIHN0cm9rZT0iI2Y3YjczMSIgc3Ryb2tlLXdpZHRoPSIzIiBmaWxsPSJub25lIi8+PC9zdmc+';

/* ---------- DEFAULT ITEMS ---------- */
const defaultItems = [
  { id:1,  name:'Common Prize',       rarity:'common',    chance:92,   displayChance:99,  hidden:false, image:'images (5).jpg' },
  { id:2,  name:'Enchantress',        rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'Enchantress.jpg' },
  { id:3,  name:'Huskar',             rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'Huskar.jpg' },
  { id:4,  name:'Puck',               rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'Puck.jpg' },
  { id:5,  name:'Riki',               rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'Riki.jpg' },
  { id:6,  name:'Spider',             rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'Spider.jpg' },
  { id:7,  name:'Templar Assassin',   rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'TA.jpg' },
  { id:8,  name:'Dragon Slave Arm',   rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'DS ARM.jpg' },
  { id:9,  name:'Steam Wallet',       rarity:'legendary', chance:0,    displayChance:0,   hidden:false, image:'STEAM.jpg' },
  { id:10, name:'DS Head',             rarity:'epic',      chance:1, displayChance:50,  hidden:false, image:'DS HEAD.jpg' }
];

/* ---------- DOM ELEMENTS ---------- */
const els = {
  rouletteStrip:  document.getElementById('rouletteStrip'),
  rouletteViewport: document.getElementById('rouletteViewport'),
  itemPool:       document.getElementById('itemPool'),
  btnSpin:        document.getElementById('btnSpin'),
  btnEditMode:    document.getElementById('btnEditMode'),
  btnAddItem:     document.getElementById('btnAddItem'),
  adminControls:     document.getElementById('adminControls'),
  hiddenPoolSection:  document.getElementById('hiddenPoolSection'),
  hiddenPool:         document.getElementById('hiddenPool'),
  btnAddHiddenItem:   document.getElementById('btnAddHiddenItem'),
  spinSpeed:          document.getElementById('spinSpeed'),
  winModal:       document.getElementById('winModal'),
  winImage:       document.getElementById('winImage'),
  winName:        document.getElementById('winName'),
  winRarity:      document.getElementById('winRarity'),
  btnCloseModal:  document.getElementById('btnCloseModal'),
  modalParticles: document.getElementById('modalParticles'),
  bgCanvas:       document.getElementById('bgCanvas'),
  loginModal:     document.getElementById('loginModal'),
  loginEmail:     document.getElementById('loginEmail'),
  loginPassword:  document.getElementById('loginPassword'),
  loginError:     document.getElementById('loginError'),
  loginView:      document.getElementById('loginView'),
  loggedInView:   document.getElementById('loggedInView'),
  btnDoLogin:     document.getElementById('btnDoLogin'),
  btnCloseLogin:  document.getElementById('btnCloseLogin'),
  btnLogout:      document.getElementById('btnLogout'),
  btnAdminLogin:  document.getElementById('btnAdminLogin'),
  adminBadge:     document.getElementById('adminBadge')
};

/* ---------- ADMIN CREDENTIALS (obfuscated) ---------- */
const _ae = [74,97,121,64,103,109,97,105,108,46,99,111,109];
const _ap = [74,97,121,50,49,51,51];
function _decode(a) { return a.map(c => String.fromCharCode(c)).join(''); }
function isAdminLoggedIn() { return sessionStorage.getItem('adminLoggedIn') === '1'; }
function checkAdmin(email, pass) { return email === _decode(_ae) && pass === _decode(_ap); }

/* ---------- INITIALIZATION ---------- */
function init() {
  loadFromStorage();
  renderPool();
  renderRouletteStrip();
  applyAdminState();
  setupEventListeners();
  initBgParticles();
}

const DATA_VERSION = 'v6';
function loadFromStorage() {
  const savedVersion = localStorage.getItem('rouletteVersion');
  const savedItems   = localStorage.getItem('rouletteItems');
  if (savedItems && savedVersion === DATA_VERSION) {
    const parsed = JSON.parse(savedItems);
    state.items = parsed.map(item => ({ hidden: false, ...item }));
  } else {
    localStorage.removeItem('rouletteItems');
    localStorage.setItem('rouletteVersion', DATA_VERSION);
    state.items = defaultItems.map(item => ({ ...item }));
  }
}

function saveToStorage() {
  localStorage.setItem('rouletteVersion', DATA_VERSION);
  localStorage.setItem('rouletteItems', JSON.stringify(state.items));
}

/* ---------- RENDER ITEM POOL ---------- */
function renderPool() {
  els.itemPool.innerHTML = '';
  state.items.forEach((item, idx) => {
    if (!item.hidden) {
      els.itemPool.appendChild(createPoolCard(item, idx));
    }
  });
}

function renderHiddenPool() {
  if (!els.hiddenPool) return;
  els.hiddenPool.innerHTML = '';
  state.items.forEach((item, idx) => {
    if (item.hidden) {
      els.hiddenPool.appendChild(createPoolCard(item, idx));
    }
  });
}

function renderBoth() {
  renderPool();
  if (isAdminLoggedIn()) renderHiddenPool();
}

function createPoolCard(item, idx) {
  const div = document.createElement('div');
  div.className = 'pool-card' + (item.hidden ? ' card-hidden-admin' : '');
  div.dataset.rarity = item.rarity;
  div.dataset.idx = idx;

  const rarityColor = (RARITY[item.rarity] || RARITY.common).color;
  const shown = item.displayChance !== undefined ? item.displayChance : item.chance;
  const viewHtml = `
    <img src="${item.image}" alt="${item.name}" />
    <div class="card-name">${item.name}</div>
    <div class="card-rarity" style="color:${rarityColor}">${item.rarity}</div>
    <div class="card-chance">${shown}%</div>
  `;

  const editHtml = isAdminLoggedIn() ? `
    <div class="edit-overlay">
      <input type="text" class="edit-name" value="${item.name}" placeholder="Name" />
      <select class="edit-rarity">
        <option value="common" ${item.rarity==='common'?'selected':''}>Common</option>
        <option value="rare" ${item.rarity==='rare'?'selected':''}>Rare</option>
        <option value="epic" ${item.rarity==='epic'?'selected':''}>Epic</option>
        <option value="legendary" ${item.rarity==='legendary'?'selected':''}>Legendary</option>
      </select>
      <input type="number" class="edit-chance" value="${item.chance}" min="0" max="100" step="0.01" placeholder="Real Chance %" />
      <input type="number" class="edit-display-chance" value="${shown}" min="0" max="100" step="1" placeholder="Display Chance %" />
      <label class="upload-label">&#128247; Change Image</label>
      <input type="file" class="edit-image" accept="image/*" />
      <button class="btn-toggle-hidden" data-idx="${idx}">${item.hidden ? '&#128065; Make Public' : '&#128274; Hide from Public'}</button>
      <button class="btn-remove" data-idx="${idx}">&#128465; Remove</button>
    </div>
  ` : '';

  div.innerHTML = viewHtml + editHtml;
  return div;
}

/* ---------- RENDER ROULETTE STRIP ---------- */
function weightedRandom() {
  const total = state.items.reduce((s, i) => s + (i.chance || 0), 0);
  if (total <= 0) return state.items[Math.floor(Math.random() * state.items.length)];
  let r = Math.random() * total;
  for (const item of state.items) { r -= item.chance; if (r <= 0) return item; }
  return state.items[0];
}

function renderRouletteStrip(forcedWinner = null, forcedPos = -1) {
  els.rouletteStrip.innerHTML = '';
  const stripLength = 40;
  for (let i = 0; i < stripLength; i++) {
    const item = (forcedWinner && i === forcedPos) ? forcedWinner : weightedRandom();
    const card = document.createElement('div');
    card.className = 'strip-card';
    card.dataset.rarity = item.rarity;
    card.dataset.id = item.id;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="s-name">${item.name}</div>
      <div class="s-rarity">${item.rarity}</div>
    `;
    els.rouletteStrip.appendChild(card);
  }
}

/* ---------- SPIN LOGIC ---------- */
function spin() {
  if (state.isSpinning) return;
  if (state.items.length === 0) {
    alert('Please add items to the pool first!');
    return;
  }

  initAudio();
  playSpinSound();

  state.isSpinning = true;
  els.btnSpin.disabled = true;

  // Step 1: Select winner first
  const winner = selectWinner();

  // Step 2: Pick a random middle position for the winner (20–28)
  const targetIdx = Math.floor(Math.random() * 9) + 20;

  // Step 3: Build randomized strip with winner forced at targetIdx
  renderRouletteStrip(winner, targetIdx);

  // Step 4: Instantly reset to position 0 with no animation
  els.rouletteStrip.style.transition = 'none';
  els.rouletteStrip.style.transform = 'translate(0px, -50%)';
  void els.rouletteStrip.offsetWidth;

  // Step 5: Measure card dimensions
  const firstCard = els.rouletteStrip.querySelector('.strip-card');
  const cardRect = firstCard.getBoundingClientRect();
  const effectiveCardWidth = cardRect.width + 12;

  // Step 6: Calculate scroll to land winner card under center marker
  const viewportWidth = els.rouletteViewport.offsetWidth;
  const centerOffset = (viewportWidth / 2) - (effectiveCardWidth / 2);
  const targetPosition = (targetIdx * effectiveCardWidth) - centerOffset;

  // Step 7: Animate
  const baseDuration = 6000 / state.spinSpeed;
  els.rouletteStrip.style.transition = `transform ${baseDuration}ms cubic-bezier(0.05, 0, 0.2, 1)`;
  els.rouletteStrip.style.transform = `translate(-${targetPosition}px, -50%)`;

  // Step 8: Highlight winner card and show modal
  const allCards = els.rouletteStrip.querySelectorAll('.strip-card');
  setTimeout(() => {
    allCards.forEach(c => c.classList.remove('winner'));
    if (allCards[targetIdx]) allCards[targetIdx].classList.add('winner');
    playWinSound();
    showWinModal(winner);
    saveToStorage();
    state.isSpinning = false;
    els.btnSpin.disabled = false;
  }, baseDuration);
}

function selectWinner() {
  // Weighted random selection
  const totalWeight = state.items.reduce((sum, item) => sum + item.chance, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of state.items) {
    random -= item.chance;
    if (random <= 0) {
      return item;
    }
  }
  return state.items[0];
}

/* ---------- WIN MODAL ---------- */
function showWinModal(item) {
  els.winImage.src = item.image;
  els.winName.textContent = item.name;
  els.winRarity.textContent = item.rarity;
  els.winRarity.style.color = RARITY[item.rarity].color;
  els.winModal.classList.remove('hidden');
  createModalParticles();
}

function closeWinModal() {
  els.winModal.classList.add('hidden');
}

function createModalParticles() {
  els.modalParticles.innerHTML = '';
  const colors = ['#c8aa5a', '#e8c252', '#f7b731', '#ffffff'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${Math.random() * 6 + 2}px;
      height: ${Math.random() * 6 + 2}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFade 1.5s ease-out forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    els.modalParticles.appendChild(p);
  }
}

// Add particle animation dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes particleFade {
    0% { opacity: 1; transform: scale(1) translateY(0); }
    100% { opacity: 0; transform: scale(0) translateY(-50px); }
  }
`;
document.head.appendChild(style);

/* ---------- EDIT MODE ---------- */
function toggleEditMode() {
  if (!isAdminLoggedIn()) return;
  state.editMode = !state.editMode;
  document.body.classList.toggle('edit-mode', state.editMode);
  els.btnEditMode.classList.toggle('active', state.editMode);
  els.btnEditMode.innerHTML = state.editMode ? '&#10003; Exit Edit Mode' : '&#9998; Edit Mode';
}

function addItem() {
  if (!isAdminLoggedIn()) return;
  state.items.push({ id: Date.now(), name: 'New Public Prize', rarity: 'common', chance: 10, displayChance: 10, hidden: false, image: PLACEHOLDER_IMG });
  renderBoth();
  renderRouletteStrip();
  saveToStorage();
}

function addHiddenItem() {
  if (!isAdminLoggedIn()) return;
  state.items.push({ id: Date.now(), name: 'New Hidden Prize', rarity: 'common', chance: 0.14, displayChance: 50, hidden: true, image: PLACEHOLDER_IMG });
  renderBoth();
  renderRouletteStrip();
  saveToStorage();
}

function toggleItemHidden(idx) {
  if (!isAdminLoggedIn()) return;
  state.items[idx].hidden = !state.items[idx].hidden;
  renderBoth();
  renderRouletteStrip();
  saveToStorage();
}

function removeItem(idx) {
  if (state.items.length <= 1) {
    alert('You must have at least one item in the pool!');
    return;
  }
  state.items.splice(idx, 1);
  renderBoth();
  renderRouletteStrip();
  saveToStorage();
}

function updateItem(idx, field, value) {
  state.items[idx][field] = value;
  if (field !== 'image') {
    renderBoth();
    renderRouletteStrip();
    saveToStorage();
  }
}

/* ---------- SOUND EFFECTS (Web Audio API) ---------- */
function initAudio() {
  if (!state.audioCtx) {
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSpinSound() {
  if (!state.audioCtx) return;
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.connect(gain);
  gain.connect(state.audioCtx.destination);
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(150, state.audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, state.audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.1, state.audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.3);
  osc.start();
  osc.stop(state.audioCtx.currentTime + 0.3);
}

function playWinSound() {
  if (!state.audioCtx) return;
  const osc = state.audioCtx.createOscillator();
  const gain = state.audioCtx.createGain();
  osc.connect(gain);
  gain.connect(state.audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, state.audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, state.audioCtx.currentTime + 0.1);
  osc.frequency.exponentialRampToValueAtTime(600, state.audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.15, state.audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, state.audioCtx.currentTime + 0.5);
  osc.start();
  osc.stop(state.audioCtx.currentTime + 0.5);
}

/* ---------- BACKGROUND PARTICLES ---------- */
function initBgParticles() {
  const ctx = els.bgCanvas.getContext('2d');
  let particles = [];
  
  function resize() {
    els.bgCanvas.width = window.innerWidth;
    els.bgCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * els.bgCanvas.width;
      this.y = Math.random() * els.bgCanvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.3 + 0.1;
      this.color = Math.random() > 0.7 ? '#c8aa5a' : '#8b1a1a';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > els.bgCanvas.width || this.y < 0 || this.y > els.bgCanvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, els.bgCanvas.width, els.bgCanvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ---------- ADMIN LOGIN ---------- */
function applyAdminState() {
  const admin = isAdminLoggedIn();
  els.adminControls.classList.toggle('hidden', !admin);
  els.hiddenPoolSection.classList.toggle('hidden', !admin);
  els.adminBadge.classList.toggle('hidden', !admin);
  els.btnAdminLogin.classList.toggle('admin-active', admin);
  if (!admin && state.editMode) {
    state.editMode = false;
    document.body.classList.remove('edit-mode');
    els.btnEditMode.innerHTML = '&#9998; Edit Mode';
  }
}

function openLoginModal() {
  els.loginEmail.value = '';
  els.loginPassword.value = '';
  els.loginError.classList.add('hidden');
  if (isAdminLoggedIn()) {
    els.loginView.classList.add('hidden');
    els.loggedInView.classList.remove('hidden');
  } else {
    els.loginView.classList.remove('hidden');
    els.loggedInView.classList.add('hidden');
  }
  els.loginModal.classList.remove('hidden');
  els.loginEmail.focus();
}

function closeLoginModal() {
  els.loginModal.classList.add('hidden');
}

function doLogin() {
  const email = els.loginEmail.value.trim();
  const pass  = els.loginPassword.value;
  if (checkAdmin(email, pass)) {
    sessionStorage.setItem('adminLoggedIn', '1');
    applyAdminState();
    renderBoth();
    closeLoginModal();
  } else {
    els.loginError.classList.remove('hidden');
    els.loginPassword.value = '';
    els.loginPassword.focus();
  }
}

function doLogout() {
  sessionStorage.removeItem('adminLoggedIn');
  applyAdminState();
  renderBoth();
  closeLoginModal();
}

/* ---------- EVENT LISTENERS ---------- */
function setupEventListeners() {
  els.btnSpin.addEventListener('click', spin);
  els.btnEditMode.addEventListener('click', toggleEditMode);
  els.btnAddItem.addEventListener('click', addItem);
  els.btnAddHiddenItem.addEventListener('click', addHiddenItem);
  els.btnCloseModal.addEventListener('click', closeWinModal);
  els.btnAdminLogin.addEventListener('click', openLoginModal);
  els.btnCloseLogin.addEventListener('click', closeLoginModal);
  els.btnDoLogin.addEventListener('click', doLogin);
  els.btnLogout.addEventListener('click', doLogout);
  els.loginPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  els.loginEmail.addEventListener('keydown', (e) => { if (e.key === 'Enter') els.loginPassword.focus(); });
  document.getElementById('btnTogglePass').addEventListener('click', () => {
    const input = els.loginPassword;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    document.getElementById('btnTogglePass').textContent = isHidden ? '\uD83D\uDE48' : '\uD83D\uDC41';
  });

  // Speed control
  els.spinSpeed.addEventListener('input', (e) => {
    state.spinSpeed = parseInt(e.target.value);
  });

  // Shared pool event delegation (handles both #itemPool and #hiddenPool)
  function poolClickHandler(e) {
    if (!state.editMode) return;
    const card = e.target.closest('.pool-card');
    if (!card) return;
    const idx = parseInt(card.dataset.idx);
    if (e.target.classList.contains('btn-remove')) {
      removeItem(idx);
    } else if (e.target.classList.contains('btn-toggle-hidden')) {
      toggleItemHidden(idx);
    } else if (e.target.classList.contains('upload-label')) {
      const fileInput = card.querySelector('.edit-image');
      fileInput.click();
      fileInput.onchange = (ev) => {
        const file = ev.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            state.items[idx].image = event.target.result;
            renderBoth();
            renderRouletteStrip();
            saveToStorage();
          };
          reader.readAsDataURL(file);
        }
      };
    }
  }

  function poolChangeHandler(e) {
    if (!state.editMode) return;
    const card = e.target.closest('.pool-card');
    if (!card) return;
    const idx = parseInt(card.dataset.idx);
    if (e.target.classList.contains('edit-name')) {
      updateItem(idx, 'name', e.target.value);
    } else if (e.target.classList.contains('edit-rarity')) {
      updateItem(idx, 'rarity', e.target.value);
    } else if (e.target.classList.contains('edit-chance')) {
      updateItem(idx, 'chance', parseFloat(e.target.value));
    } else if (e.target.classList.contains('edit-display-chance')) {
      updateItem(idx, 'displayChance', parseFloat(e.target.value));
    }
  }

  els.itemPool.addEventListener('click', poolClickHandler);
  els.itemPool.addEventListener('change', poolChangeHandler);
  els.hiddenPool.addEventListener('click', poolClickHandler);
  els.hiddenPool.addEventListener('change', poolChangeHandler);
}

// Start the app
init();
