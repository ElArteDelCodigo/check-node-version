// changelog.config.cjs (CommonJS)

// Orden de secciones en el changelog
const ORDER = [
  '✨ Features',
  '🐛 Fixes',
  '📖 Documentación',
  '🛠 Chores',
  '🧪 Tests',
  '♻️ Refactor',
  '🎨 Style',
  '⚡ Performance',
  '👽 Otros',
];

// Mapeo de tipos Conventional Commits -> títulos bonitos
const TYPE_MAP = {
  feat: '✨ Features',
  fix: '🐛 Fixes',
  docs: '📖 Documentación',
  chore: '🛠 Chores',
  test: '🧪 Tests',
  refactor: '♻️ Refactor',
  style: '🎨 Style',
  perf: '⚡ Performance',
};

const { execSync } = require('node:child_process');
const TZ_NAME = 'America/La_Paz';

// Detecta commits de merge para ignorarlos
const isMergeCommit = (header = '') =>
  /^(Merge( branch)?|Merge pull request|Merge remote-tracking)/i.test(header);

// Quita :shortcodes: y emojis unicode AL INICIO del subject
function stripEmojisAndShortcodes(text = '') {
  let t = String(text).trim();

  // Elimina shortcodes como :memo:, :sparkles:, etc. en cualquier parte
  t = t.replace(/:\w+:/g, ' ');

  // Elimina emojis unicode SOLO al inicio (incluye variaciones y ZWJ)
  t = t.replace(
    /^\s*(?:[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2700}-\u{27BF}][\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]*)+\s*/u,
    '',
  );

  // Normaliza espacios
  return t.replace(/\s{2,}/g, ' ').trim();
}

function formatDateTZ(date, tz) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function isDateOnly(str) {
  return typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str);
}

function tagExists(name) {
  try {
    execSync(`git rev-parse -q --verify "refs/tags/${name}"`, {
      stdio: ['ignore', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findActualTagName(context) {
  const version = String(context.version || '').replace(/^v/, '');
  const candidates = [];

  if (context.currentTag) candidates.push(String(context.currentTag));
  if (version) {
    candidates.push(`v${version}`, version);
  }

  // 1) Probar candidatos directos
  const seen = new Set();
  for (const cand of candidates) {
    if (!cand || seen.has(cand)) continue;
    seen.add(cand);
    if (tagExists(cand)) return cand;
  }

  // 2) Buscar por patrón ^v?VERSION$
  if (version) {
    try {
      const list = execSync(
        `git for-each-ref refs/tags --format="%(refname:short)"`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      )
        .split(/\r?\n/)
        .filter(Boolean);
      const re = new RegExp(`^v?${escapeRegex(version)}$`);
      const found = list.find((t) => re.test(t));
      if (found) return found;
    } catch {}
  }

  return null;
}

// Fecha del TAG si es anotado (taggerdate)
function getAnnotatedTagDateISO(tag) {
  try {
    const out = execSync(
      `git for-each-ref "refs/tags/${tag}" --format="%(taggerdate:iso-strict)"`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return out || null;
  } catch {
    return null;
  }
}

// Fecha del commit apuntado por el tag (funciona para lightweight)
function getCommitDateISO(tagOrRef) {
  try {
    const out = execSync(`git log -1 --format=%cI ${tagOrRef}^{} `, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

// Fecha del último commit del repo (HEAD)
function getHeadCommitDateISO() {
  try {
    const out = execSync(`git log -1 --format=%cI HEAD`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

module.exports = {
  preset: 'conventionalcommits',

  // Re-mapea títulos de secciones del preset
  presetConfig: {
    types: Object.entries(TYPE_MAP).map(([type, section]) => ({
      type,
      section,
    })),
  },

  writerOpts: {
    // ⬅️ Usamos un CAMPO NUEVO: {{date_la_paz}}
    headerPartial:
      '## 🚀 Versión {{version}} <small>({{date_la_paz}})</small>\n',

    // Cómo imprimir cada commit
    commitPartial:
      '* {{subject}} ({{shortHash}}{{#if authorName}}, @{{authorName}}{{/if}})\n',

    groupBy: 'type',

    // Ordena grupos según ORDER; si no está, alfabético al final
    commitGroupsSort: (a, b) => {
      const ai = ORDER.indexOf(a.title);
      const bi = ORDER.indexOf(b.title);
      if (ai === -1 && bi === -1)
        return String(a.title).localeCompare(String(b.title));
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    },

    // Orden dentro de cada grupo
    commitsSort: ['scope', 'subject'],

    // ✅ Fechado robusto por versión en campo propio (date_la_paz)
    finalizeContext(context) {
      // Si alguien ya fijó explicitamente date_la_paz como YYYY-MM-DD, respétalo
      if (isDateOnly(context.date_la_paz)) return context;

      let date = null;

      // 1) Si hay tag, usar su fecha (taggerdate si anotado; si no, commit date)
      const tagName = findActualTagName(context);
      if (tagName) {
        const isoTag = getAnnotatedTagDateISO(tagName);
        const isoCommit = isoTag ? null : getCommitDateISO(tagName);
        const iso = isoTag || isoCommit;
        if (iso) {
          const parsed = new Date(iso);
          if (!isNaN(parsed)) date = parsed;
        }
      }

      // 2) Si no hay tag: usar fecha del último commit (HEAD)
      if (!date) {
        const isoHead = getHeadCommitDateISO();
        if (isoHead) {
          const parsed = new Date(isoHead);
          if (!isNaN(parsed)) date = parsed;
        }
      }

      // 3) Fallback: now
      if (!date) date = new Date();

      // Guardamos en un CAMPO NUEVO para que nadie lo pise
      context.date_la_paz = formatDateTZ(date, TZ_NAME);

      // No tocamos context.date
      return context;
    },

    // Transform por commit
    transform(originalCommit) {
      // Clonar superficialmente para no mutar el original
      const c = { ...originalCommit };

      // 1) Ignora merges
      if (isMergeCommit(c.header || '')) return false;

      // 2) Notas de ruptura (con título consistente)
      c.notes = (originalCommit.notes || []).map((n) => ({
        ...n,
        title: '⚠️ BREAKING CHANGES',
      }));

      // 3) Mapea el tipo a sección bonita; si no corresponde, descarta
      if (c.type && TYPE_MAP[c.type]) {
        c.type = TYPE_MAP[c.type];
      } else {
        c.type = '👽 Otros';
      }

      // 4) short hash y autor
      c.shortHash = c.hash ? c.hash.slice(0, 7) : '';
      c.authorName = (c.author && c.author.name) || c.committerName || '';

      // 5) Subject: elimina emojis/shortcodes y normaliza
      // Si no hay subject (commits no estandar), usamos el header completo como fallback
      const rawSubject = c.subject || c.header || '';
      c.subject = stripEmojisAndShortcodes(rawSubject);

      // 6) Descarta si el subject quedó vacío (seguridad)
      if (!c.subject) return false;

      return c;
    },
  },

  // Si no quieres listar reverts, descomenta:
  // ignoreReverted: true,
};
