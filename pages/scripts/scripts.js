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

const PROJECT_LIBS = 'https://milo.adobe.com/libs';
const PROJECT_STYLES = '/pages/styles/styles.css';
const PROJECT_CONFIG = {
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

function getMiloLibs() {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return PROJECT_LIBS;
  const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
  return branch === 'local' ? 'http://localhost:6456/libs' : `https://${branch}.milo.pink/libs`;
}
const miloLibs = getMiloLibs();

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

const {
  loadArea,
  loadDelayed,
  setConfig,
} = await import(`${miloLibs}/utils/utils.js`);

(async function loadPage() {
  setConfig({ ...PROJECT_CONFIG, miloLibs });
  decorateButtons();
  turnH6intoDetailM();
  await loadArea();
  const { default: loadModals } = await import(`${miloLibs}/blocks/modals/modals.js`);
  loadModals();
  loadDelayed();
}());

export default PROJECT_CONFIG;
