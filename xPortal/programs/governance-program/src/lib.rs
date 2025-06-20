use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("GovPool111111111111111111111111111111111111");

#[program]
pub mod governance_program {
    use super::*;

    /// Initialize the governance pool
    pub fn initialize_governance_pool(
        ctx: Context<InitializeGovernancePool>,
        governance_fee_rate: u64, // Fee rate in basis points (500 = 5%)
    ) -> Result<()> {
        let governance_pool = &mut ctx.accounts.governance_pool;
        
        governance_pool.authority = ctx.accounts.authority.key();
        governance_pool.governance_fee_rate = governance_fee_rate;
        governance_pool.total_fees_collected = 0;
        governance_pool.total_rewards_distributed = 0;
        governance_pool.bump = *ctx.bumps.get("governance_pool").unwrap();
        
        msg!("Governance pool initialized with fee rate: {} basis points", governance_fee_rate);
        Ok(())
    }

    /// Collect governance fee from bounty creation
    pub fn collect_governance_fee(
        ctx: Context<CollectGovernanceFee>,
        bounty_amount: u64,
    ) -> Result<()> {
        let governance_pool = &mut ctx.accounts.governance_pool;
        let bounty_creator = &ctx.accounts.bounty_creator;
        
        // Calculate governance fee (5% of bounty amount)
        let governance_fee = (bounty_amount * governance_pool.governance_fee_rate) / 10000;
        
        require!(governance_fee > 0, GovernanceError::InvalidFeeAmount);
        
        // Transfer fee from bounty creator to governance pool
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.bounty_creator_token_account.to_account_info(),
                to: ctx.accounts.governance_pool_token_account.to_account_info(),
                authority: bounty_creator.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, governance_fee)?;
        
        // Update governance pool stats
        governance_pool.total_fees_collected += governance_fee;
        
