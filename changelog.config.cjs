// changelog.config.cjs (CommonJS)
const ORDER = [
  '✨ Features',
  '🐛 Fixes',
  '📖 Documentación',
  '🛠 Chores',
  '🧪 Tests',
  '♻️ Refactor',
  '🎨 Style',
  '⚡ Performance',
];

module.exports = {
  preset: 'conventionalcommits',

  // Cambios de títulos de secciones sin tocar transform
  presetConfig: {
    types: [
      { type: 'feat', section: '✨ Features' },
      { type: 'fix', section: '🐛 Fixes' },
      { type: 'docs', section: '📖 Documentación' },
      { type: 'chore', section: '🛠 Chores' },
      { type: 'test', section: '🧪 Tests' },
      { type: 'refactor', section: '♻️ Refactor' },
      { type: 'style', section: '🎨 Style' },
      { type: 'perf', section: '⚡ Performance' },
    ],
  },

  writerOpts: {
    // Encabezado por release
    headerPartial: '## 🚀 Versión {{version}} <small>({{date}})</small>\n',

    // Cómo imprimir cada commit
    // (shortHash suele venir ya calculado por el writer)
    commitPartial:
      '* {{subject}} ({{shortHash}}{{#if authorName}}, @{{authorName}}{{/if}})\n',

    groupBy: 'type',
    commitGroupsSort: (a, b) => ORDER.indexOf(a.title) - ORDER.indexOf(b.title),
    commitsSort: ['scope', 'subject'],

    // ⚠️ Transform "puro": no mutar el objeto original
    transform(originalCommit) {
      // Clonar nivel 1
      const c = { ...originalCommit };

      // Clonar/ajustar notas sin mutar
      c.notes = (originalCommit.notes || []).map((n) => ({
        ...n,
        title: '⚠️ BREAKING CHANGES',
      }));

      // Mapear el tipo a título bonito (ya mapeado por presetConfig; por si acaso)
      const map = {
        feat: '✨ Features',
        fix: '🐛 Fixes',
        docs: '📖 Documentación',
        chore: '🛠 Chores',
        test: '🧪 Tests',
        refactor: '♻️ Refactor',
        style: '🎨 Style',
        perf: '⚡ Performance',
      };
      if (c.type && map[c.type]) c.type = map[c.type];

      // shortHash “derivado” sin mutar original
      c.shortHash = c.hash ? c.hash.slice(0, 7) : '';

      // Autor amigable sin mutar original
      c.authorName = (c.author && c.author.name) || c.committerName || '';

      // Limpiar emoji al inicio del subject (sin mutar original)
      if (c.subject) {
        c.subject = c.subject
          .replace(
            /^\s*(:\w+:|[\u{2700}-\u{27BF}\u{E000}-\u{F8FF}\u{2190}-\u{21FF}\u{2600}-\u{26FF}])\s*/u,
            '',
          )
          .trim();
      }

      return c;
    },
  },
};
