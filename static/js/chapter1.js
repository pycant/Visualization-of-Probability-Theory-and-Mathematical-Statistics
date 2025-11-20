// chapter1 页面交互脚本（骰子频率模拟 + 条件概率计算器）
// 统一抽取到独立文件，便于在其他页面复用或维护

(function(){
  function setupDice(){
    const rollBtn = document.getElementById('dice-roll');
    const resetBtn = document.getElementById('dice-reset');
    const totalEl = document.getElementById('dice-total');
    const lastEl = document.getElementById('dice-last');
    const countEls = [1,2,3,4,5,6].map(n => document.getElementById('dice-count-'+n));
    if (!rollBtn || !resetBtn || !totalEl || !lastEl || countEls.some(el => !el)) return;
    let counts = [0,0,0,0,0,0];
    let total = 0;
    function update(){
      totalEl.textContent = String(total);
      countEls.forEach((el,i)=>{ el.textContent = String(counts[i]); });
    }
    function roll(){
      const v = Math.floor(Math.random()*6)+1;
      lastEl.textContent = String(v);
      counts[v-1] += 1; total += 1; update();
    }
    function reset(){ counts = [0,0,0,0,0,0]; total = 0; lastEl.textContent='-'; update(); }
    rollBtn.addEventListener('click', roll);
    resetBtn.addEventListener('click', reset);
    update();
  }

  function setupConditionalProbability(){
    const pAB = document.getElementById('pAB');
    const pB = document.getElementById('pB');
    const pA = document.getElementById('pA');
    const btn = document.getElementById('cond-calc');
    const out = document.getElementById('cond-result');
    const ind = document.getElementById('ind-result');
    if (!btn || !out || !ind || !pAB || !pB) return;
    function calc(){
      const AB = parseFloat(pAB.value || '');
      const B = parseFloat(pB.value || '');
      const A = parseFloat(pA && pA.value || '');
      if (!isFinite(AB) || !isFinite(B) || B <= 0){
        out.textContent = '请输入有效的 P(A∩B) 与 P(B)>0';
        ind.textContent = '';
        return;
      }
      const cond = AB/B;
      out.textContent = 'P(A|B) ≈ ' + cond.toFixed(4);
      if (isFinite(A)){
        const indp = Math.abs(cond - A) < 1e-6;
        ind.textContent = '独立性判断：' + (indp ? 'A 与 B 近似独立' : '不独立');
      }
    }
    btn.addEventListener('click', calc);
  }

  document.addEventListener('DOMContentLoaded', function(){
    try { setupDice(); } catch(e){ console.warn('Dice setup failed:', e); }
    try { setupConditionalProbability(); } catch(e){ console.warn('Conditional setup failed:', e); }
  });
})();