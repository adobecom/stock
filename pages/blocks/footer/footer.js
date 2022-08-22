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
  isNodeName,
} from '../../scripts/utils.js';

export default function decorate($block) {
  // console.log($block);
  
  // let $footerTag = document.querySelector('footer');
  // if (!$footerTag) {
  //   $footerTag = document.createElement('footer');
  //   document.body.append($footerTag);
  // }
  // $footerTag.append($block);

  // // Move default footer into a div called .footer-copyright
  // const $copyright = document.createElement('div');
  // $copyright.classList.add('footer-copyright');
  // const $footerElements = Array.from($footerTag.children);
  // $footerTag.append($copyright);
  // $footerElements.forEach((div) => {
  //   $copyright.append(div);
  // });

  // // Decorate social media icon list
  // const $inlineSVGicons = Array.from($block.querySelectorAll('svg.icon'));
  // $inlineSVGicons.forEach((icon) => {
  //   let $c = icon.parentElement;
  //   if ($c.nodeName.toLowerCase() === 'a') {
  //     $c = $c.parentElement;
  //   }
  //   if ($c.nodeName.toLowerCase() != 'p') {
  //     const p = document.createElement('p');
  //     $c.append(p);
  //     p.append(icon);
  //     $c = p;
  //   }
  //   if ($c.children.length > 1) {
  //     $c.classList.add('icon-container');
  //     icon.setAttribute('fill', 'currentColor');
  //   }
  // });
}
