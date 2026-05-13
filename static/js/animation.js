/**
 * Scroll-Reveal Animation Engine
 * [Agent: vs]
 *
 * 基于 GSAP + ScrollTrigger 的轻量动画系统。
 * 通过 HTML data 属性驱动，零侵入性。
 *
 * 用法:
 *   data-scroll-reveal="fade-up"     → 从下往上淡入
 *   data-scroll-reveal="fade-left"   → 从左往右淡入
 *   data-scroll-reveal="fade-right"  → 从右往左淡入
 *   data-scroll-reveal="scale-up"    → 缩放进入
 *   data-scroll-reveal="stagger"     → 父容器，子元素逐个进入
 *
 *   data-count-up="true"             → 数字滚动计数
 *   data-count-to="100"              → 目标数值（默认元素文本内容）
 *   data-count-suffix="%"            → 数值后缀
 *   data-count-duration="2"          → 动画时长（秒，默认 1.5）
 */

(function () {
  'use strict';

  // ── 工具函数 ──────────────────────────────────────

  /** 解析数值，返回数字或 0 */
  function toNum(v, fallback) {
    var n = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    return isFinite(n) ? n : (fallback || 0);
  }

  /** 检测 reduced-motion 偏好 */
  function prefersReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** 检测是否为桌面端（>= 768px） */
  function isDesktop() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  // ── 主初始化 ──────────────────────────────────────

  function init() {
    // reduced-motion 或移动端 → 直接显示所有元素，跳过动画
    if (prefersReduced() || !isDesktop()) {
      document.querySelectorAll('[data-scroll-reveal]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      document.querySelectorAll('[data-count-up]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count-to') || el.textContent;
      });
      return;
    }

    // 确保 GSAP + ScrollTrigger 可用
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // 静默降级 — 让所有内容可见
      document.querySelectorAll('[data-scroll-reveal]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Scroll-Reveal 动画 ────────────────────────

    var revealMap = {
      'fade-up':    { y: 60, opacity: 0 },
      'fade-left':  { x: -60, opacity: 0 },
      'fade-right': { x: 60, opacity: 0 },
      'scale-up':   { scale: 0.85, opacity: 0 },
    };

    // 处理 data-scroll-reveal="stagger" 父容器
    document.querySelectorAll('[data-scroll-reveal="stagger"]').forEach(function (container) {
      var children = container.querySelectorAll('[data-scroll-reveal]');
      if (children.length === 0) return;

      var fromVars = { y: 40, opacity: 0 };
      gsap.fromTo(children, fromVars, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    // 处理普通 data-scroll-reveal 元素（非 stagger 父容器内的）
    document.querySelectorAll('[data-scroll-reveal]').forEach(function (el) {
      // 跳过 stagger 父容器自身
      if (el.getAttribute('data-scroll-reveal') === 'stagger') return;
      // 跳过 stagger 父容器内的子项（由 stagger 统一控制）
      if (el.closest('[data-scroll-reveal="stagger"]') && el.parentElement.getAttribute('data-scroll-reveal') === 'stagger') return;

      var type = el.getAttribute('data-scroll-reveal') || 'fade-up';
      var fromVars = revealMap[type] || revealMap['fade-up'];
      var start = el.getAttribute('data-scroll-start') || 'top 88%';

      gsap.fromTo(el, fromVars, {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: start,
          toggleActions: 'play none none none',
        },
      });
    });

    // ── Count-Up 动画 ─────────────────────────────

    document.querySelectorAll('[data-count-up]').forEach(function (el) {
      var target = toNum(el.getAttribute('data-count-to'), toNum(el.textContent));
      var suffix = el.getAttribute('data-count-suffix') || '';
      var duration = toNum(el.getAttribute('data-count-duration'), 1.5);
      var prefix = el.getAttribute('data-count-prefix') || '';

      // 显示初始值
      el.textContent = prefix + '0' + suffix;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(el, {
            duration: duration,
            ease: 'power2.out',
            // 用自定义属性追踪进度
            onUpdate: function () {
              var val = Math.round(this.progress() * target);
              el.textContent = prefix + val.toLocaleString() + suffix;
            },
            onComplete: function () {
              el.textContent = prefix + target.toLocaleString() + suffix;
            },
          });
          // GSAP 需要目标值做 progress 参考
          // 使用一个虚拟对象动画触发 onUpdate
          var proxy = { val: 0 };
          gsap.to(proxy, {
            val: target,
            duration: duration,
            ease: 'power2.out',
            onUpdate: function () {
              var val = Math.round(this.targets()[0].val);
              el.textContent = prefix + val.toLocaleString() + suffix;
            },
            onComplete: function () {
              el.textContent = prefix + target.toLocaleString() + suffix;
            },
          });
        },
      });
    });

    // ── 刷新 ScrollTrigger ────────────────────────
    ScrollTrigger.refresh();
  }

  // ── 启动 ──────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 导航栏动态加载完成后刷新 ScrollTrigger
  document.addEventListener('navbar:loaded', function () {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });

})();
