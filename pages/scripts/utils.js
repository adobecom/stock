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
      return `https://${branch}--milo--adobecom.hlx.page/libs`;
    }, () => libs,
  ];
})();
const LIBS = 'https://milo.adobe.com/libs';
const miloLibs = setLibs(LIBS);
const { getConfig } = await import(`${miloLibs}/utils/utils.js`);

/*
* ------------------------------------------------------------
* Edit above at your own risk
* ------------------------------------------------------------
*/

export function toClassName(name) {
  return (name && typeof name === 'string') ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-') : '';
}

export async function fetchPlaceholders() {
  const { locale } = getConfig();
  const localeRoot = locale.contentRoot;
  if (!window.placeholders) {
    try {
      const resp = await fetch(`${localeRoot}/pages/artisthub/placeholders.json`);
      const json = await resp.json();
      window.placeholders = {};
      json.data.forEach((placeholder) => {
        window.placeholders[toClassName(placeholder.Key)] = placeholder.Text;
      });
    } catch {
      const resp = await fetch('/pages/artisthub/placeholders.json');
      const json = await resp.json();
      window.placeholders = {};
      json.data.forEach((placeholder) => {
        window.placeholders[toClassName(placeholder.Key)] = placeholder.Text;
      });
    }
  }
  return window.placeholders;
}

export function createTag(tag, attributes, html) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
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
  const videoHref = `/media_${helixId}.mp4`;
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

