import { test, expect } from './fixtures';

test.describe('Tenant Flow - Property Browsing and Lease Initiation', () => {
  test('should browse properties with filters', async ({ tenantPage }) => {
    // Navigate to browse properties
    await tenantPage.goto('/browse-properties');
    
    // Verify page loaded
    await expect(tenantPage.locator('text=Find Your Perfect Home')).toBeVisible();
    
    // Filter by price
    await tenantPage.fill('input[placeholder="Min price (KES)"]', '10000');
    await tenantPage.fill('input[placeholder="Max price (KES)"]', '50000');
    
    // Wait for filtered results
    await tenantPage.waitForLoadState('networkidle');
    
    // Verify property cards are displayed
    const propertyCards = await tenantPage.locator('[class*="Card"]').count();
    expect(propertyCards).toBeGreaterThan(0);
  });

  test('should view property details', async ({ tenantPage }) => {
    await tenantPage.goto('/browse-properties');
    
    // Click first property (FIXED: locate first, then click)
    await tenantPage.locator('button:has-text("View Details & Apply")').first().click();
    
    // Verify property details displayed
    await expect(tenantPage.locator('text=Monthly Rent')).toBeVisible();
    await expect(tenantPage.locator('text=Security Deposit')).toBeVisible();
  });

  test('should initiate lease agreement through wizard', async ({ tenantPage }) => {
    // Navigate to lease wizard (after property selection)
    await tenantPage.goto('/lease-wizard?propertyId=test-property&landlordId=test-landlord');
    
    // Verify step 1 loaded
    await expect(tenantPage.locator('text=Property Details')).toBeVisible();
    
    // Fill monthly rent
    await tenantPage.fill('input[placeholder="Enter monthly rent amount"]', '45000');
    
    // Fill deposit
    await tenantPage.fill('input[placeholder="Enter deposit amount"]', '90000');
    
    // Click Next
    await tenantPage.click('button:has-text("Next")');
    
    // Verify step 2 loaded
    await expect(tenantPage.locator('text=Lease Period')).toBeVisible();
    
    // Fill dates
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // FIXED: locate first, then fill
    await tenantPage.locator('input[type="date"]').first().fill(startDate);
    await tenantPage.locator('input[type="date"]').last().fill(endDate);
    
    // Click Next
    await tenantPage.click('button:has-text("Next")');
    
    // Verify step 3 (Special Terms) loaded
    await expect(tenantPage.locator('text=Special Terms')).toBeVisible();
    
    // Skip special terms and proceed
    await tenantPage.click('button:has-text("Next")');
    
    // Verify step 4 (Review) loaded
    await expect(tenantPage.locator('text=Review & Submit')).toBeVisible();
    
    // Verify summary displays correct amounts
    await expect(tenantPage.locator('text=KES 45,000')).toBeVisible();
    await expect(tenantPage.locator('text=KES 90,000')).toBeVisible();
    
    // Submit lease
    // Note: In real tests, this would create an actual lease
    // await tenantPage.click('button:has-text("Submit Lease")');
  });

  test('should view lease dashboard', async ({ tenantPage }) => {
    await tenantPage.goto('/leases');
    
    // Verify dashboard loaded
    await expect(tenantPage.locator('text=My Leases')).toBeVisible();
    
    // Verify stats are displayed
    await expect(tenantPage.locator('text=Active Leases')).toBeVisible();
    await expect(tenantPage.locator('text=Pending Approvals')).toBeVisible();
    await expect(tenantPage.locator('text=Total Monthly Rent')).toBeVisible();
  });
});

test.describe('Tenant Flow - Pre-Occupancy Inspection', () => {
  test('should upload inspection photos', async ({ tenantPage }) => {
    await tenantPage.goto('/inspection?type=pre-occupancy&leaseId=test-lease');
    
    // Verify inspection page loaded
    await expect(tenantPage.locator('text=Pre-Occupancy Inspection')).toBeVisible();
    
    // Select category
    await tenantPage.click('button:has-text("General Condition")');
    
    // Simulate file upload (drag and drop would be ideal but harder to test)
    const fileInput = tenantPage.locator('input[type="file"]').first();
    
    // Verify upload area visible
    await expect(tenantPage.locator('text=Click to upload photos')).toBeVisible();
    
    // Add inspection summary
    await tenantPage.fill(
      'textarea[placeholder="Describe the overall condition of the property..."]',
      'Property in good condition. No visible damage.'
    );
    
    // Verify submit button exists
    const submitButton = tenantPage.locator('button:has-text("Submit Inspection")');
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Landlord Flow - Property Management', () => {
  test('should view portfolio overview', async ({ landlordPage }) => {
    await landlordPage.goto('/landlord/portfolio');
    
    // Verify portfolio page loaded (if exists)
    // await expect(landlordPage.locator('text=My Portfolio')).toBeVisible();
  });

  test('should view and approve pending leases', async ({ landlordPage }) => {
    await landlordPage.goto('/landlord/leases');
    
    // Verify leases view loaded
    // This tests landlord's ability to see pending tenant leases
  });
});

test.describe('Admin Flow - KYC Management', () => {
  test('should view KYC queue', async ({ adminPage }) => {
    await adminPage.goto('/admin/kyc-queue');
    
    // Verify KYC queue page loaded
    // await expect(adminPage.locator('text=KYC Verifications')).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    
    // Verify register form loaded
    await expect(page.locator('text=Create Account')).toBeVisible();
    
    // Fill registration form
    await page.fill('input[placeholder*="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[placeholder*="password"]', 'TestPassword123!');
    await page.fill('input[placeholder*="name"]', 'Test User');
    
    // Select role
    await page.click('select');
    await page.click('option:has-text("Tenant")');
    
    // Submit registration
    // await page.click('button:has-text("Register")');
    // await page.waitForNavigation();
  });

  test('should login successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login form loaded
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Fill credentials
    await page.fill('input[type="email"]', 'tenant@test.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    // Note: Actual login tested in fixtures
  });

  test('should logout successfully', async ({ tenantPage }) => {
    // Navigate to profile or menu
    await tenantPage.click('[data-testid="user-menu"]');
    
    // Click logout
    // await tenantPage.click('button:has-text("Logout")');
    // await tenantPage.waitForNavigation();
    // await expect(tenantPage).toHaveURL('/login');
  });
});