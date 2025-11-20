// 动态引入 templates/partials/footer.html 到页面中的 #site-footer 容器
document.addEventListener('DOMContentLoaded', function () {
  // 在所有模板页面中，templates 为当前目录，因此相对路径可用
  fetch('partials/footer.html')
    .then(function (res) { return res.text(); })
    .then(function (html) {
      // 优先替换已存在的页脚
      var existingFooter = document.querySelector('footer.bg-dark-card');
      if (existingFooter) {
        existingFooter.outerHTML = html;
        return;
      }
      // 其次注入到占位容器
      var container = document.getElementById('site-footer');
      if (container) {
        container.innerHTML = html;
        return;
      }
      // 如果既没有页脚也没有占位容器，则追加到 body 末尾
      var wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      document.body.appendChild(wrapper.firstElementChild);
    })
    .catch(function (err) { console.error('页脚加载失败:', err); });
});