/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {
  decorateButtons,
  turnH6intoDetailM,
} from './stock-utils.js';

// This can be changed to 'https://milo.adobe.com/libs'
// if you don't have '/libs' mapped to the milo origin.
const PROD_LIBS = 'https://milo.adobe.com/libs';

export const config = {
  // imsClientId: 'college',
  contentRoot: '/pages',
  codeRoot: '/pages',
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
  },
};

(async function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  lcpImg?.setAttribute('loading', 'eager');
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

/**
 * The logic to decide where to load milo from.
 *
 * @returns {String} the libs path for milo
 */
function getMiloLibs() {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return PROD_LIBS;
  const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
  return branch === 'local' ? 'http://localhost:6456/libs' : `https://${branch}.milo.pink/libs`;
}
config.miloLibs = getMiloLibs();

(async function loadStyles() {
  const miloStyle = document.createElement('link');
  miloStyle.setAttribute('rel', 'stylesheet');
  miloStyle.setAttribute('href', `${config.miloLibs}/styles/styles.css`);
  document.head.appendChild(miloStyle);
  
  const repoStyle = document.createElement('link');
  repoStyle.setAttribute('rel', 'stylesheet');
  repoStyle.setAttribute('href', '/styles/styles.css');
  document.head.appendChild(repoStyle);
}());

const {
  loadArea,
  loadDelayed,
  setConfig,
} = await import(`${config.miloLibs}/utils/utils.js`);

(async function loadPage() {
  setConfig(config);
  decorateButtons();
  turnH6intoDetailM();
  await loadArea();
  const { default: loadModals } = await import(`${config.miloLibs}/blocks/modals/modals.js`);
  loadModals();
  loadDelayed();
}());
