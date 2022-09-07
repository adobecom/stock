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

import { fetchPlaceholders } from '../../scripts/scripts.js';

function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

function handlize(string) {
  return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
}

function buildCards($block, payload) {
  const $cardsTray = createTag('div', { class: 'cards horizontal' });
  const $contentArea = $block.querySelector('.content-area');

  let tabCounts = 0;
  payload.tabs[payload.tabs.length - 1].content.forEach((category, index) => {
    const $htmlHolder = document.createElement('div');
    $htmlHolder.innerHTML = category.innerContent;
    const $liWithLink = $htmlHolder.querySelectorAll('li');

    for (let i = 0; i < $liWithLink.length; i += 1) {
      tabCounts += 1;
      const $picture = $liWithLink[i].querySelector('picture');
      const $link = $liWithLink[i].querySelector('a');

      const $card = createTag('div', { class: 'card' });
      const $linkLayer = createTag('a', { class: 'card-container-link' });
      const $cardText = createTag('div', { class: 'card-text' });
      const $grayText = createTag('p', { class: 'detail-M', id: handlize(category.subHeading) });

      const $h3 = createTag('div', { class: handlize($link.textContent) });
      $h3.textContent = $link.textContent;
      $linkLayer.href = $link.href;
      $grayText.textContent = category.subHeading;

      if ($picture) {
        const $pictureWrapper = createTag('div', { class: 'card-picture' });
        $pictureWrapper.append($picture);
        $linkLayer.append($pictureWrapper);
      }

      if (index === 0) {
        $linkLayer.setAttribute('download', 'true');
      } else {
        $linkLayer.setAttribute('target', '_blank');
      }

      $cardText.append($grayText, $h3);
      $linkLayer.append($cardText);
      $card.append($linkLayer);
      $cardsTray.append($card);

      $liWithLink[i].remove();
    }
    $contentArea.append($cardsTray);
    $htmlHolder.remove();
  });

  if (tabCounts <= 6) {
    $cardsTray.classList.add(`col-${tabCounts}-cards`);
  }
}

function injectFBSDK() {
  const $holder = createTag('div', { id: 'fb-root' });
  const $sdkScript = createTag('script');
  $sdkScript.innerHTML = '(function(d, s, id) {\n    var js, fjs = d.getElementsByTagName(s)[0];\n    if (d.getElementById(id)) return;\n    js = d.createElement(s); js.id = id;\n    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";\n    fjs.parentNode.insertBefore(js, fjs);\n    }(document, \'script\', \'facebook-jssdk\'));'
  const body = document.querySelector('body');
  body.prepend($holder, $sdkScript);
}

function makeTwitterButton() {
  const $twitter = createTag('span');
  const $button = createTag('a', {
    href: 'https://twitter.com/share?ref_src=twsrc%5Etfw',
    className: 'twitter-share-button',
    'data-show-count': false,
  });
  const $script = createTag('script', {
    async: true,
    src: 'https://platform.twitter.com/widgets.js',
    charSet: 'utf-8',
  });
  $button.textContent = 'Tweet';
  $twitter.append($button, $script);
  return $twitter;
}

function decorateSocialShareLinks() {
  const $wrapper = createTag('div', { class: 'social-wrapper' });
  const $heading = createTag('div', { class: 'social-heading' });
  const $socialButtons = createTag('div', { class: 'social-buttons' });

  $wrapper.append($heading, $socialButtons);

  // FB
  injectFBSDK();
  $socialButtons.append(createTag('div', {
    class: 'fb-share-button',
    'data-href': window.location.href,
    'data-layout': 'button',
  }));

  // Twitter
  $socialButtons.append(makeTwitterButton());

  // LinkedIn
  return $wrapper;
}

function loadTranscript($block, payload) {
  const $contentArea = $block.querySelector('.content-area');
  $contentArea.innerHTML = '';

  const paragraphs = payload.videos[payload.videoIndex].Transcript.split('\n');
  if (paragraphs.length > 0) {
    paragraphs.forEach((p) => {
      const $p = createTag('p');
      $p.textContent = p;
      $contentArea.append($p);
    });
  }
}

function loadTabContent($block, payload, index) {
  const $contentArea = $block.querySelector('.content-area');
  if (index === payload.tabs.length - 1) {
    $contentArea.innerHTML = '';
    buildCards($block, payload);
  } else {
    $contentArea.innerHTML = payload.tabs[index].content;
  }
}

function decorateTabbedArea($block, payload) {
  const $tabbedArea = createTag('div', { class: 'tabbed-area' });
  const $tabs = createTag('div', { class: 'tabs' });
  const $contentArea = createTag('div', { class: 'content-area' });

  payload.tabs.forEach((tab, index) => {
    const $tab = createTag('a', { class: 'tab' });
    if (index === 0) {
      $tab.classList.add('active');
    }
    $tab.textContent = tab.heading;
    $tabs.append($tab);

    $tab.addEventListener('click', () => {
      const $allTabs = $block.querySelectorAll('.tab');
      for (let i = 0; i < $allTabs.length; i += 1) {
        $allTabs[i].classList.remove('active');
      }
      $tab.classList.add('active');
      loadTabContent($block, payload, index);
    });

    if (index === 1) {
      const $trascriptTab = createTag('a', { class: 'tab' });
      const indexOfLastColumn = [payload.videos.length - 1];
      $trascriptTab.textContent = Object.keys(payload.videos[indexOfLastColumn])[indexOfLastColumn];
      $tabs.append($trascriptTab);

      $trascriptTab.addEventListener('click', () => {
        const $allTabs = $block.querySelectorAll('.tab');
        for (let i = 0; i < $allTabs.length; i += 1) {
          $allTabs[i].classList.remove('active');
        }
        $trascriptTab.classList.add('active');
        loadTranscript($block, payload);
      });
    }
  });

  $tabbedArea.append($tabs, $contentArea);
  $block.append($tabbedArea);
  loadTabContent($block, payload, 0);
}

