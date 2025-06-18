use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod bounty_program {
    use super::*;

    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        amount: u64,
        expires_at: i64,
    ) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty;
        let user = &ctx.accounts.user;
        let clock = Clock::get()?;

        // Check if bounty has expired
        if expires_at > 0 && clock.unix_timestamp > expires_at {
            return err!(BountyError::BountyExpired);
        }

        // Transfer tokens from user to bounty account
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.bounty_token_account.to_account_info(),
                authority: user.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, amount)?;

        // Initialize bounty account
        bounty.authority = user.key();
        bounty.amount = amount;
        bounty.expires_at = expires_at;
        bounty.status = BountyStatus::Active;
        bounty.bump = *ctx.bumps.get("bounty").unwrap();

        Ok(())
    }

    pub fn claim_bounty(ctx: Context<ClaimBounty>) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty;
        let winner = &ctx.accounts.winner;
        let clock = Clock::get()?;

        // Check if bounty is active
        require!(bounty.status == BountyStatus::Active, BountyError::BountyNotActive);

        // Check if bounty has expired
        if bounty.expires_at > 0 && clock.unix_timestamp > bounty.expires_at {
            bounty.status = BountyStatus::Expired;
            return err!(BountyError::BountyExpired);
        }

        // Transfer tokens from bounty account to winner
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bounty_token_account.to_account_info(),
                to: ctx.accounts.winner_token_account.to_account_info(),
                authority: ctx.accounts.bounty.to_account_info(),
            },
        );

        let seeds = &[
            b"bounty".as_ref(),
            &[bounty.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(transfer_ctx.with_signer(signer), bounty.amount)?;

        // Update bounty status
        bounty.status = BountyStatus::Claimed;
        bounty.winner = Some(winner.key());

        Ok(())
    }

    pub fn refund_bounty(ctx: Context<RefundBounty>) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty;
        let clock = Clock::get()?;

        // Only the bounty creator can refund
        require!(bounty.authority == ctx.accounts.authority.key(), BountyError::Unauthorized);

        // Check if bounty is active and expired
        require!(bounty.status == BountyStatus::Active, BountyError::BountyNotActive);
        require!(bounty.expires_at > 0 && clock.unix_timestamp > bounty.expires_at, BountyError::BountyNotExpired);

        // Transfer tokens back to creator
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bounty_token_account.to_account_info(),
                to: ctx.accounts.authority_token_account.to_account_info(),
                authority: ctx.accounts.bounty.to_account_info(),
            },
        );

        let seeds = &[
            b"bounty".as_ref(),
            &[bounty.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(transfer_ctx.with_signer(signer), bounty.amount)?;

        // Update bounty status
        bounty.status = BountyStatus::Refunded;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBounty<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Bounty::LEN,
        seeds = [b"bounty", user.key().as_ref()],
        bump
    )]
    pub bounty: Account<'info, Bounty>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = user,
        token::mint = mint,
        token::authority = bounty,
    )]
    pub bounty_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, token::Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimBounty<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    
    #[account(mut)]
    pub winner: Signer<'info>,
    
    #[account(mut)]
    pub bounty_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub winner_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundBounty<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub bounty_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Bounty {
    pub authority: Pubkey,
    pub amount: u64,
    pub expires_at: i64,
    pub status: BountyStatus,
    pub winner: Option<Pubkey>,
    pub bump: u8,
}

impl Bounty {
    pub const LEN: usize = 32 + 8 + 8 + 1 + 33 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyStatus {
    Active,
    Claimed,
    Refunded,
    Expired,
}

#[error_code]
pub enum BountyError {
    #[msg("Bounty has expired")]
    BountyExpired,
    #[msg("Bounty is not active")]
    BountyNotActive,
    #[msg("Bounty is not expired")]
    BountyNotExpired,
    #[msg("Unauthorized")]
    Unauthorized,
} 