export function turnH6intoDetailM(scope = document) {
  scope.querySelectorAll('h6').forEach((h6) => {
    const p = createTag('p', { class: 'detail-M' }, h6.innerHTML);
    const attrs = h6.attributes;
    for (let i = 0, len = attrs.length; i < len; i += 1) {
      p.setAttribute(attrs[i].name, attrs[i].value);
    }
    h6.parentNode.replaceChild(p, h6);
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
}

export function decorateButtons(scope = document) {
  const blocksWithoutButton = ['image-carousel', 'image-rows'];
  const isNodeName = (node, name) => {
    if (!node || typeof node !== 'object') return false;
    return node.nodeName.toLowerCase() === name.toLowerCase();
  };
  scope.querySelectorAll(':scope a').forEach((a) => {
    a.title = a.title || a.textContent || a.href;
    const block = a.closest('div.section > div');
    const blockNames = [];
    if (block) {
      const blockClassNames = block.className.split(' ');
      blockClassNames.forEach((className) => {
        blockNames.push(className);
      });
    }
    if (!blockNames.some((e) => blocksWithoutButton.includes(e))) {
      const p = a.closest('p');
      if (p) {
        const childNodes = Array.from(p.childNodes);
        const whitespace = /^\s*$/;
        // Check that the 'button-container' contains buttons only
        const buttonsOnly = childNodes.every((c) => {
          if (isNodeName(c, 'a') || (isNodeName(c, '#text') && whitespace.test(c.textContent))) return true;
          if (c.childNodes.length > 0) {
            return Array.from(c.childNodes).every((cc) => {
              if (isNodeName(cc, 'a') || (isNodeName(cc, '#text') && whitespace.test(cc.textContent))) return true;
              if (cc.childNodes.length > 0) {
                // Could be nested twice for 'em' and 'strong' tags.
                return Array.from(cc.childNodes).every((ccc) => isNodeName(ccc, 'a') || (isNodeName(ccc, '#text') && whitespace.test(ccc.textContent)));
              } return false;
            });
          } return false;
        });
        if (buttonsOnly) {
          p.classList.add('button-container');
          const up = a.parentElement;
          const twoUp = a.parentElement.parentElement;
          const threeUp = a.parentElement.parentElement.parentElement;
          if (isNodeName(up, 'p')) a.className = 'button transparent'; // default
          if (isNodeName(up, 'strong') && isNodeName(twoUp, 'p')) a.className = 'button primary';
          if (isNodeName(up, 'em') && isNodeName(twoUp, 'p')) a.className = 'button secondary';
          if (((isNodeName(up, 'em') && isNodeName(twoUp, 'strong'))
            || (isNodeName(up, 'strong') && isNodeName(twoUp, 'em')))
            && isNodeName(threeUp, 'p')) {
            a.className = 'button accent';
          }
        }
      }
    }
  });
}

export function unwrapSingularFragments() {
  Array.from(document.querySelectorAll('main > .section > div > div > div > .fragment')).forEach((fragment) => {
    const section = fragment.closest('main > .section');
    const div = fragment.closest('main > .section > div');
    Array.from(fragment.childNodes).forEach((node) => {
      section.insertBefore(node, div);
      node.classList.add('fragment');
      decorateButtons(node);
      turnH6intoDetailM(node);
    });
    div.remove();
    if (section.childElementCount === 0) section.remove();
  });
}

export function customSpacings() {
  // Adjust spacing for sections that have a background color
  Array.from(document.querySelectorAll('.section-metadata')).forEach((sm) => {
    if (sm.textContent.toLowerCase().includes('background')) {
      const section = sm.closest('main > .section');
      section.classList.add('has-background');
      const next = section.nextElementSibling;
      if (next && next.querySelector(':scope > .banner:first-child')) next.style.paddingTop = '0';
      const prev = section.previousElementSibling;
      if (prev && prev.querySelector(':scope > .banner:last-child')) prev.style.paddingBottom = '0';
    }
    sm.remove();
  });
}

export const delay = (timeOut, cb) => new Promise((resolve) => {
  setTimeout(() => {
    resolve((cb && cb()) || null);
  }, timeOut);
});

export async function gnavUnderline() {
  const { href } = window.location;
  const relHref = makeRelative(href);
  if (!relHref.includes('artisthub')) return;
  await delay(50);
  const links = document.querySelectorAll('.gnav-navitem > a');
  let currentActivePage;
  for (let i = 0; i < links.length; i += 1) {
    if (relHref.startsWith(makeRelative(links[i].href)) && links[i].textContent !== 'Home') {
      currentActivePage = document.querySelector('.gnav-navitem > a.active-page');
      if (currentActivePage) currentActivePage.classList.remove('active-page');
      links[i].classList.add('active-page');
    }
  }
  for (let x = 0; x < links.length; x += 1) {
    if (makeRelative(links[x].href) === relHref) {
      currentActivePage = document.querySelector('.gnav-navitem > a.active-page');
      if (currentActivePage) currentActivePage.classList.remove('active-page');
      links[x].classList.add('active-page');
    }
  }
}

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

export function getMetadata(name) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = [...document.head.querySelectorAll(`meta[${attr}="${name}"]`)].map((el) => el.content).join(', ');
  return meta;
}

export async function loadBlockCSS(blockName) {
  const href = `/pages/blocks/${blockName}/${blockName}.css`;
  if (document.querySelector(`head > link[href="${href}"]`)) return;
  // eslint-disable-next-line consistent-return
  return new Promise((resolve) => {
    loadCSS(href, resolve);
  });
}

export function createSVG(path, name = undefined) {
  const anchor = (typeof (name) === 'string') ? name : null;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `${path}${(anchor) ? '#' : ''}${anchor}`);
  svg.appendChild(use);
  return svg;
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

export async function getNavbarHeight() {
  const placeholders = await fetchPlaceholders((plhldrs) => plhldrs);
  return (placeholders['navbar-height']) ? (placeholders['navbar-height']) : 97;
}

export async function handleAnchors() {
  const navbarHeight = await getNavbarHeight();
  const sectionToggles = Array.from(document.querySelectorAll('[data-anchor-section]'));
  sectionToggles.forEach(async (toggleSection, index) => {
    if (window.location.hash === toggleSection.getAttribute('data-anchor-section')) {
      toggleSection.classList.add('anchor-section-toggle--active');
      await delay(500);
      window.scroll({ top: toggleSection.offsetTop - navbarHeight, left: 0, behavior: 'smooth' });
    } else if (index === 0 && !window.location.hash) {
      toggleSection.classList.add('anchor-section-toggle--active');
    } else {
      toggleSection.classList.add('anchor-section-toggle--hidden');
    }
  });
}
