const { createTag, getConfig, sampleRUM } = await import('../../scripts/utils.js');

async function load404() {
  const { locale } = getConfig();
  const main = document.body.querySelector('main');
  main.innerHTML = '';
  let resp = await fetch(`${locale.contentRoot}/404.plain.html`);
  if (!resp || !resp.ok) {
    resp = await fetch('/pages/404.plain.html');
  }
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const section = createTag('div', { class: 'section' });
  main.appendChild(section);
  const sectionDiv = createTag('div');
  section.appendChild(sectionDiv);
  const backgroudWrapper = createTag('div');
  const backgroud = createTag('div', { class: 'error404-background' }, backgroudWrapper);
  sectionDiv.appendChild(backgroud);
  const title = doc.querySelector('h1');
  title.after(createTag('hr'));
  const textSection = title.parentElement;
  textSection.classList.add('error404-textwrapper')
  sectionDiv.appendChild(textSection);
  const cta = textSection.querySelector('a');
  cta.classList.add('button', 'transparent');
  if (window.location.pathname.includes('/pages/artisthub/')) {
    cta.href = `${locale.contentRoot}/artisthub/`;
  }
  const videoSection = textSection.querySelector('.random-video-background-options');
  if (videoSection) {
    const videoOptions = videoSection.querySelectorAll(':scope > div');
    const randomVideo = videoOptions[Math.floor(Math.random() * videoOptions.length)];
    const videoSource = randomVideo.querySelector('p:first-child > a').href;
    const videoCaption = randomVideo.querySelector('p:last-child');
    videoCaption.classList.add('error404-video-caption');
    backgroudWrapper.innerHTML = /* html */ `
      <video playsinline autoplay loop muted>
        <source src="${videoSource}" type="video/mp4">
      </video>
    `;
    backgroudWrapper.appendChild(videoCaption);
    backgroudWrapper.after(createTag('div', { class: 'error404-background-overlay' }));
    videoSection.remove();
  }
  const footer = document.querySelector('footer');
  footer.remove();
  sampleRUM('404', { source: document.referrer, target: window.location.href });
}

(async function init() {
  load404();
}());
