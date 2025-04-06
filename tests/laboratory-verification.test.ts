import { describe, it, expect, beforeEach } from 'vitest';

// Mock blockchain environment
const mockBlockchain = {
  currentHeight: 100,
  currentSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contracts: {
    labVerification: {
      verifications: new Map(),
      authorizedLabs: new Map(),
      contractOwner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      
      authorizeLab: function(labPrincipal) {
        if (this.contractOwner !== mockBlockchain.currentSender) {
          return { type: 'err', value: 403 };
        }
        this.authorizedLabs.set(labPrincipal, { authorized: true });
        return { type: 'ok', value: true };
      },
      
      revokeLab: function(labPrincipal) {
        if (this.contractOwner !== mockBlockchain.currentSender) {
          return { type: 'err', value: 403 };
        }
        this.authorizedLabs.set(labPrincipal, { authorized: false });
        return { type: 'ok', value: true };
      },
      
      verifyStone: function(stoneId, labName, grade, reportNumber, notes) {
        if (!this.isAuthorized(mockBlockchain.currentSender)) {
          return { type: 'err', value: 401 };
        }
        
        this.verifications.set(stoneId, {
          labName,
          verifiedBy: mockBlockchain.currentSender,
          grade,
          reportNumber,
          verifiedAt: mockBlockchain.currentHeight,
          notes
        });
        
        return { type: 'ok', value: true };
      },
      
      getVerification: function(stoneId) {
        return this.verifications.get(stoneId) || null;
      },
      
      isAuthorized: function(labPrincipal) {
        const lab = this.authorizedLabs.get(labPrincipal);
        return lab ? lab.authorized : false;
      }
    }
  }
};

describe('Laboratory Verification Contract', () => {
  beforeEach(() => {
    // Reset the contract state before each test
    const contract = mockBlockchain.contracts.labVerification;
    contract.verifications = new Map();
    contract.authorizedLabs = new Map();
    contract.contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  });
  
  it('should authorize a lab', () => {
    const contract = mockBlockchain.contracts.labVerification;
    const labPrincipal = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    const result = contract.authorizeLab(labPrincipal);
    
    expect(result.type).toBe('ok');
    expect(contract.isAuthorized(labPrincipal)).toBe(true);
  });
  
  it('should revoke a lab authorization', () => {
    const contract = mockBlockchain.contracts.labVerification;
    const labPrincipal = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    contract.authorizeLab(labPrincipal);
    expect(contract.isAuthorized(labPrincipal)).toBe(true);
    
    const result = contract.revokeLab(labPrincipal);
    
    expect(result.type).toBe('ok');
    expect(contract.isAuthorized(labPrincipal)).toBe(false);
  });
  
  it('should not allow unauthorized users to authorize labs', () => {
    const contract = mockBlockchain.contracts.labVerification;
    const labPrincipal = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    // Change the current sender to someone else
    const originalSender = mockBlockchain.currentSender;
    mockBlockchain.currentSender = 'ST3AMFB2C5BDZ0X5RE2JVDP5M9UVTW5JAXF56JSGJ';
    
    const result = contract.authorizeLab(labPrincipal);
    
    expect(result.type).toBe('err');
    expect(result.value).toBe(403);
    expect(contract.isAuthorized(labPrincipal)).toBe(false);
    
    // Restore the original sender
    mockBlockchain.currentSender = originalSender;
  });
  
  it('should allow authorized labs to verify stones', () => {
    const contract = mockBlockchain.contracts.labVerification;
    const labPrincipal = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    
    // Authorize the lab
    contract.authorizeLab(labPrincipal);
    
    // Change the current sender to the lab
    const originalSender = mockBlockchain.currentSender;
    mockBlockchain.currentSender = labPrincipal;
    
    const result = contract.verifyStone(
        1, // stone ID
        'GIA', // lab name
        'AAA', // grade
        'GIA123456789', // report number
        'Excellent color and clarity' // notes
    );
    
    expect(result.type).toBe('ok');
    
    const verification = contract.getVerification(1);
    expect(verification).not.toBeNull();
    expect(verification.labName).toBe('GIA');
    expect(verification.grade).toBe('AAA');
    expect(verification.reportNumber).toBe('GIA123456789');
    expect(verification.verifiedBy).toBe(labPrincipal);
    
    // Restore the original sender
    mockBlockchain.currentSender = originalSender;
  });
  
  it('should not allow unauthorized labs to verify stones', () => {
    const contract = mockBlockchain.contracts.labVerification;
    const unauthorizedLab = 'ST3AMFB2C5BDZ0X5RE2JVDP5M9UVTW5JAXF56JSGJ';
    
    // Change the current sender to the unauthorized lab
    const originalSender = mockBlockchain.currentSender;
    mockBlockchain.currentSender = unauthorizedLab;
    
    const result = contract.verifyStone(
        1, // stone ID
        'Fake Lab', // lab name
        'AAA', // grade
        'FAKE123456789', // report number
        'Fake verification' // notes
    );
    
    expect(result.type).toBe('err');
    expect(result.value).toBe(401);
    
    const verification = contract.getVerification(1);
    expect(verification).toBeNull();
    
    // Restore the original sender
    mockBlockchain.currentSender = originalSender;
  });
});
