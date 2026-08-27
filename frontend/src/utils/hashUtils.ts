/**
 * Cryptographic SHA-256 Hashing and Hash Chain Verification Utilities
 */

import { AuditRecord, AuditVerificationResult } from '../types';

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function computeRecordHash(
  record: Omit<AuditRecord, 'current_hash'>,
  previousHash: string
): Promise<string> {
  const contentToHash = `${record.sequence_id}|${record.event_id}|${record.timestamp}|${record.actor}|${record.action}|${record.target_resource}|${record.payload_digest}|${previousHash}`;
  return sha256(contentToHash);
}

export async function verifyAuditChainClientSide(
  chain: AuditRecord[]
): Promise<AuditVerificationResult> {
  if (!chain || chain.length === 0) {
    return {
      is_valid: true,
      total_records: 0,
      verified_records: 0,
      corrupted_sequence_id: null,
      message: 'Audit chain is empty. Zero records to verify.',
    };
  }

  // Sort ascending by sequence_id
  const sorted = [...chain].sort((a, b) => a.sequence_id - b.sequence_id);

  let verifiedCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    const record = sorted[i];

    // For genesis block (first record)
    const expectedPrevHash =
      i === 0 ? record.previous_hash : sorted[i - 1].current_hash;

    if (i > 0 && record.previous_hash !== expectedPrevHash) {
      return {
        is_valid: false,
        total_records: sorted.length,
        verified_records: verifiedCount,
        corrupted_sequence_id: record.sequence_id,
        message: `Chain Broken: Record #${record.sequence_id} previous_hash does not match block #${sorted[i - 1].sequence_id} current_hash.`,
      };
    }

    const calculatedCurrentHash = await computeRecordHash(record, record.previous_hash);
    if (calculatedCurrentHash !== record.current_hash) {
      return {
        is_valid: false,
        total_records: sorted.length,
        verified_records: verifiedCount,
        corrupted_sequence_id: record.sequence_id,
        message: `Payload Tampered: Record #${record.sequence_id} computed hash (${calculatedCurrentHash.slice(0, 8)}...) does not match stored block hash (${record.current_hash.slice(0, 8)}...).`,
      };
    }

    verifiedCount++;
  }

  return {
    is_valid: true,
    total_records: sorted.length,
    verified_records: verifiedCount,
    corrupted_sequence_id: null,
    message: `All ${verifiedCount} audit block hashes mathematically verified with zero anomalies. Cryptographic integrity confirmed.`,
  };
}
