// Row action three-dots menu
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.row-action__trigger');

    // Close all open menus first
    document.querySelectorAll('.row-action__menu--open').forEach(menu => {
      if (!trigger || menu !== trigger.nextElementSibling) {
        menu.classList.remove('row-action__menu--open');
        menu.style.top = '';
        menu.style.left = '';
      }
    });

    // Toggle the clicked menu with fixed positioning
    if (trigger) {
      e.stopPropagation();
      const menu = trigger.nextElementSibling;
      if (menu) {
        const isOpen = menu.classList.contains('row-action__menu--open');
        if (isOpen) {
          menu.classList.remove('row-action__menu--open');
          menu.style.top = '';
          menu.style.left = '';
        } else {
          // Position relative to trigger using fixed coords
          const rect = trigger.getBoundingClientRect();
          menu.style.top = (rect.bottom + 4) + 'px';
          menu.style.left = (rect.right - 200) + 'px'; // align right edge
          menu.classList.add('row-action__menu--open');
        }
      }
    }
  });
});
