// app.mjs

import { AUTH_LAMBDA } from './common/config.mjs';
import { saveTokens } from "./common/saveTokens.mjs";
import { saveCookies } from "./common/saveCookies.mjs";
import { getUserById } from './common/getUserById.mjs';
import { initializePuppeteer } from "./common/browser.mjs";

const runApp = async (event, context) => {
    const user_id = event.user_id || event.queryStringParameters.user_id;
    const { browser, page } = await initializePuppeteer(event);
    let user;

    try {
        user = await getUserById(user_id);
        if (!user) {
            throw new Error('User not found');
        }
    } catch (err) {
        throw new Error(`Error retrieving user from DynamoDB: ${err}`);
    }

    console.log(`Logging in to: ${user.username_spotify}`);
    try {
        await handleAuthentication(page, user);
        const tokens = await getTokens(page);

        await page.close();
        await browser.close();
        await saveTokens(user, tokens);

        return tokens.access_token
    } catch (err) {
        throw new Error(`Error retrieving token: ${err}`);
    }
};

const handleAuthentication = async (page, user) => {
    let access_token = null;
    if (user.refresh_token) {
        console.log('Refreshing token');
        try {
            await page.goto(`${AUTH_LAMBDA}/refresh?refresh_token=${user.refresh_token}`);
            const tokens = await getTokens(page);
            access_token = tokens.access_token;
        } catch (err) {
            console.log(`Error refreshing token: ${err}`);
        }
    }
    if (!access_token) {
        if (!user.spotify_cookies?.length) {
            console.log('Logging in using credentials');
            await page.goto(`${AUTH_LAMBDA}/login`);
        } else {
            console.log('Using cookies');
            await page.setCookie(...user.spotify_cookies);
            await page.goto(`${AUTH_LAMBDA}/login`);
        }
        await enterCredentialsAndAcceptAuth(page, user);
    }
};

const enterCredentialsAndAcceptAuth = async (page, user) => {
    try {
        await page.type('#login-username', user.username_spotify);
        await page.type('#login-password', user.password_spotify);
        await page.click('#login-button');
        await saveCookies(page, user);
    } catch { }

    try {
        await page.waitForSelector('[data-testid="auth-accept"]', { timeout: 1000 });
        await page.click('[data-testid="auth-accept"]');
        await saveCookies(page, user);
    } catch (err) {
        if (err.name !== 'TimeoutError') {
            console.log(`Error accepting authorization: ${err}`);
        }
    }
};

const getTokens = async (page) => {
    await page.waitForSelector('pre');
    return JSON.parse(await page.evaluate(() => document.querySelector('pre').innerText));
};

export { runApp };
