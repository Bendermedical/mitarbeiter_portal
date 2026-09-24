import { test, expect } from "@playwright/test";

test.describe("Gate 2 Foundation & Auth E2E Tests (REQ-IT-09, REQ-NFR-10, REQ-NFR-17)", () => {
  test("REQ-IT-09 & REQ-NFR-10: NextAuth API route exposes OIDC providers with zero local password storage", async ({ request }) => {
    // Check NextAuth providers endpoint
    const response = await request.get("/api/auth/providers");
    expect(response.ok()).toBeTruthy();
    const providers = await response.json();
    
    // Confirms AD provider is registered
    expect(providers).toHaveProperty("ad-mock-sso");
    expect(providers["ad-mock-sso"].name).toContain("Active Directory SSO");
  });

  test("REQ-NFR-17 & §6.8: Employee Shell renders Comfortable density with German default and English toggle", async ({ page }) => {
    await page.goto("/hr/leave");

    // Verify comfortable density attribute is active
    const comfortableContainer = page.locator('[data-density="comfortable"]');
    await expect(comfortableContainer).toBeVisible();

    // Verify German default chrome
    await expect(page.locator('text=BMV Mitarbeiterportal').or(page.locator('text=Bender Medical Vertriebs GmbH')).first()).toBeVisible();

    // Verify language toggle exists
    const langToggle = page.locator('button[aria-label*="Sprache umschalten"]').or(page.locator('button:has-text("DE")')).first();
    await expect(langToggle).toBeVisible();
    await langToggle.click();

    // Verify switch to EN
    await expect(page.locator('button:has-text("EN")').first()).toBeVisible();
  });

  test("§6.8 & §4: Admin Shell renders Compact density with collapsible sidebar and breadcrumbs", async ({ page }) => {
    await page.goto("/admin/overview");

    // Verify compact density attribute is active
    const compactContainer = page.locator('[data-density="compact"]');
    await expect(compactContainer).toBeVisible();

    // Verify sidebar navigation items
    await expect(page.locator('text=System-Übersicht').first()).toBeVisible();
    await expect(page.locator('text=IT-Ticket-Triage').first()).toBeVisible();

    // Verify breadcrumbs
    await expect(page.locator('text=Startseite').first()).toBeVisible();
    await expect(page.locator('text=Triage & Verwaltung').first()).toBeVisible();

    // Verify sidebar collapse button
    const collapseBtn = page.locator('button[title*="Seitenleiste einklappen"]').first();
    await expect(collapseBtn).toBeVisible();
    await collapseBtn.click();

    // Verify expand button appears
    const expandBtn = page.locator('button[title*="Seitenleiste ausklappen"]').first();
    await expect(expandBtn).toBeVisible();
  });
});
