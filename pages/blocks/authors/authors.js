import { getLibs, getMetadata } from '../../scripts/utils.js';
const libs = getLibs();
const { createTag } = await import(`${libs}/scripts/utils.js`);
const { replacekey } = await import(`${libs}/features/placeholders.js`);

export default async function authors(block) {
  const metaAuthors = getMetadata('authors');

  const heading = createTag('h3');
  const authors = createTag('p');

  heading.textContent = `${await replacekey('authors')}:`;
  authors.textContent = metaAuthors;

  block.append(heading, authors);
}
