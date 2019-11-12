const iso8601DurationRegex = /(-)?P(?:([.\d]+)Y)?(?:([.\d]+)M)?(?:([.\d]+)W)?(?:([.\d]+)D)?(?:T|$)(?:([.\d]+)H)?(?:([.\d]+)M)?(?:([.\d]+)S)?/;

interface Duration {
    negate: boolean;
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const cache: {[key: string]: Duration} = {};

function parseWithCache(s: string): Duration {
    if (!(s in cache)) cache[s] = parse(s);
    return cache[s];
}

export { parseWithCache as parse };

const parse = function (iso8601Duration: string): Duration {
    const matches = iso8601Duration.match(iso8601DurationRegex);
    if (!matches) throw new Error(`invalid format "${iso8601Duration}"`);
    return {
        negate: matches[1] === '-',
        years: matches[2] === undefined ? 0 : Number(matches[2]),
        months: matches[3] === undefined ? 0 : Number(matches[3]),
        days: 7 * (matches[4] === undefined ? 0 : Number(matches[4]))
            + (matches[5] === undefined ? 0 : Number(matches[5])),
        hours: matches[6] === undefined ? 0 : Number(matches[6]),
        minutes: matches[7] === undefined ? 0 : Number(matches[7]),
        seconds: matches[8] === undefined ? 0 : Number(matches[8])
    };
};

export function add(d: Date, o: Duration) {
    const abs = o.negate ? -1 : 1;
    if (o.seconds || o.minutes || o.hours) d.setSeconds(d.getSeconds() + abs * (o.seconds + 60*o.minutes + 3600*o.hours));
    if (o.days) d.setDate(d.getDate() + abs * o.days);
    if (o.months) d.setMonth(d.getMonth() + abs * o.months);
    if (o.years) d.setFullYear(d.getFullYear() + abs * o.years);
}
