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

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

/**
 * The decision engine for where to get Milo's libs from.
 */
export const [setLibs, getLibs] = (() => {
  let libs;
  return [
    (prodLibs) => {
      const { hostname } = window.location;
      if (!hostname.includes('hlx.page')
        && !hostname.includes('hlx.live')
        && !hostname.includes('localhost')) {
        libs = prodLibs;
        return libs;
      }
      const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
      if (branch === 'local') return 'http://localhost:6456/libs';
      if (branch.indexOf('--') > -1) return `https://${branch}.hlx.page/libs`;
      return `https://${branch}--milo--adobecom.hlx.live/libs`;
    }, () => libs,
  ];
})();
/*
 * ------------------------------------------------------------
 * Edit above at your own risk
 * ------------------------------------------------------------
*/

const LIBS = 'https://milo.adobe.com/libs';
const miloLibs = setLibs(LIBS);
const { createTag } = await import(`${miloLibs}/utils/utils.js`);
const { replaceKey } = await import(`${miloLibs}/features/placeholders.js`);
export { createTag, replaceKey };

export function handleAliases(scope = document) {
  // turn h6 into detail-M
  scope.querySelectorAll('h6').forEach((h6) => {
    const p = createTag('p', { class: 'detail-M' }, h6.innerHTML);
    const attrs = h6.attributes;
    for (let i = 0, len = attrs.length; i < len; i += 1) {
      p.setAttribute(attrs[i].name, attrs[i].value);
    }
    h6.parentNode.replaceChild(p, h6);
  });
  // turn banner into marquee, featured-columns into z-pattern, etc.
  const aliases = {
    // eslint-disable-next-line quote-props
    'banner': 'marquee',
    'featured-columns': 'z-pattern',
  };
  Object.keys(aliases).forEach((alias) => {
    scope.querySelectorAll(`.${alias}`).forEach((el) => {
      el.classList.replace(alias, aliases[alias]);
    });
  });
}

export function externalLinks() {
  const links = document.querySelectorAll('a[href]');
  links.forEach((linkItem) => {
    const linkValue = linkItem.getAttribute('href');
    if (linkValue.includes('//') && !(linkValue.includes('stock.adobe') && linkValue.includes('pages'))) {
      linkItem.setAttribute('target', '_blank');
    }
  });
}

const delay = (timeOut, cb) => new Promise((resolve) => {
  setTimeout(() => {
    resolve((cb && cb()) || null);
  }, timeOut);
});

export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

export async function loadBlockCSS(blockName) {
  const href = `/pages/blocks/${blockName}/${blockName}.css`;
  if (document.querySelector(`head > link[href="${href}"]`)) return;
  // eslint-disable-next-line consistent-return
  return new Promise((resolve) => {
    loadCSS(href, resolve);
  });
}

export function makeRelative(href) {
  const projectName = 'stock--adobecom';
  const productionDomains = ['stock.adobe.com'];
  const fixedHref = href.replace(/\u2013|\u2014/g, '--');
  const hosts = [`${projectName}.hlx.page`, `${projectName}.hlx.live`, ...productionDomains];
  const url = new URL(fixedHref);
  const relative = hosts.some((host) => url.hostname.includes(host))
    || url.hostname === window.location.hostname;
  return relative ? `${url.pathname}${url.search}${url.hash}` : href;
};

export async function gnavUnderline() {
  const { href } = window.location;
  const relHref = makeRelative(href);
  if (!relHref.includes('artisthub')) return;
  await delay(50);
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
}

export async function handleAnchors() {
  await delay(500);
  const sectionToggles = Array.from(document.querySelectorAll('[data-anchor-section]'));
  sectionToggles.forEach((toggleSection, index) => {
    if (window.location.hash === toggleSection.getAttribute('data-anchor-section')) {
      toggleSection.classList.add('anchor-section-toggle--active');
      window.scroll({ top: toggleSection.offsetTop - 97, left: 0, behavior: 'smooth' });
    } else if (index === 0 && !window.location.hash) {
      toggleSection.classList.add('anchor-section-toggle--active');
    } else {
      toggleSection.classList.add('anchor-section-toggle--hidden');
    }
  });
}

export function transformLinkToAnimation(a) {
  if (!a || !a.href.includes('.mp4')) return null;
  const params = new URL(a.href).searchParams;
  const attribs = {};
  ['playsinline', 'autoplay', 'loop', 'muted'].forEach((p) => {
    if (params.get(p) !== 'false') attribs[p] = '';
  });
  // use closest picture as poster
  const poster = a.closest('div').querySelector('picture source');
  if (poster) {
    attribs.poster = poster.srcset;
    poster.parentNode.remove();
  }
  // replace anchor with video element
  const videoUrl = new URL(a.href);
  const helixId = videoUrl.hostname.includes('hlx.blob.core') ? videoUrl.pathname.split('/')[2] : videoUrl.pathname.split('media_')[1].split('.')[0];
  const videoHref = `media_${helixId}.mp4`;
  const video = createTag('video', attribs);
  video.innerHTML = `<source src="${videoHref}" type="video/mp4">`;
  const innerDiv = a.closest('div');
  innerDiv.prepend(video);
  innerDiv.classList.add('hero-animation-overlay');
  a.replaceWith(video);
  // autoplay animation
  video.addEventListener('canplay', () => {
    video.muted = true;
    video.play();
  });
  return video;
}
