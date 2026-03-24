'use client';

import { useState, useEffect } from 'react';

// Types
interface Template {
  id: number;
  templateName: string;
  s3OriginalImageUrl: string;
  registrationDate: string;
}

export default function AdminDashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [adminId, setAdminId] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('username');
    if(user) {
      setAdminId(user);
      fetchTemplates(user);
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchTemplates = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/templates/${userId}`);
      if (res.ok) {
        setTemplates(await res.json());
      }
    } catch (e) {
      console.error("템플릿 로드 실패", e);
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://localhost:8081/api/v1/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(templates.filter(t => t.id !== id));
      }
    } catch (e) {
      console.error("삭제 실패", e);
    }
  };

  return (
    <div className="dashboard mb-8" suppressHydrationWarning>
      <header className="mb-8 mt-4" suppressHydrationWarning>
        <h2 className="title-lg" suppressHydrationWarning>갤러리 대시보드</h2>
        <p className="description-text" suppressHydrationWarning>업로드한 디자인 템플릿을 한 눈에 관리하세요.</p>
      </header>

      <section suppressHydrationWarning>
        <div className="flex-row justify-between align-center border-bottom pb-2 mb-4" suppressHydrationWarning>
          <h3 className="title-sm" suppressHydrationWarning>보유 중인 템플릿</h3>
          <span className="premium-glass p-2 rounded-full text-xs" suppressHydrationWarning>
            총 {templates.length}건
          </span>
        </div>
        
        {templates.length === 0 ? (
          <div className="premium-glass p-10 text-center mt-8 text-secondary-color" suppressHydrationWarning>
            아직 업로드된 템플릿이 없습니다. 좌측 메뉴에서 템플릿을 추가해주세요!
          </div>
        ) : (
          <div className="gallery-grid" suppressHydrationWarning>
            {templates.map(temp => (
              <div key={temp.id} className="premium-glass gallery-card" suppressHydrationWarning>
                <div className="gallery-img-wrapper" suppressHydrationWarning>
                  <img src={temp.s3OriginalImageUrl} alt={temp.templateName} suppressHydrationWarning />
                </div>
                <div className="p-4" suppressHydrationWarning>
                  <h4 className="title-sm mb-2" suppressHydrationWarning>{temp.templateName}</h4>
                  <p className="text-secondary-color text-xs mb-4" suppressHydrationWarning>
                    등록일: {new Date(temp.registrationDate).toLocaleDateString()}
                  </p>
                  <button onClick={() => deleteTemplate(temp.id)} className="btn btn-danger w-full p-2" suppressHydrationWarning>
                    삭제하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
