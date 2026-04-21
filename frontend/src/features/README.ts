/**
 * KodiVault Frontend - Feature-Sliced Architecture
 *
 * This structure organizes the application by feature/role with strict separation of concerns:
 *
 * /features/tenant/
 *   - BrowseProperties: Search and filter available properties
 *   - LeaseWizard: Multi-step lease agreement creation
 *   - InspectionFlow: Pre/post-occupancy inspection photo upload
 *   - Dashboard: View lease status and approvals
 *   - types.ts: Tenant-specific types (TenantDashboardStats, PropertyBrowseFilters, etc.)
 *   - hooks.ts: Tenant-specific hooks (useTenantLeases, usePropertiesWithFilters, etc.)
 *
 * /features/landlord/
 *   - Portfolio: Overview of owned properties
 *   - PropertyManager: Manage individual properties and maintenance
 *   - TenantManagement: View and manage tenants
 *   - KYCVerification: Review tenant KYC documents
 *   - MarketResearch: Analyze rental market data
 *   - types.ts: Landlord-specific types (LandlordPortfolioStats, PropertyManagementData, etc.)
 *   - hooks.ts: Landlord-specific hooks (useLandlordLeases, useLandlordProperties, etc.)
 *
 * /features/admin/
 *   - KYCQueue: Review pending KYC verifications
 *   - DisputeResolution: Resolve disputes between tenants and landlords
 *   - SystemOverview: Platform metrics and analytics
 *   - types.ts: Admin-specific types (AdminDashboardStats, KYCQueueItem, etc.)
 *   - hooks.ts: Admin-specific hooks (useAdminUsers, usePendingKYC, etc.)
 *
 * /features/shared/
 *   - ProfileSettings: User account management and password changes
 *   - DropzoneImageUploader: Reusable file upload component
 *   - types.ts: Shared types (UserProfile, NotificationData, etc.)
 *   - hooks.ts: Shared hooks (useImageUpload, useFormState, etc.)
 *   - utils.ts: Shared utilities (formatKES, formatDate, debounce, etc.)
 *
 * Key Principles:
 * 1. NO cross-feature imports (tenant/ never imports from landlord/)
 * 2. All shared code goes in features/shared/
 * 3. Each feature has its own types.ts and hooks.ts for independence
 * 4. Services layer (/services/) handles all API communication
 * 5. Components are composable and testable
 *
 * Component Architecture:
 * - All components are functional and use React hooks
 * - State management via React Query for async data
 * - Context providers for auth/theme (in /context/)
 * - No component-level coupling between features
 *
 * Testing:
 * - E2E tests in /e2e/ use Playwright
 * - Critical paths tested: tenant flow, landlord flow, admin flow
 * - Auth fixtures provide pre-authenticated browser contexts
 */

export {};
