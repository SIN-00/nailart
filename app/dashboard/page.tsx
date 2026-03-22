'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import PromptArea from '@/components/dashboard/PromptArea';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/auth');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');`}</style>
      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundColor: '#181818',
          backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
          backgroundSize: '40px 40px',
        }}
      >
        <DashboardNavbar />

        {/* 중앙 PromptArea */}
        <main className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-3xl">
            <h1
              className="text-2xl font-bold text-white text-center mb-2 tracking-tight"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              Describe your thumbnails
            </h1>
            <p
              className="text-sm text-white/30 text-center mb-8"
              style={{ fontFamily: "'Indie Flower', cursive" }}
            >
              Just describe your video — Nailart AI crafts scroll-stopping YouTube thumbnails in seconds.
            </p>
            <PromptArea
              onSend={(message, files) => {
                console.log('Send:', message, files);
              }}
            />
          </div>
        </main>
      </div>
    </>
  );
}
