// 动态加载统一导航栏，并支持每页差异化配置与高亮
(function () {
  // 调试：通过 URL 参数 ?navdebug=1 或 NAV_CONFIG.debug 开启
  var DEBUG = /[?&](navdebug|debugNav)=1/.test(location.search) || !!(window.NAV_CONFIG && window.NAV_CONFIG.debug);
  function dlog() {
    if (!DEBUG) return;
    try {
      var args = Array.prototype.slice.call(arguments);
      console.log.apply(console, ['[NAV]'].concat(args));
    } catch (e) {}
  }
  function getPartialUrl() {
    try {
      // /templates/page.html => /templates/partials/navbar.html
      return location.pathname.replace(/\/[^\/]+$/, '/partials/navbar.html');
    } catch (e) {
      return '/templates/partials/navbar.html';
    }
  }

  function slugFromPath() {
    var m = location.pathname.match(/([^\/]+)\.html$/);
    return m ? m[1] : 'index';
  }

  function applyActiveLink(root) {
    var slug = (window.NAV_CONFIG && window.NAV_CONFIG.active) || slugFromPath();
    dlog('applyActiveLink slug=', slug);
    // 高亮首页链接
    var home = root.querySelector('#nav-home-link');
    if (home) {
      if (slug === 'index') {
        home.classList.add('active-glow');
      } else {
        home.classList.remove('active-glow');
      }
    }
    // 高亮章节下拉中的当前项
    var links = root.querySelectorAll('#chapters-list a[data-route]');
    dlog('applyActiveLink chapters count=', links.length);
    links.forEach(function (a) {
      if (a.getAttribute('data-route') === slug) {
        a.classList.add('active-glow');
      } else {
        a.classList.remove('active-glow');
      }
    });
  }

  function injectPageLinks(root) {
    var container = root.querySelector('#nav-page-links');
    if (!container) return;
    var cfg = (window.NAV_CONFIG && window.NAV_CONFIG.sectionLinks) || [];
    dlog('injectPageLinks items=', cfg.length);
    container.innerHTML = '';
    cfg.forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      a.className = 'text-gray-300 hover:text-white py-2';
      li.appendChild(a);
      container.appendChild(li);
    });
    if (cfg.length === 0) {
      container.classList.add('hidden');
    } else {
      container.classList.remove('hidden');
    }
  }

  // 新增：为页面链接添加下拉选择栏，支持快速跳转
  function injectPageSelect(root) {
    var select = root.querySelector('#nav-page-select');
    if (!select) return;
    var cfg = (window.NAV_CONFIG && window.NAV_CONFIG.sectionLinks) || [];
    dlog('injectPageSelect items=', cfg.length);
    // 清空并填充
    select.innerHTML = '';
    if (cfg.length === 0) {
      select.classList.add('hidden');
      return;
    }
    select.classList.remove('hidden');
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '跳转到…';
    placeholder.disabled = true; placeholder.selected = true;
    select.appendChild(placeholder);
    cfg.forEach(function (item) {
      var opt = document.createElement('option');
      opt.value = item.href;
      opt.textContent = item.label;
      select.appendChild(opt);
    });
    select.addEventListener('change', function () {
      var val = select.value;
      dlog('pageSelect change value=', val);
      if (!val) return;
      // 同页锚点优先平滑滚动
      if (val.startsWith('#')) {
        try {
          var target = document.querySelector(val);
          var found = !!target;
          dlog('pageSelect anchor found=', found);
          if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
        } catch (e) {}
      }
      // 跨页或无元素命中则直接跳转
      location.href = val;
    });
  }

  function positionDropdown(root) {
    var dropdown = document.querySelector('#chapters-dropdown') || root.querySelector('#chapters-dropdown');
    if (!dropdown) return;
    try {
      var nav = document.getElementById('global-nav') || document.querySelector('nav');
      var navRect = nav ? nav.getBoundingClientRect() : null;
      var navHeight = navRect ? Math.ceil(navRect.height) : 56;
      dropdown.style.top = navHeight + 'px';
      dlog('positionDropdown navHeight=', navHeight);
    } catch (e) {}
  }

  // 将章节下拉提升到 body，避免父级导航 overflow:hidden 裁剪
  function hoistDropdownToBody(root) {
    try {
      var dd = root.querySelector('#chapters-dropdown');
      if (!dd) return;
      document.body.appendChild(dd);
      dd.style.position = 'fixed';
      dd.style.left = '0';
      dd.style.right = '0';
      positionDropdown(root);
      dlog('hoistDropdownToBody done');
    } catch (e) { dlog('hoistDropdownToBody error', e && e.message); }
  }

  function wireDropdown(root) {
    var toggle = root.querySelector('#chapters-toggle');
    var dropdown = document.querySelector('#chapters-dropdown') || root.querySelector('#chapters-dropdown');
    dlog('wireDropdown start toggleExists=', !!toggle, 'dropdownExists=', !!dropdown);
    if (!toggle || !dropdown) {
      // 兜底：使用事件委托防止节点替换导致绑定丢失
      document.addEventListener('click', function (e) {
        var t = e.target.closest && e.target.closest('#chapters-toggle');
        var dd = document.querySelector('#chapters-dropdown');
        if (t && dd) {
          e.stopPropagation();
          positionDropdown(root);
          var isHidden = dd.classList.contains('hidden');
          dlog('delegate toggle click isHiddenBefore=', isHidden);
          if (isHidden) {
            dd.classList.remove('hidden');
            dd.classList.add('dropdown-shown');
            t.setAttribute('aria-expanded', 'true');
            bindChapterCardInteractions();
          } else {
            dd.classList.add('hidden');
            dd.classList.remove('dropdown-shown');
            t.setAttribute('aria-expanded', 'false');
          }
        }
      });
      dlog('wireDropdown using delegation');
      return;
    }

    positionDropdown(root);

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = dropdown.classList.contains('hidden');
      dlog('toggle click isHiddenBefore=', isHidden);
      if (isHidden) {
        dropdown.classList.remove('hidden');
        dropdown.classList.add('dropdown-shown');
        toggle.setAttribute('aria-expanded', 'true');
        dlog('dropdown shown');
        bindChapterCardInteractions();
      } else {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('dropdown-shown');
        toggle.setAttribute('aria-expanded', 'false');
        dlog('dropdown hidden');
      }
    });

    // 点击外部关闭
    document.addEventListener('click', function (e) {
      if (!dropdown.classList.contains('hidden')) {
        var within = dropdown.contains(e.target) || toggle.contains(e.target);
        dlog('doc click to close within=', within);
        if (!within) {
          dropdown.classList.add('hidden');
          dropdown.classList.remove('dropdown-shown');
          toggle.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // 视口变化时重新定位
    window.addEventListener('resize', function () { positionDropdown(root); });
    window.addEventListener('orientationchange', function () { positionDropdown(root); });
  }

  /**
   * 为章节卡片绑定交互：悬浮倾斜 + 点击涟漪
   * 通过 data-bound 标记避免重复绑定
   */
  function bindChapterCardInteractions() {
    try {
      var cards = document.querySelectorAll('#chapters-list .chapter-card');
      if (!cards || cards.length === 0) return;
      cards.forEach(function (card) {
        if (card.getAttribute('data-bound') === '1') return;
        card.setAttribute('data-bound', '1');

        // 悬浮倾斜
        var maxTiltX = 2;  // deg
        var maxTiltY = 4;  // deg
        var resetTransform = function () { card.style.transform = ''; };
        card.addEventListener('mousemove', function (ev) {
          var rect = card.getBoundingClientRect();
          var x = ev.clientX - rect.left;
          var y = ev.clientY - rect.top;
          var px = (x / rect.width - 0.5) * 2;   // -1..1
          var py = (y / rect.height - 0.5) * 2;  // -1..1
          var tiltY = Math.max(Math.min(px * maxTiltY, maxTiltY), -maxTiltY);
          var tiltX = Math.max(Math.min(-py * maxTiltX, maxTiltX), -maxTiltX);
          card.style.transform = 'perspective(600px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        });
        card.addEventListener('mouseleave', resetTransform);
        card.addEventListener('blur', resetTransform);

        // 点击涟漪
        card.addEventListener('click', function (ev) {
          var rect = card.getBoundingClientRect();
          var size = Math.max(rect.width, rect.height);
          var ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = (ev.clientX - rect.left - size / 2) + 'px';
          ripple.style.top = (ev.clientY - rect.top - size / 2) + 'px';
          card.appendChild(ripple);
          setTimeout(function () { ripple.remove(); }, 700);
        });
      });
    } catch (e) { dlog('bindChapterCardInteractions error', e && e.message); }
  }

  function loadNavbar() {
    var partialUrl = getPartialUrl();
    dlog('loadNavbar start partialUrl=', partialUrl);
    fetch(partialUrl, { cache: 'no-cache' })
      .then(function (resp) { return resp.text(); })
      .then(function (html) {
        dlog('navbar fetched');
        var temp = document.createElement('div');
        temp.innerHTML = html.trim();
        var navEl = temp.firstElementChild;

        var existing = document.querySelector('nav');
        if (existing) {
          existing.outerHTML = navEl.outerHTML;
          dlog('navbar replaced existing <nav>');
        } else {
          document.body.insertAdjacentElement('afterbegin', navEl);
          dlog('navbar inserted at body start');
        }

        var root = document.querySelector('#global-nav') || document.querySelector('nav');
        dlog('root resolved=', !!root);
        applyActiveLink(root);
        injectPageLinks(root);
        injectPageSelect(root);
        hoistDropdownToBody(root);
        wireDropdown(root);
        dlog('navbar wired');
      })
      .catch(function (err) {
        console.error('加载导航栏失败:', err);
        dlog('loadNavbar error', err && err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNavbar);
  } else {
    loadNavbar();
  }
})();