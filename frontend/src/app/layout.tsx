import './globals.css';

export const metadata = {
  title: 'CraftAI | 프리미엄 가죽 공방 AI 렌더링',
  description: 'AI 가죽 소품 커스텀 디자인 주문제작 기능 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
