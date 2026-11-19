"""
Converts the official Polish ministry exam-question catalog (xlsx) into
apps/api/prisma/official-catalog-b.json (category B only, main sheet only).

Source: https://www.gov.pl/web/infrastruktura/jak-uzyskac-prawo-jazdy
        ("Baza pytan na prawo jazdy", KATALOG_dla_kandydatow_na_kierowcow_*.xlsx)

Usage:  python scripts/catalog-xlsx-to-json.py <catalog.xlsx> [out.json]
Requires: openpyxl
"""
import json
import re
import sys

import openpyxl

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else 'prisma/official-catalog-b.json'

norm = lambda s: re.sub(r'\s+', ' ', str(s or '')).strip()

wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
ws = wb['katalog']  # the 'W trakcie weryfikacji' sheet (under verification) is intentionally skipped
it = ws.iter_rows(values_only=True)
head = [str(c) if c else '' for c in next(it)]


def scope_of(v):
    v = norm(v).lower()
    if v.startswith('pod'):
        return 'basic'
    if v.startswith('spec'):  # also covers the "Specajlistyczny" typo in the source
        return 'specialist'
    raise ValueError('unknown scope: %r' % v)


rows = []
for r in it:
    d = {head[i]: r[i] for i in range(min(len(head), len(r))) if head[i]}
    if not d.get('Numer pytania'):
        continue
    cats = [c.strip() for c in str(d.get('Kategorie') or '').split(',')]
    if 'B' not in cats:
        continue

    def opts(prefix, suffix=''):
        res = [norm(d.get('Odpowiedź %s%s' % (l, suffix))) for l in 'ABC']
        return [o for o in res if o]

    rows.append({
        'number': int(d['Numer pytania']),
        'pl': norm(d['Pytanie']),
        'plOpts': opts('', ''),
        'correct': norm(d['Poprawna odp']).upper(),
        'media': norm(d.get('Media')) or None,
        'scope': scope_of(d['Zakres struktury']),
        'points': int(d['Liczba punktów']),
        'en': {'q': norm(d.get('Pytanie [EN]')), 'o': opts('', ' [EN]')},
        'uk': {'q': norm(d.get('Pytanie [UA]')), 'o': opts('', ' [UA]')},
    })

with open(out, 'w', encoding='utf-8') as f:
    json.dump(rows, f, ensure_ascii=False, separators=(',', ':'))
print('written', len(rows), 'questions ->', out)
