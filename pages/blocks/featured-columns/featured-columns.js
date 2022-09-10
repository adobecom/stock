/*
 * Copyright 2021 Adobe. All rights reserved.
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
  transformLinkToAnimation,
  createTag,
} from '../../scripts/utils.js';

function lazyDecorateVideo($cell, $a) {
  if (!$a || (!$a.href.endsWith('.mp4') && !$a.href.startsWith('https://www.youtube.com/watch') && !$a.href.startsWith('https://youtu.be/'))) return;
  const decorateVideo = () => {
    if ($cell.classList.contains('picture-column')) return;
    let youtube = null;
    let mp4 = null;
    if ($a.href.endsWith('.mp4')) {
      mp4 = transformLinkToAnimation($a);
    } else if ($a.href.startsWith('https://www.youtube.com/watch') || $a.href.startsWith('https://youtu.be/')) {
      youtube = transformLinkToYoutubeEmbed($a);
    }
    $cell.innerHTML = '';
    if (youtube) {
      $cell.classList.add('picture-column');
      $cell.appendChild(youtube);
    } else if (mp4) {
      $cell.classList.add('picture-column');
      const $row = $cell.closest('.featured-row');
      const $cta = $row.querySelector('.button.accent') ?? $row.querySelector('.button');
      if ($cta) {
        const a = createTag('a', {
          href: $cta.href, title: $cta.title, target: $cta.target, rel: $cta.rel,
        });
        $cell.appendChild(a);
        a.appendChild(mp4);
      } else {
        $cell.appendChild(mp4);
      }
    } else if ($cell.querySelector('.milo-video')) {
      $cell.classList.add('picture-column');
    }
  };
  const addIntersectionObserver = (block) => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
        decorateVideo();
      }
    }, {
      root: null,
      rootMargin: '300px',
      threshold: 0,
    });
    intersectionObserver.observe(block);
  };
  if (document.readyState === 'complete') {
    addIntersectionObserver($cell);
  } else {
    window.addEventListener('load', () => {
      addIntersectionObserver($cell);
    });
  }
}

export default function decorate($block) {
  const $rows = Array.from($block.children);
  $rows.forEach(($row) => {
    $row.classList.add('featured-row');
    const $featured = Array.from($row.children);
    $featured.forEach(($cell) => {
      const $ps = $cell.querySelectorAll('p');
      [...$ps].forEach(($p) => { if ($p.childNodes.length === 0) $p.remove() })
      $cell.classList.add('featured-column');
      const $a = $cell.querySelector('a');
      if ($a && $cell.childNodes.length === 1 && ($a.href.endsWith('.mp4') || $a.href.startsWith('https://www.youtube.com/watch') || $a.href.startsWith('https://youtu.be/'))) {
        lazyDecorateVideo($cell, $a);
      } else {
        const $pic = $cell.querySelector('picture:first-child:last-child');
        if ($pic) {
          $cell.classList.add('picture-column');
          const $cta = $row.querySelector('a.button.accent') ?? $row.querySelector('a.button');
          const $picParent = $pic.parentElement;
          $cell.innerHTML = '';
          if ($picParent.tagName.toLowerCase() === 'a') {
            $cell.appendChild($picParent);
            $picParent.appendChild($pic);
          } else if ($cta) {
            const a = createTag('a', {
              href: $cta.href, title: $cta.title, target: $cta.target, rel: $cta.rel,
            });
            $cell.appendChild(a);
            a.appendChild($pic);
          } else {
            $cell.appendChild($pic);
          }
        }
      }
    });
  });
}
