// ───────── WEATHER SECTION ─────────
const BACKEND = 'http://localhost:3001';

const ACTIVITIES = [
  { name: "রহিম উদ্দিন", district: "ময়মনসিংহ", crop: "ধান", disease: "ব্লাস্ট রোগ" },
  { name: "জলিল মিয়া",   district: "কুষ্টিয়া",  crop: "গম",   disease: "মরিচা রোগ" },
  { name: "মর্জিনা বেগম", district: "যশোর",      crop: "টমেটো", disease: "অ্যান্থ্রাকনোজ" },
  { name: "শফিকুল",      district: "বগুড়া",     crop: "আলু",   disease: "লেট ব্লাইট" },
  { name: "নূর হোসেন",   district: "রংপুর",     crop: "ভুট্টা", disease: "লিফ ব্লাইট" },
  { name: "হাসিনা বেগম", district: "ঢাকা",      crop: "মরিচ",  disease: "পাউডারি মিলডিউ" },
];

async function loadWeather() {
  const district = document.getElementById('districtSelect').value;
  document.getElementById('wDistrict').textContent = district;

  try {
    const res = await fetch(`${BACKEND}/api/weather?district=${encodeURIComponent(district)}`);
    const data = await res.json();

    document.getElementById('wTemp').textContent   = data.temperature;
    document.getElementById('wIcon').textContent   = data.icon;
    document.getElementById('wDesc').textContent   = data.description;
    document.getElementById('wHumid').textContent  = data.humidity;
    document.getElementById('wWind').textContent   = data.windSpeed;
    document.getElementById('wFeel').textContent   = data.feelsLike;

    // Risk update
    const risk = data.risk;
    const riskCard = document.getElementById('riskCard');
    document.getElementById('riskLevel').textContent  = risk.level + (risk.color === 'red' ? ' ⚠️' : risk.color === 'amber' ? ' ⚡' : ' ✅');
    document.getElementById('riskAdvice').textContent = risk.advice;

    riskCard.className = 'weather-risk';
    if (risk.color === 'amber') riskCard.classList.add('amber-risk');
    if (risk.color === 'green') riskCard.classList.add('green-risk');

    const diseasesEl = document.getElementById('riskDiseases');
    diseasesEl.innerHTML = risk.diseases.map(d => `<span>🌿 ${d}</span>`).join('') || '<span>🌿 ঝুঁকি কম</span>';

  } catch (e) {
    console.log('Backend offline — showing demo data');
    // Demo fallback
    document.getElementById('wTemp').textContent = '28';
    document.getElementById('wIcon').textContent = '⛅';
    document.getElementById('wDesc').textContent = 'আংশিক মেঘলা';
    document.getElementById('wHumid').textContent = '82';
    document.getElementById('wWind').textContent  = '12';
    document.getElementById('wFeel').textContent  = '30';
    document.getElementById('riskLevel').textContent = 'মাঝারি ⚡';
    document.getElementById('riskAdvice').textContent = 'মাঝারি ঝুঁকির পরিবেশ। ফসল নিয়মিত পরীক্ষা করুন।';
    document.getElementById('riskCard').className = 'weather-risk amber-risk';
    document.getElementById('riskDiseases').innerHTML = '<span>🌿 গমের মরিচা রোগ</span><span>🌿 পেঁয়াজের বেগুনি দাগ</span>';
  }
}

// ───────── IMAGE PREVIEW ─────────
function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('previewImg');
    img.src = e.target.result;
    img.style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ───────── DISEASE ANALYSIS ─────────
async function analyzeDisease() {
  const file = document.getElementById('imageInput').files[0];
  if (!file) { alert('আগে একটি ছবি বেছে নিন'); return; }

  const cropType = document.getElementById('cropType').value;
  document.getElementById('loadingDiv').style.display = 'block';
  document.getElementById('resultDiv').style.display = 'none';

  // Convert to base64
  const base64 = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch(`${BACKEND}/api/analyze-disease`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, cropType })
    });
    const data = await res.json();
    showResult(data);
  } catch (e) {
    // Demo fallback when backend is offline
    showResult({
      diseaseName: "ধানের ব্লাস্ট রোগ",
      confidence: 87,
      severity: "তীব্র",
      symptoms: "পাতায় হীরার আকৃতির সাদা থেকে ধূসর দাগ, কিনারায় গাঢ় বর্ডার।",
      cause: "Magnaporthe oryzae ছত্রাকের আক্রমণ। উচ্চ আর্দ্রতা ও ঠান্ডা রাতে বেশি ছড়ায়।",
      treatment: "ট্রাইসাইক্লাজোল ৭৫% WP ১ গ্রাম/লিটার পানিতে মিশিয়ে স্প্রে করুন। মাঠে সঠিক পানি নিষ্কাশন নিশ্চিত করুন।"
    });
  }
}

function showResult(data) {
  document.getElementById('loadingDiv').style.display = 'none';
  document.getElementById('resultDiv').style.display = 'block';
  document.getElementById('diseaseName').textContent = '🌿 ' + data.diseaseName;
  document.getElementById('symptomsText').textContent = data.symptoms;
  document.getElementById('causeText').textContent    = data.cause;
  document.getElementById('treatmentText').textContent = data.treatment;
  document.getElementById('confidenceText').textContent = `আস্থা: ${data.confidence}%`;

  const badge = document.getElementById('severityBadge');
  badge.textContent = data.severity;
  badge.className = 'badge ' + (data.severity === 'তীব্র' ? 'badge-red' : data.severity === 'মাঝারি' ? 'badge-amber' : 'badge-green');
}

// ───────── DISEASE MODAL ─────────
function showDiseaseModal(name, symptoms, treatment, severity) {
  document.getElementById('modalTitle').textContent = name;
  document.getElementById('modalSymptoms').textContent = symptoms;
  document.getElementById('modalTreatment').textContent = treatment;
  const badge = document.getElementById('modalSeverity');
  badge.textContent = severity;
  badge.className = 'badge ' + (severity === 'তীব্র' ? 'badge-red' : severity === 'মাঝারি' ? 'badge-amber' : 'badge-green');
  document.getElementById('diseaseModal').style.display = 'flex';
}
function closeModal(event) {
  if (event.target.id === 'diseaseModal') {
    event.target.style.display = 'none';
  }
}

// ───────── LIVE NOTIFICATION ─────────
let notifIdx = 0;
function showNotification() {
  const a = ACTIVITIES[notifIdx % ACTIVITIES.length];
  notifIdx++;
  document.getElementById('notifAvatar').textContent = a.name.charAt(0);
  document.getElementById('notifName').textContent = a.name + ' · ' + a.district;
  document.getElementById('notifMsg').textContent = a.crop + '-এ ' + a.disease + ' পরীক্ষা করেছেন';
  const notif = document.getElementById('liveNotif');
  notif.style.display = 'flex';
  setTimeout(() => { notif.style.display = 'none'; }, 5000);
}

// ───────── INIT ─────────
window.onload = () => {
  loadWeather();
  setTimeout(showNotification, 4000);
  setInterval(showNotification, 14000);
};