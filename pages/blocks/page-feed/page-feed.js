import {
  createTag,
  transformLinkToAnimation,
  makeRelative,
  turnH6intoDetailM,
  fetchPlaceholders,
} from '../../scripts/utils.js';

const placeholders = await fetchPlaceholders((result) => result);
const payload = {
  offset: 0,
};

function getFetchRange() {
  let range;

  if (payload.offset + payload.limit < payload.total) {
    range = payload.offset + payload.limit;
  } else {
    range = payload.total;
  }
  
  return range;
}

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
    returnUrls.push({ link: row['page-url'], setting: row['setting'] });
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
  return card;
}

function decorateLoadMoreButton(block) {
  const loadMoreWrapper = createTag('div', { class: 'content' });
  const loadMore = document.createElement('a');
  loadMore.className = 'button transparent';
  loadMore.href = '#';
  loadMore.textContent = placeholders['load-more'];
  loadMoreWrapper.append(loadMore);
  block.insertAdjacentElement('afterend', loadMoreWrapper);

  return {
    wrapper: loadMoreWrapper,
    button: loadMore,
  };
}

function getCols(total) {
  let len;
  if (total === 1 || total === 2) {
    len = 2;
  } else if (total % 3 === 0) {
    len = 3;
  } else if (total % 4 === 0) {
    len = 4;
  } else if (total % 5 === 0) {
    len = 5;
  } else {
    len = 4;
  }

  return len;
}

function decorateCards(block, cards, offset) {
  payload.offset = offset;

  if (payload.total === 5) {
    block.classList.add('col-3-pf-cards');
    const pfRowFive = createTag('div', { class: 'page-feed col-2-pf-cards' });
    pfRowFive.append(cards[3]);
    pfRowFive.append(cards[4]);
    payload.offset += 2;
    block.insertAdjacentElement('afterend', pfRowFive);
  } else {
    block.classList.add(`col-${payload.cols}-pf-cards`);
  }

  for (let i = 0; i < cards.length; i += 1) {
    if (payload.cols !== 5 || (payload.cols === 5 && i < 3)) {
      block.append(cards[i]);
      payload.offset += 1;
    }
  }

  const newRange = getFetchRange();

  if (payload.offset < payload.total) {
    const loadMoreObject = decorateLoadMoreButton(block);
    loadMoreObject.button.addEventListener('click', async (event) => {
      event.preventDefault();
      loadMoreObject.wrapper.remove();

      const newCards = [];

      for (let i = payload.offset; i < newRange; i += 1) {
        if (payload.loadFromJson) {
          if (payload.pageLinks[i].setting !== 'in_featured_pod') {
            const card = await loadPageFeedCard(payload.pageLinks[i].link);
            if (card) newCards.push(buildCard(card, payload.overlay));
          }
        } else if (payload.pageLinks[i] && payload.pageLinks[i].href) {
          const card = await loadPageFeedCard(payload.pageLinks[i]);
          if (card) newCards.push(buildCard(card, payload.overlay));
        }
      }

      decorateCards(block, newCards, payload.offset);
    });
  }
}

export default async function pageFeed(block) {
  const rows = Array.from(block.children);
  const cards = [];
  const overlay = (block.classList.contains('overlay'));
  payload.overlay = overlay;
  if (block.classList.contains('fit')) {
    block.classList.add('pf-fit');
    block.classList.remove('fit');
  } else if (overlay) {
    block.classList.add('pf-overlay');
    block.classList.remove('overlay');
  }

  for (let n = 0; n < rows.length; n += 1) {
    const { children } = rows[n];
    if (children.length > 0 && children[0].querySelector('ul')) {
      const pageLinks = children[0].querySelector('ul').querySelectorAll('a');
      if (pageLinks[0] && pageLinks[0].href && pageLinks[0].href.endsWith('.json')) {
        payload.loadFromJson = true;
        const linksFromSpreadsheet = await loadPageFeedFromSpreadsheet(pageLinks[0].href);
        if (linksFromSpreadsheet && linksFromSpreadsheet.length) {
          payload.pageLinks = linksFromSpreadsheet;
          payload.total = linksFromSpreadsheet.length;
          payload.cols = getCols(payload.total);
          payload.limit = payload.cols % 2 ? 6 : 8;
          const range = getFetchRange();
          for (let x = 0; x < range; x += 1) {
            if (linksFromSpreadsheet[x].setting !== 'in_featured_pod') {
              const card = await loadPageFeedCard(linksFromSpreadsheet[x].link);
              if (card) cards.push(buildCard(card, overlay));
            }
          }
        }
      } else {
        payload.pageLinks = pageLinks;
        payload.loadFromJson = false;
        payload.total = pageLinks.length;
        payload.cols = getCols(payload.total);
        payload.limit = payload.cols % 2 ? 6 : 8;
        const range = getFetchRange();
        for (let i = 0; i < range; i += 1) {
          if (pageLinks[i] && pageLinks[i].href) {
            const card = await loadPageFeedCard(pageLinks[i]);
            if (card) cards.push(buildCard(card, overlay));
          }
        }
      }
    } else {
      cards.push(buildCard(rows[n], overlay));
    }
  }
  block.innerHTML = '';
  decorateCards(block, cards, payload.offset);
}
