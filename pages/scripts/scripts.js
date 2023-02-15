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

import { setLibs } from './utils.js';

// Add project-wide style path here.
const STYLES = '/pages/styles/styles.css';

// Use '/libs' if your live site maps '/libs' to milo's origin.
const LIBS = 'https://milo.adobe.com/libs';

// Add any config options.
const CONFIG = {
  codeRoot: '/pages',
  contentRoot: '/pages',
  // imsClientId: 'stock',
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
  await loadArea();
  loadDelayed();
}());

/*
* ------------------------------------------------------------
*/

export function makeRelative(href) {
  const projectName = 'stock--adobecom';
  const productionDomains = ['stock.adobe.com'];
  const fixedHref = href.replace(/\u2013|\u2014/g, '--');
  const hosts = [`${projectName}.hlx.page`, `${projectName}.hlx.live`, ...productionDomains];
  const url = new URL(fixedHref);
  const relative = hosts.some((host) => url.hostname.includes(host))
    || url.hostname === window.location.hostname;
  return relative ? `${url.pathname}${url.search}${url.hash}` : href;
}

(function gnavUnderline() {
  const { href } = window.location;
  const relHref = makeRelative(href);
  if (!relHref.includes('artisthub')) return;
  const links = document.querySelectorAll('.gnav-navitem > a');
  let currentActivePage;
  for (let i = 0; i < links.length; i += 1) {
    if (window.location.host === links[i].host && relHref.startsWith(makeRelative(links[i].href)) && !(relHref.endsWith('/pages/artisthub/'))) {
      currentActivePage = document.querySelector('.gnav-navitem > a.active-page');
      if (currentActivePage) currentActivePage.classList.remove('active-page');
      links[i].classList.add('active-page');
    }
  }
  for (let x = 0; x < links.length; x += 1) {
    if (window.location.host === links[x].host && makeRelative(links[x].href) === relHref) {
      currentActivePage = document.querySelector('.gnav-navitem > a.active-page');
      if (currentActivePage) currentActivePage.classList.remove('active-page');
      links[x].classList.add('active-page');
    }
  }
})();

