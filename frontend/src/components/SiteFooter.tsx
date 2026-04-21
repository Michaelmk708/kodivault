export function SiteFooter() {
  return (
    <footer className="border-t bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} KodiVault. Decentralized rent deposit escrow.</span>
        <span className="text-xs">Solana devnet · v0.1</span>
      </div>
    </footer>
  );
}
