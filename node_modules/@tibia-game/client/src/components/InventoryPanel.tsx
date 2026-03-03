import React from 'react';
import { InventorySlot, Item, ItemRarity } from '@shared/types';

interface InventoryPanelProps {
  inventory: InventorySlot[];
  onDropItem: (slot: InventorySlot) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, onDropItem }) => {
  const getItemColor = (rarity: ItemRarity): string => {
    switch (rarity) {
      case ItemRarity.COMMON:
        return '#8B4513';
      case ItemRarity.UNCOMMON:
        return '#0080FF';
      case ItemRarity.RARE:
        return '#008000';
      case ItemRarity.EPIC:
        return '#9932CC';
      case ItemRarity.LEGENDARY:
        return '#FFD700';
      default:
        return '#808080';
    }
  };

  const handleItemClick = (slot: InventorySlot) => {
    if (slot.item) {
      onDropItem(slot);
    }
  };

  return (
    <div
      className="inventory-panel"
      style={{
        position: 'absolute',
        right: '20px',
        top: '100px',
        width: '200px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #444',
        borderRadius: '4px',
        padding: '10px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: 'white'
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFD700' }}>
        Inventory
      </h3>
      
      <div
        className="inventory-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          marginBottom: '10px'
        }}
      >
        {inventory.map((slot) => (
          <div
            key={slot.slot}
            className={`inventory-slot ${slot.item ? 'has-item' : 'empty'}`}
            onClick={() => handleItemClick(slot)}
            style={{
              width: '40px',
              height: '40px',
              border: slot.item ? `2px solid ${getItemColor(slot.item.rarity)}` : '1px solid #666',
              borderRadius: '2px',
              backgroundColor: slot.item ? getItemColor(slot.item.rarity) : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: slot.item ? 'pointer' : 'default',
              position: 'relative',
              fontSize: '10px'
            }}
            >
            {slot.item ? (
              <>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: getItemColor(slot.item.rarity),
                    border: '1px solid #000',
                    borderRadius: '2px'
                  }}
                />
                {slot.quantity > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      backgroundColor: '#FFD700',
                      color: '#000',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      padding: '1px 3px',
                      borderRadius: '2px',
                      lineHeight: '1'
                    }}
                  >
                    {slot.quantity}
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: '#666', fontSize: '8px' }}>Empty</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ fontSize: '10px', color: '#aaa', marginTop: '5px' }}>
        Click item to drop
      </div>
    </div>
  );
};
