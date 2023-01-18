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
  setLibs,
  handleAliases,
  externalLinks,
  gnavUnderline,
  handleAnchors,
} from './utils.js';

// Add project-wide style path here.
const STYLES = '/pages/styles/styles.css';

// Use '/libs' if your live site maps '/libs' to milo's origin.
const LIBS = 'https://milo.adobe.com/libs';

// Add any config options.
const CONFIG = {
  codeRoot: '/pages',
  contentRoot: '/pages',
  // imsClientId: 'college',
  // geoRouting: 'off',
  // fallbackRouting: 'off',
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
    es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
    jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  },
};

// Load LCP image immediately
(async function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  lcpImg?.removeAttribute('loading');
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

(async function loadPage() {
  const { loadArea, loadDelayed, setConfig } = await import(`${miloLibs}/utils/utils.js`);

  setConfig({ ...CONFIG, miloLibs });

  handleAliases();
  await loadArea();
  loadDelayed();

  externalLinks();
  gnavUnderline();
  handleAnchors();
}());
