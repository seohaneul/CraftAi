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
      const formData = new FormData();
      formData.append('leatherImage', myImage);
      formData.append('templateImageUrl', selectedTemplate.s3OriginalImageUrl);

      const res = await fetch(`http://localhost:8081/api/v1/orders/visualize`, {
        method: 'POST',
        body: formData
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
    <div className="customer-container" suppressHydrationWarning>
      <header className="customer-header" suppressHydrationWarning>
        <div suppressHydrationWarning>
            <h1 className="premium-text-gradient" suppressHydrationWarning>
                {username} 맞춤 디자인 쇼룸
            </h1>
            <p className="customer-subtitle" suppressHydrationWarning>
                찍어온 가죽 사진과 마음에 드는 디자인을 골라 합성 결과를 확인해보세요.
            </p>
        </div>
        <button onClick={() => window.location.href='/portal'} className="btn premium-glass text-primary-color" suppressHydrationWarning>이전으로</button>
      </header>

      <div className="customer-content-layout" suppressHydrationWarning>
        {/* 왼쪽 갤러리 (템플릿 선택) */}
        <section className="customer-gallery-section" suppressHydrationWarning>
          <h2 className="title-section" suppressHydrationWarning>1. 원하는 디자인 베이스(템플릿) 선택</h2>
          
          <div className="customer-gallery-grid" suppressHydrationWarning>
            {templates.map(t => {
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <div 
                  key={t.id} 
                  className={`premium-glass gallery-card customer-gallery-card ${isSelected ? 'selected' : ''}`} 
                  onClick={() => setSelectedTemplate(t)}
                  suppressHydrationWarning
                >
                  <div className="gallery-img-wrapper">
                    <img src={t.s3OriginalImageUrl} alt={t.templateName} />
                  </div>
                  <div className="card-footer text-center p-4">
                    <strong className="title-sm">{t.templateName}</strong>
                    {isSelected && <span className="text-accent-color mt-4 block text-sm">선택됨 ✔️</span>}
                  </div>
                </div>
              );
            })}
            {templates.length === 0 && <p className="text-secondary-color text-center p-8">스토어에 등록된 샘플 템플릿이 없습니다.</p>}
          </div>
        </section>

        {/* 오른쪽 사용자 가죽 업로드 및 결과물 확인 */}
        <section className="customer-upload-section" suppressHydrationWarning>
          <div className="premium-glass customer-card-padding" suppressHydrationWarning>
            <h2 className="title-section mb-8" suppressHydrationWarning>📸 내 가죽과 아이템 매칭하기</h2>
            
            <form onSubmit={handleAiProcessing} className="customer-form" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="customer-label" suppressHydrationWarning>
                  2. 직접 촬영한 가죽이나 스와치(질감) 사진 올리기
                </label>
                <div 
                  className={`customer-upload-box ${previewImage ? 'border-accent' : 'border-dashed'}`} 
                  suppressHydrationWarning
                >
                  {previewImage ? (
                    <img src={previewImage} alt="미리보기" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-secondary-color text-center p-8" suppressHydrationWarning>
                      <span className="text-5xl block mb-2">📤</span>
                      <p className="m-0">클릭하여 소재 사진 첨부</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {selectedTemplate ? (
                <div className="customer-selection-info active" suppressHydrationWarning>
                  현재 선택된 템플릿: <strong className="text-bold">{selectedTemplate.templateName}</strong>
                </div>
              ) : (
                <div className="customer-selection-info empty" suppressHydrationWarning>
                  좌측에서 원하시는 디자인 템플릿을 먼저 클릭해주세요.
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary customer-submit-btn" 
                disabled={!selectedTemplate || !myImage}
                style={{ opacity: (!selectedTemplate || !myImage) ? 0.5 : 1 }}
                suppressHydrationWarning
              >
                ✨ AI 디자인 렌더링 시작
              </button>
            </form>

            {status && <p className="mt-4 text-accent-color text-bold" suppressHydrationWarning>{status}</p>}

            {resultImg && (
              <div className="customer-result-area" suppressHydrationWarning>
                <h3 className="title-sm mb-4 text-primary-color" suppressHydrationWarning>결과물 프리뷰</h3>
                <img src={resultImg} alt="AI 합성 결과" className="w-full rounded-xl border-accent shadow-glow" suppressHydrationWarning />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );

}
