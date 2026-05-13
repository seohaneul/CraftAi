import './globals.css';

export const metadata = {
  title: 'AiTelier',
  description: 'AI 소품 커스텀 디자인 시각화 플랫폼 AiTelier',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
