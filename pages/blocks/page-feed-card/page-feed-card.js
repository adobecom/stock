export default function decorate(block) {
  block.remove();
  // this block should not appear within the page, only within other pages that link to this page using the page-feed block.
}
