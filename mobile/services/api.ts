import { API_URL, API_TIMEOUT } from '../config';

// ── Types ───────────────────────────────────────────────
export interface PriceData {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface PriceSchedule {
  time: string;
  prices: PriceData;
}

export interface AuditConfig {
  time: string;
}

// ── Helper ──────────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetchWithTimeout(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json();
}

// ── Health ──────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const data = await apiRequest<{ status: string }>('/health', {
      method: 'GET',
    });
    return data.status === 'ok';
  } catch {
    return false;
  }
}

// ── Price Schedules ─────────────────────────────────────
export async function getSchedules(): Promise<PriceSchedule[]> {
  return apiRequest<PriceSchedule[]>('/price/schedules', {
    method: 'GET',
  });
}

export async function addSchedule(data: PriceSchedule): Promise<{ message: string; data: PriceSchedule[] }> {
  return apiRequest('/price/schedule', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteSchedule(time: string): Promise<{ message: string; data: PriceSchedule[] }> {
  return apiRequest('/price/schedule', {
    method: 'DELETE',
    body: JSON.stringify({ time }),
  });
}

// ── Night Audit ─────────────────────────────────────────
export async function getAuditTime(): Promise<AuditConfig> {
  return apiRequest<AuditConfig>('/audit/time', {
    method: 'GET',
  });
}

export async function setAuditTime(time: string): Promise<{ message: string }> {
  return apiRequest('/audit/time', {
    method: 'POST',
    body: JSON.stringify({ time }),
  });
}

export async function deleteAuditTime(): Promise<{ message: string }> {
  return apiRequest('/audit/time', {
    method: 'DELETE',
  });
}

// ── Device Registration ─────────────────────────────────
export async function registerDevice(token: string): Promise<{ status: string }> {
  return apiRequest('/register-device', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
