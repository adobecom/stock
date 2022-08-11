let miloLibs;

/**
 * Get Milo Libs
 *
 * The project determines where it wants to load milo from.
 * On production, it is expected that the origin for '/libs' points to milo.
 *
 * @returns miloLibs
 */
export default function getMiloLibs() {
  if (miloLibs) return miloLibs;
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return '/libs';
  const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
  miloLibs = branch === 'local' ? 'http://localhost:6456/libs' : `https://${branch}.milo.pink/libs`;
  return miloLibs;
}
