import { describe, it, expect, beforeEach } from 'vitest';
import {
  interpretClarityValue,
  interpretContractCall,
  createMockRuntime
} from './test-utils';

describe('Proposal Submission Contract', () => {
  let mockRuntime;
  let adminAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  let userAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    mockRuntime = createMockRuntime();
    // Deploy the contract
    mockRuntime.deployer.addContract('proposal-submission', './contracts/proposal-submission.clar');
    // Set block height
    mockRuntime.setBlockHeight(10);
  });
  
  it('user can create a valid proposal', () => {
    mockRuntime.setTxSender(userAddress);
    
    const result = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'create-proposal',
        [
          'Test Proposal',
          'This is a test proposal description',
          15, // start-block
          20  // end-block
        ]
    );
    
    expect(result.success).toBe(true);
    
    // Verify proposal was created with ID 0
    const proposalResult = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'get-proposal',
        [0]
    );
    
    expect(proposalResult.result).toBeDefined();
    expect(proposalResult.result.title).toBe('Test Proposal');
    expect(proposalResult.result.creator).toBe(userAddress);
  });
  
  it('rejects proposals with start block in the past', () => {
    mockRuntime.setTxSender(userAddress);
    
    const result = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'create-proposal',
        [
          'Invalid Proposal',
          'This proposal has a start block in the past',
          5,  // start-block in the past (current block is 10)
          20  // end-block
        ]
    );
    
    expect(result.success).toBe(false);
    expect(result.error).toBe(200);
  });
  
  it('rejects proposals with end block before start block', () => {
    mockRuntime.setTxSender(userAddress);
    
    const result = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'create-proposal',
        [
          'Invalid Proposal',
          'This proposal has end block before start block',
          15,  // start-block
          14   // end-block before start block
        ]
    );
    
    expect(result.success).toBe(false);
    expect(result.error).toBe(201);
  });
  
  it('creator can close their proposal early', () => {
    mockRuntime.setTxSender(userAddress);
    
    // Create proposal
    interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'create-proposal',
        [
          'Test Proposal',
          'This is a test proposal description',
          15,
          20
        ]
    );
    
    // Close proposal
    const closeResult = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'close-proposal',
        [0]
    );
    
    expect(closeResult.success).toBe(true);
    
    // Verify proposal is no longer active
    const proposalResult = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'get-proposal',
        [0]
    );
    
    expect(proposalResult.result['is-active']).toBe(false);
  });
  
  it('admin can close any proposal', () => {
    // Create proposal as regular user
    mockRuntime.setTxSender(userAddress);
    interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'create-proposal',
        [
          'Test Proposal',
          'This is a test proposal description',
          15,
          20
        ]
    );
    
    // Close as admin
    mockRuntime.setTxSender(adminAddress);
    const closeResult = interpretContractCall(
        mockRuntime,
        'proposal-submission',
        'close-proposal',
        [0]
    );
    
    expect(closeResult.success).toBe(true);
  });
});
