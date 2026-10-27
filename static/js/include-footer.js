// 动态引入 partials/footer.html 到页面中的 #site-footer 容器
(function () {
  function mountFooter() {
    // 全站级去重：同一页面可能多次引入本脚本
    if (window.__siteFooterMounted) return;
    window.__siteFooterMounted = true;
    fetch("/partials/footer.html")
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        // 优先替换已存在的页脚
        var existingFooter = document.querySelector("footer.bg-dark-card");
        if (existingFooter) {
          existingFooter.outerHTML = html;
          return;
        }
        // 其次注入到占位容器
        var container = document.getElementById("site-footer");
        if (container) {
          container.innerHTML = html;
          return;
        }
        // 兜底追加到 body 末尾
        var wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        if (wrapper.firstElementChild) {
          document.body.appendChild(wrapper.firstElementChild);
        }
      })
      .catch(function (err) {
        console.error("页脚加载失败:", err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountFooter);
  } else {
    mountFooter();
  }
})();
