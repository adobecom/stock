export default async function decorate($block) {
  const $section = $block.closest('main > .section');
  $block.remove();
  if ($section.childElementCount === 0) $section.remove();
}
