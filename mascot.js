/* Toolbox mascot — a squat rounded octagon with two capsule eyes that follow
   the pointer and blink. One source for the Toolbox and every tool page:
     <script src="https://granqvistsanna-web.github.io/mascot.js" defer></script>
     <a href="https://granqvistsanna-web.github.io/" data-toolbox-home>Toolbox</a>
   The script draws the mascot into each [data-toolbox-home], gives it the
   .tb-home look, and sets the page's favicon to match. Colours come from the
   page's --ink and --bg (Pumice), with fallbacks. On phones, a mark followed
   by .tb-sep drops its label so "Toolbox / tool" fits one bar. */
(function () {
  var PTS = "32,24 68,24 89,41 89,63 68,80 32,80 11,63 11,41";
  // eyes sit a touch below centre and a touch apart: reads younger, less startled
  var EYES = '<rect class="tb-eye" x="36.5" y="44" width="10" height="19" rx="5"/>' +
    '<rect class="tb-eye" x="53.5" y="44" width="10" height="19" rx="5"/>';
  var SVG = '<svg class="tb-head" viewBox="0 0 100 100" aria-hidden="true"><g class="tb-face">' +
    '<polygon class="tb-oct" points="' + PTS + '" stroke-width="18" stroke-linejoin="round"/>' +
    '<g class="tb-eyes">' + EYES + '</g></g></svg>';
  var SPRING = "var(--spring,cubic-bezier(.28,1.3,.36,1))", SOFT = "var(--spring-soft,cubic-bezier(.3,1.12,.4,1))";

  var css = document.createElement("style");
  css.textContent =
    ".tb-home{display:inline-flex;align-items:center;gap:8px;color:var(--ink,#17181a);text-decoration:none;border-radius:10px;" +
      "font:500 14px/1 var(--font-ui,Inter,'Helvetica Neue',Arial,sans-serif);white-space:nowrap;-webkit-tap-highlight-color:transparent}" +
    ".tb-home:focus-visible{outline:2px solid var(--ink,#17181a);outline-offset:4px}" +
    ".tb-head{width:var(--tb-size,26px);height:var(--tb-size,26px);flex:none;display:block;overflow:visible;" +
      "transition:scale 380ms " + SPRING + "}" +
    ".tb-face{transform-box:fill-box;transform-origin:50% 70%;rotate:var(--tb-tilt,0deg);transition:rotate 520ms " + SPRING + "}" +
    ".tb-oct{fill:var(--ink,#17181a);stroke:var(--ink,#17181a)}" +
    ".tb-eye{fill:var(--bg,#fff);transform-box:fill-box;transform-origin:50% 60%;transition:scale 220ms " + SOFT + "}" +
    // hover: a small happy tilt and a soft squint; press: a squish
    ".tb-home:hover .tb-face{rotate:calc(var(--tb-tilt,0deg) - 8deg)}" +
    ".tb-home:hover .tb-eye{scale:1.06 .62}" +
    ".tb-home:active .tb-head{scale:1.06 .9;transition-duration:120ms}" +
    ".tb-blink .tb-eye{animation:tb-blink 170ms ease-in-out}" +
    "@keyframes tb-blink{50%{scale:1.2 .1}}" +
    ".tb-sep{color:var(--ink-4,#6f6e68);font:400 16px/1 var(--font-ui,Inter,sans-serif);margin:0 2px}" +
    "@media (max-width:560px){.tb-home:has(+.tb-sep) .tb-label{display:none}}" +
    "@media (pointer:coarse){.tb-home{min-height:44px;min-width:44px;justify-content:center}}" +
    "@media (prefers-reduced-motion:reduce){.tb-face,.tb-eye,.tb-head{transition:none}.tb-blink .tb-eye{animation:none}}";
  document.head.appendChild(css);

  // favicon: the same face, flipped to light ink on dark browser chrome
  var fav = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><style>.o{fill:#17181a;stroke:#17181a}.e{fill:#fff}' +
    '@media (prefers-color-scheme:dark){.o{fill:#f2f1ec;stroke:#f2f1ec}.e{fill:#17181a}}</style>' +
    '<polygon class="o" points="' + PTS + '" stroke-width="18" stroke-linejoin="round"/>' +
    '<rect class="e" x="36" y="43" width="11" height="21" rx="5.5"/><rect class="e" x="53" y="43" width="11" height="21" rx="5.5"/></svg>');
  document.querySelectorAll('link[rel~="icon"]').forEach(function (l) { l.remove(); });
  var link = document.createElement("link"); link.rel = "icon"; link.href = fav; document.head.appendChild(link);

  var heads = [];
  function draw() {
    document.querySelectorAll("[data-toolbox-home]").forEach(function (a) {
      if (a.querySelector(".tb-head")) return;
      a.classList.add("tb-home");
      if (!a.getAttribute("aria-label")) a.setAttribute("aria-label", (a.textContent.trim() || "Toolbox") + ", home");
      [].slice.call(a.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) {
          var s = document.createElement("span"); s.className = "tb-label"; s.textContent = n.textContent.trim(); n.replaceWith(s);
        }
      });
      a.insertAdjacentHTML("afterbegin", SVG);
      var h = a.querySelector(".tb-head");
      heads.push({ el: h, eyes: h.querySelector(".tb-eyes"), x: 0, y: 0, tx: 0, ty: 0 });
    });
    if (!still) blinkLater();
  }

  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
  if (still) return;

  // blinks: irregular, both eyes together, now and then a double
  function blink() {
    heads.forEach(function (h) {
      h.el.classList.remove("tb-blink"); void h.el.getBBox(); h.el.classList.add("tb-blink");
    });
  }
  function blinkLater() {
    setTimeout(function () {
      if (!document.hidden) { blink(); if (Math.random() < .2) setTimeout(blink, 260); }
      blinkLater();
    }, 2400 + Math.random() * 3600);
  }

  // eyes ease toward the pointer (up to 13 by 6 units of the 100-unit face);
  // the head leans a few degrees the same way
  var frame = 0, px = null, py = null, idle = 0;
  function aim() {
    heads.forEach(function (h) {
      if (!h.el.getClientRects().length || px === null) { h.tx = h.ty = 0; return; }
      var r = h.el.getBoundingClientRect(), dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      var d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 140);
      h.tx = dx / d * k * 13; h.ty = dy / d * k * 6;
      h.el.style.setProperty("--tb-tilt", (Math.max(-1, Math.min(1, dx / 400)) * 5).toFixed(1) + "deg");
    });
    if (!frame) frame = requestAnimationFrame(step);
  }
  function step() {
    var moving = false;
    heads.forEach(function (h) {
      h.x += (h.tx - h.x) * .2; h.y += (h.ty - h.y) * .2;
      if (Math.abs(h.tx - h.x) + Math.abs(h.ty - h.y) > .05) moving = true;
      h.eyes.style.translate = h.x.toFixed(2) + "px " + h.y.toFixed(2) + "px";
    });
    frame = moving ? requestAnimationFrame(step) : 0;
  }
  document.addEventListener("pointermove", function (e) {
    px = e.clientX; py = e.clientY; aim();
    clearTimeout(idle); idle = setTimeout(rest, 4000);
  }, { passive: true });
  document.addEventListener("pointerdown", function (e) { px = e.clientX; py = e.clientY; aim(); clearTimeout(idle); idle = setTimeout(rest, 2500); }, { passive: true });
  document.documentElement.addEventListener("pointerleave", rest);
  // when nobody's pointing, look back to the middle
  function rest() { px = py = null; heads.forEach(function (h) { h.el.style.setProperty("--tb-tilt", "0deg"); }); aim(); }
})();
