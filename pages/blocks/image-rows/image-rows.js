export default function imageRows(block) {
  Array.from(block.children).forEach((div) => {
    if (!div.querySelector('img')) div.classList.add('image-rows-caption');
  });
}
