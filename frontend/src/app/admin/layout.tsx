import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout" suppressHydrationWarning>
      <aside className="premium-glass admin-sidebar" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h1 className="premium-text-gradient" suppressHydrationWarning style={{ fontSize: '1.5rem' }}>CraftAI</h1>
          <p className="text-secondary-color text-sm" suppressHydrationWarning>사장님 관리자 패널</p>
        </div>
        <nav className="flex-column gap-2" suppressHydrationWarning>
          <Link href="/admin" className="admin-nav-link" suppressHydrationWarning>
            🖼️ 갤러리 대시보드
          </Link>
          <Link href="/admin/upload" className="admin-nav-link" suppressHydrationWarning>
            ⬆️ 템플릿 업로드
          </Link>
        </nav>
      </aside>

      <main className="admin-main" suppressHydrationWarning>
        {children}
      </main>
    </div>
  );
}
