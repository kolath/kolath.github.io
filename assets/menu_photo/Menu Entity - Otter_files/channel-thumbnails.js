document.addEventListener('DOMContentLoaded', () => {
  const channelLogos = [
    { name: 'DoorDash', src: 'assets/thumbnails/DoorDash.svg' },
    { name: 'Uber Eats', src: 'assets/thumbnails/Uber Eats.svg' },
    { name: 'Grubhub', src: 'assets/thumbnails/Grubhub.svg' },
    { name: 'Direct Orders', src: 'assets/Icons/App Icons/Online Ordering.svg' },
    { name: 'Otter POS', src: 'assets/Icons/App Icons/POS.svg' }
  ];

  function buildChannelStack(count) {
    const stack = document.createElement('span');
    stack.className = 'channel-stack';
    stack.setAttribute('aria-label', `${count} ${count === 1 ? 'channel' : 'channels'}`);
    stack.title = channelLogos.slice(0, count).map(channel => channel.name).join(', ');

    channelLogos.slice(0, count).forEach(channel => {
      const img = document.createElement('img');
      img.src = channel.src;
      img.alt = channel.name;
      stack.appendChild(img);
    });

    return stack;
  }

  function renderChannelCells(root = document) {
    root.querySelectorAll('td').forEach(cell => {
      if (cell.dataset.channelThumbs === 'true' || cell.querySelector('.channel-stack')) return;

      const match = cell.textContent.trim().match(/^([1-5]) channels?$/i);
      if (!match || !cell.closest('table')) return;

      const count = Number(match[1]);
      cell.textContent = '';
      cell.appendChild(buildChannelStack(count));
      cell.dataset.channelThumbs = 'true';
    });
  }

  renderChannelCells();

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        renderChannelCells(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
