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
import { getMetadata, fetchPlaceholders } from '../../scripts/scripts.js';
import { createTag } from '../../scripts/utils.js';

export default async function decorate($block) {
  const metaAuthors = getMetadata('authors');
  const placeholders = await fetchPlaceholders((placeholders) => placeholders);

  const $heading = createTag('h3');
  const $authors = createTag('p');

  $heading.textContent = `${placeholders['authors-block-heading']}:`;
  $authors.textContent = metaAuthors;

  $block.append($heading, $authors);
}
