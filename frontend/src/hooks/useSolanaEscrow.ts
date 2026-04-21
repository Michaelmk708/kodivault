import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

/**
 * Placeholder program ID for the KodiVault Anchor program (devnet).
 * Replace with the real deployed program ID when available.
 */
export const KODIVAULT_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr", // valid base58 placeholder (Memo program)
);

export interface EscrowAccounts {
  pda: string;
  bump: number;
}

export interface EscrowResult {
  signature: string;
  pda: string;
}

/**
 * useSolanaEscrow
 * Wraps Anchor-style instructions for KodiVault. Until the on-chain program is
 * deployed, instructions are simulated by sending a real Memo-program transaction
 * so wallets actually sign and a verifiable tx hash is returned.
 */
export function useSolanaEscrow() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();
  const [busy, setBusy] = useState(false);

  const derivePda = useCallback((leaseId: string): EscrowAccounts | null => {
    if (!publicKey) return null;
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), publicKey.toBuffer(), Buffer.from(leaseId)],
      KODIVAULT_PROGRAM_ID,
    );
    return { pda: pda.toBase58(), bump };
  }, [publicKey]);

  const sendMemoTx = useCallback(
    async (memo: string): Promise<string> => {
      if (!publicKey) throw new Error("Connect a wallet first");
      const ix = new TransactionInstruction({
        keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
        programId: KODIVAULT_PROGRAM_ID, // memo program
        data: Buffer.from(memo, "utf8"),
      });
      const tx = new Transaction().add(ix);
      tx.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      const sig = await sendTransaction(tx, connection);
      return sig;
    },
    [connection, publicKey, sendTransaction],
  );

  const initializeEscrow = useCallback(
    async (input: { leaseId: string; depositLamports?: number }): Promise<EscrowResult> => {
      if (!publicKey) throw new Error("Connect a wallet first");
      setBusy(true);
      try {
        const accounts = derivePda(input.leaseId);
        if (!accounts) throw new Error("Could not derive PDA");
        const sig = await sendMemoTx(`KodiVault:init:${input.leaseId}`);
        return { signature: sig, pda: accounts.pda };
      } finally {
        setBusy(false);
      }
    },
    [derivePda, publicKey, sendMemoTx],
  );

  const depositFunds = useCallback(
    async (input: { leaseId: string; lamports: number }): Promise<EscrowResult> => {
      if (!publicKey) throw new Error("Connect a wallet first");
      setBusy(true);
      try {
        const accounts = derivePda(input.leaseId);
        if (!accounts) throw new Error("Could not derive PDA");
        // Real lamport transfer to the derived PDA — works even without the program deployed.
        const ix = SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(accounts.pda),
          lamports: Math.max(1, Math.floor(input.lamports)),
        });
        const tx = new Transaction().add(ix);
        tx.feePayer = publicKey;
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        const sig = await sendTransaction(tx, connection);
        return { signature: sig, pda: accounts.pda };
      } finally {
        setBusy(false);
      }
    },
    [connection, derivePda, publicKey, sendTransaction],
  );

  const approveRelease = useCallback(
    async (input: { leaseId: string }): Promise<EscrowResult> => {
      if (!publicKey) throw new Error("Connect a wallet first");
      setBusy(true);
      try {
        const accounts = derivePda(input.leaseId);
        if (!accounts) throw new Error("Could not derive PDA");
        const sig = await sendMemoTx(`KodiVault:approve_release:${input.leaseId}`);
        return { signature: sig, pda: accounts.pda };
      } finally {
        setBusy(false);
      }
    },
    [derivePda, publicKey, sendMemoTx],
  );

  return {
    connected,
    publicKey: publicKey?.toBase58() ?? null,
    busy,
    derivePda,
    initializeEscrow,
    depositFunds,
    approveRelease,
  };
}
