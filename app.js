// app.js
// Shared helpers for SafeCampus (client-side demo)
// - Auth state stored in sessionStorage under 'safecampus_user'
// - Reports stored in localStorage under 'safecampus_reports'
// - Attach guards to links/buttons with data-protect="auth"
// - Provide requireAuth to open login modal or redirect to index.html with redirect param

(function(window){
  const AUTH_KEY = 'safecampus_user';
  const REPORTS_KEY = 'safecampus_reports';

  // Auth helpers
  function getAuthState(){
    const raw = sessionStorage.getItem(AUTH_KEY);
    try{ return raw ? JSON.parse(raw) : null; }catch(e){ return null; }
  }

  function saveAuthState(user){
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  }

  function clearAuthState(){
    sessionStorage.removeItem(AUTH_KEY);
  }

  // Reports storage (client-side demo)
  function getReports(){
    try{ return JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]'); }catch(e){ return []; }
  }

  function saveReports(arr){
    localStorage.setItem(REPORTS_KEY, JSON.stringify(arr || []));
  }

  function saveReport(report){
    const arr = getReports();
    arr.unshift(report); // newest first
    saveReports(arr);
    return report;
  }

  function updateReport(id, updates){
    const arr = getReports();
    const idx = arr.findIndex(r => r.id === id);
    if(idx === -1) return null;
    arr[idx] = Object.assign({}, arr[idx], updates);
    saveReports(arr);
    return arr[idx];
  }

  function deleteReport(id){
    let arr = getReports();
    const exists = arr.some(r => r.id === id);
    if(!exists) return false;
    arr = arr.filter(r => r.id !== id);
    saveReports(arr);
    return true;
  }

  function findReport(id){
    const arr = getReports();
    return arr.find(r => r.id === id) || null;
  }

  // UI guards & redirect helpers
  function requireAuth(redirectTo = 'index.html'){
    const user = getAuthState();
    if(!user){
      // If login modal is available on current page, open it
      if(typeof openModal === 'function'){
        openModal();
        // Store redirect in URL so index.html can navigate back after login if needed
        const current = window.location.pathname.split('/').pop() || '';
        const params = new URLSearchParams(window.location.search);
        params.set('redirect', current);
        // Keep showLogin so index can detect (if we redirected there)
        params.set('showLogin', '1');
        history.replaceState(null, '', window.location.pathname + '?' + params.toString());
      } else {
        // Redirect to index.html and ask to show login, include redirect param back to current page
        const href = window.location.pathname.split('/').pop() || '';
        window.location.href = `${redirectTo}?showLogin=1&redirect=${encodeURIComponent(href)}`;
      }
      return null;
    }
    return user;
  }

  function attachNavGuards(){
    document.querySelectorAll('[data-protect="auth"]').forEach(el=>{
      if(el.__safecampus_guard) return;
      el.__safecampus_guard = true;
      el.addEventListener('click', function(e){
        const user = getAuthState();
        if(!user){
          e.preventDefault();
          if(typeof openModal === 'function'){
            openModal();
            setTimeout(()=> alert('Please sign in with your university account to continue.'), 60);
          } else {
            const href = el.getAttribute('href') || window.location.pathname;
            window.location.href = `index.html?showLogin=1&redirect=${encodeURIComponent(href)}`;
          }
        }
      });
    });
  }

  function maybeShowLoginFromQuery(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('showLogin') === '1' && typeof openModal === 'function'){
      openModal();
    }
  }

  // Make some helpers globally available for backward compatibility
  window.getAuthState = getAuthState;
  window.saveAuthState = saveAuthState;
  window.clearAuthState = clearAuthState;

  // Expose API
  window.SafeCampusApp = {
    getAuthState,
    saveAuthState,
    clearAuthState,
    requireAuth,
    attachNavGuards,
    maybeShowLoginFromQuery,
    // reports
    getReports,
    saveReport,
    updateReport,
    deleteReport,
    findReport
  };

  // Auto attach guards and check query on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    attachNavGuards();
    maybeShowLoginFromQuery();
  });

})(window);