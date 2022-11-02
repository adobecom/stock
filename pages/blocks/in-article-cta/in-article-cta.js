export default async function inArticleCta(block) {
  const firstLayer = block.querySelector('div');

  block.classList.add('content');
  firstLayer.classList.add('in-article-cta-container');

  if (firstLayer) {
    const $divs = block.querySelector('div').querySelectorAll('div');

    Array.from($divs).forEach(($div) => {
      if ($div.querySelector('div:scope>picture')) {
        $div.classList.add('in-article-cta-image-container');
      } else {
        $div.classList.add('in-article-cta-content-container');
      }
    });
  }
}
