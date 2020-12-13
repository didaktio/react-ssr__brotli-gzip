export const formats = [
    'clock',
    'nanoseconds',
    'milliseconds',
    'microseconds',
    'seconds',
    'hours',
    'minutes',
    'days'
] as const;

export type TimeFormat = typeof formats[number];

export const speeds = [
    '1x',
    '2x',
    '4x',
    '10x',
    '100x'
] as const;
export type Speed = typeof speeds[number];
export const speedToMilliseconds = (speed: Speed) =>
speed === '1x' ? 1000
: speed === '2x' ? 500
: speed === '4x' ? 250
: speed === '10x' ? 100
: 10

export const formatSeconds = (format: TimeFormat, seconds: number) => format === 'seconds' ? `${seconds}s`
    : format === 'milliseconds' ? `${seconds * 1000}ms`
        : format === 'microseconds' ? `${seconds * 1000000}μs`
            : format === 'nanoseconds' ? `${(seconds * 1000000000).toLocaleString()}ns`
                : format === 'minutes' ? `${Math.round(seconds / 60)}mins`
                    : format === 'hours' ? `${Math.round(seconds / 3600)}hrs`
                        : format === 'days' ? `${Math.round(seconds / 86400)}days`
                            : secsToHHMMSS(seconds);

const secsToHHMMSS = (seconds: number) => {
    let hrs: (number | string) = Math.floor(+seconds / 3600),
        mins: (number | string) = Math.floor((+seconds - (hrs * 3600)) / 60),
        secs: (number | string) = Math.floor(+seconds - (hrs * 3600) - (mins * 60));

    if (hrs < 10) hrs = '0' + hrs;
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;
    return `${hrs}:${mins}:${secs}`.split('.')[0];
}