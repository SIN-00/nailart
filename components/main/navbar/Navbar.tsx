'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-[clamp(20px,4vw,48px)] h-16 font-sans transition-all duration-350 ease-in-out ${scrolled
          ? 'bg-black/55 backdrop-blur-2xl backdrop-saturate-[140%] shadow-[0_1px_0_rgba(255,255,255,0.06)]'
          : ''
        }`}
    >
      {/* Left: Logo + Brand */}
      <a href="/" className="flex items-center gap-2.5 no-underline text-white">
        <img
          src="/nailart.png"
          alt="Nailart AI Logo"
          width={32}
          height={32}
          className="w-8 h-8 rounded-lg object-contain"
        />
        <span className="text-[1.1rem] font-bold tracking-tight">Nailart AI</span>
      </a>

      {/* Center: Nav Links */}
      <ul className="hidden md:flex gap-8 list-none m-0 p-0">
        <li>
          <a href="#features" className="text-white/75 no-underline text-sm font-medium tracking-wide hover:text-white transition-colors duration-200">
            Features
          </a>
        </li>
        <li>
          <a href="#pricing" className="text-white/75 no-underline text-sm font-medium tracking-wide hover:text-white transition-colors duration-200">
            Pricing
          </a>
        </li>
        <li>
          <a href="#contact" className="text-white/75 no-underline text-sm font-medium tracking-wide hover:text-white transition-colors duration-200">
            Contact
          </a>
        </li>
      </ul>

      {/* Right: CTA */}
      <a
        href={user ? undefined : '/auth'}
        onClick={user ? (e) => e.preventDefault() : undefined}
        className="px-5 py-2 rounded-[10px] bg-white/12 text-white no-underline text-sm font-semibold border border-white/18 backdrop-blur-md hover:bg-white/22 hover:border-white/35 transition-all duration-250"
        style={{ cursor: user ? 'default' : 'pointer' }}
      >
        Get Started
      </a>
    </nav>
  );
}
