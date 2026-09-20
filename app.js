/* 系统面板这一页用的脚本。
   只做三件事：在线人数轻微浮动、把近五日的活动记录铺出来、工单。
   时钟在 clock.js 里。 */

(function () {
  "use strict";

  var pad = function (n) { return String(n).padStart(2, "0"); };
  function stamp(d) {
    d = d || new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  function stampFull(d) {
    d = d || new Date();
    return pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + stamp(d);
  }

  /* ── 在线人数：轻微浮动，看起来是活的 ───────────── */
  var online = document.getElementById("online");
  if (online) {
  var base = 1047;
  setInterval(function () {
    base += (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.8 ? 1 : 2);
    if (base < 1032) base = 1032;
    if (base > 1061) base = 1061;
    online.textContent = base.toLocaleString("en-US");
  }, 9000);
  }

  /* ── 活动记录 ─────────────────────────────────── */
  // 四行日程，一天一遍。前面几天是"正常的历史"，后面刷出来的才是不对的地方。
  var SCHEDULE = ["07:20  开门", "09:00  改价", "12:00  午饭", "19:30  关门"];
  var log = document.getElementById("log");
  var cursor = 0;
  var count = 0;
  var MAX = 200;

  function line(text, odd, when) {
    var el = document.createElement("div");
    var t = document.createElement("span");
    t.className = "t";
    t.textContent = "[" + stampFull(when) + "] ";
    el.appendChild(t);

    var b = document.createElement("span");
    if (odd) b.className = "odd";
    b.textContent = text;
    el.appendChild(b);

    log.appendChild(el);
    while (log.childElementCount > MAX) log.removeChild(log.firstChild);
    log.scrollTop = log.scrollHeight;
    count++;
  }

  // ── 近五日：前面四天一模一样，今天停在 09:00 ──
  var HOURS = [7, 9, 12, 19];
  var MINS = [20, 0, 0, 30];
  var now = new Date();
  for (var back = 4; back >= 1; back--) {
    var day = new Date(now.getTime() - back * 86400000);
    for (var i = 0; i < SCHEDULE.length; i++) {
      var t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), HOURS[i], MINS[i], 0);
      line(SCHEDULE[i], false, t);
      cursor = i + 1;
    }
  }
  // 今天：只到 09:00 改价。后面没有了。
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), HOURS[0], MINS[0], 0);
  line(SCHEDULE[0], false, today);
  var today2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), HOURS[1], MINS[1], 0);
  line(SCHEDULE[1], false, today2);

  /* ── 工单 ─────────────────────────────────────── */
  var subject = document.getElementById("subject");
  var body = document.getElementById("body");
  var receipt = document.getElementById("receipt");
  var consent = document.getElementById("consent");
  var msg = document.getElementById("msg");
  var plain = "";

  function shortCode(text, salt) {
    // 自己算一个短码，不联网。内容变了码就变。
    var h = 2166136261;
    var s = salt + "|" + text;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h.toString(16).toUpperCase().padStart(8, "0").slice(0, 4);
  }

  document.getElementById("submit").addEventListener("click", function () {
    var text = body.value.trim();
    if (!text) {
      msg.textContent = "内容不能为空。";
      body.focus();
      return;
    }
    msg.textContent = "";

    var d = new Date();
    var id = "TP-" + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + shortCode(text, stamp());
    var at = stamp();

    plain =
      "工单号    " + id + "\n" +
      "主题      " + subject.value + "\n" +
      "状态      已受理\n" +
      "受理人    ——\n" +
      "提交时间  " + at + "\n" +
      "──────────────\n" +
      text;

    receipt.textContent = plain;
    receipt.hidden = false;
    consent.hidden = false;
    if (window.SIMMC) SIMMC.page("panel", "solved");   // 大站那边把这一页记成「已解开」
    document.getElementById("submit").disabled = true;
    body.readOnly = true;
  });

  document.getElementById("reset").addEventListener("click", function () {
    body.value = "";
    body.readOnly = false;
    receipt.hidden = true;
    receipt.textContent = "";
    consent.hidden = true;
    msg.textContent = "";
    document.getElementById("submit").disabled = false;
    plain = "";
    body.focus();
  });

  consent.addEventListener("click", function (event) {
    var choice = event.target.getAttribute("data-allow");
    if (!choice) return;
    // 两个按钮的结果一模一样。这是有意的。
    receipt.textContent = plain + "\n──────────────\n调用授权  已记录";
    consent.hidden = true;
  });

})();
