'use client';

import React, { useEffect, useRef } from 'react';

export type AetherHeroProps = {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;

  align?: 'left' | 'center' | 'right';
  maxWidth?: number;
  overlayGradient?: string;
  textColor?: string;

  fragmentSource?: string;
  dprMax?: number;
  clearColor?: [number, number, number, number];

  height?: string | number;
  className?: string;
  ariaLabel?: string;
};

const DEFAULT_FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define S smoothstep
#define MN min(R.x,R.y)
float pattern(vec2 uv) {
  float d=.0;
  for (float i=.0; i<3.; i++) {
    uv.x+=sin(T*(1.+i)+uv.y*1.5)*.2;
    d+=.005/abs(uv.x);
  }
  return d;	
}
vec3 scene(vec2 uv) {
  vec3 col=vec3(0);
  uv=vec2(atan(uv.x,uv.y)*2./6.28318,-log(length(uv))+T);
  for (float i=.0; i<3.; i++) {
    int k=int(mod(i,3.));
    col[k]+=pattern(uv+i*6./MN);
  }
  return col;
}
void main() {
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  float s=12., e=9e-4;
  col+=e/(sin(uv.x*s)*cos(uv.y*s));
  uv.y+=R.x>R.y?.5:.5*(R.y/R.x);
  col+=scene(uv);
  O=vec4(col,1.);
}`;

const VERT_SRC = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }
`;

export default function AetherHero({
  title = 'Make the impossible feel inevitable.',
  subtitle = 'A minimal hero with a living shader background.',
  ctaLabel = 'Get Started',
  ctaHref = '#',
  secondaryCtaLabel,
  secondaryCtaHref,

  align = 'center',
  maxWidth = 960,
  overlayGradient = 'linear-gradient(180deg, #00000099, #00000040 40%, transparent)',
  textColor = '#ffffff',

  fragmentSource = DEFAULT_FRAG,
  dprMax = 2,
  clearColor = [0, 0, 0, 1],

  height = '100vh',
  className = '',
  ariaLabel = 'Aurora hero background',
}: AetherHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const compileShader = (gl: WebGL2RenderingContext, src: string, type: number) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(sh) || 'Unknown shader error';
      gl.deleteShader(sh);
      throw new Error(info);
    }
    return sh;
  };

  const createProgram = (gl: WebGL2RenderingContext, vs: string, fs: string) => {
    const v = compileShader(gl, vs, gl.VERTEX_SHADER);
    const f = compileShader(gl, fs, gl.FRAGMENT_SHADER);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog) || 'Program link error';
      gl.deleteProgram(prog);
      throw new Error(info);
    }
    return prog;
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!gl) return;

    let prog: WebGLProgram;
    try {
      prog = createProgram(gl, VERT_SRC, fragmentSource);
    } catch (e) {
      console.error(e);
      return;
    }

    const verts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    gl.useProgram(prog);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uniTime = gl.getUniformLocation(prog, 'time');
    const uniRes = gl.getUniformLocation(prog, 'resolution');

    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

    const fit = () => {
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, dprMax));
      const rect = canvas.getBoundingClientRect();
      const W = Math.floor(Math.max(1, rect.width) * dpr);
      const H = Math.floor(Math.max(1, rect.height) * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    window.addEventListener('resize', fit);

    const loop = (now: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      if (uniRes) gl.uniform2f(uniRes, canvas.width, canvas.height);
      if (uniTime) gl.uniform1f(uniTime, now * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fragmentSource, dprMax, clearColor]);

  const alignClasses = {
    left: 'items-center justify-start text-left',
    center: 'items-center justify-center text-center',
    right: 'items-center justify-end text-right',
  };

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      aria-label="Hero"
    >
      {/* Font import for Indie Flower (title only) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');
      `}</style>

      {/* Shader canvas */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full block select-none touch-none"
      />

      {/* Overlay gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ background: overlayGradient }}
      />

      {/* Content layer */}
      <div
        className={`relative z-[2] h-full flex p-[min(6vw,64px)] font-sans ${alignClasses[align]}`}
        style={{ color: textColor }}
      >
        <div
          className={`w-full ${align === 'center' ? 'mx-auto' : ''}`}
          style={{ maxWidth }}
        >
          {/* Title — Indie Flower font */}
          <h1
            className="m-0 text-[clamp(2.2rem,6vw,4.5rem)] leading-[1.04] tracking-tight font-bold"
            style={{
              fontFamily: "'Indie Flower', cursive",
              textShadow: '0 6px 36px rgba(0,0,0,0.45)',
            }}
          >
            {title}
          </h1>

          {/* Subtitle — system font */}
          {subtitle && (
            <p
              className={`mt-4 text-[clamp(1rem,2vw,1.25rem)] leading-relaxed opacity-90 max-w-[700px] ${
                align === 'center' ? 'mx-auto' : ''
              }`}
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
            >
              {subtitle}
            </p>
          )}

          {/* CTA buttons */}
          {(ctaLabel || secondaryCtaLabel) && (
            <div className="inline-flex gap-3 mt-8 flex-wrap">
              {ctaLabel && (
                <a
                  href={ctaHref}
                  className="px-7 py-3 rounded-xl bg-gradient-to-b from-white/18 to-white/6 no-underline font-semibold text-base shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28),0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-md backdrop-saturate-[120%]"
                  style={{ color: textColor }}
                >
                  {ctaLabel}
                </a>
              )}
              {secondaryCtaLabel && (
                <a
                  href={secondaryCtaHref}
                  className="px-7 py-3 rounded-xl bg-transparent opacity-85 no-underline font-semibold text-base shadow-[inset_0_0_0_1px_rgba(255,255,255,0.28)] backdrop-blur-sm"
                  style={{ color: textColor }}
                >
                  {secondaryCtaLabel}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export { AetherHero };
