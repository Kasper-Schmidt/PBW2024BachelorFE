import { test, expect, devices } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:4200');

  await expect(page).toHaveTitle(/Bachelorfe/);
});

test('has sidebar component', async ({ page }) => {
  await page.goto('localhost:4200');
  const sidebar = page.locator('.userSideList');
  await expect(sidebar).toBeVisible();

  const userRows = sidebar.locator('.user-item');

  await expect(userRows.count()).resolves.toBeGreaterThan(0);
});

test('test search input ensures exact user match', async ({ page }) => {
  await page.goto('localhost:4200');

  const sidebar = page.locator('.userSideList');
  const userRows = sidebar.locator('.user-item');
  const searchInput = sidebar.locator('#searchField');

  // Log alle brugere
  const initialUserCount = await userRows.count();
  console.log(`Initial user count: ${initialUserCount}`);
  for (let i = 0; i < initialUserCount; i++) {
    const userText = await userRows.nth(i).innerText();
    console.log(`Initial User ${i + 1}: ${userText}`);
  }

  await expect(searchInput).toBeVisible();
  await searchInput.fill('mathias christensen');

  // waitForSelector til at finde matchende brugere
  await page.waitForSelector('.user-item:has-text("mathias christensen")');

  // Filtrerer brugere som matcher
  const filteredUsers = userRows.filter({ hasText: 'mathias christensen' });
  const filteredUserCount = await filteredUsers.count();
  console.log(`Filtered user count (exact match): ${filteredUserCount}`);

  for (let i = 0; i < filteredUserCount; i++) {
    const userText = await filteredUsers.nth(i).innerText();
    console.log(`Filtered User ${i + 1}: ${userText}`);
  }

  // Verificer resultater
  const filteredUserName = (await filteredUsers.first().innerText())
    .replace(/^MC\s/, '')
    .toLowerCase()
    .trim(); // fjerner mc i 'mc mathias christensen'
  console.log(`Final matched user: ${filteredUserName}`);
  expect(filteredUserCount).toBe(1);
  expect(filteredUserName).toBe('mathias christensen');
});

// TODO WIP
test('does show selected user', async ({ page }) => {
  await page.goto('localhost:4200');
  const sidebar = page.locator('.userSideList');
  await expect(sidebar).toBeVisible();

  const userRows = sidebar.locator('.user-item');
  const userCount = await userRows.count();
  console.log(`Number of users: ${userCount}`);
  expect(userCount).toBeGreaterThan(0);

  const user = userRows.filter({ hasText: 'mathias christensen' });
  console.log('User exists:', await user.count());
  expect(await user.count()).toBeGreaterThan(0);

  const userName = await user.first().innerText();
  console.log('User name clicked:', userName);

  // Henter klasserne for knappen (user element)
  const userClasses = await user.first().getAttribute('class');
  const classList = userClasses?.split(' ') || []; // Splitter strengen til et array

  console.log('User classes:', classList);

  // Tjekker om klassen eksisterer
  let hasBgSurfaceClass = false;
  for (const className of classList) {
    if (className.includes('bg-surface')) {
      hasBgSurfaceClass = true;
      break;
    }
  }

  expect(hasBgSurfaceClass).toBe(true);

  const userNameAfterClick = await user.first().innerText();
  console.log('User name after click:', userNameAfterClick);
});

test('test search input ensures exact user match', async ({ page }) => {
  await page.goto('localhost:4200');

  const sidebar = page.locator('app-user-side-component');
  const userRows = sidebar.locator('.user-item');
  const searchInput = sidebar.locator('#searchField');

  // Log alle brugere
  const initialUserCount = await userRows.count();
  for (let i = 0; i < initialUserCount; i++) {
    const userText = await userRows.nth(i).innerText();
  }

  await expect(searchInput).toBeVisible();
  await searchInput.fill('mathias christensen');

  // waitForSelector til at finde matchende brugere
  await page.waitForSelector('.user-item:has-text("mathias christensen")');

  // Filtrerer brugere som matcher
  const filteredUsers = userRows.filter({ hasText: 'mathias christensen' });
  const filteredUserCount = await filteredUsers.count();

  for (let i = 0; i < filteredUserCount; i++) {
    const userText = await filteredUsers.nth(i).innerText();
  }

  // Verificer resultater
  const filteredUserName = (await filteredUsers.first().innerText())
    .replace(/^[A-Z]{2,}\s/, '')
    .toLowerCase()
    .trim();
  expect(filteredUserCount).toBe(1);
  expect(filteredUserName).toBe('mathias christensen');
});

