import { describe, it, expect, beforeEach } from 'vitest';
import {
  interpretClarityValue,
  interpretContractCall,
  createMockRuntime,
  createMockEmulator
} from './test-utils';

describe('Voter Verification Contract', () => {
  let mockRuntime;
  let adminAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  let voterAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    mockRuntime = createMockRuntime();
    // Deploy the contract
    mockRuntime.deployer.addContract('voter-verification', './contracts/voter-verification.clar');
  });
  
  it('admin can transfer admin rights', () => {
    mockRuntime.setTxSender(adminAddress);
    const newAdminAddress = 'ST3PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    
    // Transfer admin
    const result = interpretContractCall(
        mockRuntime,
        'voter-verification',
        'transfer-admin',
        [newAdminAddress]
    );
    
    expect(result.success).toBe(true);
    
    // Verify new admin can add voters
    mockRuntime.setTxSender(newAdminAddress);
    const addResult = interpretContractCall(
        mockRuntime,
        'voter-verification',
        'add-voter',
        [voterAddress]
    );
    
    expect(addResult.success).toBe(true);
  });
});
