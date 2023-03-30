// custom.mjs

import { createTable } from './common/createTable.mjs';
import { CUSTOM } from './common/config.mjs';
import { initializePuppeteer } from './common/browser.mjs';
import { getAlbumLinks } from './common/getAlbumLinks.mjs';
import { addAlbumsToDb } from './common/addAlbumsToDb.mjs';
import dotenv from "dotenv";
dotenv.config();

const collectAlbumLinks = async (page, genre) => {
    console.log(`getting ${genre}...`);

    const url = `https://bandcamp.com/tag/${genre}?tab=all_releases` // ${query ? `&s=${query}` : ""}

    try {
        await page.goto(url, {
            waitUntil: 'load',
            timeout: 300000,
        });
    } catch (error) {
        console.log(`Failed to load page: ${error}`);
        throw error;
    }

    const links = new Set();
    let prevSize = 0, newSize = 1;

    while (prevSize < newSize) {
        prevSize = newSize
        await loadMoreAlbums(page);
        const albumLinks = await getAlbumLinks(page, CUSTOM.SELECTOR);
        const validAlbumLinks = albumLinks.filter(isValidLink);
        validAlbumLinks.forEach(link => links.add(link));
        newSize = links.size;
        console.log(`[${prevSize ? prevSize : 0}/${newSize}] albums loaded...`);
    };

    return [...links];
};


const loadMoreAlbums = async (page) => {
    try {
        await page.waitForSelector(".view-more");
        const loadMoreButton = await page.$(".view-more");
        if (loadMoreButton) {
            await loadMoreButton.click();
        }
    } catch (err) { }
};

const isValidLink = (link) => {
    try {
        return link.includes("com/album") || link.includes("com/track");
    } catch (error) {
        console.error(error);
        return false;
    }
};

const runApp = async (event) => {
    try {
        const { genre } = event || queryStringParameters;
        if (!genre) {
            throw new Error('Missing required parameters');
        }
        const table = `bandcamp-${genre}-${process.env.STAGE}`;
        await createTable(table);
        const { browser, page } = await initializePuppeteer(event);
        const albumLinks = await collectAlbumLinks(page, genre);
        await page.close();
        await browser.close();
        await addAlbumsToDb(table, albumLinks);
        return { message: 'done' };
    } catch (error) {
        throw new Error(`Error app: ${error}`);
    }
};


export { runApp };
