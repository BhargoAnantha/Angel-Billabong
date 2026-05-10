/**
 * weatherService.js
 *
 * Strategi pengambilan data:
 * - Fetch dari Open-Meteo API hanya sekali sehari pada jam 06:00
 * - Data disimpan di localStorage dengan timestamp
 * - Di luar jam fetch, cuaca per jam diprediksi menggunakan Markov Chain
 *   berdasarkan data real yang sudah di-cache
 *
 * Open-Meteo: https://open-meteo.com/
 * - Gratis, tanpa API key
 * - Mendukung koordinat custom (Sanur, Nusa Penida, dll.)
 */

// ─── Koordinat Lokasi ────────────────────────────────────────────────────────

const LOCATIONS = {
  'Sanur':       { lat: -8.6978, lon: 115.2630 },
  'Nusa Penida': { lat: -8.7278, lon: 115.5444 },
  'Padang Bai':  { lat: -8.5339, lon: 115.5101 },
  'Kusamba':     { lat: -8.5889, lon: 115.4472 },
};

const DEFAULT_LOCATION = LOCATIONS['Sanur'];

// ─── Markov Matrices (per musim) ─────────────────────────────────────────────
// State: 0 = Sunny, 1 = Cloudy, 2 = Rainy
// P[i][j] = probabilitas dari state i ke state j

const MARKOV_MATRICES = {
  rainy: [
    [0.839559, 0.135823, 0.024618],
    [0.130890, 0.678883, 0.190227],
    [0.025105, 0.182427, 0.792469],
  ],
  transition: [
    [0.871912, 0.103385, 0.024703],
    [0.190476, 0.691244, 0.118280],
    [0.048387, 0.223118, 0.728495],
  ],
  dry: [
    [0.829154, 0.108934, 0.061912],
    [0.177108, 0.762651, 0.060241],
    [0.094286, 0.087143, 0.818571],
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSeason(month) {
  if ([11, 12, 1, 2, 3].includes(month)) return 'rainy';
  if ([6, 7, 8, 9].includes(month)) return 'dry';
  return 'transition';
}

/**
 * Konversi WMO weather code dari Open-Meteo ke state Markov
 * https://open-meteo.com/en/docs#weathervariables
 * 0        = Clear sky          → Sunny
 * 1,2      = Mainly/Partly cloud → Cloudy
 * 3        = Overcast            → Cloudy
 * 45,48    = Fog                 → Cloudy
 * 51–67    = Drizzle/Rain        → Rainy
 * 71–77    = Snow (unlikely Bali) → Rainy
 * 80–82    = Rain showers        → Rainy
 * 85–86    = Snow showers        → Rainy
 * 95–99    = Thunderstorm        → Rainy
 */
function wmoCodeToState(code) {
  if (code === 0) return 0;                          // Sunny
  if (code <= 3 || code === 45 || code === 48) return 1; // Cloudy
  return 2;                                           // Rainy
}

function stateToLabel(state) {
  return ['Sunny', 'Cloudy', 'Rainy'][state] ?? 'Sunny';
}

/**
 * Multiply state vector by Markov matrix for N steps
 * @param {number[]} initialState - [pSunny, pCloudy, pRainy]
 * @param {number[][]} matrix
 * @param {number} steps
 * @returns {number[]} - resulting probability vector
 */
function markovPropagate(initialState, matrix, steps) {
  let state = [...initialState];
  for (let i = 0; i < steps; i++) {
    const next = [0, 0, 0];
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        next[j] += state[k] * matrix[k][j];
      }
    }
    state = next;
  }
  return state;
}

/**
 * Ambil state dominan dari probability vector
 * @param {number[]} probVector
 * @returns {{ sunny: number, cloudy: number, rainy: number, status: string, prob: number }}
 */
function probVectorToResult(probVector) {
  const [s, c, r] = probVector;
  const sunny  = Math.round(s * 100);
  const cloudy = Math.round(c * 100);
  const rainy  = Math.round(r * 100);

  let status = 'Sunny';
  let prob = sunny;
  if (cloudy > prob) { status = 'Cloudy'; prob = cloudy; }
  if (rainy > prob)  { status = 'Rainy';  prob = rainy;  }

  return { sunny, cloudy, rainy, status, prob };
}