test('Skift til forrige uge ved klik på navigation', async ({ page }) => {
  await page.goto('http://localhost:4200');

  const currentWeekElement = page.locator(
    'a.fc-timegrid-axis-cushion.fc-scrollgrid-shrink-cushion.fc-scrollgrid-sync-inner'
  );
  const currentWeek = await currentWeekElement.innerText();

  const currentWeekNumber = parseInt(currentWeek.replace('W ', ''), 10);
  const previousWeekNumber = currentWeekNumber - 1;

  const weekBefore = page.locator(
    'button.fc-prev-button.fc-button-primary >> span.fc-icon.fc-icon-chevron-left'
  );
  await weekBefore.click();

  await expect(page.locator(`text=W ${previousWeekNumber}`)).toBeVisible();
});

test('Skift til næste uge ved klik på navigation', async ({ page }) => {
  await page.goto('http://localhost:4200');

  const currentWeekElement = page.locator(
    'a.fc-timegrid-axis-cushion.fc-scrollgrid-shrink-cushion.fc-scrollgrid-sync-inner'
  );
  const currentWeek = await currentWeekElement.innerText();

  const currentWeekNumber = parseInt(currentWeek.replace('W ', ''), 10);
  let nextWeekNumber = currentWeekNumber + 1;

  if (nextWeekNumber == 53) {
    nextWeekNumber = 1;
  }

  const nextWeek = page.locator(
    'button.fc-next-button.fc-button-primary >> span.fc-icon.fc-icon-chevron-right'
  );
  await nextWeek.click();
  await expect(page.locator(`text=W ${nextWeekNumber}`)).toBeVisible();
});

test('count calendar rows when week is selected', async ({ page }) => {
  await page.goto('http://localhost:4200');

  const weekBtn = page.locator('.fc-timeGridWeek-button');
  await expect(weekBtn).toHaveClass(/button-active/);

  const weekView = page.locator('.fc-timeGridWeek-view');
  await expect(weekView).toBeVisible();

  const dayBtn = page.locator('.fc-timeGridDay-button');
  dayBtn.click();
  await expect(dayBtn).toHaveClass(/button-active/);

  const monthBtn = page.locator('.fc-dayGridMonth-button');
  monthBtn.click();
  await expect(monthBtn).toHaveClass(/button-active/);
});

test('click user, and view events', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(3000);

  await page.locator('.user-item').first().click();

  await page.waitForTimeout(1000);

  const events = page.locator('.fc-event-main');
  const eventCount = await events.count();

  if (eventCount > 0) {
    console.log(`Found ${eventCount} event(s) in the calendar`);
    expect(eventCount).toBeGreaterThan(0);
  } else {
    console.log('No events found in the calendar');
    expect(eventCount).toBe(0);
  }
});

test('test with mobile resolution', async ({ browser }) => {
  const iphone = devices['iPhone 13'];

  // Create a new context with the device settings
  const context = await browser.newContext({
    ...iphone, // Apply the iPhone 13 settings
  });

  const page = await context.newPage();
  await page.goto('http://localhost:4200');
  await page.waitForTimeout(3000);

  const header = page.locator('app-m-header');
  expect(header).toBeVisible();

  const toggleBtn = page.locator('.toggleUserMenuBtn');
  expect(toggleBtn).toBeVisible();

  await toggleBtn.click();
  await page.waitForSelector('.header_userSide');

  const userList = page.locator('.header_userSide');

  await userList.locator('.user-item').first().click();
  await page.waitForTimeout(1000);

  let avatars = await header.locator('app-user-avatar').count();
  expect(avatars).toEqual(1);
});
