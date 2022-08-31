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

function createTag(name, attrs) {
  const el = document.createElement(name);
  if (typeof attrs === 'object') {
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
  }
  return el;
}

function injectFBSDK() {
  const script = `<!-- Load Facebook SDK for JavaScript -->
    <div id="fb-root"></div>
    <script>(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
    fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));</script>`;

  const body = document.querySelector('body');
}

function decorateSocialShareLinks($block, payload) {

}

function loadTranscript($block, payload) {
  const $contentArea = $block.querySelector('.content-area');
  $contentArea.innerHTML = '';
  $contentArea.textContent = payload.videos[payload.videoIndex].Transcript;
}

function loadTabContent($block, payload, index) {
  const $contentArea = $block.querySelector('.content-area');
  $contentArea.innerHTML = payload.tabs[index].content;

  // build cards if there are <li> with <a>
  const isLastTab = index === payload.tabs.length - 1;
  const $listItems = $contentArea.querySelectorAll('li');
  const $liWithLink = [];
  for (let i = 0; i < $listItems.length; i += 1) {
    const $link = $listItems[i].querySelector('a');
    if ($link) {
      $liWithLink.push($link);
    }
  }

  if ($liWithLink.length > 0 && isLastTab) {
    for (let i = 0; i < $liWithLink.length; i += 1) {
      const $picture = $liWithLink[i].querySelector('picture');
      if ($picture) {

      }
    }
  }
}

function decorateTabbedArea($block, payload) {
  const $tabbedArea = createTag('div', { class: 'tabbed-area' });
  const $tabs = createTag('div', { class: 'tabs' });
  const $contentArea = createTag('div', { class: 'content-area' });

  payload.tabs.forEach((tab, index) => {
    const $tab = createTag('a', { class: 'tab' });
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

    $clickable.addEventListener('click', () => {
      if (payload.videoIndex !== index) {
        payload.videoIndex = index;
        loadVideo($block, payload);
      }
    });
  });

  return $list;
}

function decorateVideoPlayer($block, payload) {
  const $videoPlayerWrapper = createTag('div', { class: 'video-player-wrapper' });
  const $videoPlayer = createTag('video', {
    class: 'video-player',
    controls: true,
    download: false,
    preload: 'metadata',
  });
  const $videoList = decorateVideoList($block, payload);

  $videoPlayerWrapper.append($videoPlayer, $videoList);
  $block.append($videoPlayerWrapper);
  loadVideo($block, payload);
}

async function buildPayload($block, payload) {
  const rows = Array.from($block.children);
  const videoSpreadSheetUrl = rows[0].querySelector('a').href;
  payload.videos = await fetchVideos(videoSpreadSheetUrl);
  rows.shift();

  rows.forEach(($row) => {
    const firstCol = $row.querySelector('div');
    const heading = firstCol.textContent;
    firstCol.remove();
    const content = $row.querySelector('div').innerHTML;
    payload.tabs.push({
      heading,
      content,
    });
  });
}

export default async function decorate($block) {
  const payload = {
    videoIndex: 0,
    tabs: [],
    videos: [],
  };

  await buildPayload($block, payload);
  $block.innerHTML = '';
  decorateVideoPlayer($block, payload);
  decorateTabbedArea($block, payload);
}
