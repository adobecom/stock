const delay = (timeOut, cb) => new Promise((resolve) => {
  setTimeout(() => {
    resolve((cb && cb()) || null);
  }, timeOut);
});
function fixMiloVideoClassNameOfContainerInFeaturedColumnsBlock() {
  document.querySelectorAll('.featured-column').forEach((col) => {
    if (col.querySelector('.milo-video')) col.classList.add('picture-column');
  })
}
await delay(50);
fixMiloVideoClassNameOfContainerInFeaturedColumnsBlock();
await delay(50);
fixMiloVideoClassNameOfContainerInFeaturedColumnsBlock();
await delay(50);
fixMiloVideoClassNameOfContainerInFeaturedColumnsBlock();
await delay(50);
fixMiloVideoClassNameOfContainerInFeaturedColumnsBlock();
