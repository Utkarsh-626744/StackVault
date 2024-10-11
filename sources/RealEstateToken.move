module RealEstate::RealEstateToken {
    use std::signer;
    use aptos_framework::event;
    use aptos_framework::vector;
    use aptos_framework::error;

    struct RealEstateToken has key, store {
        id: u64,
        owner: address,
        property_value: u64,
        ipfs_hash: vector<u8>,
        rwa_type: vector<u8>,
        locked_for_collateral: bool,
        loan_amount: u64,
        is_loan_active: bool,
    }

    struct RealEstateCollection has key {
        tokens: vector<RealEstateToken>,
    }

    #[event]
    struct MintEvent has drop, store {
        token_id: u64,
        owner: address,
        value: u64,
    }

    #[event]
    struct CollateralLockEvent has drop, store {
        token_id: u64,
        owner: address,
    }

    #[event]
    struct LoanEvent has drop, store {
        token_id: u64,
        owner: address,
        loan_amount: u64,
    }

    const EZERO_VALUE: u64 = 1;
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        if (!exists<RealEstateCollection>(account_addr)) {
            let collection = RealEstateCollection {
            tokens: vector::empty<RealEstateToken>(),
            };
        move_to(account, collection);
        }
// If the collection already exists, we just return without doing anything
    }

    public entry fun mint_real_estate_token(
        account: &signer,
        property_value: u64,
        ipfs_hash: vector<u8>,
        rwa_type: vector<u8>
    ) acquires RealEstateCollection {
        assert!(property_value > 0, error::invalid_argument(EZERO_VALUE));

        let owner = signer::address_of(account);

        // Check if RealEstateCollection exists, if not, initialize it
        if (!exists<RealEstateCollection>(owner)) {
            move_to(account, RealEstateCollection { tokens: vector::empty() });
        };
        let collection = borrow_global_mut<RealEstateCollection>(owner);
        
        let token_id = vector::length(&collection.tokens) + 1;

        let token = RealEstateToken {
            id: token_id,
            owner: owner,
            property_value: property_value,
            ipfs_hash: ipfs_hash,
            rwa_type: rwa_type,
            locked_for_collateral: false,
            loan_amount: 0,
            is_loan_active: false,
        };

        event::emit(MintEvent {
            token_id: token_id,
            owner: owner,
            value: property_value,
        });

        vector::push_back(&mut collection.tokens, token);
    }

    public entry fun lock_for_collateral(account: &signer, token_id: u64) acquires RealEstateCollection {
        let owner = signer::address_of(account);
        let collection = borrow_global_mut<RealEstateCollection>(owner);

        let token = vector::borrow_mut(&mut collection.tokens, token_id - 1);
        assert!(!token.locked_for_collateral, 1001); // Token already locked
        
        token.locked_for_collateral = true;

        event::emit(CollateralLockEvent {
            token_id: token_id,
            owner: owner,
        });
    }

    public entry fun unlock_collateral(account: &signer, token_id: u64) acquires RealEstateCollection {
        let owner = signer::address_of(account);
        let collection = borrow_global_mut<RealEstateCollection>(owner);

        let token = vector::borrow_mut(&mut collection.tokens, token_id - 1);
        assert!(token.locked_for_collateral, 1001); // Token not locked

        token.locked_for_collateral = false;
    }

    public entry fun take_loan(account: &signer, token_id: u64, loan_amount: u64) acquires RealEstateCollection {
        let owner = signer::address_of(account);
        let collection = borrow_global_mut<RealEstateCollection>(owner);

        let token = vector::borrow_mut(&mut collection.tokens, token_id - 1);
        assert!(!token.is_loan_active, 2001); // Loan already active
        assert!(token.locked_for_collateral, 2002); // Token must be locked for collateral

        token.loan_amount = loan_amount;
        token.is_loan_active = true;

        event::emit(LoanEvent {
            token_id: token_id,
            owner: owner,
            loan_amount: loan_amount,
        });
    }

    public entry fun repay_loan(account: &signer, token_id: u64) acquires RealEstateCollection {
        let owner = signer::address_of(account);
        let collection = borrow_global_mut<RealEstateCollection>(owner);

        let token = vector::borrow_mut(&mut collection.tokens, token_id - 1);
        assert!(token.is_loan_active, 2001); // No active loan

        token.loan_amount = 0;
        token.is_loan_active = false;
    }

    // -------- Token Transfer Functionality:
    public entry fun transfer_token(account: &signer, recipient: address, token_id: u64) acquires RealEstateCollection {
        let sender = signer::address_of(account);
        let collection = borrow_global_mut<RealEstateCollection>(sender);
        let token = vector::remove(&mut collection.tokens, token_id - 1);
   
        let recipient_collection = borrow_global_mut<RealEstateCollection>(recipient);
        vector::push_back(&mut recipient_collection.tokens, token);
    }

    
    public fun check_liquidation(token: &RealEstateToken, threshold: u64): bool {
        // If collateral drops below threshold, trigger liquidation
        token.property_value < threshold
    }

    public fun calculate_interest(loan_amount: u64, loan_duration: u64, rate: u64): u64 {
        // Simple interest: loan_amount * (rate/100) * loan_duration
        loan_amount * rate / 100 * loan_duration
    }

    // #[test_only]
    // public fun initialize_for_test(account: &signer) {
    //     initialize(account);
    // }


    #[test_only]
    use aptos_framework::account;

    #[test(admin = @0x123)]
