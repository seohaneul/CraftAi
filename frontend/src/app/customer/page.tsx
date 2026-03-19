'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: number;
  templateName: string;
  s3OriginalImageUrl: string;
}

export default function CustomerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [myImage, setMyImage] = useState<File | null>(null);
  const [synthPrompt, setSynthPrompt] = useState('');
  const [resultImg, setResultImg] = useState('');
  const [status, setStatus] = useState('');
  const [username, setUsername] = useState('고객님');

  // 지금은 편의상 admin123 사장님의 템플릿을 고정으로 불러옴
  const adminId = 'admin123';

  useEffect(() => {
    setUsername(localStorage.getItem('username') || '고객님');
    fetch(`http://localhost:8081/api/v1/templates/${adminId}`)
      .then(res => res.json())
      .then(data => setTemplates(data))
      .catch(e => console.error(e));
  }, []);

  const handleAiProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myImage || !synthPrompt) return setStatus('사진 선택과 프롬프트를 모두 입력해주세요.');
    
    setStatus('AI가 가죽의 질감을 분석하여 디자인 패턴에 합성 중입니다... (약 2초 대기)');
    
    // AI 더미 엔드포인트를 그대로 테스트용 활용 (원래는 사진을 S3에 올려서 처리)
    // AI 파이썬 서버 연결 API인 백엔드의 /api/v1/orders/visualize 경로로 보냅니다.
    try {
      const res = await fetch(`http://localhost:8081/api/v1/orders/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: "https://craftai-storage.s3.ap-northeast-2.amazonaws.com/dummy-client-img.jpeg", // 더미 사용자 사진
          prompt: synthPrompt
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus('✨ 합성 완료! 멋진 결과물이 도착했습니다.');
        setResultImg(data.result_image_url);
      } else {
        setStatus('서버 에러가 발생했습니다.');
      }
    } catch (err) {
      setStatus('AI 백엔드 서버(FastAPI) 연결을 확인해주세요!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2.5rem 5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                CraftAI 맞춤 공방
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>환영합니다, {username}! 나만의 가죽 제품을 디자인해보세요.</p>
        </div>
        <button onClick={() => window.location.href='/'} className="btn premium-glass" style={{ color: 'var(--text-primary)' }}>로그아웃</button>
      </header>

      <div style={{ display: 'flex', gap: '3rem' }}>
        {/* 왼쪽 갤러리 섹션 */}
        <section style={{ flex: '1.2' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>1. 공방 제공 디자인 템플릿</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>맘에 드는 디자인을 클릭하면 옆 칸에 자동 입력됩니다.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {templates.map(t => (
              <div key={t.id} className="premium-glass gallery-card" style={{ cursor: 'pointer' }} onClick={() => setSynthPrompt(t.templateName + ' 디자인으로 재질감 살려서 만들어줘!')}>
                <div className="gallery-img-wrapper" style={{ paddingTop: '80%' }}>
                  <img src={t.s3OriginalImageUrl} alt={t.templateName} />
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <strong style={{ fontSize: '0.95rem' }}>{t.templateName}</strong>
                </div>
              </div>
            ))}
            {templates.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>아직 사장님이 등록한 오픈 템플릿이 없습니다.</p>}
          </div>
        </section>

        {/* 오른쪽 주문 생성 섹션 */}
        <section style={{ flex: '1' }}>
          <div className="premium-glass" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600 }}>📸 내 가죽과 아이템으로 AI 생성하기</h2>
            
            <form onSubmit={handleAiProcessing} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  2. 가지고 계신 스와치나 소품 파일을 골라주세요
                </label>
                <input type="file" accept="image/*" onChange={e => setMyImage(e.target.files?.[0] || null)} className="btn" style={{ width: '100%', border: '1px dashed var(--border)', padding: '2rem', textAlign: 'center' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  3. AI에게 묘사할 주문서 (프롬프트)
                </label>
                <textarea rows={3} value={synthPrompt} onChange={e => setSynthPrompt(e.target.value)} placeholder="예시: 검은색 송아지 가죽으로 단면이 깨끗하게 마감된 토트백을 만들어주세요." style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white', resize: 'vertical' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem' }}>
                ✨ AI 디자인 렌더링 시작
              </button>
            </form>

            {status && <p style={{ marginTop: '1.5rem', color: 'var(--accent)', fontWeight: 'bold' }}>{status}</p>}

            {resultImg && (
              <div style={{ marginTop: '2.5rem', animation: 'fadeIn 0.5s ease', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>결과물 프리뷰</h3>
                <img src={resultImg} alt="AI 합성 결과" style={{ width: '100%', borderRadius: '12px', border: '1px solid #3b82f6', boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
