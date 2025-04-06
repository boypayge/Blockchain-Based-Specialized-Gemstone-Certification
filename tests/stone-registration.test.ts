import { describe, it, expect, beforeEach } from 'vitest';

// Mock blockchain environment
const mockBlockchain = {
  currentHeight: 100,
  currentSender: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  contracts: {
    stoneRegistration: {
      lastStoneId: 0,
      stones: new Map(),
      registerStone: function(name, weight, color, clarity, cut, origin) {
        const stoneId = this.lastStoneId + 1;
        this.lastStoneId = stoneId;
        
        this.stones.set(stoneId, {
          name,
          weight,
          color,
          clarity,
          cut,
          origin,
          owner: mockBlockchain.currentSender,
          registeredAt: mockBlockchain.currentHeight
        });
        
        return { type: 'ok', value: stoneId };
      },
      getStone: function(stoneId) {
        return this.stones.get(stoneId) || null;
      },
      getLastStoneId: function() {
        return this.lastStoneId;
      }
    }
  }
};

describe('Stone Registration Contract', () => {
  beforeEach(() => {
    // Reset the contract state before each test
    mockBlockchain.contracts.stoneRegistration.lastStoneId = 0;
    mockBlockchain.contracts.stoneRegistration.stones = new Map();
  });
  
  it('should register a new stone', () => {
    const contract = mockBlockchain.contracts.stoneRegistration;
    
    const result = contract.registerStone(
        'Blue Sapphire',
        500, // 5.00 carats (in points)
        'Deep Blue',
        'VS1',
        'Oval',
        'Sri Lanka'
    );
    
    expect(result.type).toBe('ok');
    expect(result.value).toBe(1);
    expect(contract.getLastStoneId()).toBe(1);
    
    const stone = contract.getStone(1);
    expect(stone).not.toBeNull();
    expect(stone.name).toBe('Blue Sapphire');
    expect(stone.weight).toBe(500);
    expect(stone.color).toBe('Deep Blue');
    expect(stone.clarity).toBe('VS1');
    expect(stone.cut).toBe('Oval');
    expect(stone.origin).toBe('Sri Lanka');
    expect(stone.owner).toBe(mockBlockchain.currentSender);
    expect(stone.registeredAt).toBe(mockBlockchain.currentHeight);
  });
  
  it('should register multiple stones', () => {
    const contract = mockBlockchain.contracts.stoneRegistration;
    
    contract.registerStone('Blue Sapphire', 500, 'Deep Blue', 'VS1', 'Oval', 'Sri Lanka');
    contract.registerStone('Ruby', 300, 'Pigeon Blood', 'VVS2', 'Cushion', 'Myanmar');
    
    expect(contract.getLastStoneId()).toBe(2);
    
    const stone1 = contract.getStone(1);
    expect(stone1.name).toBe('Blue Sapphire');
    
    const stone2 = contract.getStone(2);
    expect(stone2.name).toBe('Ruby');
    expect(stone2.color).toBe('Pigeon Blood');
  });
  
  it('should return null for non-existent stones', () => {
    const contract = mockBlockchain.contracts.stoneRegistration;
    
    const stone = contract.getStone(999);
    expect(stone).toBeNull();
  });
});
