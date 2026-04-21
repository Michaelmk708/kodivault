use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("DFkESxidGPfLqh5eD67ek2Z4AiZGoPYfzYbDnMN929ut");

#[program]
pub mod kodivault {
    use super::*;

    /// Initialize a new escrow vault for a lease agreement
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        lease_id: String,
        amount: u64,
        tenant_pubkey: Pubkey,
        landlord_pubkey: Pubkey,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        escrow.lease_id = lease_id.clone();
        escrow.amount = amount;
        escrow.tenant = tenant_pubkey;
        escrow.landlord = landlord_pubkey;
        escrow.tenant_approved = false;
        escrow.landlord_approved = false;
        escrow.status = EscrowStatus::Initialized;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.bump = ctx.bumps.escrow;

        msg!("Escrow initialized for lease: {}", lease_id);
        Ok(())
    }

    /// Tenant deposits funds into the escrow vault
    pub fn deposit_funds(ctx: Context<DepositFunds>, amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Initialized,
            EscrowError::InvalidEscrowStatus
        );
        
        require!(
            ctx.accounts.tenant.key() == escrow.tenant,
            EscrowError::UnauthorizedTenant
        );
        
        require!(
            amount == escrow.amount,
            EscrowError::IncorrectDepositAmount
        );

        // Transfer SOL from tenant to escrow vault
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.tenant.key(),
            &ctx.accounts.vault.key(),
            amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.tenant.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        escrow.status = EscrowStatus::Locked;
        escrow.locked_at = Clock::get()?.unix_timestamp;

        msg!("Funds deposited and locked: {} lamports", amount);
        Ok(())
    }

    /// Tenant approves fund release
    pub fn tenant_approve_release(ctx: Context<ApproveRelease>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Locked,
            EscrowError::InvalidEscrowStatus
        );
        
        require!(
            ctx.accounts.signer.key() == escrow.tenant,
            EscrowError::UnauthorizedTenant
        );

        escrow.tenant_approved = true;
        
        msg!("Tenant approved fund release");
        
        // If both parties approved, release funds
        if escrow.landlord_approved {
            escrow.status = EscrowStatus::ReadyForRelease;
            msg!("Both parties approved - ready for release");
        }
        
        Ok(())
    }

    /// Landlord approves fund release
    pub fn landlord_approve_release(ctx: Context<ApproveRelease>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Locked,
            EscrowError::InvalidEscrowStatus
        );
        
        require!(
            ctx.accounts.signer.key() == escrow.landlord,
            EscrowError::UnauthorizedLandlord
        );

        escrow.landlord_approved = true;
        
        msg!("Landlord approved fund release");
        
        // If both parties approved, release funds
        if escrow.tenant_approved {
            escrow.status = EscrowStatus::ReadyForRelease;
            msg!("Both parties approved - ready for release");
        }
        
        Ok(())
    }

    /// Release funds to tenant (requires both approvals)
    pub fn release_funds_to_tenant(ctx: Context<ReleaseFunds>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::ReadyForRelease,
            EscrowError::NotReadyForRelease
        );
        
        require!(
            escrow.tenant_approved && escrow.landlord_approved,
            EscrowError::MissingApprovals
        );

        let amount = escrow.amount;
        
        // Transfer SOL from vault to tenant
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.tenant.to_account_info().try_borrow_mut_lamports()? += amount;

        escrow.status = EscrowStatus::Released;
        escrow.released_at = Clock::get()?.unix_timestamp;

        msg!("Funds released to tenant: {} lamports", amount);
        Ok(())
    }

    /// Release funds with deduction (for damages)
    pub fn release_with_deduction(
        ctx: Context<ReleaseFunds>,
        deduction_amount: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::ReadyForRelease,
            EscrowError::NotReadyForRelease
        );
        
        require!(
            escrow.tenant_approved && escrow.landlord_approved,
            EscrowError::MissingApprovals
        );
        
        require!(
            deduction_amount <= escrow.amount,
            EscrowError::InvalidDeductionAmount
        );

        let tenant_amount = escrow.amount - deduction_amount;
        
        // Transfer to tenant
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= tenant_amount;
        **ctx.accounts.tenant.to_account_info().try_borrow_mut_lamports()? += tenant_amount;
        
        // Transfer deduction to landlord
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= deduction_amount;
        **ctx.accounts.landlord.to_account_info().try_borrow_mut_lamports()? += deduction_amount;

        escrow.status = EscrowStatus::Released;
        escrow.released_at = Clock::get()?.unix_timestamp;

        msg!("Funds released - Tenant: {}, Landlord: {}", tenant_amount, deduction_amount);
        Ok(())
    }

    /// Initiate dispute resolution
    pub fn initiate_dispute(ctx: Context<InitiateDispute>, reason: String) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Locked,
            EscrowError::InvalidEscrowStatus
        );
        
        // Either party can initiate dispute
        require!(
            ctx.accounts.signer.key() == escrow.tenant || 
            ctx.accounts.signer.key() == escrow.landlord,
            EscrowError::UnauthorizedParty
        );

        escrow.status = EscrowStatus::Disputed;
        escrow.dispute_reason = Some(reason.clone());
        escrow.disputed_at = Some(Clock::get()?.unix_timestamp);

        msg!("Dispute initiated: {}", reason);
        Ok(())
    }

    /// Resolve dispute (admin only)
    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        tenant_share: u64,
        landlord_share: u64,
    ) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Disputed,
            EscrowError::InvalidEscrowStatus
        );
        
        require!(
            tenant_share + landlord_share == escrow.amount,
            EscrowError::InvalidSplitAmount
        );

        // Transfer to tenant
        if tenant_share > 0 {
            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= tenant_share;
            **ctx.accounts.tenant.to_account_info().try_borrow_mut_lamports()? += tenant_share;
        }
        
        // Transfer to landlord
        if landlord_share > 0 {
            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= landlord_share;
            **ctx.accounts.landlord.to_account_info().try_borrow_mut_lamports()? += landlord_share;
        }

        escrow.status = EscrowStatus::Released;
        escrow.released_at = Clock::get()?.unix_timestamp;

        msg!("Dispute resolved - Tenant: {}, Landlord: {}", tenant_share, landlord_share);
        Ok(())
    }

    /// Cancel escrow before deposit (initialization phase only)
    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        
        require!(
            escrow.status == EscrowStatus::Initialized,
            EscrowError::CannotCancelAfterDeposit
        );
        
        require!(
            ctx.accounts.signer.key() == escrow.tenant || 
            ctx.accounts.signer.key() == escrow.landlord,
            EscrowError::UnauthorizedParty
        );

        escrow.status = EscrowStatus::Cancelled;

        msg!("Escrow cancelled");
        Ok(())
    }
}

