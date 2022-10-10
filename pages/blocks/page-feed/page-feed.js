
import {
  createTag,
  transformLinkToAnimation,
  makeRelative,
  turnH6intoDetailM,
} from '../../scripts/utils.js';

export async function loadPageFeedCard(a) {
  const href = (typeof (a) === 'string') ? a : a.href;
  const path = makeRelative(href);
  if (!path.startsWith('/')) return null;
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pfCard = doc.querySelector('.page-feed-card > div');
  if (pfCard) {
    turnH6intoDetailM(pfCard);
    const aEl = (a && a.nodeType) ? a : createTag('a', { href: path });
    pfCard.append(createTag('div', {}, aEl));
    // eslint-disable-next-line consistent-return
    return pfCard;
  }
}

export async function loadPageFeedFromSpreadsheet(sheetUrl) {
  const path = makeRelative(sheetUrl);
  if (!path.startsWith('/')) return null;
  const resp = await fetch(path);
  if (!resp.ok) return;
  const json = await resp.json();
  const returnUrls = [];
  json.data.forEach((row) => {
    returnUrls.push({ link: row['page-url'], setting: row['setting'] })
  });
  return returnUrls;
}

function buildCard(card, overlay = false) {
  card.classList.add('pf-card');
  const cells = Array.from(card.children);
  let hasLink = false;
  cells.forEach((cell, index) => {
    if (index === 0) {
      const pic = cell.querySelector('picture:first-child:last-child');
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
        if (pageLinks[i] && pageLinks[i].href && pageLinks[i].href.endsWith('.json')) {
          const linksFromSpreadsheet = await loadPageFeedFromSpreadsheet(pageLinks[i].href);
          if (linksFromSpreadsheet && linksFromSpreadsheet.length) {
            for (let x = 0; x < linksFromSpreadsheet.length; x += 1) {
              if (linksFromSpreadsheet[x].setting !== 'in_featured_pod') {
                const card = await loadPageFeedCard(linksFromSpreadsheet[x].link);
                if (card) cards.push(buildCard(card, overlay));
              }
            }
          }
        } else if (pageLinks[i] && pageLinks[i].href) {
          const card = await loadPageFeedCard(pageLinks[i]);
          if (card) cards.push(buildCard(card, overlay));
        }
      }
    } else {
      cards.push(buildCard(rows[n], overlay));
    }
  };
  block.innerHTML = '';
  let len = cards.length;
  let odd = false;
  if (cards.length === 1 || cards.length === 2 ) {
    len = 2;
  } else if (cards.length % 3 === 0) {
    len = 3;
  } else if (cards.length % 4 === 0) {
    len = 4;
  } else if (cards.length % 5 === 0) {
    len = 5;
  } else {
    len = 4;
  }
  if (cards.length === 5) {
    block.classList.add(`col-3-pf-cards`);
    const pfRowFive = createTag('div', { class: 'page-feed col-2-pf-cards' });
    pfRowFive.append(cards[3]);
    pfRowFive.append(cards[4]);
    block.insertAdjacentElement('afterend', pfRowFive)
  } else {
    block.classList.add(`col-${len}-pf-cards`);
  }
  cards.forEach((card, index) => {
    if (len != 5 || (len === 5 && index < 3)) {
      block.append(card);
    }
  });
}
