// @ts-nocheck
/**
 * Gravity Pixel — exact vendor snippet (pixel ID + script URL must stay as-is).
 * Called once from the root App component. Guarded so React Strict Mode
 * (double useEffect in dev) does not inject a second copy.
 */
export function installGravityPixel() {
  if (typeof window === 'undefined') return
  if (window.__bountyhubGravityPixelInstalled) return
  window.__bountyhubGravityPixelInstalled = true

  !function(w,d,t,u,n,a,m){w['GravityPixelObject']=n;w[n]=w[n]||function(){
  (w[n].q=w[n].q||[]).push(arguments)},w[n].l=1*new Date();a=d.createElement(t),
  m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
  }(window,document,'script','https://code.trygravity.com/gr-pix.js','gravity');
  gravity('init', '21bc572a-7a9c-4ee7-b10d-aaeddf02025e');
}
