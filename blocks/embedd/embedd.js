/**
 * embedd Block - Converts YouTube links into responsive lazy-loaded video players.
 */
export default function decorate(block) {
  const link = block.querySelector('a')?.href || block.textContent.trim();
  if (!link) return;

  const ytMatch = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embedd\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    block.innerHTML = ''; // Clear raw text link

    const container = document.createElement('div');
    container.className = 'embedd-youtube-wrapper';
    container.style.aspectRatio = '16 / 9';
    container.style.width = '100%';
    container.style.backgroundColor = '#000000';

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube-nocookie.com/embedd/${videoId}?autoplay=0`;
        iframe.title = 'YouTube Video Embed';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = '0';

        container.appendChild(iframe);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(block);
    block.appendChild(container);
  }
}
