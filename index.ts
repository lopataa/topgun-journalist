import {getRandomTimeBetween} from "./helpers";

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
        runAutomatically: false // dont forget to add time range to .env.placeholder file
    }
);

journalist.autoRun().then(() => {
    console.log(`[TopGun Journalist] Done.`);
});
