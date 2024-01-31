export function getRandomTimeBetween(time1: string, time2: string) {
    // both strings are in the format of hh:mm
    const time1Split = time1.split(':');
    const time2Split = time2.split(':');

    const time1Hours = parseInt(time1Split[0]);
    const time1Minutes = parseInt(time1Split[1]);

    const time2Hours = parseInt(time2Split[0]);
    const time2Minutes = parseInt(time2Split[1]);

    const time1TotalMinutes = time1Hours * 60 + time1Minutes;
    const time2TotalMinutes = time2Hours * 60 + time2Minutes;

    const randomMinutes = Math.floor(Math.random() * (time2TotalMinutes - time1TotalMinutes + 1) + time1TotalMinutes);

    return `${Math.floor(randomMinutes / 60)}:${randomMinutes % 60}`;
}