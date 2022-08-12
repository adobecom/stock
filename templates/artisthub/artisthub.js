(function turnH6intoDetailM() {
  document.querySelectorAll('h6').forEach(($h6) => {
    const $p = document.createElement('p');
    $p.classList.add('detail-M');
    const attrs = $h6.attributes;
    for (let i = 0, len = attrs.length; i < len; i += 1) {
      $p.setAttribute(attrs[i].name, attrs[i].value);
    }
    $p.innerHTML = $h6.innerHTML;
    $h6.parentNode.replaceChild($p, $h6);
  });
})();

(function decorateButtons() {
  const $blocksWithoutButton = ['header', 'footer', 'breadcrumbs', 'sitemap', 'embed', 'quote', 'images', 'title', 'share', 'tags'];
  const isNodeName = (node, name) => {
    if (!node || typeof node !== 'object') return false;
    return node.nodeName.toLowerCase() === name.toLowerCase();
  }
  document.querySelectorAll(':scope a').forEach(($a) => {
    $a.title = $a.title || $a.textContent || $a.href;
    const $block = $a.closest('div.section > div');
    const blockNames = [];
    if ($block) {
      const blockClassNames = $block.className.split(' ');
      blockClassNames.forEach((className) => {
        blockNames.push(className);
      });
    }
    if (!blockNames.some((e) => $blocksWithoutButton.includes(e))) {
      const $p = $a.closest('p');
      if ($p) {
        const childNodes = Array.from($p.childNodes);
        const whitespace = new RegExp('^\\s*$');
        // Check that the 'button-container' contains buttons only
        const buttonsOnly = childNodes.every(($c) => {
          if (isNodeName($c, 'a') || (isNodeName($c, '#text') && whitespace.test($c.textContent))) {
            return true;
          } else if ($c.childNodes.length > 0) {
            return Array.from($c.childNodes).every(($cc) => {
              if (isNodeName($cc, 'a') || (isNodeName($cc, '#text') && whitespace.test($cc.textContent))) {
                return true;
              } else if ($cc.childNodes.length > 0) {
                // Could be nested twice for 'em' and 'strong' tags.
                return Array.from($cc.childNodes).every(($ccc) => isNodeName($ccc, 'a') || (isNodeName($ccc, '#text') && whitespace.test($ccc.textContent)));
              } else return false;
            });
          } else return false;
        });
        if (buttonsOnly) {
          $p.classList.add('button-container');
          const $up = $a.parentElement;
          const $twoUp = $a.parentElement.parentElement;
          const $threeUp = $a.parentElement.parentElement.parentElement;
          if (isNodeName($up, 'p')) {
            $a.className = 'button transparent'; // default
          }
          if (isNodeName($up, 'strong') && isNodeName($twoUp, 'p')) {
            $a.className = 'button primary';
          }
          if (isNodeName($up, 'em') && isNodeName($twoUp, 'p')) {
            $a.className = 'button secondary';
          }
          if (((isNodeName($up, 'em') && isNodeName($twoUp, 'strong'))
            || (isNodeName($up, 'strong') && isNodeName($twoUp, 'em')))
            && isNodeName($threeUp, 'p')) {
            $a.className = 'button accent';
          }
        }
      }
    }
  });
})();
