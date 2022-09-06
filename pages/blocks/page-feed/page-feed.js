
import {
  getArtistHubPagesByCategory,
  createTag
} from '../../scripts/utils.js';

export default async function decorate($block) {
  const $rows = [...$block.children];
  let pages;
  for (const $div of $rows) {
    let key;
    let value;
    if ([...$div.children].length > 1) {
      key = $div.children[0].textContent.trim().toLowerCase();
      value = $div.children[1].textContent.trim().toLowerCase();
      if (key && key === 'category') {
        pages = await getArtistHubPagesByCategory(value);
      }
    }
  }
  $block.innerHTML = '';
  if (pages) {
    // for each page...

    // check if the page is already there

    // create a card for the page 
    // { image, detail, header, text}

    // add the card to a cards-array

    // build the page using the cards-array (automatically look good depending on how many cards are in the array)

    console.log(pages);
    pages.forEach((page) => {
      const $a = createTag('a');
      $a.innerHTML = `<a href="${page.path}">${page.path}</a>;`
      $block.append($a);
    })
  }
}
