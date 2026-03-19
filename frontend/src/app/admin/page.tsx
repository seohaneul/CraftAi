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
  const adminId = 'admin123'; // 테스트용 목업 ID

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`http://localhost:8081/api/v1/templates/${adminId}`);
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
    <div className="dashboard" style={{ paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>갤러리 대시보드</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>업로드한 디자인 템플릿을 한 눈에 관리하세요.</p>
      </header>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>보유 중인 템플릿</h3>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem' }}>
            총 {templates.length}건
          </span>
        </div>
        
        {templates.length === 0 ? (
          <div className="premium-glass" style={{ padding: '4rem', textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)' }}>
            아직 업로드된 템플릿이 없습니다. 좌측 메뉴에서 템플릿을 추가해주세요!
          </div>
        ) : (
          <div className="gallery-grid">
            {templates.map(temp => (
              <div key={temp.id} className="premium-glass gallery-card">
                <div className="gallery-img-wrapper">
                  <img src={temp.s3OriginalImageUrl} alt={temp.templateName} />
                </div>
                <div style={{ padding: '1.2rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{temp.templateName}</h4>
                  <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    등록일: {new Date(temp.registrationDate).toLocaleDateString()}
                  </p>
                  <button onClick={() => deleteTemplate(temp.id)} className="btn btn-danger" style={{ width: '100%', padding: '0.7rem' }}>
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
