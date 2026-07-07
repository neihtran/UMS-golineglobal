/**
 * Seed script — INT (Tích hợp Hệ thống) data
 * Run: npm run seed:int
 */
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Integration, IntegrationLog } from '../models/Integration.js';
import { logger } from '../utils/logger.js';

config();

const INTEGRATIONS: Array<Record<string, unknown>> = [
  { name: 'HEMIS Sync', system: 'HEMIS', direction: 'bidirectional', endpoint: 'https://hemis.example.com/api/v1', status: 'active', syncIntervalMinutes: 360, retryPolicy: { maxRetries: 3, backoffMs: 5000 } },
  { name: 'VNeID Authentication', system: 'VNeID', direction: 'push', endpoint: 'https://vneid.example.com/api/v1/verify', status: 'active', syncIntervalMinutes: 60, retryPolicy: { maxRetries: 2, backoffMs: 3000 } },
  { name: 'VGCA Digital Signing', system: 'VGCA', direction: 'push', endpoint: 'https://vgca.example.com/api/v1/sign', status: 'active', syncIntervalMinutes: 30, retryPolicy: { maxRetries: 3, backoffMs: 2000 } },
  { name: 'CSDL Văn bằng Quốc gia', system: 'CSDLVB', direction: 'pull', endpoint: 'https://csdlvb.example.com/api/v1/verify', status: 'inactive', syncIntervalMinutes: 1440, retryPolicy: { maxRetries: 5, backoffMs: 10000 } },
  { name: 'Kho bạc Nhà nước', system: 'KHOBAC', direction: 'push', endpoint: 'https://khobac.example.com/api/v1/payment', status: 'inactive', syncIntervalMinutes: 360, retryPolicy: { maxRetries: 3, backoffMs: 5000 } },
];

const LOGS: Array<Record<string, unknown>> = [
  { integrationName: 'HEMIS Sync', direction: 'pull', status: 'success', httpStatus: 200, durationMs: 320, requestBody: { action: 'getStudents' }, responseBody: { total: 1200 } },
  { integrationName: 'HEMIS Sync', direction: 'push', status: 'success', httpStatus: 201, durationMs: 150, requestBody: { action: 'createEnrollment' }, responseBody: { id: 'HEM-001' } },
  { integrationName: 'VNeID Authentication', direction: 'pull', status: 'success', httpStatus: 200, durationMs: 450, requestBody: { idNumber: '[FAKE]' }, responseBody: { verified: true, name: 'Nguyễn Văn A' } },
  { integrationName: 'VGCA Digital Signing', direction: 'push', status: 'success', httpStatus: 200, durationMs: 890, requestBody: { documentId: 'DOC-001' }, responseBody: { signed: true, certId: 'CERT-001' } },
  { integrationName: 'HEMIS Sync', direction: 'pull', status: 'error', httpStatus: 500, durationMs: 5000, errorMessage: 'Lỗi kết nối HEMIS: timeout sau 5s' },
  { integrationName: 'CSDL Văn bằng Quốc gia', direction: 'pull', status: 'error', httpStatus: 503, durationMs: 3000, errorMessage: 'Dịch vụ tạm thời bảo trì' },
  { integrationName: 'VNeID Authentication', direction: 'pull', status: 'success', httpStatus: 200, durationMs: 380, requestBody: { idNumber: '[FAKE]' }, responseBody: { verified: true } },
  { integrationName: 'HEMIS Sync', direction: 'push', status: 'success', httpStatus: 200, durationMs: 200, requestBody: { action: 'updateGrade' }, responseBody: { updated: true } },
];

export async function seedInt() {
  await Promise.all([Integration.deleteMany({}), IntegrationLog.deleteMany({})]);
  logger.info('Cleared existing INT data');

  const createdIntegrations = await Integration.insertMany(INTEGRATIONS) as unknown as Array<{ name: string; _id: { toString: () => string } }>;
  logger.info(`✅ Seeded ${createdIntegrations.length} integrations`);

  const intIdEntries: Array<[string, string]> = createdIntegrations.map(i => [i.name, i._id.toString()]);
  const intIdMap = new Map<string, string>(intIdEntries);
  const createdLogs = await IntegrationLog.insertMany(LOGS.map(log => ({
    ...log,
    integrationId: intIdMap.get(log.integrationName as string),
    timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
  })));
  logger.info(`✅ Seeded ${createdLogs.length} integration logs`);

  console.log('\n✅ INT seed complete!');
  console.log(`   Integrations: ${createdIntegrations.length}`);
  console.log(`   Integration logs: ${createdLogs.length}`);
}
