// auth.mjs 

import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { AWS_DYNAMO } from "./config.mjs";

const checkCredentials = async (page, username) => {
    try {
        await page.goto("https://bandcamp.com/login", {
            waitUntil: "load",
            timeout: 300000,
        });

        const isUserNameFieldExist = await page.$("#username-field");

        if (!isUserNameFieldExist) {
            return true;
        } else {
            console.log("No cookies found");
            return false;
        }
    } catch (error) {
        console.error(`Error checkCredentials: ${error}`);
        throw error;
    }
};

const saveCookies = async (page, user) => {
    try {
        const cookies = await page.cookies();
        const documentClient = DynamoDBDocument.from(new DynamoDB(AWS_DYNAMO));
        user.bandcamp_cookies = cookies;
        await documentClient.put({ TableName: `regroovio-users-${process.env.STAGE}`, Item: user });
    } catch (err) {
        console.error(`Error saveCookies: ${err}`);
        throw err;
    }
};

const login = async (page, username_bandcamp, password_bandcamp) => {
    await page.goto("https://bandcamp.com/login", {
        waitUntil: "load",
        timeout: 300000,
    });

    await page.type("#username-field", `${username_bandcamp}`);
    await page.type("#password-field", `${password_bandcamp}`);
    await page.click(".buttons button");
    await page.waitForTimeout(5000);

    const isUserNameFieldExist = await page.$("#username-field");

    if (isUserNameFieldExist !== null) {
        console.log("Solving captchas. This will take a moment");
        const { solved, error } = await page.solveRecaptchas();

        if (error) {
            console.error(error);
            throw error;
        }

        if (solved) {
            console.log("Captchas solved");
            await page.waitForTimeout(3000);
            return true;
        }
    } else {
        return true;
    }
};

const authenticateUser = async (page, user) => {
    const { bandcamp_cookies, username, username_bandcamp, password_bandcamp } = user;

    if (bandcamp_cookies?.length) await page.setCookie(...bandcamp_cookies);

    let isAuth = await checkCredentials(page, username);

    if (!isAuth) {
        isAuth = await login(page, username_bandcamp, password_bandcamp);
    }

    if (isAuth) {
        await saveCookies(page, user);
        return isAuth
    } else {
        return isAuth
    }
};

export { authenticateUser };