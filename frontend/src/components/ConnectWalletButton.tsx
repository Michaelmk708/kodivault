import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

function shorten(addr?: string | null) {
  if (!addr) return "";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function ConnectWalletButton({ size = "default" }: { size?: "default" | "sm" }) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const [busy, setBusy] = useState(false);

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-md border bg-emerald-soft px-2.5 py-1 font-mono text-xs text-emerald">
          {shorten(publicKey.toBase58())}
        </span>
        <Button
          variant="outline"
          size={size === "sm" ? "sm" : "default"}
          onClick={async () => {
            setBusy(true);
            try {
              await disconnect();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setVisible(true)}
      disabled={connecting}
      size={size === "sm" ? "sm" : "default"}
      className="bg-emerald text-emerald-foreground hover:bg-emerald/90"
    >
      <Wallet className="mr-1.5 h-4 w-4" />
      {connecting ? "Connecting…" : "Connect wallet"}
    </Button>
  );
}
