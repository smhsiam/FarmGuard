const ADMIN_PASSWORD = 'farmguard2024';
const BACKEND = 'http://localhost:3001';

// ── LOGIN / LOGOUT ──
function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('loginError').style.display = 'none';
    localStorage.setItem('fg_admin', pass);
    initAdmin();
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
}

function adminLogout() {
  localStorage.removeItem('fg_admin');
  document.getElementById('loginSection').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('adminPass').value = '';
}

// ── TAB SWITCH ──
function switchTab(id) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  event.target.classList.add('active');
}

// ── CHART (Overview) ──
const CHART_DATA = [
  { name: "ধানের ব্লাস্ট", count: 420 },
  { name: "আলুর মড়ক",     count: 350 },
  { name: "গমের মরিচা",   count: 280 },
  { name: "টমেটো কার্ল",  count: 210 },
  { name: "পাটের পচা",    count: 150 },
];

function renderChart() {
  const max = Math.max(...CHART_DATA.map(d => d.count));
  const el = document.getElementById('chartBars');
  el.innerHTML = CHART_DATA.map(d => `
    <div class="chart-bar-wrap">
      <div class="chart-bar-val">${d.count}</div>
      <div class="chart-bar" style="height: ${(d.count / max) * 130}px;"></div>
      <div class="chart-bar-label">${d.name}</div>
    </div>
  `).join('');
}

// ── PRICES TABLE ──
const PRICES_DATA = [
  { id: 'cp1',  name: 'ধান (মোটা)',        unit: 'প্রতি মণ',  avg: 1100 },
  { id: 'cp2',  name: 'ধান (সরু/মিনিকেট)', unit: 'প্রতি মণ',  avg: 1650 },
  { id: 'cp3',  name: 'গম',                unit: 'প্রতি মণ',  avg: 1400 },
  { id: 'cp4',  name: 'আলু',               unit: 'প্রতি কেজি', avg: 28   },
  { id: 'cp5',  name: 'পেঁয়াজ',            unit: 'প্রতি কেজি', avg: 65   },
  { id: 'cp6',  name: 'রসুন',              unit: 'প্রতি কেজি', avg: 180  },
  { id: 'cp7',  name: 'সরিষা',             unit: 'প্রতি মণ',  avg: 2800 },
  { id: 'cp8',  name: 'টমেটো',             unit: 'প্রতি কেজি', avg: 45   },
  { id: 'cp9',  name: 'মরিচ (কাঁচা)',      unit: 'প্রতি কেজি', avg: 120  },
  { id: 'cp10', name: 'মসুর ডাল',          unit: 'প্রতি কেজি', avg: 135  },
  { id: 'cp11', name: 'আম',                unit: 'প্রতি কেজি', avg: 80   },
  { id: 'cp12', name: 'পাট',               unit: 'প্রতি মণ',  avg: 2200 },
];

function renderPricesTable() {
  const tbody = document.getElementById('pricesTableBody');
  tbody.innerHTML = PRICES_DATA.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>৳ ${p.avg}</td>
      <td>${p.unit}</td>
      <td>
        <input type="number" class="price-input" value="${p.avg}" id="price_${p.id}" />
        <button class="save-btn" onclick="savePrice('${p.id}', '${p.name}')">সংরক্ষণ</button>
        <span class="success-msg" id="msg_${p.id}" style="display:none;">✅ সংরক্ষিত</span>
      </td>
    </tr>
  `).join('');
}

async function savePrice(id, name) {
  const newVal = document.getElementById('price_' + id).value;
  const msgEl = document.getElementById('msg_' + id);

  try {
    const res = await fetch(`${BACKEND}/api/crop-prices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': ADMIN_PASSWORD
      },
      body: JSON.stringify({ nationalAvg: Number(newVal) })
    });
    if (res.ok) {
      msgEl.style.display = 'inline';
      setTimeout(() => { msgEl.style.display = 'none'; }, 2500);
    }
  } catch (e) {
    // Offline fallback
    msgEl.style.display = 'inline';
    setTimeout(() => { msgEl.style.display = 'none'; }, 2500);
    console.log(`Saved ${name}: ${newVal} (local only)`);
  }
}

// ── INIT ──
function initAdmin() {
  renderChart();
  renderPricesTable();
}

// Auto-login check
window.onload = () => {
  const saved = localStorage.getItem('fg_admin');
  if (saved === ADMIN_PASSWORD) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    initAdmin();
  }
};