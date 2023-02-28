import { 
  getMetadata,
  createTag,
  getConfig,
  replaceKey,
} from '../../scripts/utils.js';

export default async function authors(block) {
  const metaAuthors = getMetadata('authors');
  const heading = createTag('h3');
  const authors = createTag('p');
  const headingTitle = await replaceKey('authors', getConfig());
  heading.textContent = headingTitle;
  authors.textContent = metaAuthors;
  block.append(heading, authors);
}
