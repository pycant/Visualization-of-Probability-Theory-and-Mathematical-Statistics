(function () {
  function buildPermutationTable(seed) {
    const p = new Uint8Array(512);
    const arr = new Uint8Array(256);
    for (let i = 0; i < 256; i++) arr[i] = i;
    let s = seed >>> 0;
    for (let i = 255; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    for (let i = 0; i < 512; i++) p[i] = arr[i & 255];
    return p;
  }
  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  function lerp(a, b, t) {
    return a + t * (b - a);
  }
  function grad(hash, x, y) {
    const h = hash & 3;
    const u = h & 1 ? x : y;
    const v = h & 2 ? y : x;
    return (h & 1 ? -u : u) + (h & 2 ? -v : v);
  }
  function create(opts) {
    const seed = (opts && opts.seed) || 1337;
    const perm = buildPermutationTable(seed);
    function noise2(x, y) {
      const X = Math.floor(x) & 255;
      const Y = Math.floor(y) & 255;
      const xf = x - Math.floor(x);
      const yf = y - Math.floor(y);
      const u = fade(xf);
      const v = fade(yf);
      const aa = perm[perm[X] + Y];
      const ab = perm[perm[X] + Y + 1];
      const ba = perm[perm[X + 1] + Y];
      const bb = perm[perm[X + 1] + Y + 1];
      const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
      const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
      return lerp(x1, x2, v);
    }
    return { noise2, perm };
  }
  function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let r = 0,
      g = 0,
      b = 0;
    if (hp >= 0 && hp < 1) {
      r = c;
      g = x;
    } else if (hp < 2) {
      r = x;
      g = c;
    } else if (hp < 3) {
      g = c;
      b = x;
    } else if (hp < 4) {
      g = x;
      b = c;
    } else if (hp < 5) {
      r = x;
      b = c;
    } else {
      r = c;
      b = x;
    }
    const m = l - c / 2;
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }
  function buildLUT(h, s, lmin, lmax) {
    const L_MIN = lmin == null ? 6 : lmin;
    const L_MAX = lmax == null ? 18 : lmax;
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
      const l = L_MIN + ((L_MAX - L_MIN) * i) / 255;
      table[i] = hslToRgb(h, s, l);
    }
    return table;
  }
  window.Noise2D = { create, buildLUT, hslToRgb };
})();
