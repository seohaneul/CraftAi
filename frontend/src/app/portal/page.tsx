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
    <div className="full-viewport-center" suppressHydrationWarning>
      <header className="portal-header" suppressHydrationWarning>
        <h1 className="premium-text-gradient title-xl" suppressHydrationWarning>
          {username} 스튜디오 환영합니다
        </h1>
        <p className="description-text" suppressHydrationWarning>어떤 모드로 접속하시겠습니까?</p>
      </header>

      <div className="portal-card-grid" suppressHydrationWarning>
        <Link href="/admin" className="no-underline" suppressHydrationWarning>
          <div className="premium-glass gallery-card portal-card" suppressHydrationWarning>
            <span className="portal-icon" suppressHydrationWarning>👨‍💼</span>
            <div suppressHydrationWarning>
              <h2 className="title-md mb-4" suppressHydrationWarning>사장님 관리 모드</h2>
              <p className="text-secondary-color lh-1-5 text-sm" suppressHydrationWarning>
                스토어의 템플릿과 가죽<br/>스와치를 데이터베이스에<br/>등록하고 관리합니다.
              </p>
            </div>
            <button className="btn btn-primary w-full mt-4 p-4" suppressHydrationWarning>백오피스 열기</button>
          </div>
        </Link>

        <Link href="/customer" className="no-underline" suppressHydrationWarning>
          <div className="premium-glass gallery-card portal-card" suppressHydrationWarning>
            <span className="portal-icon" suppressHydrationWarning>🧑‍🎨</span>
            <div suppressHydrationWarning>
              <h2 className="title-md mb-4" suppressHydrationWarning>고객 쇼룸 모드</h2>
              <p className="text-secondary-color lh-1-5 text-sm" suppressHydrationWarning>
                아이패드 등에 띄워두고<br/>실제 매장 고객들이 AI 디자인을<br/>생성해 볼 수 있는 화면입니다.
              </p>
            </div>
            <button className="btn btn-danger w-full mt-4 p-4" suppressHydrationWarning>쇼룸 화면 띄우기</button>
          </div>
        </Link>
      </div>
      
      <button onClick={() => { localStorage.clear(); router.push('/'); }} className="btn portal-logout-btn" suppressHydrationWarning>
        다른 계정으로 로그인하기
      </button>
    </div>
  );
}
