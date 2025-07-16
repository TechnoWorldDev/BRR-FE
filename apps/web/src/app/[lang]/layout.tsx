import 'server-only'

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: { lang: string }
}) {
  return (
    <html lang={params.lang}>
      <body>{children}</body>
    </html>
  )
}

export async function generateStaticParams() {
  return [{ lang: 'en' }]
} 