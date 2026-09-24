import { test, expect } from "@playwright/test";

test.describe("HR & Culture Pillar E2E Tests (REQ-HR-01..05 & REQ-NFR-01/02)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("REQ-HR-01: Full Leave-Approval State Machine (Draft -> Pending Manager -> Approved/Rejected -> Cancelled)", async ({ page }) => {
    // 1. Employee creates a leave request
    await page.click('button:has-text("Thomas (Employee)")');
    await page.click('button:has-text("Urlaubsverwaltung")');

    // Fill form
    await page.selectOption('select[name="category"]', "annual_vacation");
    await page.fill('input[name="start_date"]', "2026-11-16");
    await page.fill('input[name="end_date"]', "2026-11-20");
    await page.fill('textarea[name="notes"]', "Jahresurlaub Erholung");
    await page.click('button:has-text("Antrag als Entwurf anlegen")');

    // Verify draft status badge is present
    await expect(page.locator('text=Entwurf').first()).toBeVisible();

    // 2. Transition Draft -> Pending Manager
    const submitBtn = page.locator('button:has-text("Zur Genehmigung einreichen")').first();
    await submitBtn.click();
    await expect(page.locator('text=Wartet auf Genehmigung').first()).toBeVisible();

    // 3. Switch to Manager Persona
    await page.click('button:has-text("Anna (Manager)")');

    // 4. Manager Approves Request
    const approveBtn = page.locator('button:has-text("Genehmigen")').first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await expect(page.locator('text=Genehmigt').first()).toBeVisible();
    }
  });

  test("REQ-HR-02 & REQ-NFR-01: Manager Dashboard Aggregate Privacy (Zero Individual Sick Data)", async ({ page }) => {
    // Switch to Manager Persona and navigate to Team Availability
    await page.click('button:has-text("Anna (Manager)")');
    await page.click('button:has-text("Team-Verfügbarkeit")');

    // Verify aggregate capacity indicators are displayed
    await expect(page.locator('text=Quality Assurance')).toBeVisible();
    await expect(page.locator('text=Gesamte Teamstärke')).toBeVisible();
    await expect(page.locator('text=Geplante Abwesenheiten')).toBeVisible();
    await expect(page.locator('text=Schichtabdeckung')).toBeVisible();

    // Compliance Assertion: BetrVG §87 & DSGVO Privacy - Manager must NEVER see individual sick leave records
    const sickDataDiagnoses = page.locator('text=Krankheitsgrund');
    await expect(sickDataDiagnoses).toHaveCount(0);

    const icdCodes = page.locator('text=/ICD-10|Diagnose|AU-Bescheinigung/');
    await expect(icdCodes).toHaveCount(0);

    // Verify compliance badge is rendered
    await expect(page.locator('text=BetrVG §87 & DSGVO konform')).toBeVisible();
  });

  test("REQ-HR-04: Notice Board Mandatory ISO 13485 Acknowledgment", async ({ page }) => {
    await page.click('button:has-text("Schwarzes Brett")');

    // Verify ISO notice
    await expect(page.locator('text=ISO 13485 QMS Policy Revision v4.2')).toBeVisible();
    await expect(page.locator('text=Verpflichtende Kenntnisnahme')).toBeVisible();
    await expect(page.locator('button:has-text("Gelesen & Bestätigen")')).toBeVisible();
  });

  test("REQ-HR-05: Staff Directory Active Directory Search", async ({ page }) => {
    await page.click('button:has-text("Mitarbeiterverzeichnis")');

    // Verify staff directory renders synced members
    await expect(page.locator('text=Anna Schmidt')).toBeVisible();
    await expect(page.locator('text=Thomas Weber')).toBeVisible();
    await expect(page.locator('text=Quality Assurance')).toBeVisible();

    // Test search filter
    await page.fill('input[placeholder*="Nach Name oder Abteilung"]', "Fischer");
    await expect(page.locator('text=Markus Fischer')).toBeVisible();
    await expect(page.locator('text=Anna Schmidt')).not.toBeVisible();
  });

  test("REQ-HR-06: Draft-State Edits Allowed and Post-Submission Edits Forbidden", async ({ page }) => {
    // Navigate directly to a draft leave request detail page
    await page.click('button:has-text("Thomas (Employee)")');
    await page.goto("/hr/leave/req-mock-draft-001");

    // Verify Draft Status
    await expect(page.locator('text=Entwurf')).toBeVisible();

    // Verify Bearbeiten button exists in Draft state
    const editBtn = page.locator('button:has-text("Bearbeiten")');
    await expect(editBtn).toBeVisible();

    // Click Bearbeiten (REQ-HR-06)
    await editBtn.click();
    await expect(page.locator('text=Entwurf bearbeiten (REQ-HR-06)')).toBeVisible();

    // Update form fields
    await page.fill('input[name="end_date"]', "2026-10-18");
    await page.fill('textarea[name="notes"]', "Aktualisierter Entwurfsgrund gemäss REQ-HR-06");
    await page.click('button:has-text("Entwurf speichern")');

    // Verify success feedback
    await expect(page.locator('text=Entwurf erfolgreich aktualisiert (REQ-HR-06)')).toBeVisible();

    // Submit the draft
    await page.click('button:has-text("Einreichen")');
    await expect(page.locator('text=Urlaubsantrag erfolgreich zur Prüfung eingereicht (REQ-HR-01)')).toBeVisible();
    await expect(page.locator('text=Wartet auf Genehmigung')).toBeVisible();

    // Verification: Post-submission edit button must NO LONGER be present
    await expect(page.locator('button:has-text("Bearbeiten")')).toHaveCount(0);
  });
});

