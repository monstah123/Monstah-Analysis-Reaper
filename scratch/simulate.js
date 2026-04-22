const a = { id: 'US30' };
const data = {"longPct":40.9,"shortPct":59.1,"contractsLong":13171,"contractsShort":19011,"changeLong":2505,"changeShort":-3065,"source":"CFTC udgc-27he (2026-04-14)"};
const scores = { gdp: 0, inflation: 0, interestRates: 0, employmentChange: 0 }; // assuming no macro

let cL = data.contractsLong ?? data.iLong ?? null;
let cS = data.contractsShort ?? data.iShort ?? null;
let cPct = null;
let cI = a.cot || 0;

if (cL === null && data.longPct !== undefined) {
    cL = data.longPct;
    cS = data.shortPct;
}

if (typeof cL === 'number' && typeof cS === 'number' && cPct === null) {
    const total = cL + cS;
    if (total > 0) cPct = (cL / total) * 100;
}

let baseCI = 0;
if (cPct !== null) {
    if (cPct >= 70) baseCI = 2;
    else if (cPct >= 52) baseCI = 1;
    else if (cPct <= 30) baseCI = -2;
    else if (cPct <= 48) baseCI = -1;
}

let momentumBoost = 0;
const changeLong = data?.changeLong || 0;
const changeShort = data?.changeShort || 0;
if (changeLong > changeShort + 5000) momentumBoost = 1;
if (changeShort > changeLong + 5000) momentumBoost = -1;

cI = baseCI + momentumBoost;
if (cI > 2) cI = 2;
if (cI < -2) cI = -2;

const usMacroScore = (scores.gdp || 0) + (scores.inflation || 0) + 
                     (scores.interestRates || 0) + (scores.employmentChange || 0);

let macroImpact = usMacroScore;
if (['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD', 'GOLD', 'SILVER'].includes(a.id) || a.category === 'Crypto') {
    macroImpact = -usMacroScore;
} else if (['USDJPY', 'USDCAD', 'USDCHF'].includes(a.id)) {
    macroImpact = usMacroScore;
}

const newTotals = (cI * 3) + macroImpact; 

console.log({ cPct, baseCI, momentumBoost, cI, newTotals });
