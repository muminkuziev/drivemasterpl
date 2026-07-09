import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { haptic, getTelegramId } from '../telegram';
import { useTranslation } from '../i18n/LocaleContext';
import {
  fetchTranslatorUsage,
  translateVoice,
  TranslatorLimitError,
  type TranslatorUsage,
  type TranslateResult,
} from '../api';

const PASSENGER_LANGUAGES: { code: string; label: string }[] = [
  { code: 'pl', label: 'Polski' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'zh', label: '中文' },
];

// Brauzer/qurilmaga qarab qo'llab-quvvatlanadigan formatlar farq qiladi
// (Android odatda webm/opus, iOS ko'pincha mp4/aac) — birinchi mos kelganini tanlaymiz.
const RECORDER_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/mp4;codecs=mp4a.40.2',
];

function pickSupportedMimeType(): string {
  for (const candidate of RECORDER_MIME_CANDIDATES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(candidate)) {
      return candidate;
    }
  }
  return '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function playAudio(audioBase64: string) {
  new Audio(`data:audio/mp3;base64,${audioBase64}`).play().catch(() => {});
}

type Status = 'idle' | 'recording' | 'processing' | 'result' | 'limit' | 'error';

export function Translator() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [passengerLanguage, setPassengerLanguage] = useState('pl');
  const [status, setStatus] = useState<Status>('idle');
  const [usage, setUsage] = useState<TranslatorUsage | null>(null);
  const [result, setResult] = useState<TranslateResult | null>(null);
  const [limitCode, setLimitCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('');

  useEffect(() => {
    fetchTranslatorUsage(getTelegramId())
      .then(setUsage)
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        void handleRecordingStop();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      haptic('light');
      setStatus('recording');
    } catch {
      setErrorMessage(t('translator.micDenied'));
      setStatus('error');
    }
  }

  function stopRecording() {
    haptic('light');
    mediaRecorderRef.current?.stop();
  }

  async function handleRecordingStop() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus('processing');
    const mimeType = mimeTypeRef.current || 'audio/webm';
    const blob = new Blob(chunksRef.current, { type: mimeType });
    try {
      const audioBase64 = await blobToBase64(blob);
      const res = await translateVoice(getTelegramId(), audioBase64, mimeType, passengerLanguage);
      setResult(res);
      setStatus('result');
      playAudio(res.audioBase64);
      fetchTranslatorUsage(getTelegramId()).then(setUsage).catch(() => {});
    } catch (err) {
      if (err instanceof TranslatorLimitError) {
        setLimitCode(err.code);
        setStatus('limit');
      } else {
        setErrorMessage(t('translator.error'));
        setStatus('error');
      }
    }
  }

  function handleMicPress() {
    if (status === 'recording') {
      stopRecording();
      return;
    }
    if (status === 'processing') return;
    setResult(null);
    setErrorMessage(null);
    setLimitCode(null);
    void startRecording();
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xl px-1"
          style={{ color: '#f5f7fa' }}
        >
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#f5f7fa' }}>
          🗣 {t('translator.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-4">
        <div>
          <label className="block text-xs mb-1" style={{ color: '#9aa4bf' }}>
            {t('translator.passengerLanguage')}
          </label>
          <select
            value={passengerLanguage}
            onChange={(e) => setPassengerLanguage(e.target.value)}
            disabled={status === 'recording' || status === 'processing'}
            className="w-full rounded-xl px-3 py-3"
            style={{ background: '#1a2338', border: '1px solid #2a3350', color: '#f5f7fa' }}
          >
            {PASSENGER_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {usage && (
          <p className="text-xs text-center" style={{ color: '#9aa4bf' }}>
            {usage.isPremium
              ? t('translator.usagePremium', { remaining: usage.remaining, limit: usage.limit })
              : t('translator.usageFree', { remaining: usage.remaining, limit: usage.limit })}
          </p>
        )}

        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          {status === 'result' && result && (
            <div className="w-full flex flex-col gap-3">
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: '#1a2338', border: '1px solid #2a3350' }}
              >
                <p className="text-xs mb-1" style={{ color: '#9aa4bf' }}>
                  {result.detectedLang.toUpperCase()}
                </p>
                <p style={{ color: '#f5f7fa' }}>{result.originalText}</p>
              </div>
              <div
                className="rounded-2xl px-4 py-3"
                style={{ background: '#1a2338', border: '1.5px solid #d4af37' }}
              >
                <p className="text-xs mb-1" style={{ color: '#d4af37' }}>
                  {result.targetLang.toUpperCase()}
                </p>
                <p style={{ color: '#f5f7fa' }}>{result.translatedText}</p>
              </div>
              <button
                type="button"
                onClick={() => playAudio(result.audioBase64)}
                className="text-sm underline text-center"
                style={{ color: '#9aa4bf' }}
              >
                🔊 {t('translator.replay')}
              </button>
            </div>
          )}

          {status === 'limit' && (
            <div className="text-center flex flex-col gap-3">
              <p style={{ color: '#f5a623' }}>
                {limitCode === 'FREE_LIMIT_EXCEEDED'
                  ? t('translator.freeLimitReached')
                  : limitCode === 'DAILY_LIMIT_EXCEEDED'
                    ? t('translator.dailyLimitReached')
                    : t('translator.disabled')}
              </p>
              {limitCode === 'FREE_LIMIT_EXCEEDED' && (
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="rounded-xl px-4 py-2"
                  style={{ background: '#d4af37', color: '#0b1220' }}
                >
                  {t('translator.goPremium')}
                </button>
              )}
            </div>
          )}

          {status === 'error' && errorMessage && (
            <p className="text-center" style={{ color: '#ef4444' }}>
              {errorMessage}
            </p>
          )}

          <button
            type="button"
            disabled={status === 'processing'}
            onClick={handleMicPress}
            className="flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 88,
              height: 88,
              background: status === 'recording' ? '#ef4444' : '#d4af37',
              fontSize: 36,
              opacity: status === 'processing' ? 0.6 : 1,
            }}
          >
            {status === 'processing' ? '⏳' : status === 'recording' ? '⏹' : '🎙'}
          </button>

          <p className="text-sm text-center" style={{ color: '#9aa4bf' }}>
            {status === 'recording'
              ? t('translator.recording')
              : status === 'processing'
                ? t('translator.processing')
                : t('translator.tapToSpeak')}
          </p>
        </div>
      </div>
    </div>
  );
}
