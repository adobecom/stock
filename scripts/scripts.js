const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';

export default function getMiloLibs() {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return '/libs';
  return branch === 'local' ? 'http://localhost:6456/libs' : `https://${branch}.milo.pink/libs`;
}

const config = {
  projectRoot: `${window.location.origin}/`,
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
  },
  miloLibs: getMiloLibs(),
};

(async function loadStyle() {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', `${config.miloLibs}/styles/styles.css`);
  document.head.appendChild(link);
}());

const {
  decorateArea,
  decorateNavs,
  loadLCP,
  loadArea,
  loadDelayed,
  loadTemplate,
  setConfig,
} = await import(`${config.miloLibs}/utils/utils.js`);

(async function loadPage() {
  setConfig(config);
  const blocks = decorateArea();
  const navs = decorateNavs();
  await loadLCP({ blocks });
  import(`${config.miloLibs}/utils/fonts.js`);
  loadTemplate();
  await loadArea({ blocks: [...navs, ...blocks] });
  const { default: loadModals } = await import(`${config.miloLibs}/blocks/modals/modals.js`);
  loadModals();
  loadDelayed();
}());
