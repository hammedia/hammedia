/* HAM travel ocean: MET Norway forecast adapter (no geolocation or persistence).
 * Data: MET Norway, CC BY 4.0. UI must credit the source, link the license,
 * describe the scene as a forecast-based artistic rendering, and disclose the
 * direct request's IP/rounded-coordinate transmission before location consent.
 * https://docs.api.met.no/doc/TermsOfService.html
 * https://docs.api.met.no/doc/WebClients.html
 */
(() => {
  'use strict';

  const ENDPOINT = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
  const SOURCE_URL = 'https://docs.api.met.no/doc/locationforecast/Locationforecast.html';
  const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const TIMEOUT = 10 * 1000;
  // A missing/malformed/already-expired Expires is not a reason to hammer the API.
  // Thirty minutes is a conservative fallback relative to hourly/6-hourly model
  // updates. Data coverage is still checked on every read; stale data never show.
  const FALLBACK_TTL = 30 * MINUTE;
  const FAILURE_TTL = MINUTE;
  const MAX_LOCATIONS = 16;
  const MAX_PENDING = 3;
  const cache = new Map();
  let pendingCount = 0;
  let blockedUntil = 0;

  function failure(code, message, retryAt) {
    const error = new Error(message);
    error.name = 'HamOceanWeatherError';
    error.code = code;
    if (retryAt) error.retryAt = new Date(retryAt).toISOString();
    return error;
  }

  function coordinates(input) {
    const lat = input && input.lat;
    const lon = input && input.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) ||
        lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw failure('INVALID_COORDINATES', '날씨를 불러올 위치가 올바르지 않습니다');
    }
    // Round before constructing either the cache key or the request. Never retain
    // the original precision, and canonicalize negative zero for deduplication.
    const rounded = value => (Math.round(value * 100) / 100 || 0).toFixed(2);
    return { lat: rounded(lat), lon: rounded(lon) };
  }

  function timeOf(value) {
    return typeof value === 'string' ? Date.parse(value) : NaN;
  }

  function periodFor(data) {
    for (const hours of [1, 6, 12]) {
      const period = data && data['next_' + hours + '_hours'];
      if (period && period.details && Number.isFinite(period.details.precipitation_amount) &&
          period.details.precipitation_amount >= 0 && period.summary &&
          typeof period.summary.symbol_code === 'string') {
        return { hours, amount: period.details.precipitation_amount, symbol: period.summary.symbol_code };
      }
    }
    return null;
  }

  function description(symbol) {
    const base = symbol.replace(/_(day|night|polartwilight)$/, '');
    const simple = {
      clearsky: '맑음 예보', fair: '대체로 맑음 예보',
      partlycloudy: '구름 조금 예보', cloudy: '흐림 예보', fog: '안개 예보'
    };
    if (simple[base]) return simple[base];
    let label;
    if (base.includes('sleet')) label = '진눈깨비';
    else if (base.includes('snow')) label = '눈';
    else if (base.includes('rain')) label = '비';
    else return '날씨 예보';
    if (base.startsWith('light')) label = '약한 ' + label;
    if (base.startsWith('heavy')) label = '강한 ' + label;
    if (base.includes('showers')) label += ' 소나기';
    if (base.includes('thunder')) label += '·천둥';
    return label + ' 예보';
  }

  function normalize(document, now, expiresAt) {
    const properties = document && document.properties;
    const updated = timeOf(properties && properties.meta && properties.meta.updated_at);
    const series = properties && properties.timeseries;
    if (!Number.isFinite(updated) || !Array.isArray(series) || !series.length) {
      throw failure('INVALID_DATA', '예보 데이터 형식을 확인할 수 없습니다');
    }
    const entries = series.map(entry => ({ entry, time: timeOf(entry && entry.time) }))
      .filter(item => Number.isFinite(item.time)).sort((a, b) => a.time - b.time);
    if (!entries.length) throw failure('INVALID_DATA', '예보 시각을 확인할 수 없습니다');
    const first = entries[0];
    const last = entries[entries.length - 1];
    const tail = periodFor(last.entry.data);
    const coverageEnd = last.time + (tail ? tail.hours * HOUR : 0);
    const coversNow = entries.some(item => {
      const period = periodFor(item.entry.data);
      return item.time === now || (period && item.time <= now && now < item.time + period.hours * HOUR);
    });
    if (now < first.time || now > coverageEnd || !coversNow) {
      throw failure('STALE_FORECAST', '현재 시각에 맞는 예보가 아직 없습니다');
    }
    // Re-evaluate on every cache read. The first entry may be several hours old.
    // On exact ties prefer the earlier timestamp. Never extrapolate beyond the
    // dataset's explicitly provided forecast period.
    let chosen = first;
    for (const item of entries) {
      if (Math.abs(item.time - now) < Math.abs(chosen.time - now)) chosen = item;
    }
    const data = chosen.entry.data;
    const instant = data && data.instant && data.instant.details;
    const period = periodFor(data);
    if (!instant || !Number.isFinite(instant.air_temperature) ||
        !Number.isFinite(instant.cloud_area_fraction) || instant.cloud_area_fraction < 0 ||
        instant.cloud_area_fraction > 100 || !period || !/^[a-z_]+$/.test(period.symbol)) {
      throw failure('INCOMPLETE_FORECAST', '기온·구름·강수 예보가 충분하지 않습니다');
    }
    // Rain is an artistic 0..1 intensity, NOT precipitation probability or an
    // observed measurement: mean mm/hour divided by 4, capped at 1. Pure snow
    // forecasts do not generate rain streaks. Sleet retains precipitation motion.
    const rain = period.symbol.includes('snow') ? 0 : Math.min(1, period.amount / period.hours / 4);
    return Object.freeze({
      temperature: instant.air_temperature,
      cloudCover: instant.cloud_area_fraction / 100,
      rain,
      symbol: period.symbol,
      description: description(period.symbol),
      updatedAt: new Date(updated).toISOString(),
      forecastTime: new Date(chosen.time).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      sourceUrl: SOURCE_URL,
      licenseUrl: LICENSE_URL
    });
  }

  function getForecast(input) {
    let point;
    try { point = coordinates(input); }
    catch (error) { return Promise.reject(error); }
    const key = point.lat + ',' + point.lon;
    const now = Date.now();
    const existing = cache.get(key);
    if (existing && existing.pending) return existing.pending;
    if (existing && now < existing.expiresAt) {
      if (existing.error) return Promise.reject(existing.error);
      try { return Promise.resolve(normalize(existing.document, now, existing.expiresAt)); }
      catch (error) { return Promise.reject(error); }
    }
    if (now < blockedUntil) {
      return Promise.reject(failure('RATE_LIMITED', '예보 제공처가 요청을 제한했습니다. 잠시 후 다시 시도해 주세요', blockedUntil));
    }
    for (const [cachedKey, value] of cache) {
      if (!value.pending && now >= value.expiresAt) cache.delete(cachedKey);
    }
    // Preserve all still-fresh entries instead of eviction followed by repeated
    // network calls. These limits bound memory and simultaneous request count.
    if (cache.size >= MAX_LOCATIONS || pendingCount >= MAX_PENDING) {
      return Promise.reject(failure('BUSY', '잠시 후 다시 날씨를 불러와 주세요'));
    }
    if (typeof window.fetch !== 'function' || typeof window.AbortController !== 'function') {
      return Promise.reject(failure('UNSUPPORTED', '이 브라우저에서는 예보를 불러올 수 없습니다'));
    }
    const record = { document: null, error: null, expiresAt: 0, pending: null };
    cache.set(key, record);
    pendingCount += 1;
    const controller = new window.AbortController();
    let timer;
    const timeout = new Promise((resolve, reject) => {
      timer = window.setTimeout(() => {
        reject(failure('TIMEOUT', '예보 응답이 늦어지고 있습니다. 잠시 후 다시 시도해 주세요'));
        controller.abort();
      }, TIMEOUT);
    });
    const download = Promise.resolve().then(async () => {
      // GET + no custom headers/credentials keeps this a simple CORS request.
      // A real browser supplies the deployed HAM Origin; never spoof identity.
      // no-store prevents this module from persisting coordinates in HTTP cache.
      const response = await window.fetch(ENDPOINT + '?lat=' + point.lat + '&lon=' + point.lon, {
        method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store', signal: controller.signal
      });
      // A transport that finishes after abort must not extend a failed record's
      // cache lifetime or update the global provider cooldown.
      if (controller.signal.aborted) throw failure('TIMEOUT', '예보 응답 시간이 초과되었습니다');
      const receivedAt = Date.now();
      const expires = Date.parse(response.headers.get('Expires') || '');
      record.expiresAt = Number.isFinite(expires) && expires > receivedAt ? expires : receivedAt + FALLBACK_TTL;
      if (response.status === 429 || response.status === 403) {
        // A provider block affects all locations, not just this coordinate pair.
        blockedUntil = Math.max(record.expiresAt, receivedAt + 15 * MINUTE);
        throw failure('RATE_LIMITED', '예보 제공처가 요청을 제한했습니다. 잠시 후 다시 시도해 주세요', blockedUntil);
      }
      if (!response.ok) throw failure('HTTP_ERROR', '예보 제공처에 연결할 수 없습니다');
      if (response.status === 203) {
        throw failure('DEPRECATED_API', '예보 서비스 연결을 업데이트해야 합니다');
      }
      try { return await response.json(); }
      catch (error) {
        if (error && error.name === 'SyntaxError') {
          throw failure('INVALID_DATA', '예보 데이터 형식을 확인할 수 없습니다');
        }
        throw error;
      }
    });
    record.pending = Promise.race([download, timeout]).then(document => {
      const result = normalize(document, Date.now(), record.expiresAt);
      record.document = document;
      return result;
    }).catch(error => {
      const known = error && error.name === 'HamOceanWeatherError';
      record.error = known ? error : failure('NETWORK_ERROR', '예보를 불러오지 못했습니다. 연결 상태를 확인해 주세요');
      // No automatic retry; cache failures briefly (or to the provider's Expires)
      // so repeated UI clicks cannot create an uncontrolled retry loop.
      record.expiresAt = Math.max(record.expiresAt, Date.now() + FAILURE_TTL);
      throw record.error;
    }).finally(() => {
      window.clearTimeout(timer);
      record.pending = null;
      pendingCount -= 1;
    });
    return record.pending;
  }

  window.HamOceanWeather = Object.freeze({ getForecast });
})();
