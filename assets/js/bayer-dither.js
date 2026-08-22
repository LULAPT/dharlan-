// bayer-dither.js
// Canvas-based ordered Bayer 8x8 dither applied to <img> elements.
// Replaces the image source with a dithered dataURL; preserves original src in data-original-src.
// Exposes window.__bayerDither API: enable/disable/apply/remove/setOptions

(function () {
  // default 8x8 Bayer matrix (kept for compatibility)
  const bayer8 = [
    [0, 32, 8, 40, 2, 34, 10, 42],
    [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38],
    [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41],
    [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37],
    [63, 31, 55, 23, 61, 29, 53, 21],
  ];

  // cache for generated matrices by size
  const _bayerCache = new Map();

  // generate Bayer (ordered) matrix of size n x n (n must be power of two)
  function generateBayer(n) {
    if (n === 8) return bayer8;
    if (_bayerCache.has(n)) return _bayerCache.get(n);
    // start with 2x2 base
    let M = [
      [0, 2],
      [3, 1],
    ];
    let size = 2;
    while (size < n) {
      const next = Array(size * 2)
        .fill(0)
        .map(() => Array(size * 2).fill(0));
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const v = M[y][x];
          next[y][x] = 4 * v + 0;
          next[y][x + size] = 4 * v + 2;
          next[y + size][x] = 4 * v + 3;
          next[y + size][x + size] = 4 * v + 1;
        }
      }
      M = next;
      size *= 2;
    }
    _bayerCache.set(n, M);
    return M;
  }

  // return current Bayer matrix according to options (options.bayerMatrix override allowed)
  function getBayerMatrix() {
    if (options && options.bayerMatrix && Array.isArray(options.bayerMatrix)) return options.bayerMatrix;
    const n = (options && Number(options.bayerSize)) || 8;
    return generateBayer(n);
  }

  // Defaults (highly customizable)
  const DEFAULTS = {
    levels: 3, // quantization levels per channel (2=binary, 3-4 good for posterized look)
    processNaturalSize: false, // if true, use naturalWidth/naturalHeight (heavier); otherwise use displayed size
    asyncChunkMs: 16, // ms per chunk to avoid blocking
    // scale controls how much we downscale before dithering; higher -> more pixels
    scale: 50,
    // Increase default gamma to tone down perceived brightness. Gamma > 1 darkens midtones.
    gamma: 1.1,
    // optional: limit total distinct colors (approx). If set, per-channel levels ~= cbrt(maxColors)
    maxColors: 15,
    // pixelSize: if >0, number of screen pixels per pixelated block (e.g. 8 => each block is 8x8 on final image)
    pixelSize: 1,
    // ordered dither matrix size (power of two). Set to 8 for Bayer 8x8, 16 for 16x16, etc.
    bayerSize: 8,
    // optional override matrix (array of arrays) to use instead of generated Bayer matrix
    bayerMatrix: null,
    // attempt WebGL first when available (true=try, false=never, 'auto'=try when supported)
    useWebGL: "auto",
  };

  // Color conversion helpers (sRGB <-> CIE Lab) for perceptual distance
  function srgbToLinear(v) {
    v = v / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(v) {
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  }

  function rgbToLab(r, g, b) {
    // convert sRGB to XYZ
    const R = srgbToLinear(r);
    const G = srgbToLinear(g);
    const B = srgbToLinear(b);
    // Observer = 2°, Illuminant = D65
    let X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
    let Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
    let Z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;

    // Normalize for D65
    const Xn = 0.95047,
      Yn = 1.0,
      Zn = 1.08883;
    X = X / Xn;
    Y = Y / Yn;
    Z = Z / Zn;

    function f(t) {
      return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    }

    const fx = f(X),
      fy = f(Y),
      fz = f(Z);
    const L = Math.max(0, 116 * fy - 16);
    const a = 500 * (fx - fy);
    const b2 = 200 * (fy - fz);
    return [L, a, b2];
  }

  function labToRgb(L, a, b) {
    // convert Lab to XYZ
    const Y = (L + 16) / 116;
    const X = a / 500 + Y;
    const Z = Y - b / 200;

    function invf(t) {
      const t3 = t * t * t;
      return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
    }

    const Xn = 0.95047,
      Yn = 1.0,
      Zn = 1.08883;
    const xr = invf(X),
      yr = invf(Y),
      zr = invf(Z);
    const Xv = xr * Xn,
      Yv = yr * Yn,
      Zv = zr * Zn;

    // XYZ to linear RGB
    let R = 3.2404542 * Xv - 1.5371385 * Yv - 0.4985314 * Zv;
    let G = -0.969266 * Xv + 1.8760108 * Yv + 0.041556 * Zv;
    let B = 0.0556434 * Xv - 0.2040259 * Yv + 1.0572252 * Zv;

    // linear to sRGB
    R = linearToSrgb(R);
    G = linearToSrgb(G);
    B = linearToSrgb(B);
    // clamp
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v * 255)));
    return [clamp(R), clamp(G), clamp(B)];
  }

  // Active options (can be updated via setOptions or CSS variables)
  let options = Object.assign({}, DEFAULTS);

  // Try to read customization from CSS variables on :root (optional)
  function readCSSVars() {
    try {
      const root = getComputedStyle(document.documentElement);
      const cssScale = root.getPropertyValue("--bayer-scale").trim();
      const cssLevels = root.getPropertyValue("--bayer-levels").trim();
      const cssGamma = root.getPropertyValue("--bayer-gamma").trim();
      const cssMaxColors = root.getPropertyValue("--bayer-max-colors").trim();
      if (cssScale) options.scale = Math.max(0.05, Math.min(1, Number(cssScale)));
      if (cssLevels) options.levels = Math.max(2, Math.min(16, Number(cssLevels)));
      if (cssGamma) options.gamma = Math.max(0.1, Number(cssGamma));
      if (cssMaxColors) options.maxColors = Math.max(0, Number(cssMaxColors));
      if (cssPixelSize) options.pixelSize = Math.max(0, Number(cssPixelSize));
    } catch (e) {
      // ignore if not available
    }
  }

  // Initial read of CSS variables (if present)
  if (typeof window !== "undefined" && document && document.documentElement) readCSSVars();

  function ditherImageData(srcImgData, width, height, levels) {
    const out = new Uint8ClampedArray(srcImgData.length);
    const step = 8; // bayer matrix size
    const mapMax = 64; // values in bayer matrix are 0..63

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const bx = x % step;
        const by = y % step;
        const threshold = bayer8[by][bx] / (mapMax - 1); // 0..1

        for (let c = 0; c < 3; c++) {
          const v = srcImgData[idx + c] / 255; // 0..1
          const scaled = v * levels; // 0..levels
          const q = Math.floor(scaled + threshold); // dithered quantization
          const qclamped = Math.max(0, Math.min(levels - 1, q));
          const newV = Math.round((qclamped * 255) / (levels - 1));
          out[idx + c] = newV;
        }
        out[idx + 3] = srcImgData[idx + 3];
      }
    }

    return out;
  }

  // Build a palette using a simple median-cut algorithm (boxes split by longest color range)
  function buildPalette(srcImgData, width, height, maxColors) {
    const total = width * height;
    const sampleLimit = 5000;
    const step = Math.max(1, Math.floor(total / sampleLimit));
    const pixels = [];
    for (let i = 0, p = 0; i < total; i++, p += 4) {
      if (i % step !== 0) continue;
      const r = srcImgData[p],
        g = srcImgData[p + 1],
        b = srcImgData[p + 2];
      const lab = rgbToLab(r, g, b);
      pixels.push({ rgb: [r, g, b], lab });
    }

    // Each box is an array of pixel objects {rgb, lab}
    let boxes = [pixels];

    function colorRange(box) {
      let Lmin = Infinity,
        Lmax = -Infinity,
        amin = Infinity,
        amax = -Infinity,
        bmin = Infinity,
        bmax = -Infinity;
      for (const p of box) {
        const [L, a, b2] = p.lab;
        if (L < Lmin) Lmin = L;
        if (L > Lmax) Lmax = L;
        if (a < amin) amin = a;
        if (a > amax) amax = a;
        if (b2 < bmin) bmin = b2;
        if (b2 > bmax) bmax = b2;
      }
      return { LRange: Lmax - Lmin, aRange: amax - amin, bRange: bmax - bmin };
    }

    while (boxes.length < maxColors) {
      // pick box with largest perceptual range (by max Lab range)
      let bestIndex = -1;
      let bestRange = -1;
      for (let i = 0; i < boxes.length; i++) {
        const r = colorRange(boxes[i]);
        const m = Math.max(r.LRange, r.aRange, r.bRange);
        if (m > bestRange) {
          bestRange = m;
          bestIndex = i;
        }
      }
      if (bestIndex === -1) break;
      const box = boxes[bestIndex];
      if (!box || box.length <= 1) break;
      // determine split channel using Lab ranges (perceptual)
      const ranges = colorRange(box);
      let channel = "L";
      if (ranges.aRange >= ranges.LRange && ranges.aRange >= ranges.bRange) channel = "a";
      else if (ranges.bRange >= ranges.LRange && ranges.bRange >= ranges.aRange) channel = "b";
      const idx = { L: 0, a: 1, b: 2 }[channel];
      // sort and split at median using lab channel
      box.sort((A, B) => A.lab[idx] - B.lab[idx]);
      const mid = Math.floor(box.length / 2);
      const box1 = box.slice(0, mid);
      const box2 = box.slice(mid);
      boxes.splice(bestIndex, 1, box1, box2);
      // safety
      if (boxes.length > maxColors * 2) break;
    }

    // compute average color for each box
    // compute average color for each box in Lab and convert back to RGB for palette
    const palette = boxes.slice(0, maxColors).map((box) => {
      if (!box || box.length === 0) return [0, 0, 0];
      let L = 0,
        a = 0,
        b2 = 0;
      for (const p of box) {
        L += p.lab[0];
        a += p.lab[1];
        b2 += p.lab[2];
      }
      const n = box.length;
      const avgLab = [L / n, a / n, b2 / n];
      return labToRgb(avgLab[0], avgLab[1], avgLab[2]);
    });
    return palette;
  }

  // Dither to a given palette using ordered Bayer 8x8 by selecting between the two nearest palette colors per pixel
  function paletteDither(srcImgData, width, height, palette) {
    const out = new Uint8ClampedArray(srcImgData.length);
    const step = 8;
    const mapMax = 64;
    const palLen = palette.length;

    // precompute Lab for palette
    const palLab = new Array(palLen);
    for (let i = 0; i < palLen; i++) {
      const p = palette[i] || [0, 0, 0];
      palLab[i] = rgbToLab(p[0], p[1], p[2]);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r0 = srcImgData[idx];
        const g0 = srcImgData[idx + 1];
        const b0 = srcImgData[idx + 2];
        // find nearest and second nearest palette colors using Lab distance
        let bestA = -1,
          bestB = -1;
        let dA = Infinity,
          dB = Infinity;
        const lab0 = rgbToLab(r0, g0, b0);
        for (let i = 0; i < palLen; i++) {
          const pl = palLab[i];
          const dL = lab0[0] - pl[0];
          const da = lab0[1] - pl[1];
          const db = lab0[2] - pl[2];
          const d = dL * dL + da * da + db * db;
          if (d < dA) {
            dB = dA;
            bestB = bestA;
            dA = d;
            bestA = i;
          } else if (d < dB) {
            dB = d;
            bestB = i;
          }
        }
        if (bestA === -1) {
          // no palette available: copy original
          out[idx] = r0;
          out[idx + 1] = g0;
          out[idx + 2] = b0;
          out[idx + 3] = srcImgData[idx + 3];
          continue;
        }
        // compute weight favoring A: when color is exactly A, choose A always
        const wA = dA + dB === 0 ? 1 : dB / (dA + dB); // closer to A -> larger wA
        const bx = x % step;
        const by = y % step;
        const threshold = bayer8[by][bx] / (mapMax - 1); // 0..1
        const pickA = wA >= threshold;
        let chosen = null;
        if (pickA && palette[bestA]) chosen = palette[bestA];
        else if (!pickA && palette[bestB]) chosen = palette[bestB];
        else if (palette[bestA]) chosen = palette[bestA];
        else if (palette[0]) chosen = palette[0];
        else chosen = [r0, g0, b0];
        out[idx] = chosen[0];
        out[idx + 1] = chosen[1];
        out[idx + 2] = chosen[2];
        out[idx + 3] = srcImgData[idx + 3];
      }
    }
    return out;
  }

  // --- WebGL accelerated path (optional) ---
  // small helper to create WebGL context offscreen
  function createGL(w, h) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const gl = canvas.getContext("webgl", { premultipliedAlpha: false }) || canvas.getContext("experimental-webgl");
      if (!gl) return null;
      return { gl, canvas };
    } catch (e) {
      return null;
    }
  }

  function compileShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error("Shader compile error: " + info);
    }
    return s;
  }

  function createProgram(gl, vsSrc, fsSrc) {
    const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error("Program link error: " + info);
    }
    return p;
  }

  // create a WebGL texture from Uint8Array or Float32Array (RGBA)
  function createTextureFromRGBA(gl, width, height, data, options = {}) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilter || gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilter || gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // upload
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
  }

  // Build Bayer texture as RGBA unsigned bytes (R channel encodes threshold 0..255)
  function buildBayerTextureData() {
    const mat = getBayerMatrix();
    const h = mat.length;
    const w = mat[0] ? mat[0].length : h;
    const arr = new Uint8Array(w * h * 4);
    const mapMax = w * h; // values range 0..(n*n - 1)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = mat[y][x] / (mapMax - 1); // 0..1
        const idx = (y * w + x) * 4;
        const byte = Math.round(v * 255);
        arr[idx] = byte;
        arr[idx + 1] = byte;
        arr[idx + 2] = byte;
        arr[idx + 3] = 255;
      }
    }
    return { width: w, height: h, data: arr };
  }

  // Convert palette (array of [r,g,b]) into a RGBA 1D texture (height 1)
  function buildPaletteTextureData(palette) {
    const length = palette.length;
    const arr = new Uint8Array(length * 4);
    for (let i = 0; i < length; i++) {
      const p = palette[i] || [0, 0, 0];
      const idx = i * 4;
      arr[idx] = p[0];
      arr[idx + 1] = p[1];
      arr[idx + 2] = p[2];
      arr[idx + 3] = 255;
    }
    return { width: length, height: 1, data: arr };
  }

  // WebGL shader: reads source texture, reads Bayer texture, looks up nearest palette by simple RGB distance
  const VERTEX_SRC = `
    attribute vec2 a_pos;
    attribute vec2 a_uv;
    varying vec2 v_uv;
    void main() { v_uv = a_uv; gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAGMENT_SRC = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_src;
    uniform sampler2D u_bayer;
    uniform sampler2D u_palette;
    uniform int u_palLen;
    uniform vec2 u_bayerDim;
    void main() {
      vec4 s = texture2D(u_src, v_uv);
      // sample Bayer by wrapping into 0..1 space scaled by bayerDim (8x8)
      vec2 bcoord = fract(v_uv * u_bayerDim) / u_bayerDim;
      float thresh = texture2D(u_bayer, bcoord).r; // 0..1
      // find nearest and second nearest by RGB distance (fast approximation)
      float bestA = -1.0;
      float bestB = -1.0;
      float dA = 1e20;
      float dB = 1e20;
      for (int i = 0; i < 256; i++) {
        if (i >= u_palLen) break;
        float fi = (float(i) + 0.5) / float(u_palLen);
        vec3 pc = texture2D(u_palette, vec2(fi, 0.5)).rgb;
        vec3 diff = s.rgb - pc;
        float d = dot(diff, diff);
        if (d < dA) { dB = dA; bestB = bestA; dA = d; bestA = float(i); } else if (d < dB) { dB = d; bestB = float(i); }
      }
      if (bestA < 0.0) { gl_FragColor = s; return; }
      float wA = (dA + dB == 0.0) ? 1.0 : dB / (dA + dB);
      float pickA = wA >= thresh ? 1.0 : 0.0;
      float idx = pickA > 0.5 ? bestA : bestB;
      float fidx = (idx + 0.5) / float(u_palLen);
      vec3 chosen = texture2D(u_palette, vec2(fidx, 0.5)).rgb;
      gl_FragColor = vec4(chosen, s.a);
    }
  `;

  // Try to run WebGL palette dither. Returns Uint8ClampedArray RGBA or null on failure
  function glPaletteDither(srcCanvas, palette) {
    const w = srcCanvas.width;
    const h = srcCanvas.height;
    const env = createGL(w, h);
    if (!env) return null;
    const { gl, canvas } = env;
    try {
      // build program
      const prog = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
      gl.useProgram(prog);
      // create buffers
      const posLoc = gl.getAttribLocation(prog, "a_pos");
      const uvLoc = gl.getAttribLocation(prog, "a_uv");
      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      const verts = new Float32Array([-1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, 1, 1, 1, 1]);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

      // source texture from canvas
      const srcPixels = srcCanvas.getContext("2d").getImageData(0, 0, w, h).data;
      // flip Y on upload so texture sampling matches canvas top-left origin
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      } catch (e) {}
      const srcTex = createTextureFromRGBA(gl, w, h, srcPixels);
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      } catch (e) {}
      // bayer texture
      const bdat = buildBayerTextureData();
      const bTex = createTextureFromRGBA(gl, bdat.width, bdat.height, bdat.data);
      // palette texture
      const pdat = buildPaletteTextureData(palette);
      const pTex = createTextureFromRGBA(gl, pdat.width, pdat.height, pdat.data);

      // bind texture units
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, srcTex);
      gl.uniform1i(gl.getUniformLocation(prog, "u_src"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, bTex);
      gl.uniform1i(gl.getUniformLocation(prog, "u_bayer"), 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, pTex);
      gl.uniform1i(gl.getUniformLocation(prog, "u_palette"), 2);

      gl.uniform1i(gl.getUniformLocation(prog, "u_palLen"), palette.length);
      const bmat = getBayerMatrix();
      gl.uniform2f(gl.getUniformLocation(prog, "u_bayerDim"), bmat[0].length, bmat.length);

      // draw
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // read pixels
      const out = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, out);
      // WebGL readPixels returns bottom-up; flip vertically
      const flipped = new Uint8ClampedArray(w * h * 4);
      for (let row = 0; row < h; row++) {
        const srcRow = row;
        const dstRow = h - 1 - row;
        const srcStart = srcRow * w * 4;
        const dstStart = dstRow * w * 4;
        flipped.set(out.subarray(srcStart, srcStart + w * 4), dstStart);
      }
      return flipped;
    } catch (e) {
      return null;
    } finally {
      // best-effort cleanup (GL resources will be GC'ed with canvas)
    }
  }

  // wait for an image element to be loaded (resolve when natural size available)
  function awaitImageLoaded(img, timeout = 10000) {
    return new Promise((resolve, reject) => {
      try {
        if (!img) return reject(new Error("no-image"));
        if (img.complete && (img.naturalWidth || img.naturalHeight)) return resolve();
        let done = false;
        const onload = () => {
          if (done) return;
          done = true;
          cleanup();
          resolve();
        };
        const onerror = () => {
          if (done) return;
          done = true;
          cleanup();
          reject(new Error("load-error"));
        };
        const to = setTimeout(() => {
          if (done) return;
          done = true;
          cleanup();
          reject(new Error("load-timeout"));
        }, timeout);
        function cleanup() {
          clearTimeout(to);
          try {
            img.removeEventListener("load", onload);
            img.removeEventListener("error", onerror);
          } catch (e) {}
        }
        img.addEventListener("load", onload);
        img.addEventListener("error", onerror);
      } catch (e) {
        reject(e);
      }
    });
  }

  // process a single image element: draw to canvas, dither, set dataURL
  async function processImageElement(img) {
    if (!img) return;
    // do not attempt to process if no source yet; wait for attribute change to trigger
    if (!img.src) return;
    // If there's a processing marker, check if it's stale (>10s); if so, clear it and continue
    try {
      const marker = img.dataset.__bayerProcessing;
      if (marker) {
        const ts = Number(marker) || 0;
        const age = Date.now() - ts;
        if (age < 10000) {
          // another worker/process is likely handling it
          return;
        }
        // stale marker - clear and continue
        delete img.dataset.__bayerProcessing;
      }
    } catch (e) {}
    // skip if image already processed and still a data URL
    try {
      if (img.src && img.src.startsWith && img.src.startsWith("data:") && img.dataset.bayerApplied) {
        // already dithered
        return;
      }
    } catch (e) {}
    // set processing marker as timestamp
    img.dataset.__bayerProcessing = String(Date.now());

    // wait for image to be loaded (if not already). If load fails, abort gracefully
    try {
      await awaitImageLoaded(img);
    } catch (e) {
      // couldn't load image (timeout or error) - clear marker and bail
      delete img.dataset.__bayerProcessing;
      return;
    }

    // preserve original
    if (!img.dataset.originalSrc) img.dataset.originalSrc = img.src;
    console.info("bayer-dither: processing image", img.src, "(maxColors=", options.maxColors, ", scale=", options.scale, ")");

    // attempt to use natural size for fidelity, else use displayed size
    const useNatural = options.processNaturalSize && img.naturalWidth && img.naturalHeight;
    const fullWidth = useNatural ? img.naturalWidth : Math.max(1, Math.round(img.width || img.clientWidth || 64));
    const fullHeight = useNatural ? img.naturalHeight : Math.max(1, Math.round(img.height || img.clientHeight || 64));

    // downscale to create chunky pixels before dithering
    // If pixelSize is set (>0), compute the small canvas so that each pixel becomes pixelSize x pixelSize in the final image.
    let width, height;
    const pixelSize = Number(options.pixelSize) || 0;
    if (pixelSize > 0) {
      width = Math.max(1, Math.round(fullWidth / pixelSize));
      height = Math.max(1, Math.round(fullHeight / pixelSize));
      console.info("bayer-dither: using pixelSize", pixelSize, "-> small canvas", width, "x", height);
    } else {
      const scale = Math.max(0.02, Math.min(1, Number(options.scale) || 0.35));
      width = Math.max(1, Math.round(fullWidth * scale));
      height = Math.max(1, Math.round(fullHeight * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // try to handle crossOrigin images; best-effort
    if (!img.crossOrigin) {
      // leave as-is; if image is cross-origin without CORS, canvas will taint and we catch later
    }

    // draw into small canvas (downscaled). If tainted (CORS) this will throw when we try to read.
    try {
      // disable smoothing when drawing to the small canvas so blocks remain crisp when upscaled
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
    } catch (err) {
      // drawing failed (possibly CORS taint). Do not modify the image. Clear marker and return.
      delete img.dataset.__bayerProcessing;
      return;
    }

    let srcDataRaw;
    try {
      srcDataRaw = ctx.getImageData(0, 0, width, height).data;
    } catch (err) {
      delete img.dataset.__bayerProcessing;
      return;
    }

    // apply gamma correction if requested
    const gamma = Math.max(0.1, Number(options.gamma) || 1);
    if (Math.abs(gamma - 1) > 0.001) {
      for (let i = 0; i < srcDataRaw.length; i += 4) {
        srcDataRaw[i] = Math.pow(srcDataRaw[i] / 255, gamma) * 255;
        srcDataRaw[i + 1] = Math.pow(srcDataRaw[i + 1] / 255, gamma) * 255;
        srcDataRaw[i + 2] = Math.pow(srcDataRaw[i + 2] / 255, gamma) * 255;
      }
    }

    let result;
    const tryWebGL = options.useWebGL === true || (options.useWebGL === "auto" && typeof WebGLRenderingContext !== "undefined");
    if (options.maxColors && Number(options.maxColors) > 0) {
      const maxColors = Math.max(1, Math.floor(Number(options.maxColors)));
      const palette = buildPalette(srcDataRaw, width, height, Math.min(256, maxColors));
      // try WebGL path first when configured
      if (tryWebGL) {
        try {
          const glres = glPaletteDither(canvas, palette);
          if (glres && glres.length) {
            // glres is Uint8ClampedArray RGBA for small canvas size
            result = new Uint8ClampedArray(glres);
          }
        } catch (e) {
          result = null;
        }
      }
      if (!result) {
        result = paletteDither(srcDataRaw, width, height, palette);
      }
    } else {
      // perform dithering (levels)
      let levels = Math.max(2, Math.min(16, Math.round(options.levels || 3)));
      result = ditherImageData(srcDataRaw, width, height, levels);
    }

    // write dithered small result back and then upscale to original size (nearest neighbor)
    const outImg = new ImageData(result, width, height);
    ctx.putImageData(outImg, 0, 0);

    // upscale canvas to full size into another canvas with imageSmoothing=false
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = fullWidth;
    finalCanvas.height = fullHeight;
    const fctx = finalCanvas.getContext("2d");
    fctx.imageSmoothingEnabled = false;
    try {
      fctx.drawImage(canvas, 0, 0, fullWidth, fullHeight);
      const dataURL = finalCanvas.toDataURL("image/png");
      // only replace the image source once we have a valid dataURL
      if (dataURL && typeof dataURL === "string" && dataURL.startsWith("data:")) {
        img.src = dataURL;
        img.dataset.bayerApplied = "1";
      }
      // mark applied and store previous inline style so we can restore later
      if (!img.dataset.__bayerPrevStyle) img.dataset.__bayerPrevStyle = img.getAttribute("style") || "";
      // append pixelated rendering declarations (multiple fallbacks)
      const add = "image-rendering: -moz-crisp-edges; image-rendering: crisp-edges; image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor;";
      const prevStyle = img.getAttribute("style") || "";
      img.setAttribute("style", prevStyle ? prevStyle + ";" + add : add);
      img.dataset.bayerApplied = "1";
    } catch (err) {
      // fallback: do nothing
    }

    delete img.dataset.__bayerProcessing;
    return img.src;
  }

  // async apply to all images with limited concurrency
  async function applyToAll() {
    // clear any stale __bayerProcessing markers first (older than 10s)
    // Only target images explicitly marked with the `dither` class
    const allImgs = Array.from(document.querySelectorAll("img.dither"));
    const now = Date.now();
    allImgs.forEach((im) => {
      try {
        const m = im.dataset.__bayerProcessing;
        if (m) {
          const ts = Number(m) || 0;
          if (now - ts > 10000) delete im.dataset.__bayerProcessing;
        }
      } catch (e) {}
    });
    const imgs = allImgs;
    const concurrency = 6;
    let idx = 0;
    async function worker() {
      while (true) {
        let i;
        // simple atomic increment
        if (idx >= imgs.length) break;
        i = idx++;
        const img = imgs[i];
        try {
          await processImageElement(img);
        } catch (e) {
          // ignore per-image errors
        }
        // yield to event loop occasionally
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    const workers = [];
    for (let i = 0; i < concurrency; i++) workers.push(worker());
    await Promise.all(workers);
  }

  function removeFromAll() {
    // only restore images that were explicitly processed (have .dither or bayerApplied)
    const imgs = Array.from(document.querySelectorAll("img.dither, img[data-bayer-applied], img[data-bayer-applied='1']"));
    imgs.forEach((img) => {
      if (img.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
        delete img.dataset.originalSrc;
      }
      // restore previous inline style if we saved one
      try {
        if (img.dataset.__bayerPrevStyle !== undefined) {
          const s = img.dataset.__bayerPrevStyle || null;
          if (s === "") img.removeAttribute("style");
          else img.setAttribute("style", s);
          delete img.dataset.__bayerPrevStyle;
        }
      } catch (e) {}
      delete img.dataset.bayerApplied;
    });
  }

  // observe new images
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          // only process images that have the .dither class
          if (node.tagName === "IMG" && node.classList && node.classList.contains("dither")) processImageElement(node);
          if (node.querySelectorAll) node.querySelectorAll("img.dither").forEach(processImageElement);
        }
      } else if (m.type === "attributes") {
        const t = m.target;
        // only react to attribute changes on img.dither
        if (t && t.tagName === "IMG" && t.classList && t.classList.contains("dither")) {
          processImageElement(t);
        }
      }
    }
  });

  // --- Background-image processing ---
  async function processBackgroundElement(el) {
    try {
      const style = getComputedStyle(el);
      const bg = style && style.backgroundImage;
      if (!bg || bg === "none") return;
      // match the first url(...) occurrence
      const m = bg.match(/url\(["']?(.*?)["']?\)/);
      if (!m) return;
      const url = m[1];
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      try {
        await awaitImageLoaded(img);
      } catch (e) {
        // can't load background image - skip
        return;
      }
      try {
        await processImageElement(img);
      } catch (e) {
        return;
      }
      // if processing produced a data URL, replace the element background immediately
      try {
        if (img.src && typeof img.src === "string" && img.src.startsWith("data:")) {
          el.style.backgroundImage = `url("${img.src}")`;
        }
      } catch (e) {}
    } catch (e) {}
  }

  function applyToBackgrounds(root = document) {
    const els = Array.from(root.querySelectorAll("*"));
    els.forEach((el) => {
      try {
        const s = getComputedStyle(el).backgroundImage;
        if (s && s !== "none" && s.includes("url(")) processBackgroundElement(el);
      } catch (e) {}
    });
  }

  // --- pseudo-element (::before / ::after) processing ---
  // We'll scan stylesheets and inline styles for rules that use content: url(...)
  // and for any element that has an inline style or computed style with content: url(...)
  // we will produce a per-element injected stylesheet that replaces the url(...) with data:URL when processed.

  // map of element -> {beforeRuleId, afterRuleId}
  const _pseudoRules = new WeakMap();

  function extractUrlFromContent(content) {
    if (!content) return null;
    const m = String(content).match(/url\(["']?(.*?)["']?\)/);
    return m ? m[1] : null;
  }

  async function processPseudoForElement(el) {
    try {
      const cs = getComputedStyle(el);
      const before = cs.getPropertyValue("content") || cs.content;
      const urlB = extractUrlFromContent(before);
      const after = null; // not all browsers expose ::after via computed style reliably
      const stored = _pseudoRules.get(el) || {};
      // process ::before
      if (urlB) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = urlB;
        try {
          await awaitImageLoaded(img);
          await processImageElement(img);
        } catch (e) {
          // skip
        }
        if (img.src && img.src.startsWith && img.src.startsWith("data:")) {
          // inject a unique class and a style rule targeting that element's before
          const id = "bayer-pseudo-" + Math.random().toString(36).slice(2, 9);
          el.classList.add(id);
          const css = `.${id}::before{ content: url("${img.src}") !important; }`;
          const styleEl = document.createElement("style");
          styleEl.setAttribute("data-bayer-pseudo", id);
          styleEl.appendChild(document.createTextNode(css));
          document.head.appendChild(styleEl);
          stored.beforeRuleId = id;
          _pseudoRules.set(el, stored);
        }
      }
      // note: supporting ::after is similar; try to extract if needed in future
    } catch (e) {}
  }

  // scan DOM for elements that might have content: url(...) in styles or inline
  function applyToPseudoElements(root = document) {
    const els = Array.from(root.querySelectorAll("*"));
    els.forEach((el) => {
      try {
        const cs = getComputedStyle(el);
        const content = cs && (cs.getPropertyValue("content") || cs.content);
        if (content && String(content).includes("url(")) {
          processPseudoForElement(el);
        }
      } catch (e) {}
    });
  }

  // integrate background processing into the existing observer
  const bgObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "childList") {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;
          processBackgroundElement(node);
          if (node.querySelectorAll) node.querySelectorAll("*").forEach(processBackgroundElement);
        }
      } else if (m.type === "attributes") {
        const t = m.target;
        if (t && t.nodeType === 1) processBackgroundElement(t);
      }
    }
  });

  // Public API
  window.__bayerDither = {
    enable() {
      // start observing and apply only to images explicitly marked with .dither
      observer.observe(document.documentElement, { childList: true, subtree: true });
      bgObserver.observe(document.documentElement, { childList: true, subtree: true });
      // initial pass: only apply to <img class="dither">
      applyToAll();
      applyToBackgrounds();
      applyToPseudoElements();
    },
    disable() {
      observer.disconnect();
      bgObserver.disconnect();
      // remove injected pseudo-element style rules
      try {
        // remove style elements we injected
        const injected = document.querySelectorAll("style[data-bayer-pseudo]");
        injected.forEach((s) => s.parentNode && s.parentNode.removeChild(s));
        // remove classes we added (best-effort)
        _pseudoRules &&
          _pseudoRules.forEach &&
          _pseudoRules.forEach((v, k) => {
            try {
              if (v && v.beforeRuleId) k.classList.remove(v.beforeRuleId);
            } catch (e) {}
          });
      } catch (e) {}
      removeFromAll();
    },
    apply(img) {
      processImageElement(img);
    },
    applyBackgrounds(root) {
      applyToBackgrounds(root || document);
    },
    remove(img) {
      if (!img) return;
      if (img.dataset.originalSrc) {
        img.src = img.dataset.originalSrc;
        delete img.dataset.originalSrc;
      }
      // restore previous inline style if we saved one
      try {
        if (img.dataset.__bayerPrevStyle !== undefined) {
          const s = img.dataset.__bayerPrevStyle || null;
          if (s === "") img.removeAttribute("style");
          else img.setAttribute("style", s);
          delete img.dataset.__bayerPrevStyle;
        }
      } catch (e) {}
      delete img.dataset.bayerApplied;
    },
    setOptions(opt) {
      // merge options and re-run if already enabled
      options = Object.assign(options, opt || {});
      // if observer is active, reapply to refresh images
      try {
        if (observer) {
          // reprocess: disable then enable to restore originals and reapply
          this.disable();
          this.enable();
        }
      } catch (e) {}
    },
    // convenience helper to adjust gamma at runtime
    setGamma(g) {
      const gg = Number(g) || DEFAULTS.gamma;
      options.gamma = Math.max(0.1, gg);
      // reapply to images if enabled
      try {
        if (observer) {
          this.disable();
          this.enable();
        }
      } catch (e) {}
      return options.gamma;
    },
    // set approximate maximum distinct colors (total). Computes per-channel levels = cbrt(maxColors)
    setMaxColors(n) {
      const nn = Math.max(0, Math.floor(Number(n) || 0));
      options.maxColors = nn;
      // reapply
      try {
        if (observer) {
          this.disable();
          this.enable();
        }
      } catch (e) {}
      return options.maxColors;
    },
    // multiply the pixel density by two (doubling number of small pixels)
    doublePixels() {
      options.scale = Math.min(1, (options.scale || DEFAULTS.scale) * 2);
      // reapply
      this.setOptions({});
      return options.scale;
    },
    // Apply a named preset for common dither setups
    preset(name) {
      const presets = {
        // classic Bayer 8x8 binary per-channel (very high contrast)
        "bayer-pure": () => ({ maxColors: 0, levels: 2, pixelSize: 8, gamma: DEFAULTS.gamma }),
        // multi-level Bayer per-channel (softer, more levels)
        "bayer-multi": () => ({ maxColors: 0, levels: 4, pixelSize: 6, gamma: DEFAULTS.gamma }),
        // palette-based Bayer (optimized palette then Bayer selection)
        "bayer-palette": () => ({ maxColors: Math.max(2, DEFAULTS.maxColors), pixelSize: 6, gamma: DEFAULTS.gamma }),
      };
      const fn = presets[name];
      if (!fn) return false;
      const opt = fn();
      this.setOptions(opt);
      return true;
    },
  };

  // auto-enable
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.__bayerDither && window.__bayerDither.enable());
  } else {
    window.__bayerDither && window.__bayerDither.enable();
  }
})();
