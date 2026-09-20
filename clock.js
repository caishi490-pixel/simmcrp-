/* 页头那口钟。每个页面都引用它。 */
(function () {
  "use strict";
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var el = document.getElementById("clock");
  if (!el) return;
  function tick() {
    var d = new Date();
    el.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  tick();
  setInterval(tick, 1000);
})();
