'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
    const role = 'COMPANY'; // 무조건 회사(가죽공방) 자격으로 가입됨

    setStatus('인증 진행 중...');

    try {
      const res = await fetch(`http://localhost:8081${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('userRole', 'COMPANY');
        localStorage.setItem('username', data.username || username);
        
        // 로그인 성공 시 회사 분기 포털 화면으로 이동
        router.push('/portal');
      } else {
        setStatus(data.message || '인증 실패');
      }
    } catch (err) {
      setStatus('서버 연결 실패');
    }
  };

  return (
    <div className="full-viewport-center" suppressHydrationWarning>
      <form onSubmit={handleAuth} className="premium-glass login-form" suppressHydrationWarning>
        <h2 className="premium-text-gradient title-lg text-center" suppressHydrationWarning>
          CraftAI
        </h2>
        <p className="text-secondary-color text-center mb-4" suppressHydrationWarning>
          {isLogin ? '파트너 공방 전용 로그인' : '새로운 파트너 공방으로 가입하세요'}
        </p>
        
        <input 
          type="text" placeholder="공방 아이디 (회사명)" value={username} onChange={e => setUsername(e.target.value)} required
          className="login-input"
          suppressHydrationWarning
        />
        <input 
          type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required
          className="login-input"
          suppressHydrationWarning
        />
        
        {status && <div className="error-text" suppressHydrationWarning>{status}</div>}
        
        <button type="submit" className="btn btn-primary mt-4 p-4 text-lg" suppressHydrationWarning>
          {isLogin ? '로그인 들어가기' : '파트너 파트너스 가입하기'}
        </button>
        
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="link-btn" suppressHydrationWarning>
          {isLogin ? '제휴 공방 등록하기 (회원가입)' : '이미 로그인 계정이 있습니다'}
        </button>
      </form>
    </div>
  );
}
