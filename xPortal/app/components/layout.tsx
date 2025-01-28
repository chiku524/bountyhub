export function Layout({ children, backgroundColor }: { children: React.ReactNode, backgroundColor?: string }) {
    return (
      <div className={`h-screen w-full ${backgroundColor} font-mono`}>
        {children}
      </div>
    );
  }
  