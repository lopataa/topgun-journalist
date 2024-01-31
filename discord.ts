import {Client, TextChannel} from 'discord.js-selfbot-v13';
import {getRandomTimeBetween} from "./helpers";
// @ts-ignore
import * as schedule from "node-schedule";

type JournalistConfig = {
    token: string;
    channelId: string;
    botUserId: string;
    runAutomatically: boolean;
}

type WeeklyStatusResponse = string;
type DailyStatus = {
    date: string;
    status: string | false;
}

type WeeklyStatus = DailyStatus[];

export class Journalist {
    private client: Client<boolean>;
    private config: JournalistConfig;
    private isReady: boolean = false;


    constructor(config: JournalistConfig) {
        console.log(`[TopGun Journalist] Starting...`);
        this.client = new Client({});
        this.config = config;

        if(this.config.runAutomatically) {
            this.scheduleRun("today");
        }

        new Promise<void>((resolve, reject) => {
            this.client.login(process.env.DISCORD_TOKEN);
            this.client.on('ready', () => {
                console.log(`[TopGun Journalist] Logged in as ${this.client?.user?.tag}.`);
                this.isReady = true;
                resolve();
            });
        });
    }

    getWeeklyStatus() {
        return new Promise<WeeklyStatusResponse>((resolve, reject) => {
            console.log(`[TopGun Journalist] Getting weekly status...`);

            this.client.channels.fetch(this.config.channelId).then((channel) => {

                if (!channel) {
                    console.log(`[TopGun Journalist] Channel not found.`);
                    reject();
                    return;
                }
                if (!channel?.isText()) {
                    console.log(`[TopGun Journalist] Channel is not a text channel.`);
                    reject();
                    return;
                }

                channel = channel as TextChannel;

                console.log(`[TopGun Journalist] Got channel.`);

                channel.sendSlash(this.config.botUserId, "journal", ["status"]).then((message) => {
                    if (!message) {
                        console.log(`[TopGun Journalist] Command failed.`);
                        reject();
                        return;
                    }
                    if (!message?.isMessage) {
                        console.log(`[TopGun Journalist] Command failed.`);
                        reject();
                        return;
                    }
                    console.log(`[TopGun Journalist] Got weekly status.`);
                    resolve(message.content as WeeklyStatusResponse);
                    return;
                });
            });
        });
    }

    parseStatus(status: WeeklyStatusResponse): WeeklyStatus {
        let lines = status.split("\n");
        let weeklyStatus: WeeklyStatus = [];

        for (let line of lines) {
            let parts = line.split(" - ");
            let date = parts[0];
            let status = parts[1] == "❌" ? false : parts[2];

            weeklyStatus.push({
                date: date,
                status: status
            } as DailyStatus);
        }

        return weeklyStatus;
    }

    writeStatus(status: string) {
        return new Promise<void>(async (resolve, reject) => {
            if (!this.isReady) {
                setTimeout(() => {
                    this.writeStatus(status);
                }, 100);
                return;
            }
            console.log(`[TopGun Journalist] Writing daily status...`);

            let channel = await this.client.channels.fetch(this.config.channelId);

            if (!channel) {
                console.log(`[TopGun Journalist] Channel not found.`);
                return reject();
            }
            if (!channel?.isText()) {
                console.log(`[TopGun Journalist] Channel is not a text channel.`);
                return reject();
            }

            channel = channel as TextChannel;

            console.log(`[TopGun Journalist] Got channel.`);

            await channel.sendSlash(this.config.botUserId, "journal add ", [status]);
            console.log(`[TopGun Journalist] Wrote daily status.`);
            resolve();
        });
    }

    async autoRun() {
        // if today is weekend, do nothing
        const today = new Date();
        if(today.getDay() == 0 || today.getDay() == 6) {
            console.log(`[TopGun Journalist] Today is weekend.`);
            // reschedule for next day
            this.scheduleRun("tommorow");
            return;
        }
        const todayString = `${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`;
        console.log(`[TopGun Journalist] Today is ${todayString}.`);

        // find today's status
        const weeklyStatus = await this.getWeeklyStatus();
        const weeklyStatusParsed = this.parseStatus(weeklyStatus);
        for (let dailyStatus of weeklyStatusParsed) {
            if (dailyStatus.date == todayString) {
                if (dailyStatus.status) {
                    console.log(`[TopGun Journalist] Today's status is already written.`);
                    // schedule for tommorow
                    this.scheduleRun("tommorow");
                    return;
                } else {
                    // write status
                    const envMessages = process.env.MESSAGES?.split("|") || [];
                    const message = envMessages[Math.floor(Math.random() * envMessages.length)];
                    console.log(`[TopGun Journalist] Writing status: ${message}`);
                    await this.writeStatus(message);
                }
            }
        }
    }

    scheduleRun(to: "today" | "tommorow") {
        if(!this.config.runAutomatically) {
            console.log(`[TopGun Journalist] Not scheduling run because runAutomatically is false.`);
            return;
        }
        const whenTime = getRandomTimeBetween(process.env.MIN_TIME as string, process.env.MAX_TIME as string); // this is a string in the format of hh:mm
        const [hours, minutes] = whenTime.split(":");
        const today = new Date();
        let time = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes), 0);
        if(to == "tommorow") {
            time = new Date(time.getTime() + 24 * 60 * 60 * 1000);
        }
        console.log(`[TopGun Journalist] Scheduling run for ${time.toISOString()}.`);
        schedule.scheduleJob(time, () => {
            console.log(`[TopGun Journalist] Running scheduled job...`);
            this.autoRun().then(() => {
                console.log(`[TopGun Journalist] Scheduled job finished.`);
            });
        });
    }
}