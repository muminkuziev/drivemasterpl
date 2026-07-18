export interface RoadSignCategory {
  key: string;
  icon: string;
  label: string;
  count: number;
}

export interface RoadSign {
  id: string;
  code: string | null;
  namePl: string | null;
  nameUz: string;
  nameRu: string | null;
  nameEn: string | null;
  descriptionUz: string | null;
  descriptionRu: string | null;
  descriptionEn: string | null;
  imageUrl: string | null;
}

export interface RoadSignDetail extends RoadSign {
  category: string;
  actionUz: string;
  actionRu: string | null;
  actionEn: string | null;
}

import { getInitData, getTelegramId } from './telegram';

export function authHeaders(): Record<string, string> {
  const initData = getInitData();
  return initData ? { 'X-Telegram-Init-Data': initData } : {};
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: authHeaders() });
  if (!res.ok) throw new Error(`API xatosi: ${res.status}`);
  return res.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API xatosi: ${res.status}`);
  return res.json() as Promise<T>;
}

export function fetchRoadSignCategories() {
  return getJson<RoadSignCategory[]>('/api/road-signs/categories');
}

export function fetchRoadSignsByCategory(category: string) {
  return getJson<RoadSign[]>(`/api/road-signs/${category}`);
}

export function fetchRoadSign(id: string) {
  return getJson<RoadSignDetail>(`/api/road-signs/sign/${id}`);
}

// ---------- WORD markazlari ----------

export interface WordCenterVoivodeship {
  voivodeship: string;
  label: string;
  count: number;
}

export interface WordCenter {
  id: string;
  name: string;
  city: string;
  address: string;
  website: string | null;
}

export function fetchWordCenterVoivodeships() {
  return getJson<WordCenterVoivodeship[]>('/api/word-centers/voivodeships');
}

export function fetchWordCentersByVoivodeship(voivodeship: string) {
  return getJson<WordCenter[]>(`/api/word-centers/${encodeURIComponent(voivodeship)}`);
}

// ---------- Teoriya ----------

export interface TheoryOption {
  id: string;
  textPl: string;
  textUz: string;
  textRu: string | null;
  textEn: string | null;
}

export interface TheoryQuestion {
  id: string;
  textPl: string;
  textUz: string;
  textRu: string | null;
  textEn: string | null;
  category: string;
  mediaType: string | null;
  imageUrl: string | null;
  options: TheoryOption[];
}

export interface TheoryCategory {
  category: string;
  count: number;
}

export function fetchTheoryCategories(type: 'text' | 'photo' | 'video') {
  return getJson<TheoryCategory[]>(`/api/theory/categories?type=${type}`);
}

export function fetchRandomTheoryQuestion(type: 'text' | 'photo' | 'video', category?: string) {
  const q = category ? `&category=${encodeURIComponent(category)}` : '';
  return getJson<TheoryQuestion>(
    `/api/theory/random?type=${type}&telegramId=${encodeURIComponent(getTelegramId())}${q}`,
  );
}

export function submitTheoryAnswer(questionId: string, optionId: string) {
  return postJson<{ isCorrect: boolean; correctOption: TheoryOption | null }>(
    '/api/theory/answer',
    { questionId, optionId },
  );
}

// ---------- Reaksiya testi ----------

export function reactionStart(telegramId: string, deviceId: string) {
  return postJson<{ status: string; delay: number; testId: string }>('/api/reaction/start', {
    telegramId,
    deviceId,
  });
}

export function reactionResult(telegramId: string, reactionTimeMs: number, deviceId: string) {
  return postJson<{ status: string; reactionTimeMs: number; score: number }>(
    '/api/reaction/result',
    { telegramId, reactionTimeMs, deviceId },
  );
}

// ---------- Diqqat testi ----------

export function attentionStart(telegramId: string, deviceId: string) {
  return postJson<{ status: string; patternId: number; testId: string }>('/api/attention/start', {
    telegramId,
    deviceId,
  });
}

export function attentionClick(telegramId: string, isCorrect: boolean) {
  return postJson<{ status: string; totalClicks: number; correctClicks: number }>(
    '/api/attention/click',
    { telegramId, isCorrect },
  );
}

export function attentionFinish(telegramId: string) {
  return postJson<{ status: string; accuracyPercent: number; mistakes: number }>(
    '/api/attention/finish',
    { telegramId },
  );
}

// ---------- Koordinatsiya testi ----------

export function coordinationStart(telegramId: string, deviceId: string) {
  return postJson<{ status: string; pathId: number; testId: string }>('/api/coordination/start', {
    telegramId,
    deviceId,
  });
}

export function coordinationMove(telegramId: string, outOfLine: boolean) {
  return postJson<{ status: string; moves: number; outOfLineTime: number }>(
    '/api/coordination/move',
    { telegramId, outOfLine },
  );
}

export function coordinationFinish(telegramId: string) {
  return postJson<{ status: string; coordinationScore: number; outOfLineTime: number }>(
    '/api/coordination/finish',
    { telegramId },
  );
}

// ---------- Ko'p-turli testlar (Piorkowski, Krzyzowy, Signal) ----------

export type MultiRoundTestType = 'piorkowski' | 'krzyzowy' | 'signal';

export function multiRoundStart(testType: MultiRoundTestType, telegramId: string, deviceId: string) {
  return postJson<{ status: string; testId: string }>(`/api/${testType}/start`, {
    telegramId,
    deviceId,
  });
}

export function multiRoundAddRound(
  testType: MultiRoundTestType,
  telegramId: string,
  isCorrect: boolean,
  reactionTimeMs: number,
) {
  return postJson<{ status: string; roundNumber: number }>(`/api/${testType}/round`, {
    telegramId,
    isCorrect,
    reactionTimeMs,
  });
}

export function multiRoundFinish(testType: MultiRoundTestType, telegramId: string) {
  return postJson<{ status: string; score: number; rounds: number; correctRounds: number }>(
    `/api/${testType}/finish`,
    { telegramId },
  );
}

// ---------- Profil ----------

export interface UserProfile {
  telegramId: string;
  isPremium: boolean;
  premiumSince: string | null;
  createdAt: string;
  premiumPriceGrosz: number;
  blikPhone: string | null;
}

export function fetchProfile(telegramId: string) {
  return getJson<UserProfile>(`/api/profile?telegramId=${encodeURIComponent(telegramId)}`);
}

// ---------- Premium so'rovi ----------

export interface PaymentStatus {
  id: string;
  status: string;
  senderPhone: string | null;
  createdAt: string;
}

export function requestPremium(telegramId: string, phone: string) {
  return postJson<PaymentStatus>('/api/payments/request-premium', { telegramId, phone });
}

export function fetchPaymentStatus(telegramId: string) {
  return getJson<PaymentStatus | null>(`/api/payments/my-status?telegramId=${encodeURIComponent(telegramId)}`);
}

// ---------- AI Tarjimon ----------

export interface TranslatorUsage {
  isPremium: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export interface TranslateResult {
  originalText: string;
  detectedLang: string;
  translatedText: string;
  targetLang: string;
  audioBase64: string;
}

export function fetchTranslatorUsage(telegramId: string) {
  return getJson<TranslatorUsage>(`/api/translator/usage?telegramId=${encodeURIComponent(telegramId)}`);
}

/** Limit tugagan yoki funksiya o'chirilgan holatlarni backend `code`si bilan aniqlash uchun. */
export class TranslatorLimitError extends Error {
  code: string;
  limit?: number;
  constructor(code: string, limit?: number) {
    super(code);
    this.code = code;
    this.limit = limit;
  }
}

export async function translateVoice(
  telegramId: string,
  audioBase64: string,
  mimeType: string,
  passengerLanguage: string,
): Promise<TranslateResult> {
  const res = await fetch('/api/translator/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ telegramId, audioBase64, mimeType, passengerLanguage }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { code?: string; limit?: number } | null;
    if (data?.code) throw new TranslatorLimitError(data.code, data.limit);
    throw new Error(`API xatosi: ${res.status}`);
  }
  return res.json() as Promise<TranslateResult>;
}
