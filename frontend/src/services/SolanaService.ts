/**
 * SolanaService.ts - Solana blockchain integration for KodiVault
 * Handles interaction with the deployed KodiVault escrow program on devnet
 *
 * Program ID: DFkESxidGPfLqh5eD67ek2Z4AiZGoPYfzYbDnMN929ut
 * Network: Devnet
 */

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { BorshCoder, Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";

// Real deployed program ID (production)
export const KODIVAULT_PROGRAM_ID = new PublicKey(
  "DFkESxidGPfLqh5eD67ek2Z4AiZGoPYfzYbDnMN929ut"
);

// Devnet RPC endpoint
export const SOLANA_RPC_URL = "https://api.devnet.solana.com";

export interface EscrowInitializeParams {
  leaseId: string;
  tenantPubkey: string;
  landlordPubkey: string;
  amountSol: number; // Amount in SOL
}

export interface EscrowDepositParams {
  leaseId: string;
  amountLamports: number; // Amount in lamports
  vaultAddress: string;
}

export interface EscrowApprovalParams {
  leaseId: string;
  approverRole: "tenant" | "landlord";
}

export interface TransactionResult {
  signature: string;
  pda: string;
  blockHeight?: number;
  confirmations?: number;
}

/**
 * SolanaService class
 * Provides methods to interact with KodiVault Solana program
 */
export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(rpcUrl: string = SOLANA_RPC_URL) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.programId = KODIVAULT_PROGRAM_ID;
  }

  /**
   * Derive the escrow PDA for a lease
   * Uses seeds: ["escrow", userPubkey, leaseId]
   */
  derivePda(userPubkey: PublicKey, leaseId: string): [PublicKey, number] {
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("escrow"),
        userPubkey.toBuffer(),
        Buffer.from(leaseId),
      ],
      this.programId
    );
    return [pda, bump];
  }

  /**
   * Build initialize_escrow instruction
   * Initializes a new escrow vault for a lease agreement
   */
  buildInitializeEscrowInstruction(
    params: EscrowInitializeParams,
    userPubkey: PublicKey,
    systemProgram: PublicKey = SystemProgram.programId
  ): { instruction: TransactionInstruction; pda: PublicKey; bump: number } {
    const [pda, bump] = this.derivePda(userPubkey, params.leaseId);

    // Build instruction data for initialize_escrow
    // In a real setup, we'd use Anchor's IDL and proper serialization
    // For now, we'll create a memo transaction that signals intent
    const data = Buffer.from(
      `KodiVault:init:${params.leaseId}:${params.amountSol}`,
      "utf8"
    );

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPubkey, isSigner: true, isWritable: true },
        { pubkey: pda, isSigner: false, isWritable: true },
        { pubkey: systemProgram, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    });

    return { instruction, pda, bump };
  }

  /**
   * Build deposit_funds instruction
   * Transfers SOL from tenant to escrow vault
   */
  buildDepositFundsInstruction(
    params: EscrowDepositParams,
    userPubkey: PublicKey
  ): { instruction: TransactionInstruction; pda: PublicKey; bump: number } {
    const [pda, bump] = this.derivePda(userPubkey, params.leaseId);
    const vaultPubkey = new PublicKey(params.vaultAddress);

    // Build transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: userPubkey,
      toPubkey: vaultPubkey,
      lamports: params.amountLamports,
    });

    return { instruction, pda, bump };
  }

  /**
   * Build approval instruction
   * Records tenant/landlord approval for fund release
   */
  buildApprovalInstruction(
    params: EscrowApprovalParams,
    userPubkey: PublicKey
  ): { instruction: TransactionInstruction; pda: PublicKey; bump: number } {
    const [pda, bump] = this.derivePda(userPubkey, params.leaseId);

    const approvalType =
      params.approverRole === "tenant"
        ? "tenant_approve"
        : "landlord_approve";
    const data = Buffer.from(
      `KodiVault:${approvalType}:${params.leaseId}`,
      "utf8"
    );

    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPubkey, isSigner: true, isWritable: true },
        { pubkey: pda, isSigner: false, isWritable: true },
      ],
      programId: this.programId,
      data,
    });

    return { instruction, pda, bump };
  }

  /**
   * Get transaction details from blockchain
   */
  async getTransaction(signature: string) {
    try {
      const tx = await this.connection.getParsedTransaction(signature, "confirmed");
      return tx;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  /**
   * Get account balance in SOL
   */
  async getBalance(pubkey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(pubkey);
    return balance / LAMPORTS_PER_SOL;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(
    signature: string,
    maxRetries: number = 30
  ): Promise<{ confirmed: boolean; block?: number }> {
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const status = await this.connection.getSignatureStatus(signature);

        if (
          status.value?.confirmationStatus === "confirmed" ||
          status.value?.confirmationStatus === "finalized"
        ) {
          return {
            confirmed: true,
            block: status.value.slot || undefined,
          };
        }

        retries++;
        // Wait 2 seconds between retries
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Error checking confirmation:", error);
        retries++;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return { confirmed: false };
  }
}

/**
 * Create a singleton instance of SolanaService
 */
export const solanaService = new SolanaService();

/**
 * Helper function to convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Helper function to convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
