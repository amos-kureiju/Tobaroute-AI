// ====================================================================================================
// FILE: frontend/src/admin/index.js
// TUJUAN:
// Barrel export file yang mengumpulkan seluruh komponen halaman admin agar dapat diimpor secara ringkas
// dalam satu baris di App.jsx (contoh: import { AdminDashboard, AdminLayout } from './admin').
// ====================================================================================================

export { default as AdminLogin } from './AdminLogin';
export { default as AdminLayout } from './AdminLayout';
export { default as AdminDashboard } from './AdminDashboard';
export { default as AdminDestinations } from './AdminDestinations';
export { default as AdminContent } from './AdminContent';
export { default as AdminAIMonitoring } from './AdminAIMonitoring';
export { default as AdminSettings } from './AdminSettings';
