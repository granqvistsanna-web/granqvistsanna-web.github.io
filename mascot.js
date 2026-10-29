/* Toolbox mascot — a squat rounded octagon with two capsule eyes that follow
   the pointer and blink. One source for the Toolbox and every tool page:
     <script src="https://granqvistsanna-web.github.io/mascot.js" defer></script>
     <a href="https://granqvistsanna-web.github.io/" data-toolbox-home>Toolbox</a>
   The script draws the mascot into each [data-toolbox-home], gives it the
   .tb-home look, and sets the page's favicon to match. Colours come from the
   page's --ink and --bg (Pumice), with fallbacks. */
(function () {
  var PTS = "31,22 69,22 91,40 91,64 69,82 31,82 9,64 9,40";
  var SVG = '<svg class="tb-head" viewBox="0 0 100 100" aria-hidden="true">' +
    '<polygon class="tb-oct" points="' + PTS + '" stroke-width="14" stroke-linejoin="round"/>' +
    '<g class="tb-eyes"><rect class="tb-eye" x="39" y="43" width="8" height="18" rx="4"/>' +
    '<rect class="tb-eye" x="53" y="43" width="8" height="18" rx="4"/></g></svg>';

  var css = document.createElement("style");
  css.textContent =
    ".tb-home{display:inline-flex;align-items:center;gap:8px;color:var(--ink,#17181a);text-decoration:none;" +
      "font:500 14px/1 var(--font-ui,Inter,'Helvetica Neue',Arial,sans-serif);white-space:nowrap;-webkit-tap-highlight-color:transparent}" +
    ".tb-head{width:var(--tb-size,26px);height:var(--tb-size,26px);flex:none;display:block;overflow:visible;" +
      "transition:scale var(--t-press,260ms) var(--spring-soft,cubic-bezier(.3,1.12,.4,1))}" +
    ".tb-oct{fill:var(--ink,#17181a);stroke:var(--ink,#17181a);transform-box:fill-box;transform-origin:center;" +
      "transition:rotate 420ms var(--spring,cubic-bezier(.28,1.3,.36,1))}" +
    ".tb-home:hover .tb-oct{rotate:-7deg}.tb-home:active .tb-head{scale:.94}" +
    ".tb-eyes{transition:translate 160ms var(--spring-soft,cubic-bezier(.3,1.12,.4,1))}" +
    ".tb-eye{fill:var(--bg,#fff);transform-box:fill-box;transform-origin:center;animation:tb-blink 5.2s infinite}" +
    ".tb-eye+.tb-eye{animation-delay:.04s}" +
    "@keyframes tb-blink{0%,93%,100%{scale:1 1}95%{scale:1.25 .2}}" +
    ".tb-sep{color:var(--ink-4,#6f6e68);font:400 16px/1 var(--font-ui,Inter,sans-serif);margin:0 2px}" +
    "@media (pointer:coarse){.tb-home{min-height:44px}}" +
    "@media (prefers-reduced-motion:reduce){.tb-eye{animation:none}.tb-eyes,.tb-oct,.tb-head{transition:none}}";
  document.head.appendChild(css);

  // favicon: the same face, so every tab in the Toolbox family matches
  var fav = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><polygon points="' + PTS +
    '" fill="#17181a" stroke="#17181a" stroke-width="14" stroke-linejoin="round"/>' +
    '<rect x="38" y="41" width="10" height="22" rx="5" fill="#fff"/><rect x="52" y="41" width="10" height="22" rx="5" fill="#fff"/></svg>');
  document.querySelectorAll('link[rel~="icon"]').forEach(function (l) { l.remove(); });
  var link = document.createElement("link"); link.rel = "icon"; link.href = fav; document.head.appendChild(link);

  var heads = [];
  function draw() {
    document.querySelectorAll("[data-toolbox-home]").forEach(function (a) {
      if (a.querySelector(".tb-head")) return;
      a.classList.add("tb-home");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", (a.textContent.trim() || "Toolbox") + ", home");
      a.insertAdjacentHTML("afterbegin", SVG);
      heads.push(a.querySelector(".tb-head"));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();

  // eyes look toward the pointer: up to 14 and 7 units of the 100-unit face
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var frame = 0, px = 0, py = 0;
  document.addEventListener("pointermove", function (e) {
    px = e.clientX; py = e.clientY;
    if (frame) return;
    frame = requestAnimationFrame(function () {
      frame = 0;
      heads.forEach(function (h) {
        if (!h.getClientRects().length) return;
        var r = h.getBoundingClientRect(), dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 160);
        h.querySelector(".tb-eyes").style.translate = (dx / d * k * 14).toFixed(1) + "px " + (dy / d * k * 7).toFixed(1) + "px";
      });
    });
  }, { passive: true });
})();
