interface IntervalHelper {
    excludeLeft: boolean
    excludeRight: boolean
    min: number | undefined
    max: number | undefined
}

const cache: {[key: string]: IntervalHelper} = {};

function parseWithCache(s: string | null): IntervalHelper {
    if (s === null) s = "";
    if (!(s in cache)) cache[s] = parse(s);
    return cache[s];
}

export { parseWithCache as parse };

function parse(s: string | null): IntervalHelper {
    const o: IntervalHelper = {excludeLeft: false, excludeRight: false, min: undefined, max: undefined};

    let state: 0|1|2|3|4;
    let pos: number = state = 0;
    let queue: string = "";
    if (s === null) s = "";

    while(pos < s.length) {
        switch (state) {
            case 0:
                switch (s[pos]) {
                    case '(': o.excludeLeft = true; break;
                    case '[': o.excludeLeft = false; break;
                    default: throw new Error("unexpected token")
                }
                pos++;
                queue = "";
                state = 1;
                break;

            case 1:
                if (s[pos] != ':') {
                    queue += s[pos++];
                } else {
                    o.min = parseMaybeFloat(queue);
                    pos++;
                    queue = "";
                    state = 2;
                }
                break;

            case 2:
                if (s[pos] != ')' && s[pos] != ']') {
                    queue += s[pos++];
                } else {
                    o.max = parseMaybeFloat(queue);
                    queue = "";
                    state = 3;
                }
                break;

            case 3:
                switch (s[pos]) {
                    case ')': o.excludeRight = true; break;
                    case ']': o.excludeRight = false; break;
                    default: throw new Error("unexpected token")
                }
                pos++;
                state = 4;
                break;
            default: throw new Error("unexpected token")
        }
    }

    if (state !== 0 && state !== 4) {
        throw new Error("unexpected token")
    }

    if (!validate(o)) throw new Error("invalid format");

    return o;
}

function parseMaybeFloat(s: string): undefined | number {
    if (s === "") return undefined;
    const v = parseFloat(s);
    if (isNaN(v)) throw new Error("invalid token");
    return v;
}

function validate(o: IntervalHelper): boolean {
    if (o.min === undefined || o.max === undefined) return true;
    return (!o.excludeLeft && !o.excludeRight) ? o.min <= o.max : o.min < o.max;
}
