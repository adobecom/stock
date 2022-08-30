export function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  }
  return el;
}

export function transformLinkToAnimation($a) {
  if (!$a || !$a.href.includes('.mp4')) {
    return null;
  }
  const params = new URL($a.href).searchParams;
  const attribs = {};
  ['playsinline', 'autoplay', 'loop', 'muted'].forEach((p) => {
    if (params.get(p) !== 'false') attribs[p] = '';
  });
  // use closest picture as poster
  const $poster = $a.closest('div').querySelector('picture source');
  if ($poster) {
    attribs.poster = $poster.srcset;
    $poster.parentNode.remove();
  }
  // replace anchor with video element
  const videoUrl = new URL($a.href);
  const helixId = videoUrl.hostname.includes('hlx.blob.core') ? videoUrl.pathname.split('/')[2] : videoUrl.pathname.split('media_')[1].split('.')[0];
  const videoHref = `./media_${helixId}.mp4`;
  const $video = createTag('video', attribs);
  $video.innerHTML = `<source src="${videoHref}" type="video/mp4">`;
  const $innerDiv = $a.closest('div');
  $innerDiv.prepend($video);
  $innerDiv.classList.add('hero-animation-overlay');
  $a.replaceWith($video);
  // autoplay animation
  $video.addEventListener('canplay', () => {
    $video.muted = true;
    $video.play();
  });
  return $video;
}

export function turnH6intoDetailM() {
  document.querySelectorAll('h6').forEach(($h6) => {
    const $p = document.createElement('p');
    $p.classList.add('detail-M');
    const attrs = $h6.attributes;
    for (let i = 0, len = attrs.length; i < len; i += 1) {
      $p.setAttribute(attrs[i].name, attrs[i].value);
    }
    $p.innerHTML = $h6.innerHTML;
    $h6.parentNode.replaceChild($p, $h6);
  });
}

export function decorateButtons() {
  const $blocksWithoutButton = ['breadcrumbs', 'sitemap', 'images'];
  const isNodeName = (node, name) => {
    if (!node || typeof node !== 'object') return false;
    return node.nodeName.toLowerCase() === name.toLowerCase();
  }
  document.querySelectorAll(':scope a').forEach(($a) => {
    $a.title = $a.title || $a.textContent || $a.href;
    const $block = $a.closest('div.section > div');
    const blockNames = [];
    if ($block) {
      const blockClassNames = $block.className.split(' ');
      blockClassNames.forEach((className) => {
        blockNames.push(className);
      });
    }
    if (!blockNames.some((e) => $blocksWithoutButton.includes(e))) {
      const $p = $a.closest('p');
      if ($p) {
        const childNodes = Array.from($p.childNodes);
        const whitespace = new RegExp('^\\s*$');
        // Check that the 'button-container' contains buttons only
        const buttonsOnly = childNodes.every(($c) => {
          if (isNodeName($c, 'a') || (isNodeName($c, '#text') && whitespace.test($c.textContent))) {
            return true;
          } else if ($c.childNodes.length > 0) {
            return Array.from($c.childNodes).every(($cc) => {
              if (isNodeName($cc, 'a') || (isNodeName($cc, '#text') && whitespace.test($cc.textContent))) {
                return true;
              } else if ($cc.childNodes.length > 0) {
                // Could be nested twice for 'em' and 'strong' tags.
                return Array.from($cc.childNodes).every(($ccc) => isNodeName($ccc, 'a') || (isNodeName($ccc, '#text') && whitespace.test($ccc.textContent)));
              } else return false;
            });
          } else return false;
        });
        if (buttonsOnly) {
          $p.classList.add('button-container');
          const $up = $a.parentElement;
          const $twoUp = $a.parentElement.parentElement;
          const $threeUp = $a.parentElement.parentElement.parentElement;
          if (isNodeName($up, 'p')) {
            $a.className = 'button transparent'; // default
          }
          if (isNodeName($up, 'strong') && isNodeName($twoUp, 'p')) {
            $a.className = 'button primary';
          }
          if (isNodeName($up, 'em') && isNodeName($twoUp, 'p')) {
            $a.className = 'button secondary';
          }
          if (((isNodeName($up, 'em') && isNodeName($twoUp, 'strong'))
            || (isNodeName($up, 'strong') && isNodeName($twoUp, 'em')))
            && isNodeName($threeUp, 'p')) {
            $a.className = 'button accent';
          }
        }
      }
    }
  });
}

export function transformLinkToYoutubeEmbed($a) {
  if (!$a || !($a.href.startsWith('https://www.youtube.com/watch') || $a.href.startsWith('https://youtu.be/'))) {
    return null;
  }
  const $video = createTag('div', { class: 'embed embed-youtube' });
  const url = new URL($a.href);
  const usp = new URLSearchParams(url.search);
  let vid = usp.get('v');
  if (url.host === 'youtu.be') vid = url.pathname.substr(1);
  $video.innerHTML = /* html */`
  <div class="youtube-container">
    <iframe src="https://www.youtube.com/embed/${vid}?rel=0&amp;modestbranding=1&amp;playsinline=1&amp;autohide=1&amp;showinfo=0&amp;rel=0&amp;controls=1&amp;autoplay=1&amp;mute=1&amp;loop=1&amp;playlist=${vid}" frameBorder="0" allowfullscreen="" scrolling="no" allow="encrypted-media; accelerometer; gyroscope; picture-in-picture; autoplay" title="content from youtube" loading="lazy"></iframe>
  </div>
  `;
  return $video;
}

export function unwrapFragments() {
  Array.from(document.querySelectorAll('.fragment')).forEach(($fragment) => {
  const $section = $fragment.closest('main > .section');
  const $div = $fragment.closest('main > .section > div');
    Array.from($fragment.childNodes).forEach(($node) => {
      $section.parentNode.insertBefore($node, $section);
    });
    $div.remove();
    if ($section.childElementCount === 0) $section.remove();
  });
}

export function customSpacings() {
  Array.from(document.querySelectorAll('.section-metadata')).forEach(($sm) => {
    if ($sm.textContent.toLowerCase().includes('background')) {
      const $section = $sm.closest('main > section');
      $sm.parentElement.classList.add('has-background');
      const $next = $sm.parentElement.nextElementSibling;
      if ($next && $next.querySelector(':scope > .banner:first-child')) {
        $next.style.paddingTop = '0';
      }
      const $prev = $sm.parentElement.previousElementSibling;
      if ($prev && $prev.querySelector(':scope > .banner:last-child')) {
        $prev.style.paddingBottom = '0';
      }
    }
    $sm.remove();
  });  
}

export function createSVG(path, name = undefined) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `${path}${(name !== undefined) ? "#" : ""}${name}`);
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

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
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
      } else {
        const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
        switch (branch) {
          case branch === 'local':
            libs = 'http://localhost:6456/libs';
            break;
          case branch.indexOf('--') > -1:
            libs = `https://${branch}.hlx.page/libs`;
            break;
          default:
            libs = `https://${branch}--milo--adobecom.hlx.page/libs`;
        }
      }
      return libs;
    }, () => libs,
  ];
})();
