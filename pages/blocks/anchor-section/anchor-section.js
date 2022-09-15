export default function anchorSection(block) {
  const anchor = block.textContent.trim();
  const section = block.closest('main > .section');
  block.remove();
  section.setAttribute('data-anchor-section', anchor);
  Array.from(document.querySelectorAll(`a[href$="${anchor}"]`)).forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      Array.from(document.querySelectorAll('.section[data-anchor-section]')).forEach((section) => {
        section.classList.add('anchor-section-toggle--hidden');
        section.classList.remove('anchor-section-toggle--active');
      });
      section.classList.add('anchor-section-toggle--active');
      section.classList.remove('anchor-section-toggle--hidden');
    });
  });
}
