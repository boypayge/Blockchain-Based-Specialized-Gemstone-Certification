import { describe, it, expect, beforeEach } from 'vitest';

// Mock blockchain environment
const mockBlockchain = {
  currentHeight: 100,
  currentSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contracts: {
    treatmentDisclosure: {
      treatments: new Map(),
      stoneTreatments: new Map(),
      
      discloseTreatment: function(stoneId, treatmentType, description, performedBy, performedAt) {
        const key = stoneId.toString();
        const treatmentCount = this.stoneTreatments.has(key)
            ? this.stoneTreatments.get(key).treatmentCount
            : 0;
        
        const newTreatmentId = treatmentCount + 1;
        this.stoneTreatments.set(key, { treatmentCount: newTreatmentId });
        
        const treatmentKey = `${stoneId}-${newTreatmentId}`;
        this.treatments.set(treatmentKey, {
          treatmentType,
          description,
          performedBy,
          performedAt,
          disclosedBy: mockBlockchain.currentSender,
          disclosedAt: mockBlockchain.currentHeight
        });
        
        return { type: 'ok', value: newTreatmentId };
      },
      
      getTreatment: function(stoneId, treatmentId) {
        const treatmentKey = `${stoneId}-${treatmentId}`;
        return this.treatments.get(treatmentKey) || null;
      },
      
      getTreatmentCount: function(stoneId) {
        const key = stoneId.toString();
        return this.stoneTreatments.has(key)
            ? this.stoneTreatments.get(key).treatmentCount
            : 0;
      }
    }
  }
};

describe('Treatment Disclosure Contract', () => {
  beforeEach(() => {
    // Reset the contract state before each test
    const contract = mockBlockchain.contracts.treatmentDisclosure;
    contract.treatments = new Map();
    contract.stoneTreatments = new Map();
  });
  
  it('should disclose a treatment for a stone', () => {
    const contract = mockBlockchain.contracts.treatmentDisclosure;
    
    const result = contract.discloseTreatment(
        1, // stone ID
        'Heat Treatment', // treatment type
        'Stone was heated to 1200°C to enhance color', // description
        'GemLab Inc.', // performed by
        95 // performed at block height
    );
    
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1); // first treatment ID
    expect(contract.getTreatmentCount(1)).toBe(1);
    
    const treatment = contract.getTreatment(1, 1);
    expect(treatment).not.toBeNull();
    expect(treatment.treatmentType).toBe('Heat Treatment');
    expect(treatment.description).toBe('Stone was heated to 1200°C to enhance color');
    expect(treatment.performedBy).toBe('GemLab Inc.');
    expect(treatment.performedAt).toBe(95);
    expect(treatment.disclosedBy).toBe(mockBlockchain.currentSender);
    expect(treatment.disclosedAt).toBe(mockBlockchain.currentHeight);
  });
  
  it('should disclose multiple treatments for a stone', () => {
    const contract = mockBlockchain.contracts.treatmentDisclosure;
    
    contract.discloseTreatment(
        1, // stone ID
        'Heat Treatment', // treatment type
        'Stone was heated to 1200°C to enhance color', // description
        'GemLab Inc.', // performed by
        95 // performed at block height
    );
    
    const result = contract.discloseTreatment(
        1, // same stone ID
        'Irradiation', // treatment type
        'Stone was irradiated to enhance color', // description
        'Advanced Gem Labs', // performed by
        97 // performed at block height
    );
    
    expect(result.type).toBe('ok');
    expect(result.value).toBe(2); // second treatment ID
    expect(contract.getTreatmentCount(1)).toBe(2);
    
    const treatment1 = contract.getTreatment(1, 1);
    expect(treatment1.treatmentType).toBe('Heat Treatment');
    
    const treatment2 = contract.getTreatment(1, 2);
    expect(treatment2.treatmentType).toBe('Irradiation');
    expect(treatment2.performedBy).toBe('Advanced Gem Labs');
  });
  
  it('should handle treatments for different stones', () => {
    const contract = mockBlockchain.contracts.treatmentDisclosure;
    
    contract.discloseTreatment(
        1, // stone ID
        'Heat Treatment', // treatment type
        'Stone was heated to 1200°C to enhance color', // description
        'GemLab Inc.', // performed by
        95 // performed at block height
    );
    
    contract.discloseTreatment(
        2, // different stone ID
        'Oiling', // treatment type
        'Stone was oiled to improve clarity', // description
        'Clarity Enhancers Ltd.', // performed by
        98 // performed at block height
    );
    
    expect(contract.getTreatmentCount(1)).toBe(1);
    expect(contract.getTreatmentCount(2)).toBe(1);
    
    const treatment1 = contract.getTreatment(1, 1);
    expect(treatment1.treatmentType).toBe('Heat Treatment');
    
    const treatment2 = contract.getTreatment(2, 1);
    expect(treatment2.treatmentType).toBe('Oiling');
    expect(treatment2.performedBy).toBe('Clarity Enhancers Ltd.');
  });
  
  it('should return null for non-existent treatments', () => {
    const contract = mockBlockchain.contracts.treatmentDisclosure;
    
    const treatment = contract.getTreatment(999, 1);
    expect(treatment).toBeNull();
  });
});
