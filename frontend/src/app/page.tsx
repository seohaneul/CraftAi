'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './globals.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
    
    // 강제로 admin이라는 단어가 아이디에 들어가면 사장님 계정으로 만들어버림 (테스트 목적)
    const role = isLogin ? undefined : (username.toLowerCase().includes('admin') ? 'ADMIN' : 'CUSTOMER');

    try {
      const res = await fetch(`http://localhost:8081${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // 인증정보(Role)를 편의상 로컬 스토리지에 유지
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('username', data.username || username);
        
        // 권한에 따라 화면 분기
        if (data.role === 'ADMIN' || role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/customer');
        }
      } else {
        setStatus(data.message || '인증 실패');
      }
    } catch (err) {
      setStatus('서버 연결 실패');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <form onSubmit={handleAuth} className="premium-glass" style={{ padding: '3.5rem 3rem', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ textAlign: 'center', margin: 0, fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CraftAI
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '-1rem' }}>
          {isLogin ? '사장님 또는 고객님으로 로그인하세요' : '새로운 계정을 만들어보세요'}
        </p>
        
        <input 
          type="text" placeholder="아이디 (admin이 들어가면 사장님 권한)" value={username} onChange={e => setUsername(e.target.value)} required
          style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
        />
        <input 
          type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} required
          style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', outline: 'none' }}
        />
        
        {status && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{status}</div>}
        
        <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
          {isLogin ? '로그인하기' : '회원가입하기'}
        </button>
        
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}>
          {isLogin ? '아직 계정이 없으신가요? (회원가입)' : '이미 계정이 있으신가요? (로그인)'}
        </button>
      </form>
    </div>
  );
}
