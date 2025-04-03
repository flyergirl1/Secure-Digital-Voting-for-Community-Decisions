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
