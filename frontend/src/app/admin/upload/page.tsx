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
    <div className="w-full mt-4" suppressHydrationWarning>
      <header className="mb-8" suppressHydrationWarning>
        <h2 className="premium-text-gradient title-lg" suppressHydrationWarning>
          디자인 템플릿 등록
        </h2>
        <p className="description-text" suppressHydrationWarning>
          고객이 상상 속 가죽 소품을 그려볼 수 있도록, 기본 뼈대가 될 사진을 올려주세요.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="premium-glass p-10 flex-column gap-6" suppressHydrationWarning>
        
        <div className="flex-row gap-8 align-stretch" suppressHydrationWarning>
          {/* 왼쪽: 이미지 미리보기 및 업로드 (Drag & Drop 느낌 스타일링) */}
          <div className="flex-1-2" suppressHydrationWarning>
            <label className="text-bold text-primary-color block mb-4 title-sm" suppressHydrationWarning>1. 사진 찾기</label>
            <div 
              className={`customer-upload-box ${preview ? 'border-accent' : 'border-dashed'}`}
              suppressHydrationWarning
            >
              {preview ? (
                <img src={preview} alt="미리보기" className="w-full h-full object-cover rounded-xl" suppressHydrationWarning />
              ) : (
                <div className="text-secondary-color text-center p-8" suppressHydrationWarning>
                  <span className="text-5xl block mb-4" suppressHydrationWarning>📥</span>
                  <p className="text-bold mb-4" suppressHydrationWarning>여기를 클릭하여 사진을 올리세요</p>
                  <span className="btn premium-glass-btn" suppressHydrationWarning>컴퓨터에서 찾기</span>
                </div>
              )}
              {/* 투명한 Input이 위를 전부 덮고 있어서 어디를 클릭해도 업로드 동작 */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                required 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                suppressHydrationWarning
              />
            </div>
            {preview && <p className="text-center mt-4 text-secondary-color text-xs" suppressHydrationWarning>사진을 다시 고르려면 이곳을 다시 클릭하세요.</p>}
          </div>

          {/* 오른쪽: 입력 폼 및 확정 버튼 */}
          <div className="flex-1 flex-column gap-8" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="text-bold text-primary-color block mb-4 title-sm" suppressHydrationWarning>2. 템플릿 이름</label>
              <input 
                type="text" 
                value={templateName} 
                onChange={(e) => setTemplateName(e.target.value)} 
                required 
                placeholder="예: 블랙 사피아노 토트백"
                className="login-input w-full p-4 text-lg"
                suppressHydrationWarning
              />
            </div>

            <div className="mt-auto flex-column gap-4" suppressHydrationWarning>
              {status && (
                <p className={`text-bold text-sm ${status.includes('성공') ? 'text-green-color' : 'text-accent-color'}`} suppressHydrationWarning>
                  {status}
                </p>
              )}
              <button 
                type="submit" 
                className="btn btn-primary w-full p-4 text-lg text-bold" 
                disabled={isUploading}
                style={{ opacity: isUploading ? 0.7 : 1 }}
                suppressHydrationWarning
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