// Account Structures

#[derive(Accounts)]
#[instruction(lease_id: String)]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = initializer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", lease_id.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Vault to hold escrow funds
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub initializer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Vault to receive funds
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub tenant: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveRelease<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Vault holding funds
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    /// CHECK: Tenant receiving funds
    #[account(mut)]
    pub tenant: AccountInfo<'info>,
    
    /// CHECK: Landlord (for deductions)
    #[account(mut)]
    pub landlord: AccountInfo<'info>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct InitiateDispute<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    /// CHECK: Vault holding funds
    #[account(
        mut,
        seeds = [b"vault", escrow.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    /// CHECK: Tenant
    #[account(mut)]
    pub tenant: AccountInfo<'info>,
    
    /// CHECK: Landlord
    #[account(mut)]
    pub landlord: AccountInfo<'info>,
    
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub escrow: Account<'info, Escrow>,
    
    pub signer: Signer<'info>,
}

// Data Structures

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    #[max_len(50)]
    pub lease_id: String,
    pub amount: u64,
    pub tenant: Pubkey,
    pub landlord: Pubkey,
    pub tenant_approved: bool,
    pub landlord_approved: bool,
    pub status: EscrowStatus,
    pub created_at: i64,
    pub locked_at: i64,
    pub released_at: i64,
    pub disputed_at: Option<i64>,
    #[max_len(500)]
    pub dispute_reason: Option<String>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowStatus {
    Initialized,
    Locked,
    ReadyForRelease,
    Released,
    Disputed,
    Cancelled,
}

// Errors

#[error_code]
pub enum EscrowError {
    #[msg("Invalid escrow status for this operation")]
    InvalidEscrowStatus,
    
    #[msg("Unauthorized tenant")]
    UnauthorizedTenant,
    
    #[msg("Unauthorized landlord")]
    UnauthorizedLandlord,
    
    #[msg("Unauthorized party")]
    UnauthorizedParty,
    
    #[msg("Incorrect deposit amount")]
    IncorrectDepositAmount,
    
    #[msg("Not ready for release - missing approvals")]
    NotReadyForRelease,
    
    #[msg("Both parties must approve before release")]
    MissingApprovals,
    
    #[msg("Invalid deduction amount")]
    InvalidDeductionAmount,
    
    #[msg("Invalid split amount - must equal total")]
    InvalidSplitAmount,
    
    #[msg("Cannot cancel escrow after deposit")]
    CannotCancelAfterDeposit,
}
