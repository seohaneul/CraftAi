'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PortalPage() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (!user) {
      router.push('/');
    } else {
      setUsername(user);
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="premium-text-gradient" suppressHydrationWarning style={{ fontSize: '3rem' }}>
          {username} 스튜디오 환영합니다
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '1rem' }}>어떤 모드로 접속하시겠습니까?</p>
      </header>

      <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/admin" style={{ textDecoration: 'none' }}>
          <div className="premium-glass gallery-card" style={{ width: '350px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '4.5rem', display: 'block' }}>👨‍💼</span>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.8rem', margin: '0 0 0.8rem 0' }}>사장님 관리 모드</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                스토어의 템플릿과 가죽<br/>스와치를 데이터베이스에<br/>등록하고 관리합니다.
              </p>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>백오피스 열기</button>
          </div>
        </Link>

        <Link href="/customer" style={{ textDecoration: 'none' }}>
          <div className="premium-glass gallery-card" style={{ width: '350px', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '4.5rem', display: 'block' }}>🧑‍🎨</span>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.8rem', margin: '0 0 0.8rem 0' }}>고객 쇼룸 모드</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, fontSize: '0.95rem' }}>
                아이패드 등에 띄워두고<br/>실제 매장 고객들이 AI 디자인을<br/>생성해 볼 수 있는 화면입니다.
              </p>
            </div>
            <button className="btn btn-danger" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', border: 'none', background: '#ec4899', color: 'white' }}>쇼룸 화면 띄우기</button>
          </div>
        </Link>
      </div>
      
      <button onClick={() => { localStorage.clear(); router.push('/'); }} className="btn" style={{ background: 'transparent', color: 'var(--text-secondary)', marginTop: '4rem', fontSize: '1rem', textDecoration: 'underline' }}>
        다른 계정으로 로그인하기
      </button>
    </div>
  );
}
