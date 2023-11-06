
export function mix_hexes_naive(...hexes: string[]) {
    const rgbs = hexes.map(hex => hex2dec(hex));
    const rgb = rgbs.reduce((acc, cur) => {
        cur.forEach((e, i) => acc[i] = acc[i] ? acc[i] + e : e);
        return acc;
    }, []).map(e => e / rgbs.length);
    const mixture = rgb2hex(rgb[0], rgb[1], rgb[2]);
    return mixture;
}

function hex2dec(hex: string): number[] {
    let breakdown = hex.replace('#', '').match(/.{2}/g);
    breakdown = (breakdown == null ? ['0', '0', '0'] : breakdown);
    return breakdown.map(n => parseInt(n, 16));
}

function rgb2hex(r: number, g: number, b: number): string {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function rgb2cmyk(r: number, g: number, b: number): number[] {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    if (k != 1) {
        c = (c - k) / (1 - k);
        m = (m - k) / (1 - k);
        y = (y - k) / (1 - k);
    } else {
        c = m = y = 0;
    }
    return [c, m, y, k];
}

function cmyk2rgb(c: number, m: number, y: number, k: number): number[] {
    let r = c * (1 - k) + k;
    let g = m * (1 - k) + k;
    let b = y * (1 - k) + k;
    r = (1 - r) * 255 + .5;
    g = (1 - g) * 255 + .5;
    b = (1 - b) * 255 + .5;
    return [r, g, b];
}


function mix_cmyks(...cmyks: number[][]):number[] {
    let c = cmyks.map(cmyk => cmyk[0]).reduce((a, b) => a + b, 0) / cmyks.length;
    let m = cmyks.map(cmyk => cmyk[1]).reduce((a, b) => a + b, 0) / cmyks.length;
    let y = cmyks.map(cmyk => cmyk[2]).reduce((a, b) => a + b, 0) / cmyks.length;
    let k = cmyks.map(cmyk => cmyk[3]).reduce((a, b) => a + b, 0) / cmyks.length;
    return [c, m, y, k];
}

export function mix_hexes(...hexes: string[]):string {
    let rgbs = hexes.map(hex => hex2dec(hex));
    let cmyks = rgbs.map(rgb => rgb2cmyk(rgb[0], rgb[1], rgb[2]));
    let mix_cmyk = mix_cmyks(...cmyks);
    let mix_rgb = cmyk2rgb(mix_cmyk[0], mix_cmyk[1], mix_cmyk[2], mix_cmyk[3]);
    let mix_hex = rgb2hex(mix_rgb[0], mix_rgb[1], mix_rgb[2]);
    return mix_hex;
}