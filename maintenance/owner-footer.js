/* Static-export enhancement. Reapply after exporting the original Next.js project. */
(() => {
  if (window.fumeOwnerFooterInstalled) return;
  window.fumeOwnerFooterInstalled = true;
  function addOwnerLink() {
    document.querySelectorAll('footer').forEach(footer => {
      if (footer.querySelector('[data-owner-dashboard]')) return;
      const arabic = location.pathname.startsWith('/ar/');
      const row = document.createElement('div');
      row.dataset.ownerDashboard = 'true';
      row.style.cssText = 'max-width:1280px;margin:auto;padding:20px 32px;border-top:1px solid #ffffff26;font-size:14px';
      const link = document.createElement('a');
      // Use a full document navigation: the old RSC export contains a placeholder dashboard.
      link.href = arabic ? '/ar/dashboard/' : '/dashboard/';
      link.textContent = arabic ? 'لوحة المالك ↗' : 'Owner dashboard ↗';
      link.style.cssText = 'color:inherit;text-decoration:underline;text-underline-offset:4px';
      row.append(link);
      footer.append(row);
    });
  }
  new MutationObserver(addOwnerLink).observe(document.documentElement, {childList:true, subtree:true});
  addOwnerLink();
})();
