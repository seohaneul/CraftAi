'use client';

import { useState, useEffect } from 'react';

interface Template {
  id: number;
  templateName: string;
  s3OriginalImageUrl: string;
}

export default function CustomerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [myImage, setMyImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resultImg, setResultImg] = useState('');
  const [status, setStatus] = useState('');
  const [username, setUsername] = useState('고객님');

  useEffect(() => {
    const comName = localStorage.getItem('username');
    if(comName) {
      setUsername(comName);
      fetch(`http://localhost:8081/api/v1/templates/${comName}`)
        .then(res => res.json())
        .then(data => setTemplates(data))
        .catch(e => console.error(e));
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMyImage(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setMyImage(null);
      setPreviewImage(null);
    }
  };

  const handleAiProcessing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myImage || !selectedTemplate) {
      setStatus('템플릿과 가죽(소재) 사진을 모두 골라주세요.');
      return;
    }
    
    setStatus('AI가 가죽의 질감을 템플릿 디자인에 입히는 중입니다... (약 2초 대기)');
    
    try {
      const res = await fetch(`http://localhost:8081/api/v1/orders/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: "https://craftai-storage.s3.ap-northeast-2.amazonaws.com/dummy-client-img.jpeg", 
          prompt: `사용자가 올린 가죽 질감을 [${selectedTemplate.templateName}] 템플릿에 적용해줘` // 기술적인 처리를 위해 보이지 않게 넘겨주는 값
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setStatus('✨ 매력적인 가죽 제품 디자인이 완성되었습니다!');
        setResultImg(data.result_image_url);
      } else {
        setStatus('서버 에러가 발생했습니다.');
      }
    } catch (err) {
      setStatus('AI 백엔드 서버 연결을 확인해주세요!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2.5rem 5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                {username} 맞춤 디자인 쇼룸
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>찍어온 가죽 사진과 마음에 드는 디자인을 골라 합성 결과를 확인해보세요.</p>
        </div>
        <button onClick={() => window.location.href='/portal'} className="btn premium-glass" style={{ color: 'var(--text-primary)' }}>이전으로</button>
      </header>

      <div style={{ display: 'flex', gap: '3rem' }}>
        {/* 왼쪽 갤러리 (템플릿 선택) */}
        <section style={{ flex: '1.2' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>1. 원하는 디자인 베이스(템플릿) 선택</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {templates.map(t => {
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <div 
                  key={t.id} 
                  className={`premium-glass gallery-card ${isSelected ? 'selected' : ''}`} 
                  style={{ 
                    cursor: 'pointer', 
                    border: isSelected ? '3px solid #3b82f6' : '1px solid var(--border)',
                    boxShadow: isSelected ? '0 0 20px rgba(59, 130, 246, 0.4)' : '',
                    transform: isSelected ? 'translateY(-5px)' : ''
                  }} 
                  onClick={() => setSelectedTemplate(t)}
                >
                  <div className="gallery-img-wrapper" style={{ paddingTop: '80%' }}>
                    <img src={t.s3OriginalImageUrl} alt={t.templateName} />
                  </div>
                  <div style={{ padding: '1rem', textAlign: 'center', background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                    <strong style={{ fontSize: '0.95rem', color: isSelected ? '#60a5fa' : 'white' }}>{t.templateName}</strong>
                    {isSelected && <span style={{ display: 'block', marginTop: '0.5rem', color: '#60a5fa', fontSize: '0.8rem' }}>선택됨 ✔️</span>}
                  </div>
                </div>
              );
            })}
            {templates.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>스토어에 등록된 샘플 템플릿이 없습니다.</p>}
          </div>
        </section>

        {/* 오른쪽 사용자 가죽 업로드 및 결과물 확인 */}
        <section style={{ flex: '1' }}>
          <div className="premium-glass" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600 }}>📸 내 가죽과 아이템 매칭하기</h2>
            
            <form onSubmit={handleAiProcessing} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  2. 직접 촬영한 가죽이나 스와치(질감) 사진 올리기
                </label>
                <div style={{
                  border: previewImage ? '1px solid var(--accent)' : '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: previewImage ? '0' : '3rem 1rem',
                  textAlign: 'center',
                  position: 'relative',
                  background: previewImage ? 'transparent' : 'rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                  cursor: 'pointer'
                }}>
                  {previewImage ? (
                    <img src={previewImage} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📤</span>
                      <p style={{ margin: 0 }}>클릭하여 소재 사진 첨부</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                </div>
              </div>

              {selectedTemplate ? (
                <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid #3b82f6', color: '#93c5fd' }}>
                  현재 선택된 템플릿: <strong>{selectedTemplate.templateName}</strong>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  좌측에서 원하시는 디자인 템플릿을 먼저 클릭해주세요.
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={!selectedTemplate || !myImage}
                style={{ padding: '1.2rem', fontSize: '1.1rem', opacity: (!selectedTemplate || !myImage) ? 0.5 : 1 }}
              >
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
