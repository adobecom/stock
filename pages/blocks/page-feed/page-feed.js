
import {
  createTag,
  transformLinkToAnimation,
  loadPageFeedCard,
} from '../../scripts/utils.js';

function buildCard(card, overlay = false) {
  card.classList.add('pf-card');
  const cells = Array.from(card.children);
  let hasLink = false;
  cells.forEach((cell, index) => {
    if (index === 0) {
      const pic = cell.querySelector('picture');
      if (pic) {
        cell.classList.add('pf-card-picture');
      } else {
        const a = cell.querySelector('a');
        if (a && a.href.endsWith('.mp4')) {
          let video = null;
          video = transformLinkToAnimation(a);
          cell.innerHTML = '';
          if (video) {
            cell.appendChild(video);
            cell.classList.add('pf-card-picture');
          }
        } else {
          cell.classList.add('pf-card-text');
        }
      }
    } else if (index === 1) {
      cell.classList.add('pf-card-text');
    } else if (index === 2) {
      const cardLink = cell.querySelector('a');
      if (cardLink) {
        cell.classList.add('pf-card-link');
        hasLink = true;
      }
    } else if (index === 3 && card.querySelector('.pf-card-text')) {
      cell.classList.add('pf-card-banner');
      const cardTag = createTag('div');
      cardTag.innerHTML = cell.innerHTML;
      cell.innerHTML = '';
      cell.appendChild(cardTag);
    } else {
      cell.remove();
    }
  });
  if (hasLink) {
    const cardLink = card.querySelector('.pf-card-link a');
    if (cardLink) {
      cardLink.classList.remove('button');
      cardLink.classList.add('pf-card-container-link');
      cardLink.innerText = '';
      card.appendChild(cardLink);
      cells.forEach((div) => {
        cardLink.append(div);
      });
      card.querySelector('.pf-card-link').remove();
    }
  }
  if (overlay) {
    const div = document.createElement('div');
    div.classList.add('pf-card-overlay');
    card.appendChild(div);
  }
  return card
}

export default async function pageFeed(block) {
  const rows = Array.from(block.children);
  block.innerHTML = '';
  const cards = [];
  const overlay = (block.classList.contains('overlay'));
  if (block.classList.contains('fit')) {
    block.classList.add('pf-fit');
    block.classList.remove('fit');
  } else if (overlay) {
    block.classList.add('pf-overlay');
    block.classList.remove('overlay');
  }
  for (let n = 0; n < rows.length; n += 1) {
    const children = rows[n].children;
    if (children.length > 0 && children[0].querySelector('ul')) {
      const pageLinks = children[0].querySelector('ul').querySelectorAll('a');
      for (let i = 0; i < pageLinks.length; i += 1) {
        const card = await loadPageFeedCard(pageLinks[i]);
        if (card) cards.push(buildCard(card, overlay));
      }
    } else {
      cards.push(buildCard(rows[n], overlay));
    }
  };
  block.innerHTML = '';
  block.classList.add(`col-${cards.length}-pf-cards`);
  cards.forEach((card) => {
    block.append(card);
  });
}