async function fetchVideos(url) {
  const resp = await fetch(url)
    .then((response) => response.json());
  return resp.data;
}

function loadVideo($block, payload) {
  const $videoPlayer = $block.querySelector('.video-player');
  const $activeTab = $block.querySelector('.tab.active');
  const $allTabs = $block.querySelectorAll('.tab');

  $videoPlayer.innerHTML = '';
  if (payload.videos[payload.videoIndex]) {
    const webmSrc = payload.videos[payload.videoIndex].WebM;
    const mp4Src = payload.videos[payload.videoIndex].MP4;

    if (webmSrc) {
      $videoPlayer.append(createTag('source', { src: webmSrc, type: 'video/webm' }));
    }

    if (mp4Src) {
      $videoPlayer.append(createTag('source', { src: mp4Src, type: 'video/mp4' }));
    }
  }
  if ($activeTab === $allTabs[2]) {
    loadTranscript($block, payload);
  }

  $videoPlayer.pause();
  $videoPlayer.currentTime = 0;
}

function decorateVideoList($block, payload) {
  const $list = createTag('ol', { class: 'video-player-list' });
  const $videoMenuHeading = createTag('div', { class: 'video-player-menu-heading' });

  $videoMenuHeading.textContent = payload.placeholders['course-menu-heading'];
  $list.append($videoMenuHeading);

  payload.videos.forEach((video, index) => {
    const $listItem = createTag('li', { class: 'video-player-list-item' });
    const $clickable = createTag('a', { class: 'video-player-list-link' });
    const $titleSpan = createTag('span', { class: 'video-title-span' });
    const $durationSpan = createTag('span', { class: 'video-title-duration' });

    $titleSpan.textContent = video['Video Name'];
    $durationSpan.textContent = video['Video Length'];
    $list.append($listItem);
    $listItem.append($clickable);
    $clickable.append($titleSpan, $durationSpan);

    if (index === 0) {
      $clickable.classList.add('active');
    }

    $clickable.addEventListener('click', () => {
      const $allVideoButtons = $list.querySelectorAll('.video-player-list-link');
      if (payload.videoIndex !== index) {
        $allVideoButtons[payload.videoIndex].classList.remove('active');
        $allVideoButtons[index].classList.add('active');
        payload.videoIndex = index;
        loadVideo($block, payload);
      }
    });
  });

  return $list;
}

function decorateVideoPlayer($block, payload) {
  const $videoPlayerWrapper = createTag('div', { class: 'video-player-wrapper' });
  const $videoMenu = createTag('div', { class: 'video-player-menu' });

  const $videoPlayer = createTag('video', {
    class: 'video-player',
    controls: true,
    download: false,
    preload: 'metadata',
  });
  const $videoList = decorateVideoList($block, payload);

  $videoMenu.append($videoList);
  $videoPlayerWrapper.append($videoPlayer, $videoMenu);
  $block.append($videoPlayerWrapper);
  loadVideo($block, payload);
}

async function buildPayload($block, payload) {
  const placeholderKeys = ['course-tab-description', 'course-tab-takeaways', 'course-tab-transcript'];
  const rows = Array.from($block.children);
  const videoSpreadSheetUrl = rows[0].querySelector('a').href;
  payload.videos = await fetchVideos(videoSpreadSheetUrl);
  rows.shift();

  rows.forEach(($row, index, array) => {
    const heading = payload.placeholders[placeholderKeys[index]];
    const content = $row.querySelector('div').innerHTML;
    if (index < array.length - 2) {
      payload.tabs.push({
        heading,
        content,
      });
    } else if (index === 2) {
      const $innerRows = $row.querySelectorAll('div');
      payload.tabs.push({
        heading: payload.placeholders['course-tab-resources'],
        content: [{
          subHeading: $innerRows[0].textContent,
          innerContent: $innerRows[1].innerHTML,
        }],
      });
    } else {
      const $innerRows = $row.querySelectorAll('div');
      payload.tabs[payload.tabs.length - 1].content.push({
        subHeading: $innerRows[0].textContent,
        innerContent: $innerRows[1].innerHTML,
      });
    }
  });
}

export default async function decorate($block) {
  const payload = {
    videoIndex: 0,
    tabs: [],
    videos: [],
    placeholders: await fetchPlaceholders((placeholders) => { return placeholders }),
  };

  await buildPayload($block, payload);
  $block.innerHTML = '';
  decorateVideoPlayer($block, payload);
  decorateTabbedArea($block, payload);
}
