require('dotenv').config()

if (!process.env.DISCORD_TOKEN) {
    console.error('Missing DISCORD_TOKEN environment variable')
    process.exit(1)
}

import {Journalist} from "./discord";

const journalist = new Journalist(
    {
        token: process.env.DISCORD_TOKEN as string,
        channelId: process.env.CHANNEL_ID as string,
        botUserId: process.env.BOT_USER_ID as string,
        runAutomatically: true // dont forget to add time range to .env.placeholder file
    }
);