        msg!("Collected {} tokens as governance fee", governance_fee);
        Ok(())
    }

    /// Create a governance proposal
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: ProposalType,
        amount: Option<u64>,
        recipient: Option<Pubkey>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let governance_pool = &ctx.accounts.governance_pool;
        
        require!(title.len() <= 100, GovernanceError::TitleTooLong);
        require!(description.len() <= 1000, GovernanceError::DescriptionTooLong);
        
        proposal.authority = ctx.accounts.authority.key();
        proposal.governance_pool = governance_pool.key();
        proposal.title = title;
        proposal.description = description;
        proposal.proposal_type = proposal_type;
        proposal.amount = amount;
        proposal.recipient = recipient;
        proposal.status = ProposalStatus::Active;
        proposal.yes_votes = 0;
        proposal.no_votes = 0;
        proposal.total_votes = 0;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.expires_at = Clock::get()?.unix_timestamp + 7 * 24 * 60 * 60; // 7 days
        proposal.bump = *ctx.bumps.get("proposal").unwrap();
        
        msg!("Proposal created: {}", proposal.title);
        Ok(())
    }

    /// Vote on a governance proposal
    pub fn vote_on_proposal(
        ctx: Context<VoteOnProposal>,
        vote: bool,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let voter = &ctx.accounts.voter;
        let clock = Clock::get()?;
        
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);
        require!(clock.unix_timestamp < proposal.expires_at, GovernanceError::ProposalExpired);
        require!(proposal.authority != voter.key(), GovernanceError::CannotVoteOnOwnProposal);
        
        // Check if voter already voted
        let vote_record = &mut ctx.accounts.vote_record;
        require!(vote_record.voter == Pubkey::default(), GovernanceError::AlreadyVoted);
        
        // Record the vote
        vote_record.proposal = proposal.key();
        vote_record.voter = voter.key();
        vote_record.vote = vote;
        vote_record.voted_at = clock.unix_timestamp;
        vote_record.bump = *ctx.bumps.get("vote_record").unwrap();
        
        // Update proposal vote counts
        if vote {
            proposal.yes_votes += 1;
        } else {
            proposal.no_votes += 1;
        }
        proposal.total_votes += 1;
        
        msg!("Vote recorded: {}", if vote { "YES" } else { "NO" });
        Ok(())
    }

    /// Execute a governance proposal
    pub fn execute_proposal(
        ctx: Context<ExecuteProposal>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let governance_pool = &mut ctx.accounts.governance_pool;
        let clock = Clock::get()?;
        
        require!(proposal.status == ProposalStatus::Active, GovernanceError::ProposalNotActive);
        require!(clock.unix_timestamp >= proposal.expires_at, GovernanceError::ProposalNotExpired);
        require!(proposal.total_votes >= 3, GovernanceError::InsufficientVotes);
        
        // Calculate approval percentage
        let approval_percentage = (proposal.yes_votes * 100) / proposal.total_votes;
        let is_approved = approval_percentage >= 60; // 60% threshold
        
        if is_approved {
            proposal.status = ProposalStatus::Approved;
            
            // Execute the proposal based on type
            match proposal.proposal_type {
                ProposalType::RewardDistribution => {
                    if let (Some(amount), Some(recipient)) = (proposal.amount, proposal.recipient) {
                        // Transfer tokens to recipient
                        let transfer_ctx = CpiContext::new(
                            ctx.accounts.token_program.to_account_info(),
                            Transfer {
                                from: ctx.accounts.governance_pool_token_account.to_account_info(),
                                to: ctx.accounts.recipient_token_account.to_account_info(),
                                authority: ctx.accounts.governance_pool.to_account_info(),
                            },
                        );

                        let seeds = &[
                            b"governance_pool".as_ref(),
                            &[governance_pool.bump],
                        ];
                        let signer = &[&seeds[..]];

                        token::transfer(transfer_ctx.with_signer(signer), amount)?;
                        
                        governance_pool.total_rewards_distributed += amount;
                        msg!("Proposal executed: {} tokens distributed to {}", amount, recipient);
                    }
                },
                ProposalType::FeeRateChange => {
                    if let Some(new_rate) = proposal.amount {
                        governance_pool.governance_fee_rate = new_rate;
                        msg!("Proposal executed: Fee rate changed to {} basis points", new_rate);
                    }
                },
                ProposalType::EmergencyWithdraw => {
                    if let (Some(amount), Some(recipient)) = (proposal.amount, proposal.recipient) {
                        // Emergency withdrawal
                        let transfer_ctx = CpiContext::new(
                            ctx.accounts.token_program.to_account_info(),
                            Transfer {
                                from: ctx.accounts.governance_pool_token_account.to_account_info(),
                                to: ctx.accounts.recipient_token_account.to_account_info(),
                                authority: ctx.accounts.governance_pool.to_account_info(),
                            },
                        );

                        let seeds = &[
                            b"governance_pool".as_ref(),
                            &[governance_pool.bump],
                        ];
                        let signer = &[&seeds[..]];

                        token::transfer(transfer_ctx.with_signer(signer), amount)?;
                        
                        msg!("Emergency withdrawal executed: {} tokens to {}", amount, recipient);
                    }
                }
            }
        } else {
            proposal.status = ProposalStatus::Rejected;
            msg!("Proposal rejected: {}% approval (needed 60%)", approval_percentage);
        }
        
        Ok(())
    }

    /// Distribute rewards to voters (called after refund request decisions)
    pub fn distribute_voter_rewards(
        ctx: Context<DistributeVoterRewards>,
        total_reward_amount: u64,
        voter_addresses: Vec<Pubkey>,
    ) -> Result<()> {
        let governance_pool = &mut ctx.accounts.governance_pool;
        
        require!(voter_addresses.len() > 0, GovernanceError::NoVoters);
        require!(total_reward_amount > 0, GovernanceError::InvalidRewardAmount);
        
        let reward_per_voter = total_reward_amount / voter_addresses.len() as u64;
        require!(reward_per_voter > 0, GovernanceError::RewardTooSmall);
        
        // Transfer rewards to each voter
        for (i, voter_address) in voter_addresses.iter().enumerate() {
            let voter_token_account = &ctx.accounts.voter_token_accounts[i];
            
            let transfer_ctx = CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.governance_pool_token_account.to_account_info(),
                    to: voter_token_account.to_account_info(),
                    authority: ctx.accounts.governance_pool.to_account_info(),
                },
            );

            let seeds = &[
                b"governance_pool".as_ref(),
                &[governance_pool.bump],
            ];
            let signer = &[&seeds[..]];

            token::transfer(transfer_ctx.with_signer(signer), reward_per_voter)?;
        }
        
        governance_pool.total_rewards_distributed += total_reward_amount;
        
        msg!("Distributed {} tokens to {} voters ({} each)", 
             total_reward_amount, voter_addresses.len(), reward_per_voter);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGovernancePool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GovernancePool::LEN,
        seeds = [b"governance_pool"],
        bump
    )]
    pub governance_pool: Account<'info, GovernancePool>,
    
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = governance_pool,
    )]
    pub governance_pool_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CollectGovernanceFee<'info> {
    #[account(mut)]
    pub governance_pool: Account<'info, GovernancePool>,
    
    #[account(mut)]
    pub governance_pool_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub bounty_creator: Signer<'info>,
    
    #[account(mut)]
    pub bounty_creator_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Proposal::LEN,
        seeds = [b"proposal", governance_pool.key().as_ref(), &[proposal_counter]],
        bump
    )]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub governance_pool: Account<'info, GovernancePool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    /// CHECK: This is just a counter for unique proposal IDs
    pub proposal_counter: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct VoteOnProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(
        init_if_needed,
        payer = voter,
        space = 8 + VoteRecord::LEN,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
    
    #[account(mut)]
    pub governance_pool: Account<'info, GovernancePool>,
    
    #[account(mut)]
    pub governance_pool_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DistributeVoterRewards<'info> {
    #[account(mut)]
    pub governance_pool: Account<'info, GovernancePool>,
    
    #[account(mut)]
    pub governance_pool_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: These are the voter token accounts
    pub voter_token_accounts: Vec<Account<'info, TokenAccount>>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct GovernancePool {
    pub authority: Pubkey,
    pub governance_fee_rate: u64, // Basis points (500 = 5%)
    pub total_fees_collected: u64,
    pub total_rewards_distributed: u64,
    pub bump: u8,
}