// ─── Cache (localStorage) ────────────────────────────────────────────────────

const CACHE_KEY = 'weather_cache_v1';

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage mungkin penuh atau disabled — abaikan
  }
}

/**
 * Cek apakah cache masih valid:
 * - Harus dari hari yang sama
 * - Harus di-fetch pada jam 06:00 atau setelahnya
 * - Belum lewat jam 06:00 hari berikutnya (artinya belum waktunya refresh)
 */
function isCacheValid(cache, nowDate) {
  if (!cache?.fetchedAt || !cache?.date) return false;

  const fetchedAt = new Date(cache.fetchedAt);
  const todayStr  = toDateString(nowDate);

  // Cache harus dari hari ini
  if (cache.date !== todayStr) return false;

  // Cache harus diambil pada jam >= 06:00
  if (fetchedAt.getHours() < 6) return false;

  return true;
}

function toDateString(date) {
  return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
}

// ─── Open-Meteo Fetch ─────────────────────────────────────────────────────────

/**
 * Fetch data cuaca hari ini dari Open-Meteo
 * Mengambil hourly weather code untuk 24 jam
 */
async function fetchFromOpenMeteo(lat, lon, dateStr) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude',   lat);
  url.searchParams.set('longitude',  lon);
  // 'weather_code' adalah nama baru — 'weathercode' sudah deprecated dan ditolak API
  url.searchParams.set('hourly',     'weather_code');
  url.searchParams.set('timezone',   'Asia/Makassar'); // WITA (Bali)
  // start_date + end_date TIDAK boleh dikombinasikan dengan forecast_days
  url.searchParams.set('start_date', dateStr);
  url.searchParams.set('end_date',   dateStr);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Open-Meteo error: ${response.status} — ${errText}`);
  }
  return response.json();
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * getWeatherForTrip
 *
 * Entry point utama. Dipanggil dari komponen React.
 *
 * @param {string} dateStr - "YYYY-MM-DD" tanggal perjalanan
 * @param {string} locationName - nama lokasi (harus ada di LOCATIONS atau pakai default)
 * @returns {Promise<{
 *   sunny: number,
 *   cloudy: number,
 *   rainy: number,
 *   status: string,
 *   prob: number,
 *   source: 'api' | 'cache' | 'markov',
 *   fetchedAt: string | null
 * }>}
 */
// Batas maksimum forecast Open-Meteo (hari)
const OPEN_METEO_MAX_FORECAST_DAYS = 16;

export async function getWeatherForTrip(dateStr, locationName = 'Sanur') {
  const now      = new Date();
  const todayStr = toDateString(now);
  const isFuture = dateStr > todayStr;
  const isToday  = dateStr === todayStr;
  const month    = new Date(dateStr).getMonth() + 1;
  const season   = getSeason(month);
  const matrix   = MARKOV_MATRICES[season];

  // ── KASUS 1: Tanggal di masa depan ──────────────────────────────────────
  if (isFuture) {
    const daysAhead = Math.ceil(
      (new Date(dateStr) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
    );

    // Open-Meteo hanya support max 16 hari ke depan.
    // Jika lebih dari itu → gunakan Markov murni (tidak ada fetch API)
    if (daysAhead > OPEN_METEO_MAX_FORECAST_DAYS) {
      // Untuk tanggal jauh: propagate sesuai musim, steps = daysAhead (per-hari)
      // Agar berbeda antar bulan tapi stabil (tidak konvergen ke satu angka)
      const steps      = Math.min(daysAhead, 30); // cap 30 agar tidak terlalu konvergen
      const probVector = markovPropagate([1, 0, 0], matrix, steps);
      return {
        ...probVectorToResult(probVector),
        source: 'markov',
        fetchedAt: null,
      };
    }

    // Dalam range 16 hari → bisa fetch dari API (akan dilakukan di kasus hari ini
    // atau di forceRefresh). Untuk now, kembalikan Markov dulu sebagai estimasi awal.
    const steps      = Math.max(daysAhead * 8, 5); // 8 step per hari = lebih smooth
    const probVector = markovPropagate([1, 0, 0], matrix, steps);
    return {
      ...probVectorToResult(probVector),
      source: 'markov',
      fetchedAt: null,
    };
  }

  // ── KASUS 2: Hari ini ────────────────────────────────────────────────────
  if (isToday) {
    const currentHour = now.getHours();
    const cache       = getCache();

    // Sub-kasus A: Jam 06:00 ke atas — coba gunakan cache atau fetch baru
    if (currentHour >= 6) {
      // Cache masih valid → pakai cache
      if (isCacheValid(cache, now)) {
        return buildResultFromCache(cache, now, matrix);
      }

      // Cache tidak valid → fetch dari API
      try {
        const loc    = LOCATIONS[locationName] ?? DEFAULT_LOCATION;
        const apiData = await fetchFromOpenMeteo(loc.lat, loc.lon, dateStr);
        const hourlyStates = parseHourlyStates(apiData);

        const newCache = {
          date:         dateStr,
          fetchedAt:    now.toISOString(),
          hourlyStates, // array 24 elemen, index = jam (0-23)
          location:     locationName,
        };
        setCache(newCache);

        return buildResultFromCache(newCache, now, matrix);
      } catch (err) {
        console.warn('[weatherService] API fetch failed, fallback to Markov:', err);
        // Fallback: Markov dari initial state
        const probVector = markovPropagate([1, 0, 0], matrix, currentHour || 1);
        return {
          ...probVectorToResult(probVector),
          source: 'markov',
          fetchedAt: null,
        };
      }
    }

    // Sub-kasus B: Sebelum jam 06:00 — belum waktunya fetch
    // Gunakan Markov murni (initial state Sunny, propagate sejumlah jam berjalan)
    const probVector = markovPropagate([1, 0, 0], matrix, Math.max(currentHour, 1));
    return {
      ...probVectorToResult(probVector),
      source: 'markov',
      fetchedAt: null,
    };
  }

  // ── KASUS 3: Tanggal lampau ──────────────────────────────────────────────
  // Coba cek cache (mungkin masih ada untuk hari kemarin), fallback Markov
  const cache = getCache();
  if (cache?.date === dateStr) {
    return buildResultFromCache(cache, new Date(`${dateStr}T23:59:59`), matrix);
  }

  const probVector = markovPropagate([1, 0, 0], matrix, 5);
  return {
    ...probVectorToResult(probVector),
    source: 'markov',
    fetchedAt: null,
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Parse respons Open-Meteo → array 24 state (0=Sunny, 1=Cloudy, 2=Rainy)
 */
function parseHourlyStates(apiData) {
  // Open-Meteo v1 mengembalikan key 'weather_code' (bukan 'weathercode' yang sudah deprecated)
  const codes = apiData?.hourly?.weather_code ?? [];
  return Array.from({ length: 24 }, (_, h) => wmoCodeToState(codes[h] ?? 0));
}

/**
 * Dari data cache (hourly states), hitung probabilitas untuk jam saat ini
 * menggunakan Markov untuk jam-jam berikutnya
 */
function buildResultFromCache(cache, now, matrix) {
  const currentHour          = now.getHours();
  const hourlyStates         = cache.hourlyStates ?? [];

  // State observed dari API untuk jam saat ini
  const observedState        = hourlyStates[currentHour] ?? 0;

  // Propagate 1 langkah → distribusi probabilitas jam berikutnya
  // Sumber tunggal untuk sunny/cloudy/rainy/status/prob → tidak ada inkonsistensi
  const initialProb          = [0, 0, 0];
  initialProb[observedState] = 1;
  const probVector           = markovPropagate(initialProb, matrix, 1);
  const result               = probVectorToResult(probVector);

  return {
    sunny:            Math.round(probVector[0] * 100),
    cloudy:           Math.round(probVector[1] * 100),
    rainy:            Math.round(probVector[2] * 100),
    status:           result.status,
    prob:             result.prob,
    source:           'cache',
    fetchedAt:        cache.fetchedAt,
    hourlyStates,
    currentHourState: observedState,
  };
}

/**
 * Paksa refresh cache (untuk tombol manual refresh jika diperlukan)
 */
export async function forceRefreshWeather(locationName = 'Sanur', dateStr = null) {
  const now       = new Date();
  const todayStr  = toDateString(now);
  const target    = dateStr ?? todayStr;

  // Cek apakah tanggal masih dalam jangkauan API Open-Meteo (max 16 hari)
  const daysAhead = Math.ceil(
    (new Date(target) - new Date(todayStr)) / (1000 * 60 * 60 * 24)
  );

  if (daysAhead > OPEN_METEO_MAX_FORECAST_DAYS) {
    // Tanggal terlalu jauh — API tidak support, tidak ada cache yang perlu disimpan
    throw new Error(
      `Tanggal ${target} melebihi batas prakiraan API (max ${OPEN_METEO_MAX_FORECAST_DAYS} hari). ` +
      `Prediksi menggunakan model Markov Chain.`
    );
  }

  const loc          = LOCATIONS[locationName] ?? DEFAULT_LOCATION;
  const apiData      = await fetchFromOpenMeteo(loc.lat, loc.lon, target);
  const hourlyStates = parseHourlyStates(apiData);

  const newCache = {
    date:      target,
    fetchedAt: now.toISOString(),
    hourlyStates,
    location:  locationName,
  };
  setCache(newCache);
  return newCache;
}

/**
 * getWeatherForHour
 *
 * Prediksi cuaca untuk jam spesifik pada tanggal tertentu.
 * Digunakan untuk badge cuaca di tiap card transport.
 *
 * Cara kerja:
 * - Jika ada hourlyStates dari cache/API → ambil state langsung untuk jam tsb
 * - Jika tidak ada (tanggal masa depan / sebelum jam 6) → Markov dari initial state
 *   dengan steps = selisih jam dari sekarang ke jam target
 *
 * @param {string} dateStr   - "YYYY-MM-DD"
 * @param {string} timeStr   - "HH:MM" (format 24 jam, e.g. "07:30")
 * @param {string} locationName
 * @returns {{ status: string, prob: number, icon: 'sunny'|'cloudy'|'rainy' }}
 */
export function getWeatherForHour(dateStr, timeStr, locationName = 'Sanur') {
  const tripHour = parseInt(timeStr?.split(':')[0] ?? '8', 10);
  const now      = new Date();
  const todayStr = toDateString(now);
  const month    = new Date(dateStr).getMonth() + 1;
  const season   = getSeason(month);
  const matrix   = MARKOV_MATRICES[season];
  const iconMap  = { Sunny: 'sunny', Cloudy: 'cloudy', Rainy: 'rainy' };

  // ── Kasus 1: Ada hourlyStates dari cache untuk tanggal ini ────────────────
  // State sudah diketahui per jam dari data API — langsung pakai, tidak perlu Markov
  const cache = getCache();
  if (cache?.date === dateStr && Array.isArray(cache.hourlyStates)) {
    const state       = cache.hourlyStates[tripHour] ?? 0;
    const status      = stateToLabel(state);

    // Propagate 1 langkah dari state ini untuk mendapat distribusi probabilitas
    // (bukan 100% hardcode — menunjukkan "seberapa yakin" state ini bertahan)
    const initialProb    = [0, 0, 0];
    initialProb[state]   = 1;
    const probVector     = markovPropagate(initialProb, matrix, 1);

    // Ambil probabilitas untuk state yang terobservasi (bukan dominant dari probVector)
    // sehingga Sunny punya prob berbeda dari Cloudy
    const probForThisState = Math.round(probVector[state] * 100);

    return {
      status,
      prob: probForThisState,
      icon: iconMap[status] ?? 'sunny',
    };
  }

  // ── Kasus 2: Tidak ada cache → Markov murni ───────────────────────────────
  // Setiap jam diprediksi dari initial state [Sunny=1] dengan steps = tripHour
  // Ini membuat setiap jam punya distribusi berbeda (semakin siang → makin menyebar)
  // Steps minimal 1 agar tidak identik semua
  const steps      = Math.max(tripHour, 1);
  const probVector = markovPropagate([1, 0, 0], matrix, steps);
  const result     = probVectorToResult(probVector);

  return {
    status: result.status,
    prob:   result.prob,
    icon:   iconMap[result.status] ?? 'sunny',
  };
}

/**
 * Ambil info cache saat ini (untuk debugging / UI info)
 */
export function getCacheInfo() {
  const cache = getCache();
  if (!cache) return null;
  return {
    date:      cache.date,
    fetchedAt: cache.fetchedAt,
    location:  cache.location,
    valid:     isCacheValid(cache, new Date()),
  };
}