public entry fun test_mint_real_estate_token(admin: &signer) acquires RealEstateCollection {
    // Initialize the module
    initialize(admin);
    
    // Mint a token
    mint_real_estate_token(admin, 100000, b"QmHash1", b"real_estate");
    
    // Check if the collection exists
    let admin_addr = signer::address_of(admin);
    assert!(exists<RealEstateCollection>(admin_addr), 0);
    
    // Get the collection
    let collection = borrow_global<RealEstateCollection>(admin_addr);
    
    // Check if a token was added
    assert!(vector::length(&collection.tokens) == 1, 1);
    
    // Check the token's properties
    let token = vector::borrow(&collection.tokens, 0);
    assert!(token.id == 1, 2);
    assert!(token.owner == admin_addr, 3);
    assert!(token.property_value == 100000, 4);
    assert!(token.ipfs_hash == b"QmHash1", 5);
    assert!(token.rwa_type == b"real_estate", 6);
    assert!(!token.locked_for_collateral, 7);
    assert!(token.loan_amount == 0, 8);
    assert!(!token.is_loan_active, 9);
}

#[test(admin = @0x123)]
public entry fun test_mint_multiple_tokens_different_types(admin: &signer) acquires RealEstateCollection {
    // Initialize the module
    initialize(admin);
    
    // Mint two tokens with different RWA types
    mint_real_estate_token(admin, 100000, b"QmHash1", b"real_estate");
    mint_real_estate_token(admin, 50000, b"QmHash2", b"art");
    
    let admin_addr = signer::address_of(admin);
    let collection = borrow_global<RealEstateCollection>(admin_addr);
    
    // Check if two tokens were added
    assert!(vector::length(&collection.tokens) == 2, 0);
    
    // Check the properties of both tokens
    let token1 = vector::borrow(&collection.tokens, 0);
    let token2 = vector::borrow(&collection.tokens, 1);
    
    assert!(token1.id == 1, 1);
    assert!(token1.property_value == 100000, 2);
    assert!(token1.ipfs_hash == b"QmHash1", 3);
    assert!(token1.rwa_type == b"real_estate", 4);
    
    assert!(token2.id == 2, 5);
    assert!(token2.property_value == 50000, 6);
    assert!(token2.ipfs_hash == b"QmHash2", 7);
    assert!(token2.rwa_type == b"art", 8);
}

#[test(admin = @0x123, user = @0x456)]
public entry fun test_mint_token_by_different_user(admin: &signer, user: &signer) acquires RealEstateCollection {
    // Initialize the module
    initialize(admin);
    
    // Create a new user account
    account::create_account_for_test(signer::address_of(user));
    
    // Mint a token as the user
    mint_real_estate_token(user, 75000, b"QmHash3", b"vehicle");
    
    let user_addr = signer::address_of(user);
    assert!(exists<RealEstateCollection>(user_addr), 0);
    
    let collection = borrow_global<RealEstateCollection>(user_addr);
    assert!(vector::length(&collection.tokens) == 1, 1);
    
    let token = vector::borrow(&collection.tokens, 0);
    assert!(token.owner == user_addr, 2);
    assert!(token.property_value == 75000, 3);
    assert!(token.rwa_type == b"vehicle", 4);
}

#[test(admin = @0x123)]
#[expected_failure(abort_code = 0x10001, location = RealEstate::RealEstateToken)]
public entry fun test_mint_token_with_zero_value(admin: &signer) acquires RealEstateCollection {
    // Initialize the module
    initialize(admin);
    
    // Attempt to mint a token with zero value (should fail)
    mint_real_estate_token(admin, 0, b"QmHash4", b"jewelry");
}

#[test(admin = @0x123)]
public entry fun test_mint_token_with_empty_rwa_type(admin: &signer) acquires RealEstateCollection {
    // Initialize the module
    initialize(admin);
    
    // Mint a token with an empty RWA type
    mint_real_estate_token(admin, 10000, b"QmHash5", b"");
    
    let admin_addr = signer::address_of(admin);
    let collection = borrow_global<RealEstateCollection>(admin_addr);
    
    let token = vector::borrow(&collection.tokens, 0);
    assert!(token.rwa_type == b"", 0);
}
    // #[test(account = @0x1, recipient = @0x2)]
    // public entry fun test_transfer_and_liquidation(account: &signer, recipient: address) acquires RealEstateCollection {
    //     let recipient = signer::address_of(&signer::new());
    //     initialize_for_test(account);
        
    //     // Initialize the collection for the recipient as well
    //     initialize_for_test(recipient);
    
    //     mint_real_estate_token(account, 100000);
    
    //     // Transfer the token from account to recipient
    //     transfer_token(account, recipient, 1);
    
    //     // Re-borrow the recipient's collection to check if the token has been transferred
    //     let recipient_collection = borrow_global<RealEstateCollection>(recipient);
    //     let token = vector::borrow(&recipient_collection.tokens, 0);
    //     assert!(token.id == 1, 0);  // Check that the token has been transferred correctly
    //     assert!(token.owner == recipient, 1);  // Verify the new owner is the recipient
    
    //     // Test liquidation logic
    //     let is_liquidated = check_liquidation(token, 50000);
    //     assert!(is_liquidated, 2);  // Check if liquidation condition is triggered (property value < threshold)
    // }
}