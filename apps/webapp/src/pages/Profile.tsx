import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPaymentStatus, fetchProfile, requestPremium } from '../api';
import type { PaymentStatus, UserProfile } from '../api';
import { getTelegramDisplayName, getTelegramId, haptic } from '../telegram';
import { useTranslation, type Locale } from '../i18n/LocaleContext';

const MONTHS: Record<Locale, string[]> = {
  uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

const LANGUAGES: { key: Locale; label: string }[] = [
  { key: 'uz', label: "O'zbekcha" },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' },
];

function formatDate(iso: string, locale: Locale) {
  const d = new Date(iso);
  return `${d.getDate()}-${MONTHS[locale][d.getMonth()]}, ${d.getFullYear()}`;
}

export function Profile() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile(getTelegramId()).then(setProfile);
    fetchPaymentStatus(getTelegramId()).then(setPaymentStatus);
  }, []);

  async function submitPremiumRequest() {
    if (!phone.trim() || submitting) return;
    setSubmitting(true);
    haptic('light');
    try {
      const status = await requestPremium(getTelegramId(), phone.trim());
      setPaymentStatus(status);
      setShowBuyForm(false);
    } finally {
      setSubmitting(false);
    }
  }

  const name = getTelegramDisplayName() ?? t('profile.guest');
  const initial = name.replace('@', '').charAt(0).toUpperCase() || 'M';
  const currentLangLabel = LANGUAGES.find((l) => l.key === locale)?.label ?? '';

  return (
    <div className="flex-1 flex flex-col dm-enter">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xl px-1"
          style={{ color: 'var(--dm-text)' }}
        >
          ‹
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--dm-text)' }}>
          👤 {t('profile.title')}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-4">
        <div
          className="flex flex-col items-center gap-3 rounded-2xl px-4 py-6"
          style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)', boxShadow: 'var(--dm-shadow)' }}
        >
          <div
            className="flex items-center justify-center rounded-full font-bold"
            style={{
              width: 64,
              height: 64,
              fontSize: 26,
              background: 'linear-gradient(145deg, var(--dm-bg-elevated), var(--dm-bg))',
              border: '2px solid var(--dm-gold)',
              color: 'var(--dm-gold)',
            }}
          >
            {initial}
          </div>
          <p className="font-semibold text-lg" style={{ color: 'var(--dm-text)' }}>
            {name}
          </p>
          {profile && (
            <span
              className="text-xs font-bold rounded-full px-3 py-1"
              style={{
                background: profile.isPremium ? 'var(--dm-gold)' : 'var(--dm-border)',
                color: profile.isPremium ? 'var(--dm-bg)' : 'var(--dm-text-muted)',
              }}
            >
              {profile.isPremium ? t('profile.premium') : t('profile.free')}
            </span>
          )}
        </div>

        {profile && !profile.isPremium && paymentStatus?.status === 'pending' && (
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)' , boxShadow: 'var(--dm-shadow)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--dm-gold)' }}>
              ⏳ {t('profile.buyPremiumPending')}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--dm-text-muted)' }}>
              {t('profile.buyPremiumPendingSubtitle')}
            </p>
          </div>
        )}

        {profile && !profile.isPremium && paymentStatus?.status !== 'pending' && !showBuyForm && (
          <button
            type="button"
            onClick={() => {
              haptic('light');
              setShowBuyForm(true);
            }}
            className="dm-press flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
            style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)' , boxShadow: 'var(--dm-shadow)' }}
          >
            <span
              className="flex items-center justify-center rounded-xl shrink-0"
              style={{ width: 48, height: 48, background: 'var(--dm-bg-elevated)', fontSize: 24 }}
            >
              💳
            </span>
            <span className="flex-1">
              <span className="block font-semibold" style={{ color: 'var(--dm-text)' }}>
                {t('profile.buyPremiumTitle')}
              </span>
              <span className="block text-sm" style={{ color: 'var(--dm-text-muted)' }}>
                {t('profile.buyPremiumSubtitle')}
              </span>
            </span>
          </button>
        )}

        {profile && !profile.isPremium && showBuyForm && (
          <div
            className="rounded-2xl px-4 py-4 flex flex-col gap-3"
            style={{ background: 'var(--dm-card)', border: '1.5px solid var(--dm-gold)' , boxShadow: 'var(--dm-shadow)' }}
          >
            <p className="text-sm whitespace-pre-line" style={{ color: 'var(--dm-text)' }}>
              {t('profile.buyPremiumFeatures')}
            </p>
            <p className="text-sm" style={{ color: 'var(--dm-text)' }}>
              {t('profile.buyPremiumInstructions', {
                amount: (profile.premiumPriceGrosz / 100).toFixed(0),
                phone: profile.blikPhone ?? '—',
              })}
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('profile.buyPremiumPhonePlaceholder')}
              className="rounded-xl px-3 py-2.5"
              style={{ background: 'var(--dm-bg-elevated)', border: '1px solid var(--dm-border)', color: 'var(--dm-text)' }}
            />
            <button
              type="button"
              disabled={!phone.trim() || submitting}
              onClick={submitPremiumRequest}
              className="rounded-xl px-4 py-3 font-bold"
              style={{
                background: phone.trim() ? 'var(--dm-gold)' : 'var(--dm-border)',
                color: phone.trim() ? 'var(--dm-bg)' : '#4a5372',
              }}
            >
              {t('profile.buyPremiumSubmit')}
            </button>
          </div>
        )}

        {profile && (
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)' , boxShadow: 'var(--dm-shadow)' }}
          >
            <p className="text-xs" style={{ color: 'var(--dm-text-muted)' }}>
              {t('profile.registeredOn', { date: formatDate(profile.createdAt, locale) })}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            haptic('light');
            setShowLangPicker((v) => !v);
          }}
          className="dm-press flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
          style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)' , boxShadow: 'var(--dm-shadow)' }}
        >
          <span
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 48, height: 48, background: 'var(--dm-bg-elevated)', fontSize: 24 }}
          >
            🌐
          </span>
          <span className="flex-1">
            <span className="block font-semibold" style={{ color: 'var(--dm-text)' }}>
              {t('profile.language')}
            </span>
            <span className="block text-sm" style={{ color: 'var(--dm-text-muted)' }}>
              {currentLangLabel}
            </span>
          </span>
          <span style={{ color: 'var(--dm-gold)' }}>{showLangPicker ? '⌄' : '›'}</span>
        </button>

        {showLangPicker && (
          <div className="flex flex-col gap-2 -mt-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => {
                  haptic('light');
                  setLocale(lang.key);
                  setShowLangPicker(false);
                }}
                className="rounded-xl px-4 py-3 text-left font-medium"
                style={{
                  background: locale === lang.key ? 'var(--dm-gold)' : 'var(--dm-bg-elevated)',
                  color: locale === lang.key ? 'var(--dm-bg)' : 'var(--dm-text)',
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/feedback')}
          className="dm-press flex items-center gap-4 rounded-2xl px-4 py-4 text-left"
          style={{ background: 'var(--dm-card)', border: '1px solid var(--dm-border)' , boxShadow: 'var(--dm-shadow)' }}
        >
          <span
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 48, height: 48, background: 'var(--dm-bg-elevated)', fontSize: 24 }}
          >
            💬
          </span>
          <span className="flex-1 font-semibold" style={{ color: 'var(--dm-text)' }}>
            {t('profile.feedback')}
          </span>
          <span style={{ color: 'var(--dm-gold)' }}>›</span>
        </button>

        <div className="flex justify-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => navigate('/legal/terms')}
            className="text-xs underline"
            style={{ color: 'var(--dm-text-muted)' }}
          >
            {t('profile.terms')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/legal/privacy')}
            className="text-xs underline"
            style={{ color: 'var(--dm-text-muted)' }}
          >
            {t('profile.privacy')}
          </button>
        </div>
      </div>
    </div>
  );
}
