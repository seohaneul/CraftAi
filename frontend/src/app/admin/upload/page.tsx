'use client';

import { useState } from 'react';

export default function UploadTemplatePage() {
    const [adminId, setAdminId] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [status, setStatus] = useState<string>('');
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            setStatus('이미지를 선택해주세요.');
            return;
        }

        setStatus('업로드 중...');
        const formData = new FormData();
        formData.append('adminId', adminId);
        formData.append('templateName', templateName);
        formData.append('image', image);

        try {
            const res = await fetch('http://localhost:8080/api/v1/templates/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setStatus('업로드 성공!');
                setResultUrl(data.s3OriginalImageUrl); // 백엔드에서 반환된 URL 매핑
            } else {
                setStatus('업로드 실패: ' + res.statusText);
            }
        } catch (error: any) {
            setStatus('오류 발생: ' + error.message);
        }
    };

    return (
        <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h2>관리자: 템플릿 업로드 테스트 (S3 & DB)</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div>
                    <label>사장님 ID:</label>
                    <input
                        type="text"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        required
                        style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                        placeholder="admin123"
                    />
                </div>
                <div>
                    <label>템플릿 이름:</label>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        required
                        style={{ display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                        placeholder="기본 가죽 지갑"
                    />
                </div>
                <div>
                    <label>이미지 파일:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                        required
                        style={{ display: 'block', marginTop: '0.5rem' }}
                    />
                </div>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                    업로드
                </button>
            </form>

            {status && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>}

            {resultUrl && (
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                    <h4>저장된 S3 URL:</h4>
                    <a href={resultUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', wordBreak: 'break-all' }}>
                        {resultUrl}
                    </a>
                    <div style={{ marginTop: '1rem' }}>
                        <img src={resultUrl} alt="Uploaded Result" style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                </div>
            )}
        </main>
    );
}
