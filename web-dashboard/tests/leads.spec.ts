import { test, expect } from '@playwright/test';

test.describe('Leads Page', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/leads');
    // Check if redirected to login
    await expect(page).toHaveURL(/.*login/);
  });

  test('should display leads table when authenticated and data is available', async ({ page }) => {
    // Mock the admin/leads API call
    await page.route('**/api/admin/leads*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          leads: [
            {
              _id: '1',
              studentName: 'John Doe',
              phone: '1234567890',
              city: 'Pune',
              qualification: 'BE',
              currentStatus: 'HOT'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            pages: 1
          }
        }),
      });
    });

    // Mock localStorage to simulate being logged in
    await page.addInitScript(() => {
      window.localStorage.setItem('adminToken', 'mock-token');
      window.localStorage.setItem('admin', JSON.stringify({ name: 'Admin User' }));
    });

    await page.goto('/leads');

    // Check for page elements
    await expect(page.getByText('Lead Management')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByText('Pune')).toBeVisible();
    await expect(page.locator('table').getByText('HOT')).toBeVisible();
  });

  test('should filter leads by status', async ({ page }) => {
     // Mock initial load
     await page.route('**/api/admin/leads*', async (route) => {
        const url = new URL(route.request().url());
        const status = url.searchParams.get('status');

        if (status === 'Enrolled') {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    leads: [{ _id: '2', studentName: 'Jane Smith', phone: '0987654321', city: 'Mumbai', qualification: 'MCA', currentStatus: 'Enrolled' }],
                    pagination: { page: 1, limit: 20, total: 1, pages: 1 }
                })
            });
        } else {
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    leads: [{ _id: '1', studentName: 'John Doe', phone: '1234567890', city: 'Pune', qualification: 'BE', currentStatus: 'HOT' }],
                    pagination: { page: 1, limit: 20, total: 1, pages: 1 }
                })
            });
        }
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('adminToken', 'mock-token');
    });

    await page.goto('/leads');

    // Change status filter
    await page.selectOption('select[name="status"]', 'Enrolled');

    // Verify filtered result
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText('John Doe')).not.toBeVisible();
  });
});