impl GovernancePool {
    pub const LEN: usize = 32 + 8 + 8 + 8 + 1;
}

#[account]
pub struct Proposal {
    pub authority: Pubkey,
    pub governance_pool: Pubkey,
    pub title: String,
    pub description: String,
    pub proposal_type: ProposalType,
    pub amount: Option<u64>,
    pub recipient: Option<Pubkey>,
    pub status: ProposalStatus,
    pub yes_votes: u64,
    pub no_votes: u64,
    pub total_votes: u64,
    pub created_at: i64,
    pub expires_at: i64,
    pub bump: u8,
}

impl Proposal {
    pub const LEN: usize = 32 + 32 + 100 + 1000 + 1 + 8 + 32 + 1 + 8 + 8 + 8 + 8 + 8 + 1;
}

#[account]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote: bool,
    pub voted_at: i64,
    pub bump: u8,
}

impl VoteRecord {
    pub const LEN: usize = 32 + 32 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    RewardDistribution,
    FeeRateChange,
    EmergencyWithdraw,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Active,
    Approved,
    Rejected,
    Expired,
}

#[error_code]
pub enum GovernanceError {
    #[msg("Invalid fee amount")]
    InvalidFeeAmount,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Proposal not active")]
    ProposalNotActive,
    #[msg("Proposal not expired")]
    ProposalNotExpired,
    #[msg("Proposal expired")]
    ProposalExpired,
    #[msg("Cannot vote on own proposal")]
    CannotVoteOnOwnProposal,
    #[msg("Already voted")]
    AlreadyVoted,
    #[msg("Insufficient votes")]
    InsufficientVotes,
    #[msg("No voters")]
    NoVoters,
    #[msg("Invalid reward amount")]
    InvalidRewardAmount,
    #[msg("Reward too small")]
    RewardTooSmall,
}
