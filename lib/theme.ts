// Light/dark theme shared by the inline script (runs before first paint) and the toggle.
export const THEME_STORAGE_KEY = "henprotrust-theme";

/** Applies the saved theme before the page is painted (no flash). Light is the default. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
