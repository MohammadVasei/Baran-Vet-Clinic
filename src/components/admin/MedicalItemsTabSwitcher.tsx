import { useState } from 'react';

interface MedicalItemsTabSwitcherProps {
  onTabChange: (tab: 'vaccines' | 'treatment_types') => void;
  activeTab: 'vaccines' | 'treatment_types';
}

export function MedicalItemsTabSwitcher({ 
  onTabChange, 
  activeTab 
}: MedicalItemsTabSwitcherProps) {
  return (
    <div role="tablist" className="flex border-b border-muted">
      <button
        role="tab"
        aria-selected={activeTab === 'vaccines' ? 'true' : 'false'}
        aria-controls="vaccines-tabpanel"
        id="vaccines-tab"
        onClick={() => onTabChange('vaccines')}
        className={`
          px-4 py-2 font-medium text-sm
          ${activeTab === 'vaccines' 
            ? 'text-foreground border-b-2 border-primary' 
            : 'text-muted-foreground hover:text-muted-foreground/80'}
        `}
      >
        واکسن‌ها
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'treatment_types' ? 'true' : 'false'}
        aria-controls="treatment-types-tabpanel"
        id="treatment-types-tab"
        onClick={() => onTabChange('treatment_types')}
        className={`
          px-4 py-2 font-medium text-sm
          ${activeTab === 'treatment_types' 
            ? 'text-foreground border-b-2 border-primary' 
            : 'text-muted-foreground hover:text-muted-foreground/80'}
        `}
      >
        انواع درمان
      </button>
    </div>
  );
}