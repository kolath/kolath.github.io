// Filter button visual toggle (prototype only - no real dropdown)
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('filter-btn--active');
    });
  });

  // View toggle
  const viewBtns = document.querySelectorAll('.view-toggle__btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('view-toggle__btn--active'));
      btn.classList.add('view-toggle__btn--active');
    });
  });
});
