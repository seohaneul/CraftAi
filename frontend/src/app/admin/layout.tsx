import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <aside className="premium-glass" style={{ width: '280px', margin: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CraftAI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>사장님 관리자 패널</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={{ padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-primary)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', transition: '0.2s' }}>
            🖼️ 갤러리 대시보드
          </Link>
          <Link href="/admin/upload" style={{ padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-primary)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', transition: '0.2s' }}>
            ⬆️ 템플릿 업로드
          </Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '20px 40px', overflowY: 'auto', height: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
