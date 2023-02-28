import { getLibs } from '../../scripts/utils.js';
const { decorateBlockAnalytics } = await import(`${getLibs()}/martech/attributes.js`);

export default function imageRows(block) {
  decorateBlockAnalytics(block);
  Array.from(block.children).forEach((div) => {
    if (!div.querySelector('img')) div.classList.add('image-rows-caption');
  });
}
