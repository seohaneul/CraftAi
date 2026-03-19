'use client';

import { useState, useEffect } from 'react';

export default function ShopSettings() {
  const adminId = 'admin123';
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch(`http://localhost:8081/api/v1/settings/${adminId}`)
      .then(res => res.json())
      .then(data => {
        if(data && Object.keys(data).length > 0) {
          setShopName(data.shopName || '');
          setDescription(data.description || '');
          setContact(data.contact || '');
          setOperatingHours(data.operatingHours || '');
        }
      })
      .catch(e => console.error(e));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('저장 중...');
    try {
      const res = await fetch(`http://localhost:8081/api/v1/settings/${adminId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, description, contact, operatingHours })
      });
      if (res.ok) {
        setStatus('성공적으로 저장되었습니다! ✅');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('저장 실패 ❌');
      }
    } catch (err) {
      setStatus('오류가 발생했습니다.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.9rem', borderRadius: '8px', 
    border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', 
    color: 'white', marginTop: '0.5rem', outline: 'none'
  };

  return (
    <div style={{ maxWidth: '800px', paddingTop: '1rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>⚙️ 상점 설정</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>고객에게 보여질 스토어의 기본 정보를 관리하세요.</p>
      </header>

      <form onSubmit={handleSave} className="premium-glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        <div>
          <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>상점 이름</label>
          <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="예: CraftAI 스튜디오" style={inputStyle} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>소개글</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="상점을 매력적으로 소개해보세요!" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>연락처</label>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="010-XXXX-XXXX" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>운영 시간</label>
            <input type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} placeholder="평일 10:00 - 19:00" style={inputStyle} />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{status}</span>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
