/* 传埔斯 · 分页状态

   每个分页打开的时候写一条「已读」，那一页的解谜过了再写一条「已解开」。
   首页（大站）读这份记录，把每一页的状态显示出来。

   全部存在浏览器本地（localStorage），不上传、不联网。
   换浏览器 / 清缓存就没了 —— 这本来也只是给玩家自己看进度的。
*/
(function () {
  "use strict";

  var KEY = "simmc.pages";
  var RANK = { none: 0, read: 1, solved: 2 };

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (error) {
      /* 存不下就算了，不要因为进度把页面搞崩 */
    }
  }

  window.SIMMC = {
    key: KEY,
    all: load,

    status: function (id) {
      var state = load();
      return (state[id] && state[id].status) || "none";
    },

    /* 只会往上走：none → read → solved，不会退回。 */
    page: function (id, status) {
      var state = load();
      var entry = state[id] || {};
      var was = entry.status || "none";
      var next = RANK[status] > RANK[was] ? status : was;
      state[id] = {
        status: next,
        at: new Date().toISOString(),
        visits: (entry.visits || 0) + 1
      };
      save(state);
      return next;
    },

    reset: function () {
      save({});
    }
  };
})();
