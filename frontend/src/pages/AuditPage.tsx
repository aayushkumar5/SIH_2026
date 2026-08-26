import React from 'react';
import { AuditRecord } from '../types';
import { AuditVerifier } from '../components/AuditVerifier';

interface AuditPageProps {
  chain: AuditRecord[];
  onRefresh: () => void;
}

export const AuditPage: React.FC<AuditPageProps> = ({ chain, onRefresh }) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 space-y-6">
      <AuditVerifier chain={chain} onRefresh={onRefresh} />
    </div>
  );
};
