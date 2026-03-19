'use client';

import { useState, useEffect } from 'react';

export default function UploadTemplatePage() {
  const [adminId, setAdminId] = useState('admin123');
  const [templateName, setTemplateName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 로컬스토리지에 저장된 유저명 가져오기
  useEffect(() => {
    const savedName = localStorage.getItem('username');
    if (savedName) setAdminId(savedName);
  }, []);

  // 이미지가 선택되면 미리보기(Preview) 렌더링
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !templateName) {
      setStatus('템플릿 이름과 이미지를 모두 입력해주세요.');
      return;
    }

    setIsUploading(true);
    setStatus('S3에 업로드 중입니다...');
    const formData = new FormData();
    formData.append('adminId', adminId);
    formData.append('templateName', templateName);
    formData.append('image', image);

    try {
      const res = await fetch('http://localhost:8081/api/v1/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setStatus('성공적으로 업로드되었습니다! 🎉');
        setTimeout(() => {
          window.location.href = '/admin'; // 갤러리로 자동 복귀
        }, 1500);
      } else {
        setStatus('업로드 실패: 서버 오류');
        setIsUploading(false);
      }
    } catch (error: any) {
      setStatus('업로드 실패: 서버 연결에 실패했습니다.');
      setIsUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', paddingTop: '1.5rem', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          디자인 템플릿 등록
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1rem' }}>
          고객이 상상 속 가죽 소품을 그려볼 수 있도록, 기본 뼈대가 될 사진을 올려주세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="premium-glass" style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        <div style={{ display: 'flex', gap: '4rem', alignItems: 'stretch' }}>
          {/* 왼쪽: 이미지 미리보기 및 업로드 (Drag & Drop 느낌 스타일링) */}
          <div style={{ flex: '1.2' }}>
            <label style={{ fontWeight: 600, color: 'white', display: 'block', marginBottom: '1rem', fontSize: '1.1rem' }}>1. 사진 찾기</label>
            <div style={{
              border: preview ? '1px solid var(--accent)' : '2px dashed var(--text-secondary)',
              borderRadius: '16px',
              padding: preview ? '0' : '4rem 1rem',
              textAlign: 'center',
              position: 'relative',
              background: preview ? 'transparent' : 'rgba(0,0,0,0.3)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              {preview ? (
                <img src={preview} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📥</span>
                  <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>여기를 클릭하여 사진을 올리세요</p>
                  <span className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>컴퓨터에서 찾기</span>
                </div>
              )}
              {/* 투명한 Input이 위를 전부 덮고 있어서 어디를 클릭해도 업로드 동작 */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                required 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
            </div>
            {preview && <p style={{ textAlign: 'center', margin: '1rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>사진을 다시 고르려면 이곳을 다시 클릭하세요.</p>}
          </div>

          {/* 오른쪽: 입력 폼 및 확정 버튼 */}
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <label style={{ fontWeight: 600, color: 'white', display: 'block', marginBottom: '1rem', fontSize: '1.1rem' }}>2. 템플릿 이름</label>
              <input 
                type="text" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                required 
                placeholder="예: 블랙 사피아노 토트백"
                style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.4)', color: 'white', outline: 'none', fontSize: '1.05rem' }}
              />
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {status && (
                <p style={{ color: status.includes('성공') ? '#10b981' : 'var(--accent)', margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {status}
                </p>
              )}
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isUploading}
                style={{ padding: '1.2rem', fontSize: '1.15rem', width: '100%', borderRadius: '12px', opacity: isUploading ? 0.7 : 1, fontWeight: 700 }}
              >
                {isUploading ? '업로드 중...' : '클라우드에 등록하기 🚀'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
