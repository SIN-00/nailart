'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

/* ── Shader (right panel background) ───────────────────────── */
const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define MN min(R.x,R.y)
float pattern(vec2 uv){
  float d=.0;
  for(float i=.0;i<3.;i++){
    uv.x+=sin(T*(1.+i)+uv.y*1.5)*.2;
    d+=.005/abs(uv.x);
  }
  return d;
}
vec3 scene(vec2 uv){
  vec3 col=vec3(0);
  uv=vec2(atan(uv.x,uv.y)*2./6.28318,-log(length(uv))+T);
  for(float i=.0;i<3.;i++){
    int k=int(mod(i,3.));
    col[k]+=pattern(uv+i*6./MN);
  }
  return col;
}
void main(){
  vec2 uv=(FC-.5*R)/MN;
  vec3 col=vec3(0);
  float s=12.,e=9e-4;
  col+=e/(sin(uv.x*s)*cos(uv.y*s));
  uv.y+=R.x>R.y?.5:.5*(R.y/R.x);
  col+=scene(uv);
  O=vec4(col,1.);
}`;

const VERT = `#version 300 es
precision highp float;
in vec2 position;
void main(){ gl_Position=vec4(position,0.,1.); }
`;

function useShaderCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!gl) return;

    const compile = (src: string, type: number) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
      return sh;
    };

    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,-1,-1,1,1,1,-1]), gl.STATIC_DRAW);
    gl.useProgram(prog);
    const pos = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'time');
    const uRes  = gl.getUniformLocation(prog, 'resolution');
    gl.clearColor(0, 0, 0, 1);

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width: w, height: h } = canvas.getBoundingClientRect();
      const W = Math.floor(Math.max(1, w) * dpr);
      const H = Math.floor(Math.max(1, h) * dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
      gl.viewport(0, 0, W, H);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const loop = (t: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 1e-3);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteBuffer(buf); gl.deleteProgram(prog);
    };
  }, [canvasRef]);
}

/* ── Google logo ────────────────────────────────────────────── */
const GoogleLogo = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.1 24.1 0 0 0 0 21.56l7.98-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const FIXED_VIDEO_ID = 'mhVgh640FUw';

/* ── Auth Page ──────────────────────────────────────────────── */
export default function AuthPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { signInWithGoogle } = useAuth();
  useShaderCanvas(canvasRef);

  return (
    <div className="relative flex min-h-screen overflow-hidden">

      {/* ── 전체 배경: 셰이더 ───────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full block"
      />

      {/* ── 왼쪽 패널 (3/5) ─────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col"
        style={{ width: '60%', background: 'rgba(0,0,0,0.82)' }}
      >
        {/* Back 버튼 */}
        <a
          href="/"
          className="absolute top-5 left-6 flex items-center gap-2 text-white/50 text-sm font-medium no-underline hover:text-white transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </a>

        {/* 유튜브 영상 영역 */}
        <div className="flex-1 flex items-center justify-center px-12 pt-20 pb-6">
          <div className="w-full rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={`https://www.youtube.com/embed/${FIXED_VIDEO_ID}?autoplay=0&rel=0&modestbranding=1`}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>

        {/* NAILART 오버사이즈 텍스트 */}
        <div className="px-10 pb-10 select-none">
          <p
            className="m-0 font-black uppercase leading-none tracking-tighter text-white"
            style={{
              fontSize: 'clamp(4rem, 10vw, 11rem)',
              letterSpacing: '-0.04em',
              opacity: 0.92,
            }}
          >
            NAILART
          </p>
        </div>
      </div>

      {/* ── 오른쪽 패널 (2/5) ───────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{ width: '40%' }}
      >
        {/* 카드 */}
        <div className="w-full max-w-[400px] mx-8 rounded-2xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.5)] p-10 flex flex-col items-center">

          {/* 로고 */}
          <a href="/" className="flex items-center gap-2.5 no-underline text-white mb-2">
            <img src="/nailart.png" alt="Nailart AI" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-xl font-bold tracking-tight">Nailart AI</span>
          </a>

          {/* 타이틀 */}
          <h1 className="mt-6 text-3xl font-bold text-white text-center">
            Welcome Back
          </h1>

          {/* 서브타이틀 */}
          <p className="mt-2 text-sm text-white/60 text-center max-w-[280px] leading-relaxed">
            Sign in to create stunning YouTube thumbnails with AI
          </p>

          {/* 구분선 */}
          <div className="w-full flex items-center gap-3 mt-8 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40 uppercase tracking-widest font-medium">continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-[0.95rem] cursor-pointer border-0 shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]"
          >
            <GoogleLogo />
            Sign in with Google
          </button>

          {/* 약관 */}
          <p className="mt-8 text-xs text-white/35 text-center leading-relaxed max-w-[300px]">
            By continuing, you agree to our{' '}
            <a href="#terms" className="text-white/50 underline hover:text-white/70 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#privacy" className="text-white/50 underline hover:text-white/70 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>

    </div>
  );
}
