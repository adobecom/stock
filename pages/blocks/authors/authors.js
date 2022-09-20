import { getMetadata, createTag, fetchPlaceholders } from '../../scripts/utils.js';

export default async function authors(block) {
  const metaAuthors = getMetadata('authors');
  const placeholders = await fetchPlaceholders((placeholders) => placeholders);

  const heading = createTag('h3');
  const authors = createTag('p');

  heading.textContent = `${placeholders['authors-block-heading']}:`;
  authors.textContent = metaAuthors;

  block.append(heading, authors);
}
