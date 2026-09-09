
import { CalculationResult, PlotData, ChartDataset } from "../types";

// --- CONSTANTS ---
const G = 6.67430e-11; // Gravitational constant (m^3 kg^-1 s^-2)
const g = 9.80665; // Standard gravity (m/s^2)
const k_coulomb = 8.9875517923e9; // Coulomb's constant (N m^2 C^-2)

// --- HELPER FUNCTIONS ---
const range = (start: number, stop: number, step: number = 1) => Array.from({ length: Math.floor((stop - start) / step) + 1}, (_, i) => start + i * step);

const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
};

const combinations = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
};

// Abramowitz and Stegun approximation for erf(x)
const erf = (x: number): number => {
    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
};

const normalCdf = (x: number, mean: number, stdDev: number): number => {
    if (stdDev <= 0) return NaN;
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
};

// Helper to get value with unit multiplier if present
const getVal = (inputs: any, key: string) => {
    const val = Number(inputs[key]);
    const unit = inputs[`${key}_unit`] ? Number(inputs[`${key}_unit`]) : 1;
    return isNaN(val) ? 0 : val * unit;
};

// A robust, safe parser for user-provided mathematical function strings.
const parseFunction = (funcStr: string | number, vars: string[] = ['x']): ((...args: number[]) => number) | null => {
    try {
        let jsFuncStr = String(funcStr).toLowerCase();

        // Handle implicit multiplication
        // e.g., 2x -> 2*x, 2(x+1) -> 2*(x+1)
        jsFuncStr = jsFuncStr.replace(/(\d)([a-z(])/g, '$1*$2');
        // e.g. )x -> )*x, )2 -> )*2
        jsFuncStr = jsFuncStr.replace(/(\))([0-9a-z(])/g, '$1*$2');
        // e.g. x2 -> x*2
        jsFuncStr = jsFuncStr.replace(/([a-z])(\d)/g, '$1*$2');
        // e.g. xsin -> x*sin, xln -> x*ln (common vars x, t followed by function)
        jsFuncStr = jsFuncStr.replace(/([xt])([a-z])/g, '$1*$2');

        // Replace 'ln' with 'log' (Javascript's Math.log is natural log)
        // Ensure boundaries to avoid matching inside other words if any
        jsFuncStr = jsFuncStr.replace(/\bln\b/g, 'log');
        // Fallback for ln( without word boundary if previous failed (e.g. 5ln(x))
        jsFuncStr = jsFuncStr.replace(/ln\(/g, 'log(');

        // Add support for more math functions
        const allowedFunctions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'abs', 'log', 'sqrt', 'pow', 'floor', 'ceil', 'round'];
        
        const funcRegex = new RegExp(`\\b(${allowedFunctions.join('|')})\\b`, 'g');
        jsFuncStr = jsFuncStr.replace(funcRegex, 'Math.$1');
        
        jsFuncStr = jsFuncStr.replace(/\bpi\b/g, 'Math.PI');
        jsFuncStr = jsFuncStr.replace(/\be\b/g, 'Math.E');
        jsFuncStr = jsFuncStr.replace(/\^/g, '**');

        // Simple validation to prevent code injection
        let strippedStr = jsFuncStr.replace(/Math\.\w+/g, '');
        vars.forEach(v => {
            strippedStr = strippedStr.replace(new RegExp(v, 'g'), '');
        });
        
        // Allow digits, operators, parens, decimal points, spaces
        // Regex syntax: hyphen at the end
        if (/[^0-9+*\/().,\s-]/.test(strippedStr)) {
             console.error("Invalid characters in expression:", funcStr);
             return null;
        }

        const func = new Function(...vars, `return ${jsFuncStr};`);
        
        // Test execution
        try {
            const testArgs = vars.map(() => 1);
            const testResult = func(...testArgs);
            if (typeof testResult !== 'number') {
                 console.warn("Function test did not return a number.");
            }
        } catch (e) {
            console.error("Error during function test execution:", e);
            return null;
        }
        
        return func as (...args: number[]) => number;
    } catch (e) {
        console.error("Error parsing function:", e);
        return null;
    }
};

// --- SYMBOLIC DIFFERENTIATION HELPER ---

// Helper to derive a single atomic term (no + or * inside)
const deriveAtomicTerm = (term: string): { res: string, rule: string } | null => {
    let rawTerm = term.trim();
    if (!rawTerm) return { res: "0", rule: "Empty" };

    // Remove outer parens if simple
    if (rawTerm.startsWith('(') && rawTerm.endsWith(')')) {
        // Simple check: does it contain operators outside parens?
        // If atomic, we can just strip. But be careful of (x)*(x).
        // For now, assume atomic strip is safe if passed here.
        const inner = rawTerm.slice(1, -1);
        if (!inner.includes(')')) rawTerm = inner; // Very basic strip
    }

    // 1. Constant (no x)
    if (!rawTerm.includes('x')) return { res: "0", rule: "Constant Rule" };
    
    // 2. Linear (x)
    if (rawTerm === 'x') return { res: "1", rule: "Power Rule" };
    
    // 3. Linear coeff (cx)
    const linMatch = rawTerm.match(/^([-]?\d*\.?\d*)x$/);
    if (linMatch) {
        const c = linMatch[1] === '-' ? -1 : (linMatch[1] === '' ? 1 : parseFloat(linMatch[1]));
        return { res: `${c}`, rule: "Power Rule (linear)" };
    }

    // 4. Power (x^n or cx^n)
    const powMatch = rawTerm.match(/^([-]?\d*\.?\d*)?x\^([-]?\d*\.?\d*)$/);
    if (powMatch) {
        let c = 1;
        if (powMatch[1]) c = powMatch[1] === '-' ? -1 : (powMatch[1] === undefined || powMatch[1] === '' ? 1 : parseFloat(powMatch[1]));
        const n = parseFloat(powMatch[2]);
        return { res: `${c * n}*x^${n - 1}`, rule: "Power Rule" };
    }

    // 5. Trig / Exp / Log
    const parseCoeff = (str: string, funcSig: string): number | null => {
        if (!str.endsWith(funcSig)) return null;
        const prefix = str.substring(0, str.length - funcSig.length).trim();
        if (prefix === '' || prefix === '+' || prefix === '*') return 1;
        if (prefix === '-') return -1;
        if (prefix.endsWith('*')) return parseFloat(prefix.slice(0, -1));
        return parseFloat(prefix);
    };

    let c: number | null;

    c = parseCoeff(rawTerm, 'sin(x)');
    if (c !== null) return { res: `${c}*cos(x)`, rule: "Derivative of sin(x)" };

    c = parseCoeff(rawTerm, 'cos(x)');
    if (c !== null) return { res: `${-c}*sin(x)`, rule: "Derivative of cos(x)" };

    c = parseCoeff(rawTerm, 'tan(x)');
    if (c !== null) return { res: `${c}*sec(x)^2`, rule: "Derivative of tan(x)" };

    c = parseCoeff(rawTerm, 'e^x');
    if (c !== null) return { res: `${c}*e^x`, rule: "Exponential Rule" };

    c = parseCoeff(rawTerm, 'ln(x)');
    if (c !== null) return { res: `${c}/x`, rule: "Natural Log Rule" };

    return null;
};

const parseSymbolic = (funcStr: string): { derivative: string, steps: string[] } | null => {
    // Normalization
    let expr = funcStr.replace(/\s+/g, '').replace(/\*\*/g, '^');
    
    // Split into terms (handling + and -)
    // Simple parser: split by + or - not inside parens
    let terms: string[] = [];
    let currentTerm = "";
    let parens = 0;
    
    for (let i = 0; i < expr.length; i++) {
        const char = expr[i];
        if (char === '(') parens++;
        if (char === ')') parens--;
        
        if (parens === 0 && (char === '+' || (char === '-' && i > 0 && expr[i-1] !== '^' && expr[i-1] !== '*' && expr[i-1] !== '(' && expr[i-1] !== 'e'))) {
             if (currentTerm) terms.push(currentTerm);
             currentTerm = char; // Start new term with sign
        } else {
             currentTerm += char;
        }
    }
    if (currentTerm) terms.push(currentTerm);
    
    let derivParts: string[] = [];
    let steps: string[] = [];
    
    for (let term of terms) {
        let sign = term.startsWith('+') ? '+' : (term.startsWith('-') ? '-' : '+');
        let rawTerm = term.replace(/^[+-]/, '');
        if (!rawTerm) continue;

        // CHECK FOR PRODUCT RULE (u * v)
        // Split by * not inside parens
        let factors: string[] = [];
        let currentFactor = "";
        let p = 0;
        for(let i=0; i<rawTerm.length; i++) {
            const char = rawTerm[i];
            if (char === '(') p++;
            if (char === ')') p--;
            if (p === 0 && char === '*') {
                factors.push(currentFactor);
                currentFactor = "";
            } else {
                currentFactor += char;
            }
        }
        factors.push(currentFactor);

        if (factors.length === 2) {
            // Apply Product Rule: (uv)' = u'v + uv'
            const u = factors[0];
            const v = factors[1];
            
            const du = deriveAtomicTerm(u);
            const dv = deriveAtomicTerm(v);

            if (du && dv) {
                // Formatting clean up
                const cleanU = u;
                const cleanV = v;
                const res = `(${du.res})*${cleanV} + ${cleanU}*(${dv.res})`;
                
                if (sign === '-') {
                     derivParts.push(`- (${res})`);
                } else {
                     if (derivParts.length > 0) derivParts.push(`+ (${res})`);
                     else derivParts.push(res);
                }
                steps.push(`d/dx [${sign}${rawTerm}] = ${sign}(u'v + uv') [Product Rule]`);
                steps.push(`   u = ${u}, v = ${v}`);
                steps.push(`   u' = ${du.res}, v' = ${dv.res}`);
                continue;
            }
        }
        
        // Fallback to Atomic derivation
        const derived = deriveAtomicTerm(rawTerm);
        
        if (derived) {
            let res = derived.res;
             if (res !== "0") {
                 if (sign === '-') {
                     if (res.startsWith('-')) res = `+ ${res.substring(1)}`;
                     else res = `- ${res}`;
                 } else {
                     if (derivParts.length > 0 && !res.startsWith('-')) res = `+ ${res}`;
                 }
                 derivParts.push(res);
            }
            steps.push(`d/dx [${sign}${rawTerm}] = ${sign === '+' ? '' : '-'}(${derived.res.replace(/^[+-]\s*/, '')})  [${derived.rule}]`);
        } else {
            return null; // Unsupported term, fallback to numerical
        }
    }
    
    if (derivParts.length === 0) return { derivative: "0", steps: ["Derivative of a constant is 0"] };
    
    let finalStr = derivParts.join(' ').trim();
    if (finalStr.startsWith('+ ')) finalStr = finalStr.substring(2);
    
    return { derivative: finalStr, steps };
};


// --- MATH SOLVERS ---
const solveArithmetic = ({ num1, num2, operation }: { num1: number, num2: number, operation: string }): CalculationResult => {
    let result: number;
    let text: string;
    let opSymbol = operation;
    
    switch (operation) {
        case '+': result = num1 + num2; text = `${num1} + ${num2} = ${result}`; break;
        case '-': result = num1 - num2; text = `${num1} - ${num2} = ${result}`; break;
        case '*': result = num1 * num2; text = `${num1} × ${num2} = ${result}`; opSymbol = '×'; break;
        case '/':
            if (num2 === 0) return { text: "Error: Division by zero is not allowed." };
            result = num1 / num2; text = `${num1} ÷ ${num2} = ${result}`; opSymbol = '÷'; break;
        default: return { text: "Invalid operation." };
    }
    return { 
        text, 
        steps: [
            `**1. Identify variables:**`,
            `   a = ${num1}`,
            `   b = ${num2}`,
            `**2. Apply formula:**`,
            `   Result = a ${opSymbol} b`,
            `   Result = ${num1} ${opSymbol} ${num2}`,
            `**3. Result:**`,
            `   ${result}`
        ],
        plotData: { type: 'bar', data: { labels: ['Number 1', 'Number 2', 'Result'], datasets: [{ label: 'Values', data: [num1, num2, result], backgroundColor: ['rgba(129, 140, 248, 0.5)', 'rgba(52, 211, 153, 0.5)', 'rgba(244, 63, 94, 0.5)'], }] } } 
    };
};

const solvePercentage = ({ part, total }: { part: number, total: number }): CalculationResult => {
    if (total === 0) return { text: "Error: Total value cannot be zero." };
    const percentage = (part / total) * 100;
    return { 
        text: `${part} is ${percentage.toFixed(2)}% of ${total}.`, 
        steps: [
            `**1. Identify variables:**`,
            `   Part = ${part}`,
            `   Total = ${total}`,
            `**2. Apply formula:**`,
            `   Percentage = (Part / Total) × 100`,
            `   Percentage = (${part} / ${total}) × 100`,
            `   Percentage = ${part/total} × 100`,
            `**3. Result:**`,
            `   ${percentage.toFixed(2)}%`
        ],
        plotData: { type: 'doughnut', data: { labels: [`Part (${percentage.toFixed(2)}%)`, `Remainder (${(100 - percentage).toFixed(2)}%)`], datasets: [{ label: 'Percentage Breakdown', data: [percentage, 100 - percentage], backgroundColor: ['rgb(129, 140, 248)', 'rgba(255, 255, 255, 0.1)'], borderColor: ['rgb(129, 140, 248)', 'rgba(255, 255, 255, 0.2)'], borderWidth: 1 }] }, options: { plugins: { title: { display: true, text: 'Percentage Breakdown', } } } } 
    };
};

const solveUnitConverter = (inputs: { [key: string]: any }): CalculationResult => {
    const { conversionType, value: rawValue } = inputs;
    const value = Number(rawValue);
    
    // Map category-specific inputs
    let fromUnit = '';
    let toUnit = '';

    switch (conversionType) {
        case 'length': fromUnit = inputs.lengthFrom; toUnit = inputs.lengthTo; break;
        case 'mass': fromUnit = inputs.massFrom; toUnit = inputs.massTo; break;
        case 'temperature': fromUnit = inputs.tempFrom; toUnit = inputs.tempTo; break;
        case 'volume': fromUnit = inputs.volumeFrom; toUnit = inputs.volumeTo; break;
        case 'data': fromUnit = inputs.dataFrom; toUnit = inputs.dataTo; break;
    }

    if (isNaN(value) || !fromUnit || !toUnit) return { text: "Please provide a valid value and units." };

    // Define base units and conversion factors relative to the base
    // Length Base: Meter (m)
    const lengthUnits: {[key: string]: number} = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 };
    // Mass Base: Kilogram (kg)
    const massUnits: {[key: string]: number} = { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.45359237, oz: 0.02834952 };
    // Volume Base: Liter (L)
    const volumeUnits: {[key: string]: number} = { L: 1, mL: 0.001, m3: 1000, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.24, floz: 0.0295735 };
    // Data Base: Byte (B)
    const dataUnits: {[key: string]: number} = { b: 0.125, B: 1, KB: 1024, MB: 1024**2, GB: 1024**3, TB: 1024**4, PB: 1024**5 };

    let resultValue: number = 0;
    let categoryUnits: {[key: string]: number} | null = null;
    let steps: string[] = [`**1. Identify variables:**`, `   Value = ${value} ${fromUnit}`, `   Target Unit = ${toUnit}`];
    let baseValue = 0;
    let otherConversions: string[] = [];

    if (conversionType === 'temperature') {
        // Temperature logic (requires offset, not just factor)
        let valK = 0;
        // Convert to Kelvin first
        if (fromUnit === 'C') valK = value + 273.15;
        else if (fromUnit === 'F') valK = (value - 32) * 5/9 + 273.15;
        else valK = value;

        // Convert K to target
        if (toUnit === 'C') resultValue = valK - 273.15;
        else if (toUnit === 'F') resultValue = (valK - 273.15) * 9/5 + 32;
        else resultValue = valK;

        steps.push(`**2. Convert to Base (Kelvin):**`);
        if (fromUnit === 'K') steps.push(`   Already in Kelvin: ${value} K`);
        else if (fromUnit === 'C') steps.push(`   K = ${value} + 273.15 = ${valK.toFixed(4)} K`);
        else steps.push(`   K = (${value} - 32) × 5/9 + 273.15 = ${valK.toFixed(4)} K`);

        steps.push(`**3. Convert to Target (${toUnit}):**`);
        steps.push(`   Result = ${resultValue.toFixed(4)} ${toUnit}`);

        // Generate others
        const valC = valK - 273.15;
        const valF = (valK - 273.15) * 9/5 + 32;
        otherConversions.push(`${valC.toFixed(2)} C`);
        otherConversions.push(`${valF.toFixed(2)} F`);
        otherConversions.push(`${valK.toFixed(2)} K`);

    } else {
        // Standard multiplicative conversions
        switch (conversionType) {
            case 'length': categoryUnits = lengthUnits; break;
            case 'mass': categoryUnits = massUnits; break;
            case 'volume': categoryUnits = volumeUnits; break;
            case 'data': categoryUnits = dataUnits; break;
        }

        if (categoryUnits) {
            // 1. Convert to Base
            baseValue = value * categoryUnits[fromUnit];
            
            // 2. Convert to Target
            resultValue = baseValue / categoryUnits[toUnit];
            
            // Steps
            steps.push(`**2. Convert to Base Unit:**`);
            steps.push(`   Base Value = Value × UnitFactor`);
            steps.push(`   Base Value = ${value} × ${categoryUnits[fromUnit]} = ${baseValue.toExponential(4)} (Base)`);
            steps.push(`**3. Convert to Target Unit:**`);
            steps.push(`   Result = Base Value / TargetFactor`);
            steps.push(`   Result = ${baseValue.toExponential(4)} / ${categoryUnits[toUnit]}`);
            steps.push(`   Result = ${resultValue.toFixed(6)} ${toUnit}`);

            // 3. Generate all other conversions
            for (const [u, factor] of Object.entries(categoryUnits)) {
                const v = baseValue / factor;
                const formattedV = (v < 0.001 || v > 10000) ? v.toExponential(4) : v.toFixed(4);
                otherConversions.push(`${formattedV} ${u}`);
            }
        }
    }

    steps.push(`**4. Result:**`);
    steps.push(`   ${value} ${fromUnit} = ${resultValue.toFixed(4)} ${toUnit}`);

    let textResult = `${value} ${fromUnit} = ${resultValue.toFixed(4)} ${toUnit}`;
    if (otherConversions.length > 0) {
        textResult += `\n\nEquivalent Values:\n${otherConversions.join('\n')}`;
    }

    return { text: textResult, steps };
};

const solveAreaPerimeter = (inputs: any): CalculationResult => {
    const { shape } = inputs;
    let area: number, perimeter: number, text = `Shape: ${shape}\n\n`;
    let steps: string[] = [`**1. Identify variables:**`, `   Shape: ${shape.charAt(0).toUpperCase() + shape.slice(1)}`];

    switch (shape) {
        case 'square':
            const side = Number(inputs.side);
            area = side * side; perimeter = 4 * side;
            text += `Side = ${side}\nArea = ${area.toFixed(4)}\nPerimeter = ${perimeter.toFixed(4)}`;
            steps.push(`   Side (s) = ${side}`);
            steps.push(`**2. Apply formulas:**`);
            steps.push(`   Area (A) = s²`);
            steps.push(`   A = ${side}² = ${area.toFixed(4)}`);
            steps.push(`   Perimeter (P) = 4s`);
            steps.push(`   P = 4 × ${side} = ${perimeter.toFixed(4)}`);
            break;
        case 'rectangle':
            const l = Number(inputs.length), w = Number(inputs.width);
            area = l * w; perimeter = 2 * (l + w);
            text += `Length = ${l}, Width = ${w}\nArea = ${area.toFixed(4)}\nPerimeter = ${perimeter.toFixed(4)}`;
            steps.push(`   Length (l) = ${l}`, `   Width (w) = ${w}`);
            steps.push(`**2. Apply formulas:**`);
            steps.push(`   Area (A) = l × w`);
            steps.push(`   A = ${l} × ${w} = ${area.toFixed(4)}`);
            steps.push(`   Perimeter (P) = 2(l + w)`);
            steps.push(`   P = 2(${l} + ${w}) = ${perimeter.toFixed(4)}`);
            break;
        case 'circle':
            const r = Number(inputs.radius);
            area = Math.PI * r * r; perimeter = 2 * Math.PI * r;
            text += `Radius = ${r}\nArea = ${area.toFixed(4)}\nCircumference = ${perimeter.toFixed(4)}`;
            steps.push(`   Radius (r) = ${r}`);
            steps.push(`**2. Apply formulas:**`);
            steps.push(`   Area (A) = πr²`);
            steps.push(`   A = π × ${r}² ≈ ${area.toFixed(4)}`);
            steps.push(`   Circumference (C) = 2πr`);
            steps.push(`   C = 2π × ${r} ≈ ${perimeter.toFixed(4)}`);
            break;
        case 'triangle':
            if (inputs.triangleMethod === 'baseHeight') {
                const b = Number(inputs.base), h = Number(inputs.height);
                area = 0.5 * b * h;
                text += `Base = ${b}, Height = ${h}\nArea = ${area.toFixed(4)}`;
                steps.push(`   Base (b) = ${b}`, `   Height (h) = ${h}`);
                steps.push(`**2. Apply formula:**`);
                steps.push(`   Area (A) = ½ × b × h`);
                steps.push(`   A = 0.5 × ${b} × ${h} = ${area.toFixed(4)}`);
            } else {
                const s1=Number(inputs.s1), s2=Number(inputs.s2), s3=Number(inputs.s3);
                const s = (s1+s2+s3)/2;
                if (s <= s1 || s <= s2 || s <= s3) return { text: "Invalid triangle sides. Sum of any two sides must be greater than the third." };
                area = Math.sqrt(s*(s-s1)*(s-s2)*(s-s3));
                perimeter = s1+s2+s3;
                text += `Sides: ${s1}, ${s2}, ${s3}\nArea (Heron's Formula) = ${area.toFixed(4)}\nPerimeter = ${perimeter.toFixed(4)}`;
                steps.push(`   Side a = ${s1}`, `   Side b = ${s2}`, `   Side c = ${s3}`);
                steps.push(`**2. Apply formulas:**`);
                steps.push(`   Semi-perimeter (s) = (a+b+c)/2`);
                steps.push(`   s = (${s1}+${s2}+${s3})/2 = ${s}`);
                steps.push(`   Area (A) = √[s(s-a)(s-b)(s-c)]`);
                steps.push(`   A = √[${s}(${s-s1})(${s-s2})(${s-s3})] = ${area.toFixed(4)}`);
                steps.push(`   Perimeter (P) = a + b + c`);
                steps.push(`   P = ${s1} + ${s2} + ${s3} = ${perimeter}`);
            }
            break;
        case 'trapezoid':
            const pa=Number(inputs.pa), pb=Number(inputs.pb), th=Number(inputs.height);
            area = 0.5 * (pa+pb) * th;
            text += `Sides: ${pa}, ${pb}, Height: ${th}\nArea = ${area.toFixed(4)}`;
            steps.push(`   Parallel Side a = ${pa}`, `   Parallel Side b = ${pb}`, `   Height (h) = ${th}`);
            steps.push(`**2. Apply formula:**`);
            steps.push(`   Area (A) = ½(a + b)h`);
            steps.push(`   A = 0.5 × (${pa} + ${pb}) × ${th}`);
            steps.push(`   A = ${area.toFixed(4)}`);
            break;
         case 'parallelogram':
            const base=Number(inputs.base), ph=Number(inputs.height);
            area = base * ph;
            text += `Base: ${base}, Height: ${ph}\nArea = ${area.toFixed(4)}`;
            steps.push(`   Base (b) = ${base}`, `   Height (h) = ${ph}`);
            steps.push(`**2. Apply formula:**`);
            steps.push(`   Area (A) = b × h`);
            steps.push(`   A = ${base} × ${ph} = ${area.toFixed(4)}`);
            break;
        default: return { text: "Shape not supported." };
    }
    steps.push(`**3. Result:**`);
    steps.push(`   Area = ${area!.toFixed(4)}`);
    if (perimeter!) steps.push(`   Perimeter = ${perimeter.toFixed(4)}`);
    
    return { text, steps };
};

const solveQuadratic = ({ a, b, c }: {a:number, b:number, c:number}): CalculationResult => {
    if (a === 0) return { text: "a cannot be 0 for a quadratic equation." };
    const d = b*b - 4*a*c;
    let text = `Discriminant Δ = ${d}\n`;
    let roots = [];
    let steps = [
        `**1. Identify coefficients:**`,
        `   a = ${a}, b = ${b}, c = ${c}`,
        `**2. Apply Quadratic Formula:**`,
        `   x = [-b ± √(b² - 4ac)] / 2a`,
        `   Discriminant (Δ) = b² - 4ac`,
        `   Δ = (${b})² - 4(${a})(${c})`,
        `   Δ = ${b*b} - ${4*a*c}`,
        `   Δ = ${d}`
    ];

    if (d > 0) {
        const r1 = (-b + Math.sqrt(d))/(2*a);
        const r2 = (-b - Math.sqrt(d))/(2*a);
        text += `Two real roots: x₁ = ${r1.toFixed(4)}, x₂ = ${r2.toFixed(4)}`;
        roots.push({x:r1, y:0}, {x:r2, y:0});
        steps.push(
            `**3. Calculate Roots:**`,
            `   x₁ = (-(${b}) + √${d}) / 2(${a}) = ${r1.toFixed(4)}`,
            `   x₂ = (-(${b}) - √${d}) / 2(${a}) = ${r2.toFixed(4)}`
        );
    } else if (d === 0) {
        const r = -b/(2*a);
        text += `One real root: x = ${r.toFixed(4)}`;
        roots.push({x:r, y:0});
        steps.push(
            `**3. Calculate Root:**`,
            `   x = -(${b}) / 2(${a})`,
            `   x = ${r.toFixed(4)}`
        );
    } else {
        const re = -b/(2*a), im = Math.sqrt(-d)/(2*a);
        text += `Complex roots: ${re.toFixed(4)} ± ${im.toFixed(4)}i`;
        steps.push(
            `**3. Calculate Complex Roots:**`,
            `   x = [-(${b}) ± i√${-d}] / 2(${a})`,
            `   x = ${re.toFixed(4)} ± ${im.toFixed(4)}i`
        );
    }
    
    // Generate graph data
    const vx = -b / (2*a);
    const rangeX = Math.max(Math.abs(vx) * 2, 10);
    const startX = vx - rangeX;
    const endX = vx + rangeX;
    const step = (endX - startX) / 50;
    const plotPoints = [];
    for(let x = startX; x <= endX; x += step) {
        plotPoints.push({x, y: a*x*x + b*x + c});
    }

    return { 
        text,
        steps,
        plotData: {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'y = ax² + bx + c',
                        data: plotPoints,
                        borderColor: 'rgb(129, 140, 248)',
                        pointRadius: 0,
                    },
                    {
                        label: 'Roots',
                        data: roots,
                        backgroundColor: 'red',
                        pointRadius: 5,
                        showLine: false,
                        type: 'scatter'
                    }
                ] as ChartDataset[]
            }
        }
    };
};

const solveDerivative = (inputs: any): CalculationResult => {
    const isParametric = inputs.inputType === 'parametric';
    const point = Number(inputs.point);
    const h = Number(inputs.h) || 0.0001;
    const order = Number(inputs.order) || 1;
    const method = inputs.method || 'central';

    if (h <= 0) return { text: "Step size h must be positive." };

    let funcX: ((...args: number[]) => number) | null = null;
    let funcY: ((...args: number[]) => number) | null = null;
    let func: ((...args: number[]) => number) | null = null;

    if (isParametric) {
        funcX = parseFunction(inputs.funcX, ['t']);
        funcY = parseFunction(inputs.funcY, ['t']);
        if (!funcX || !funcY) return { text: "Invalid parametric functions." };
    } else {
        func = parseFunction(inputs.func);
        if (!func) return { text: "Invalid function." };
    }

    const calculateDerivative = (f: (v: number) => number, val: number, ord: number) => {
         if (ord === 1) {
            if (method === 'forward') return (f(val + h) - f(val)) / h;
            if (method === 'backward') return (f(val) - f(val - h)) / h;
            if (method === 'fivepoint') return (-f(val + 2*h) + 8*f(val + h) - 8*f(val - h) + f(val - 2*h)) / (12 * h);
            return (f(val + h) - f(val - h)) / (2 * h);
        } else {
             if (method === 'fivepoint') {
                 return (-f(val + 2*h) + 16*f(val + h) - 30*f(val) + 16*f(val - h) - f(val - 2*h)) / (12 * h * h);
             }
             return (f(val + h) - 2*f(val) + f(val - h)) / (h * h);
        }
    }

    let resultVal = 0;
    let label = "";
    let formulaSteps: string[] = [];
    let methodText = method.charAt(0).toUpperCase() + method.slice(1);
    const plotDataPoints = [];
    const derivDataPoints = [];
    const tStart = point - 5;
    const tEnd = point + 5;
    const tStep = 0.1;

    if (isParametric) {
        // Parametric Differentiation
        const dxdt = calculateDerivative(funcX!, point, 1);
        const dydt = calculateDerivative(funcY!, point, 1);
        
        if (order === 1) {
            if (Math.abs(dxdt) < 1e-10) return { text: "Vertical tangent detected (dx/dt ≈ 0). Derivative undefined." };
            resultVal = dydt / dxdt;
            label = "dy/dx";
            formulaSteps = [
                `dx/dt ≈ ${dxdt.toFixed(4)}`,
                `dy/dt ≈ ${dydt.toFixed(4)}`,
                `dy/dx = (dy/dt) / (dx/dt)`
            ];
        } else {
            const g = (t: number) => {
                 const dxdt_local = calculateDerivative(funcX!, t, 1);
                 const dydt_local = calculateDerivative(funcY!, t, 1);
                 return Math.abs(dxdt_local) > 1e-10 ? dydt_local / dxdt_local : 0;
            };
            const dgdt = calculateDerivative(g, point, 1);
            
            if (Math.abs(dxdt) < 1e-10) return { text: "Vertical tangent detected. Derivative undefined." };
            resultVal = dgdt / dxdt;
            label = "d²y/dx²";
            formulaSteps = [
                `First calculate dy/dx as a function of t`,
                `Then d²y/dx² = [d/dt (dy/dx)] / (dx/dt)`
            ];
        }

        for (let t = tStart; t <= tEnd; t += tStep) {
            plotDataPoints.push({ x: funcX!(t), y: funcY!(t) });
        }

    } else {
        // Explicit Differentiation
        resultVal = calculateDerivative(func!, point, order);
        label = order === 1 ? "f'(x)" : "f''(x)";
        formulaSteps = [`Using ${methodText} Difference method`];

        // Explicit Plotting
        for (let x = tStart; x <= tEnd; x += tStep) {
            plotDataPoints.push({ x: x, y: func!(x) });
            derivDataPoints.push({ x: x, y: calculateDerivative(func!, x, order) });
        }
        
        // Try symbolic differentiation if first order and simple function
        if (order === 1) {
            const symbolic = parseSymbolic(inputs.func);
            if (symbolic) {
                 try {
                     const derivedFunc = parseFunction(symbolic.derivative);
                     if (derivedFunc) {
                         const symbolicVal = derivedFunc(point);
                         // Update values to use symbolic precision if possible
                         resultVal = symbolicVal;
                         formulaSteps = [
                             `**Symbolic Differentiation:**`,
                             `f'(x) = ${symbolic.derivative}`,
                             ...symbolic.steps,
                             `**Substitution:**`,
                             `Evaluate at x = ${point}:`,
                             `f'(${point}) = ${resultVal.toFixed(6)}`
                         ];
                         
                         // Replot derivative with symbolic function for better accuracy
                         derivDataPoints.length = 0;
                         for (let x = tStart; x <= tEnd; x += tStep) {
                            derivDataPoints.push({ x: x, y: derivedFunc(x) });
                        }
                     }
                 } catch (e) {
                     // Fallback to numerical if symbolic evaluation fails
                 }
            }
        }
    }
    
    // Construct Result
    const datasets: ChartDataset[] = [
         {
            label: isParametric ? 'Parametric Curve (x(t), y(t))' : 'f(x)',
            data: plotDataPoints,
            borderColor: 'rgba(129, 140, 248, 0.5)',
            borderWidth: 2,
            pointRadius: 0
        }
    ];

    if (!isParametric) {
         datasets.push({
            label: label,
            data: derivDataPoints,
            borderColor: 'rgb(52, 211, 153)',
            borderWidth: 2,
            pointRadius: 0
        });
    }

    // Add point
    const px = isParametric ? funcX!(point) : point;
    const py = isParametric ? funcY!(point) : func!(point);
    
    datasets.push({
         label: `Point (t=${point})`,
         data: [{x: px, y: isParametric ? py : resultVal}], // Show deriv value on Y for explicit for visual confirmation
         type: 'scatter',
         backgroundColor: 'red',
         pointRadius: 5
    });

    return { 
        text: `${order === 1 ? "First" : "Second"} Derivative at ${isParametric ? 't' : 'x'} = ${point}:\n${label} ≈ ${resultVal.toFixed(6)}`,
        steps: [
            `**1. Configuration:**`,
            `   Type: ${isParametric ? 'Parametric' : 'Explicit'}`,
            `   Point: ${point}`,
            `   Method: ${methodText}`,
            `**2. Calculation:**`,
            ...formulaSteps,
            `**3. Result:**`,
            `   ${label} ≈ ${resultVal.toFixed(6)}`
        ],
        plotData: {
            type: 'line',
            data: { datasets },
            options: {
                plugins: {
                    title: { display: true, text: isParametric ? 'Parametric Curve' : `Function and ${label}` }
                },
                scales: {
                    x: { type: 'linear', position: 'bottom', title: { display: true, text: isParametric ? 'x(t)' : 'x' } },
                    y: { title: { display: true, text: isParametric ? 'y(t)' : 'y' } }
                }
            }
        }
    };
};

const solveIntegral = (inputs: any): CalculationResult => {
    const func = parseFunction(inputs.func);
    const a = Number(inputs.lower);
    const b = Number(inputs.upper);
    if (!func) return { text: "Invalid function." };
    if (a >= b) return { text: "Lower limit must be less than upper limit for this implementation." };
    
    // Trapezoidal Rule
    const n = 1000;
    const h = (b - a) / n;
    let sum = 0.5 * (func(a) + func(b));
    for(let i=1; i<n; i++) {
        sum += func(a + i*h);
    }
    const integral = sum * h;
    
    const plotDataPoints = range(a, b, (b-a)/100).map(x => ({x, y: func(x)}));

    return { 
        text: `Integral from ${a} to ${b} ≈ ${integral.toFixed(6)}`,
        steps: [
            `**1. Identify variables:**`,
            `   Function f(x) = ${inputs.func}`,
            `   Lower limit a = ${a}`,
            `   Upper limit b = ${b}`,
            `**2. Apply Numerical Method (Trapezoidal Rule):**`,
            `   Area ≈ (h/2) * [f(a) + 2f(a+h) + ... + f(b)]`,
            `   Using n=${n} segments, h=${h}`,
            `**3. Result:**`,
            `   Area ≈ sum(trapezoids) = ${integral.toFixed(6)}`
        ],
        plotData: {
            type: 'line',
            data: {
                datasets: [{
                    label: 'f(x)',
                    data: plotDataPoints,
                    fill: true,
                    backgroundColor: 'rgba(129, 140, 248, 0.2)',
                    borderColor: 'rgb(129, 140, 248)'
                }]
            }
        }
    };
};

const solveLimit = (inputs: any): CalculationResult => {
    const func = parseFunction(inputs.func);
    const a = Number(inputs.point);
    if (!func) return { text: "Invalid function." };
    
    const h = 0.00001;
    const left = func(a - h);
    const right = func(a + h);
    
    const steps = [
        `**1. Identify variables:**`,
        `   Function f(x) = ${inputs.func}`,
        `   Target point a = ${a}`,
        `**2. Evaluate approaches to x = ${a}:**`,
        `   Left Limit (x = ${a} - ${h}): ${left.toFixed(6)}`,
        `   Right Limit (x = ${a} + ${h}): ${right.toFixed(6)}`
    ];

    if (Math.abs(left - right) > 0.1) {
        steps.push(`**3. Conclusion:**`, `   Left and Right limits differ significantly.`);
        return { 
            text: `Limit appears to diverge or does not exist.\nLeft approach: ${left.toFixed(4)}\nRight approach: ${right.toFixed(4)}`,
            steps
        };
    }
    
    steps.push(`**3. Result:**`, `   Limits converge to ≈ ${((left + right)/2).toFixed(6)}`);
    return { text: `Limit ≈ ${((left + right)/2).toFixed(7)}`, steps };
};

const solveDifferentialEquation = (inputs: any): CalculationResult => {
    // Euler's Method for y' = f(x, y)
    // Use the robust parser
    const f = parseFunction(inputs.func, ['x', 'y']);
    if (!f) return { text: "Error parsing ODE function. Ensure you use 'x' and 'y' variables." };

    try {
        const x0 = Number(inputs.x0 || 0);
        const y0 = Number(inputs.y0 || 0);
        
        const h = 0.1;
        const stepsCount = 20;
        const data = [{x: x0, y: y0}];
        
        let x = x0, y = y0;
        let stepLog = [];
        
        for(let i=0; i<Math.min(stepsCount, 5); i++) {
             const slope = f(x, y);
             stepLog.push(`   x=${x.toFixed(1)}, y=${y.toFixed(2)}, slope=${slope.toFixed(2)} → new y = ${y.toFixed(2)} + ${h}*${slope.toFixed(2)} = ${(y + h * slope).toFixed(2)}`);
             y = y + h * slope;
             x = x + h;
             data.push({x, y});
        }
        // Finish calc without logging
        for(let i=5; i<stepsCount; i++) {
            const slope = f(x, y);
            y = y + h * slope;
            x = x + h;
            data.push({x, y});
        }
        
        return {
            text: `Numerical Solution (Euler Method)\ny(${x.toFixed(2)}) ≈ ${y.toFixed(4)}`,
            steps: [
                `**1. Identify variables:**`,
                `   ODE: y' = ${inputs.func}`,
                `   Initial Condition: y(${x0}) = ${y0}`,
                `**2. Apply Numerical Method (Euler's Method):**`,
                `   Step size h = ${h}`,
                `   Formula: y_next = y_curr + h * f(x, y)`,
                `**3. First 5 Steps:**`,
                ...stepLog,
                `   ...`,
                `   Final y(${x.toFixed(2)}) ≈ ${y.toFixed(4)}`
            ],
            plotData: {
                type: 'line',
                data: {
                    datasets: [{ label: "y(x)", data: data, borderColor: 'rgb(52, 211, 153)' }]
                }
            }
        };
    } catch (e) {
        return { text: "Error executing ODE function. Please check your syntax." };
    }
};

const solveTrigEquation = (inputs: any): CalculationResult => {
    return { text: "Symbolic trigonometric equation solving is not fully supported in this browser-based version. Please check back for updates using a CAS engine." };
};

const solveMatrixMultiplication = (inputs: any): CalculationResult => {
    const a11=Number(inputs.m1_00), a12=Number(inputs.m1_01), a21=Number(inputs.m1_10), a22=Number(inputs.m1_11);
    const b11=Number(inputs.m2_00), b12=Number(inputs.m2_01), b21=Number(inputs.m2_10), b22=Number(inputs.m2_11);
    
    // C = A * B
    const c11 = a11*b11 + a12*b21;
    const c12 = a11*b12 + a12*b22;
    const c21 = a21*b11 + a22*b21;
    const c22 = a21*b12 + a22*b22;
    
    return { 
        text: `Result Matrix:\n[ ${c11}, ${c12} ]\n[ ${c21}, ${c22} ]`,
        steps: [
            `**1. Identify Matrices A & B:**`,
            `   A = [[${a11}, ${a12}], [${a21}, ${a22}]]`,
            `   B = [[${b11}, ${b12}], [${b21}, ${b22}]]`,
            `**2. Apply Formula:**`,
            `   C_ij = Row_i(A) • Col_j(B)`,
            `**3. Compute Dot Products:**`,
            `   Row 1 • Col 1: (${a11})(${b11}) + (${a12})(${b21}) = ${c11}`,
            `   Row 1 • Col 2: (${a11})(${b12}) + (${a12})(${b22}) = ${c12}`,
            `   Row 2 • Col 1: (${a21})(${b11}) + (${a22})(${b21}) = ${c21}`,
            `   Row 2 • Col 2: (${a21})(${b12}) + (${a22})(${b22}) = ${c22}`,
            `**4. Result:**`,
            `   [[${c11}, ${c12}], [${c21}, ${c22}]]`
        ]
    };
};

const solveMatrixDeterminant = (inputs: any): CalculationResult => {
    const a=Number(inputs.m_00), b=Number(inputs.m_01), c=Number(inputs.m_10), d=Number(inputs.m_11);
    const det = a*d - b*c;
    return { 
        text: `Determinant = ${det}`,
        steps: [
             `**1. Identify Matrix:**`,
             `   [[${a}, ${b}], [${c}, ${d}]]`,
             `**2. Apply Formula:**`,
             `   det = ad - bc`,
             `   det = (${a})(${d}) - (${b})(${c})`,
             `   det = ${a*d} - ${b*c}`,
             `**3. Result:**`,
             `   det = ${det}`
        ]
    };
};

const solveEigen = (inputs: any): CalculationResult => {
    // Char eq: lambda^2 - tr(A)lambda + det(A) = 0
    const a=Number(inputs.m_00), b=Number(inputs.m_01), c=Number(inputs.m_10), d=Number(inputs.m_11);
    const trace = a + d;
    const det = a*d - b*c;
    
    const delta = trace*trace - 4*det;
    
    let resultText = "";
    let steps = [
        `**1. Identify Matrix parameters:**`,
        `   Matrix = [[${a}, ${b}], [${c}, ${d}]]`,
        `   Trace (tr) = a + d = ${a} + ${d} = ${trace}`,
        `   Determinant (det) = ad - bc = ${det}`,
        `**2. Characteristic Equation:**`,
        `   det(A - λI) = 0`,
        `   λ² - tr(A)λ + det(A) = 0`,
        `   λ² - ${trace}λ + ${det} = 0`
    ];
    
    if (delta >= 0) {
         const l1 = (trace + Math.sqrt(delta))/2;
         const l2 = (trace - Math.sqrt(delta))/2;
         resultText = `Eigenvalues:\nλ₁ = ${l1.toFixed(4)}\nλ₂ = ${l2.toFixed(4)}`;
         steps.push(
             `**3. Solve Quadratic:**`,
             `   λ = [${trace} ± √(${trace}² - 4(1)(${det}))] / 2`,
             `   λ = [${trace} ± √${delta}] / 2`,
             `**4. Results:**`,
             `   λ₁ = ${l1.toFixed(4)}`,
             `   λ₂ = ${l2.toFixed(4)}`
         );
    } else {
        resultText = `Complex Eigenvalues:\n${(trace/2).toFixed(4)} ± ${(Math.sqrt(-delta)/2).toFixed(4)}i`;
        steps.push(
             `**3. Solve Quadratic:**`,
             `   Discriminant is negative (${delta}), so roots are complex.`,
             `   Real part = ${trace}/2 = ${(trace/2).toFixed(4)}`,
             `   Imaginary part = √${-delta}/2 = ${(Math.sqrt(-delta)/2).toFixed(4)}`
        );
    }
    return { text: resultText, steps };
};

const solveVectorCross = (inputs: any): CalculationResult => {
    const ax=Number(inputs.v1x), ay=Number(inputs.v1y), az=Number(inputs.v1z);
    const bx=Number(inputs.v2x), by=Number(inputs.v2y), bz=Number(inputs.v2z);
    
    const cx = ay*bz - az*by;
    const cy = az*bx - ax*bz;
    const cz = ax*by - ay*bx;
    
    return { text: `Cross Product = [${cx}, ${cy}, ${cz}]`, steps: [
        `**1. Identify Vectors:**`,
        `   A = [${ax}, ${ay}, ${az}]`,
        `   B = [${bx}, ${by}, ${bz}]`,
        `**2. Apply Formulas:**`,
        `   cx = ay*bz - az*by`,
        `   cy = az*bx - ax*bz`,
        `   cz = ax*by - ay*bx`,
        `**3. Substitute and Solve:**`,
        `   cx = ${ay}*${bz} - ${az}*${by} = ${cx}`,
        `   cy = ${az}*${bx} - ${ax}*${bz} = ${cy}`,
        `   cz = ${ax}*${by} - ${ay}*${bx} = ${cz}`,
        `**4. Result:**`,
        `   [${cx}, ${cy}, ${cz}]`
    ]};
};

const solveBinomial = (inputs: any): CalculationResult => {
    const n = Number(inputs.n);
    const p = Number(inputs.p);
    const k = Number(inputs.k);
    
    const prob = combinations(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
    
    // Graph
    const data = [];
    const labels = [];
    for(let i=0; i<=n; i++) {
        labels.push(i);
        data.push(combinations(n, i) * Math.pow(p, i) * Math.pow(1-p, n-i));
    }
    
    return { 
        text: `P(X=${k}) = ${prob.toFixed(6)}`,
        steps: [
            `**1. Identify parameters:**`,
            `   n = ${n}, p = ${p}, k = ${k}`,
            `**2. Apply Formula:**`,
            `   P(X=k) = C(n, k) × p^k × (1-p)^(n-k)`,
            `**3. Substitution:**`,
            `   C(${n}, ${k}) = ${combinations(n, k)}`,
            `   ${p}^${k} = ${Math.pow(p, k).toFixed(6)}`,
            `   (1-${p})^(${n}-${k}) = ${Math.pow(1-p, n-k).toFixed(6)}`,
            `**4. Result:**`,
            `   ${prob.toFixed(6)}`
        ],
        plotData: {
            type: 'bar',
            data: { labels, datasets: [{ label: 'Probability', data, backgroundColor: labels.map(l => l===k ? 'rgb(244, 63, 94)' : 'rgba(129, 140, 248, 0.5)') }] }
        }
    };
};

const solveNormalDistribution = (inputs: any): CalculationResult => {
    const mean = Number(inputs.mean);
    const std = Number(inputs.stdDev);
    if (std <= 0) return { text: "Error: Standard Deviation must be a positive number." };

    let prob = 0;
    let text = "";
    let formulaDesc = "";
    
    if (inputs.probType === 'lessThan') {
        const x = Number(inputs.x1);
        prob = normalCdf(x, mean, std);
        text = `P(X < ${x}) = ${prob.toFixed(6)}`;
        formulaDesc = `Using CDF for x=${x}`;
    } else if (inputs.probType === 'greaterThan') {
        const x = Number(inputs.x1);
        prob = 1 - normalCdf(x, mean, std);
        text = `P(X > ${x}) = ${prob.toFixed(6)}`;
        formulaDesc = `1 - CDF(${x})`;
    } else {
        const x1 = Number(inputs.x1);
        const x2 = Number(inputs.x2);
        prob = normalCdf(x2, mean, std) - normalCdf(x1, mean, std);
        text = `P(${x1} < X < ${x2}) = ${prob.toFixed(6)}`;
        formulaDesc = `CDF(${x2}) - CDF(${x1})`;
    }
    
    // Bell curve data
    const points = [];
    const rangeVal = std * 4;
    for(let i = mean - rangeVal; i <= mean + rangeVal; i+= rangeVal/50) {
        const pdf = (1/(std*Math.sqrt(2*Math.PI))) * Math.exp(-0.5 * Math.pow((i-mean)/std, 2));
        points.push({x: i, y: pdf});
    }

    return { 
        text, 
        steps: [
             `**1. Identify parameters:**`,
             `   Mean (μ) = ${mean}`,
             `   Std Dev (σ) = ${std}`,
             `**2. Calculation (${formulaDesc}):**`,
             `   Z-score calc implicitly handled via Error Function (erf).`,
             `**3. Result:**`,
             `   Probability = ${prob.toFixed(6)}`
        ],
        plotData: { 
            type: 'line', 
            data: { datasets: [{ label: 'PDF', data: points, borderColor: 'rgb(129, 140, 248)', fill: true, backgroundColor: 'rgba(129, 140, 248, 0.1)' }] } 
        } 
    };
};

const solveLinearRegression = (inputs: any): CalculationResult => {
     const pairs = inputs.dataStr.trim().split('\n').map((l: string) => l.split(',').map(n => parseFloat(n)));
     const n = pairs.length;
     let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
     const scatterData: {x:number, y:number}[] = [];
     
     pairs.forEach(([x, y]: number[]) => {
         if (!isNaN(x) && !isNaN(y)) {
             sx += x; sy += y;
             sxy += x*y; sxx += x*x; syy += y*y;
             scatterData.push({x, y});
         }
     });
     
     const m = (n*sxy - sx*sy) / (n*sxx - sx*sx);
     const b = (sy - m*sx) / n;
     const r = (n*sxy - sx*sy) / Math.sqrt((n*sxx - sx*sx) * (n*syy - sy*sy));
     
     const lineData = [
         {x: scatterData[0].x, y: m*scatterData[0].x + b},
         {x: scatterData[scatterData.length-1].x, y: m*scatterData[scatterData.length-1].x + b}
     ];

     return { 
         text: `Equation: y = ${m.toFixed(4)}x + ${b.toFixed(4)}\nCorrelation Coefficient (R): ${r.toFixed(4)}`,
         steps: [
             `**1. Identify Data & Summations (n=${n}):**`,
             `   Σx=${sx}, Σy=${sy}`,
             `   Σxy=${sxy}, Σx²=${sxx}`,
             `**2. Calculate Slope (m):**`,
             `   m = (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)`,
             `   m = (${n}*${sxy} - ${sx}*${sy}) / (${n}*${sxx} - ${sx}^2)`,
             `   m = ${m.toFixed(4)}`,
             `**3. Calculate Intercept (b):**`,
             `   b = (Σy - mΣx) / n`,
             `   b = (${sy} - ${m.toFixed(4)}*${sx}) / ${n}`,
             `   b = ${b.toFixed(4)}`
         ],
         plotData: {
             type: 'scatter',
             data: {
                 datasets: [
                     { label: 'Data Points', data: scatterData, backgroundColor: 'white' },
                     { label: 'Best Fit Line', data: lineData, type: 'line', borderColor: 'rgb(244, 63, 94)', borderDash: [5,5] }
                 ] as ChartDataset[]
             }
         }
     };
};

const solveSimpleLinearEquation = (inputs: any): CalculationResult => {
    const { a, b, c } = inputs;
    if (a === 0) return { text: "a cannot be 0" };
    // ax + b = c => ax = c - b => x = (c-b)/a
    const x = (c - b) / a;
    return { 
        text: `${a}x + ${b} = ${c}\nSolution: x = ${x.toFixed(4)}`,
        steps: [
            `**1. Identify constants:**`,
            `   a = ${a}, b = ${b}, c = ${c}`,
            `**2. Rearrange Equation:**`,
            `   ${a}x + ${b} = ${c}`,
            `   ${a}x = ${c} - ${b} = ${c-b}`,
            `**3. Solve for x:**`,
            `   x = ${c-b} / ${a}`,
            `   x = ${x.toFixed(4)}`
        ]
    };
};

const solveLinearSystem = (inputs: any): CalculationResult => {
    const { a1, b1, c1, a2, b2, c2 } = inputs;
    // a1x + b1y = c1
    // a2x + b2y = c2
    const det = a1*b2 - a2*b1;
    if (det === 0) return { text: "Determinant is zero. No unique solution (parallel or identical lines)." };
    
    const x = (c1*b2 - c2*b1) / det;
    const y = (a1*c2 - a2*c1) / det;
    
    return { 
        text: `x = ${x.toFixed(4)}\ny = ${y.toFixed(4)}`,
        steps: [
            `**1. Identify coefficients:**`,
            `   Eq 1: ${a1}x + ${b1}y = ${c1}`,
            `   Eq 2: ${a2}x + ${b2}y = ${c2}`,
            `**2. Calculate Determinant (D):**`,
            `   D = (${a1})(${b2}) - (${a2})(${b1}) = ${det}`,
            `**3. Cramer's Rule / Substitution:**`,
            `   x = (c1*b2 - c2*b1) / D = (${c1}*${b2} - ${c2}*${b1}) / ${det}`,
            `   x = ${x.toFixed(4)}`,
            `   y = (a1*c2 - a2*c1) / D = (${a1}*${c2} - ${a2}*${c1}) / ${det}`,
            `   y = ${y.toFixed(4)}`
        ],
        plotData: {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Eq 1', data: [{x: x-5, y: (c1 - a1*(x-5))/b1}, {x: x+5, y: (c1 - a1*(x+5))/b1}], borderColor: 'blue' },
                    { label: 'Eq 2', data: [{x: x-5, y: (c2 - a2*(x-5))/b2}, {x: x+5, y: (c2 - a2*(x+5))/b2}], borderColor: 'green' },
                    { label: 'Solution', data: [{x, y}], type: 'scatter', backgroundColor: 'red', pointRadius: 6 }
                ]
            }
        }
    };
};

const solveComplexNumbers = (inputs: any): CalculationResult => {
    const r1 = Number(inputs.c1_real), i1 = Number(inputs.c1_imag);
    const r2 = Number(inputs.c2_real), i2 = Number(inputs.c2_imag);
    const op = inputs.operation;
    
    let resR, resI;
    let steps: string[] = [
        `**1. Identify complex numbers:**`,
        `   z1 = ${r1} + ${i1}i`,
        `   z2 = ${r2} + ${i2}i`,
    ];

    if (op === '+') { 
        resR = r1+r2; resI = i1+i2; 
        steps.push(
            `**2. Addition:**`,
            `   (a+c) + (b+d)i`,
            `   (${r1}+${r2}) + (${i1}+${i2})i`
        );
    }
    else if (op === '-') { 
        resR = r1-r2; resI = i1-i2; 
        steps.push(
            `**2. Subtraction:**`,
            `   (a-c) + (b-d)i`,
            `   (${r1}-${r2}) + (${i1}-${i2})i`
        );
    }
    else if (op === '*') { 
        resR = r1*r2 - i1*i2; resI = r1*i2 + r2*i1; 
        steps.push(
            `**2. Multiplication:**`,
            `   (ac - bd) + (ad + bc)i`,
            `   (${r1}*${r2} - ${i1}*${i2}) + (${r1}*${i2} + ${r2}*${i1})i`
        );
    }
    else if (op === '/') {
        const denom = r2*r2 + i2*i2;
        if (denom === 0) return { text: "Error: Division by zero" };
        resR = (r1*r2 + i1*i2) / denom;
        resI = (i1*r2 - r1*i2) / denom;
         steps.push(
            `**2. Division (Multiply by Conjugate):**`,
            `   Numerator = (${r1}+${i1}i)(${r2}-${i2}i)`,
            `   Denominator = ${r2}² + ${i2}² = ${denom}`,
            `   Real = (${r1}*${r2} + ${i1}*${i2}) / ${denom}`,
            `   Imag = (${i1}*${r2} - ${r1}*${i2}) / ${denom}`
        );
    }
    
    steps.push(`**3. Result:**`, `   ${resR?.toFixed(4)} + ${resI?.toFixed(4)}i`);
    return { text: `(${r1} + ${i1}i) ${op} (${r2} + ${i2}i) \n= ${resR?.toFixed(4)} + ${resI?.toFixed(4)}i`, steps };
};

const solveDistanceFormula = (inputs: any): CalculationResult => {
    const x1=Number(inputs.x1), y1=Number(inputs.y1);
    const x2=Number(inputs.x2), y2=Number(inputs.y2);
    const dist = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
    return { 
        text: `Point A: (${x1}, ${y1})\nPoint B: (${x2}, ${y2})\nDistance = ${dist.toFixed(4)}`,
        steps: [
            `**1. Identify coordinates:**`,
            `   Point A: (${x1}, ${y1})`,
            `   Point B: (${x2}, ${y2})`,
            `**2. Apply Distance Formula:**`,
            `   d = √((x2-x1)² + (y2-y1)²)`,
            `   d = √(( ${x2}-${x1} )² + ( ${y2}-${y1} )²)`,
            `   d = √(${Math.pow(x2-x1, 2)} + ${Math.pow(y2-y1, 2)})`,
            `**3. Result:**`,
            `   d = √${Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2)}`,
            `   d = ${dist.toFixed(4)}`
        ]
    };
};

const solveTriangleSolver = (inputs: any): CalculationResult => {
    const a = Number(inputs.s1), b = Number(inputs.s2), c = Number(inputs.s3);
    // Law of Cosines: c^2 = a^2 + b^2 - 2ab cos(C)
    // cos(C) = (a^2 + b^2 - c^2) / 2ab
    
    // Check triangle validity
    if (a+b<=c || a+c<=b || b+c<=a) return { text: "Invalid triangle. Sum of two sides must be greater than the third." };

    const angA = Math.acos((b*b + c*c - a*a) / (2*b*c)) * 180 / Math.PI;
    const angB = Math.acos((a*a + c*c - b*b) / (2*a*c)) * 180 / Math.PI;
    const angC = 180 - angA - angB;
    
    return { 
        text: `Angle A (opposite side a): ${angA.toFixed(2)}°\nAngle B (opposite side b): ${angB.toFixed(2)}°\nAngle C (opposite side c): ${angC.toFixed(2)}°`,
        steps: [
            `**1. Identify sides:**`,
            `   a=${a}, b=${b}, c=${c}`,
            `**2. Law of Cosines for Angle A:**`,
            `   cos A = (b² + c² - a²) / 2bc`,
            `   cos A = (${b}² + ${c}² - ${a}²) / 2(${b})(${c})`,
            `   A = arccos(...) = ${angA.toFixed(2)}°`,
            `**3. Law of Cosines for Angle B:**`,
            `   cos B = (a² + c² - b²) / 2ac`,
            `   B = ${angB.toFixed(2)}°`,
            `**4. Sum of Angles:**`,
            `   C = 180° - A - B = ${angC.toFixed(2)}°`
        ]
    };
};

const solveTrigBasics = (inputs: any): CalculationResult => {
    const ang = Number(inputs.angle);
    const rad = inputs.unit === 'deg' ? ang * Math.PI / 180 : ang;
    
    const steps = [
        `**1. Identify angle:**`,
        `   ${ang} ${inputs.unit}`
    ];
    
    if (inputs.unit === 'deg') {
        steps.push(`   Converted to radians: ${rad.toFixed(4)} rad`);
    }

    steps.push(
        `**2. Calculate Trig Functions:**`,
        `   sin(θ), cos(θ), tan(θ)`,
        `   sin(${rad.toFixed(4)}) = ${Math.sin(rad).toFixed(4)}`,
        `   cos(${rad.toFixed(4)}) = ${Math.cos(rad).toFixed(4)}`,
        `   tan(${rad.toFixed(4)}) = ${Math.tan(rad).toFixed(4)}`
    );

    return { 
        text: `Angle: ${ang} ${inputs.unit}\n\nsin = ${Math.sin(rad).toFixed(6)}\ncos = ${Math.cos(rad).toFixed(6)}\ntan = ${Math.tan(rad).toFixed(6)}`,
        steps
    };
};

const solveLaplace = (inputs: any): CalculationResult => {
    // Simple look-up based logic for demo
    const f = inputs.func.replace(/\s/g, '');
    let res = "";
    let reason = "";
    
    if (f === '1') { res = "1/s"; reason = "L{1} = 1/s"; }
    else if (f === 't') { res = "1/s^2"; reason = "L{t} = 1/s^2"; }
    else if (/^t\^\d+$/.test(f)) { const n = parseInt(f.split('^')[1]); res = `${factorial(n)} / s^${n+1}`; reason = `L{t^n} = n! / s^(n+1) with n=${n}`; }
    else if (/^exp\([-]?\d+\*?t\)$/.test(f)) { const a = f.match(/exp\(([-]?\d+)\*?t\)/)[1]; res = `1 / (s - ${a})`; reason = `L{e^(at)} = 1/(s-a) with a=${a}`; }
    else if (/^sin\(\d+\*?t\)$/.test(f)) { const a = f.match(/sin\((\d+)\*?t\)/)[1]; res = `${a} / (s^2 + ${a*a})`; reason = `L{sin(at)} = a/(s^2+a^2) with a=${a}`; }
    else if (/^cos\(\d+\*?t\)$/.test(f)) { const a = f.match(/cos\((\d+)\*?t\)/)[1]; res = `s / (s^2 + ${a*a})`; reason = `L{cos(at)} = s/(s^2+a^2) with a=${a}`; }
    else if (!isNaN(Number(f))) { res = `${f}/s`; reason = `L{c} = c/s with c=${f}`; }
    else {
        res = "Symbolic Laplace Transform requires a more advanced CAS engine. Supported patterns: c, t^n, exp(at), sin(at), cos(at).";
        reason = "Pattern not recognized in basic look-up table.";
    }
    
    return { 
        text: `L{${inputs.func}} = ${res}`, 
        steps: [
            `**1. Identify function:**`,
            `   f(t) = ${inputs.func}`,
            `**2. Apply Transform Table:**`,
            `   L{f(t)} = F(s)`,
            `   ${reason}`,
            `**3. Result:**`,
            `   F(s) = ${res}`
        ]
    };
};

const solveFourierTransform = (inputs: any): CalculationResult => {
    const signal = inputs.signalStr.split(',').map(Number);
    // Compute DFT magnitude
    const N = signal.length;
    const spectrum = [];
    for(let k=0; k<N; k++) {
        let re = 0, im = 0;
        for(let n=0; n<N; n++) {
            const phi = (2*Math.PI*k*n)/N;
            re += signal[n] * Math.cos(phi);
            im -= signal[n] * Math.sin(phi);
        }
        spectrum.push(Math.sqrt(re*re + im*im));
    }
    
    return {
        text: `DFT Magnitudes: ${spectrum.map(x => x.toFixed(2)).join(', ')}`,
        steps: [
            `**1. Identify input signal (N=${N}):**`,
            `   x[n] = [${signal.join(', ')}]`,
            `**2. Discrete Fourier Transform (DFT):**`,
            `   X[k] = Σ x[n] * e^(-i*2π*k*n/N)`,
            `**3. Compute Magnitudes |X[k]|:**`,
            `   Iterated over k=0 to ${N-1}`,
            `**4. Resulting spectrum:**`,
            `   [${spectrum.map(x => x.toFixed(2)).join(', ')}]`
        ],
        plotData: {
            type: 'bar',
            data: { labels: range(0, N-1), datasets: [{ label: 'Magnitude', data: spectrum, backgroundColor: 'purple' }] }
        }
    };
};

// --- NEW IMPLEMENTATIONS ---

// Physics Solvers
const solveForce = (inputs: any): CalculationResult => {
    const m = getVal(inputs, 'mass');
    const a = getVal(inputs, 'acceleration');
    return { text: `F = F=ma = ${m} × ${a} = ${(m*a).toFixed(4)}` };
};

const solveMass = (inputs: any): CalculationResult => {
    const d = Number(inputs.density);
    const v = Number(inputs.volume);
    return { text: `M = M=ρV = ${d} × ${v} = ${(d*v).toFixed(4)}` };
};

const solveDensity = (inputs: any): CalculationResult => {
    const m = getVal(inputs, 'mass');
    const v = getVal(inputs, 'volume');
    if(v===0) return { text: "Volume cannot be zero." };
    return { text: `ρ = ρ=m/V = ${m} / ${v} = ${(m/v).toFixed(4)}` };
};

const solveMomentum = (inputs: any): CalculationResult => {
    const m = Number(inputs.mass);
    const v = Number(inputs.velocity);
    return { text: `p = p=mv = ${m} × ${v} = ${(m*v).toFixed(4)}` };
};

const solveKineticEnergy = (inputs: any): CalculationResult => {
    const m = getVal(inputs, 'mass');
    const v = getVal(inputs, 'velocity');
    return { text: `KE = KE=0.5mv² = 0.5 × ${m} × ${v}² = ${(0.5*m*v*v).toFixed(4)}` };
};

const solvePotentialEnergy = (inputs: any): CalculationResult => {
    const m = getVal(inputs, 'mass');
    const h = getVal(inputs, 'height');
    return { text: `PE = PE=mgh = ${m} × ${g.toFixed(2)} × ${h} = ${(m*g*h).toFixed(4)}` };
};

const solveWork = (inputs: any): CalculationResult => {
    const f = Number(inputs.force);
    const d = Number(inputs.distance);
    const theta = Number(inputs.angle) * Math.PI / 180;
    return { text: `W = W=Fd = ${f} × ${d} × cos(${inputs.angle}°) = ${(f*d*Math.cos(theta)).toFixed(4)}` };
};

const solvePower = (inputs: any): CalculationResult => {
    const w = Number(inputs.work);
    const t = Number(inputs.time);
    if(t===0) return { text: "Time cannot be zero." };
    return { text: `P = P=W/t = ${w} / ${t} = ${(w/t).toFixed(4)} Watts` };
};

const solvePressure = (inputs: any): CalculationResult => {
    const f = Number(inputs.force);
    const a = Number(inputs.area);
    if(a===0) return { text: "Area cannot be zero." };
    return { text: `P = P=F/A = ${f} / ${a} = ${(f/a).toFixed(4)} Pa` };
};

const solveTorque = (inputs: any): CalculationResult => {
    const f = Number(inputs.force);
    const r = Number(inputs.leverArm);
    const theta = Number(inputs.angle) * Math.PI / 180;
    return { text: `τ = rFsin(θ) = ${r} × ${f} × sin(${inputs.angle}°) = ${(r*f*Math.sin(theta)).toFixed(4)} Nm` };
};

const solveAngularAcceleration = (inputs: any): CalculationResult => {
    const w1 = Number(inputs.initialAngularVelocity);
    const w2 = Number(inputs.finalAngularVelocity);
    const t = Number(inputs.time);
    if(t===0) return { text: "Time cannot be zero." };
    return { text: `α = (ωf - ωi) / t = (${w2} - ${w1}) / ${t} = ${((w2-w1)/t).toFixed(4)} rad/s²` };
};

const solveAngularMomentum = (inputs: any): CalculationResult => {
    const I = Number(inputs.momentOfInertia);
    const w = Number(inputs.angularVelocity);
    return { text: `L = Iω = ${I} × ${w} = ${(I*w).toFixed(4)} kg·m²/s` };
};

const solveVelocity = (inputs: any): CalculationResult => {
    const d = Number(inputs.distance);
    const t = Number(inputs.time);
    if(t===0) return { text: "Time cannot be zero." };
    return { text: `v = d/t = ${d} / ${t} = ${(d/t).toFixed(4)} m/s` };
};

const solveCentrifugalForce = (inputs: any): CalculationResult => {
    const m = Number(inputs.mass);
    const v = Number(inputs.velocity);
    const r = Number(inputs.radius);
    if(r===0) return { text: "Radius cannot be zero." };
    return { text: `Fc = mv²/r = ${m} × ${v}² / ${r} = ${(m*v*v/r).toFixed(4)} N` };
};

const solveCoulombsLaw = (inputs: any): CalculationResult => {
    const q1 = Number(inputs.charge1);
    const q2 = Number(inputs.charge2);
    const r = Number(inputs.distance);
    if(r===0) return { text: "Distance cannot be zero." };
    const F = k_coulomb * Math.abs(q1*q2) / (r*r);
    return { text: `Fe = k|q1q2|/r² = ${(k_coulomb).toExponential(2)} * |${q1}*${q2}| / ${r}² = ${F.toExponential(4)} N` };
};

const solveDisplacement = (inputs: any): CalculationResult => {
    const x0 = Number(inputs.initialPosition);
    const x = Number(inputs.finalPosition);
    return { text: `Δx = x - x0 = ${x} - ${x0} = ${(x-x0).toFixed(4)}` };
};

const solveFallingObjectDistance = (inputs: any): CalculationResult => {
    const v0 = Number(inputs.initialVelocity);
    const t = Number(inputs.time);
    // d = v0*t + 0.5*g*t^2
    const d = v0*t + 0.5*g*t*t;
    return { text: `d = v0*t + 0.5*g*t² = ${v0}*${t} + 0.5*${g}*${t}² = ${d.toFixed(4)} m` };
};

const solveFriction = (inputs: any): CalculationResult => {
    const n = Number(inputs.normalForce);
    const u = Number(inputs.frictionCoefficient);
    return { text: `Ff = μN = ${u} × ${n} = ${(u*n).toFixed(4)} N` };
};

const solveGravitationalForce = (inputs: any): CalculationResult => {
    const m1 = Number(inputs.mass1);
    const m2 = Number(inputs.mass2);
    const r = Number(inputs.distance);
    if(r===0) return { text: "Distance cannot be zero." };
    const F = G * m1 * m2 / (r*r);
    return { text: `Fg = G*m1*m2/r² = ${F.toExponential(4)} N` };
};

const solveHeat = (inputs: any): CalculationResult => {
    const m = Number(inputs.mass);
    const c = Number(inputs.specificHeat);
    const dt = Number(inputs.temperatureChange);
    return { text: `Q = mcΔT = ${m} × ${c} × ${dt} = ${(m*c*dt).toFixed(4)} J` };
};

const solvePulleyTension = (inputs: any): CalculationResult => {
    // Assuming simple static pulley holding a mass? or Atwood machine?
    // Description says "Simple Pulley Tension". Usually T = mg if static.
    const m = Number(inputs.mass);
    return { text: `Tension (static) = mg = ${m} × ${g} = ${(m*g).toFixed(4)} N` };
};

const solveAcceleration = (inputs: any): CalculationResult => {
    const v0 = Number(inputs.initialVelocity);
    const vf = Number(inputs.finalVelocity);
    const t = Number(inputs.time);
    if(t===0) return { text: "Time cannot be zero." };
    return { text: `a = (vf - v0)/t = (${vf} - ${v0}) / ${t} = ${((vf-v0)/t).toFixed(4)} m/s²` };
};

const solveAbsolutePressure = (inputs: any): CalculationResult => {
    const pg = Number(inputs.gaugePressure);
    const pa = Number(inputs.atmosphericPressure);
    return { text: `Pabs = Pgauge + Patm = ${pg} + ${pa} = ${(pg+pa).toFixed(4)} Pa` };
};

const solveWavelength = (inputs: any): CalculationResult => {
    const v = Number(inputs.waveSpeed);
    const f = Number(inputs.frequency);
    if(f===0) return { text: "Frequency cannot be zero." };
    return { text: `λ = v/f = ${v} / ${f} = ${(v/f).toFixed(4)} m` };
};

const solveBeersLaw = (inputs: any): CalculationResult => {
    const e = Number(inputs.absorptivity);
    const l = Number(inputs.pathLength);
    const c = Number(inputs.concentration);
    const A = e * l * c;
    return { text: `Absorbance A = εlc = ${e} × ${l} × ${c} = ${A.toFixed(4)}` };
};

const solveResultantVector = (inputs: any): CalculationResult => {
    const a = Number(inputs.magnitudeA);
    const b = Number(inputs.magnitudeB);
    const ang = Number(inputs.angle) * Math.PI / 180;
    // R = sqrt(a^2 + b^2 + 2ab cos(theta))
    const R = Math.sqrt(a*a + b*b + 2*a*b*Math.cos(ang));
    return { text: `Resultant R = √(a² + b² + 2ab cosθ) = ${R.toFixed(4)}` };
};

const solveProjectileMotion = (inputs: any): CalculationResult => {
    const v0 = getVal(inputs, 'initialVelocity');
    const angleDeg = Number(inputs.launchAngle);
    const h0 = getVal(inputs, 'initialHeight');
    const theta = angleDeg * Math.PI / 180;
    
    const vx = v0 * Math.cos(theta);
    const vy = v0 * Math.sin(theta);
    
    // Time of flight
    // y(t) = h0 + vy*t - 0.5*g*t^2 = 0
    const d = Math.sqrt(vy*vy + 2*g*h0);
    const t_flight = (vy + d) / g;
    
    // Max height
    // vy(t) = vy - gt = 0 => t_max = vy/g
    const t_max = vy/g;
    const h_max = h0 + vy*t_max - 0.5*g*t_max*t_max;
    
    // Range
    const R = vx * t_flight;

    // Plot
    const points = [];
    for(let t=0; t<=t_flight; t+=t_flight/50) {
        points.push({x: vx*t, y: h0 + vy*t - 0.5*g*t*t});
    }
    points.push({x: R, y: 0});

    return {
        text: `Time of Flight: ${t_flight.toFixed(2)} s\nMaximum Height: ${h_max.toFixed(2)} m\nHorizontal Range: ${R.toFixed(2)} m`,
        steps: [
            `**1. Components:**`,
            `   vx = ${v0} cos(${angleDeg}°) = ${vx.toFixed(2)} m/s`,
            `   vy = ${v0} sin(${angleDeg}°) = ${vy.toFixed(2)} m/s`,
            `**2. Time of Flight:**`,
            `   Solves y(t) = ${h0} + ${vy.toFixed(2)}t - 4.9t² = 0`,
            `   t = ${(vy + d)/g} s`,
            `**3. Max Height:**`,
            `   Occurs at t = vy/g = ${t_max.toFixed(2)} s`,
            `   Max Height = ${h_max.toFixed(2)} m`
        ],
        plotData: {
            type: 'line',
            data: { datasets: [{ label: 'Trajectory', data: points, borderColor: 'orange', fill: false }] }
        }
    };
};

const solveOhmsLaw = (inputs: any): CalculationResult => {
    const mode = inputs.solveFor;
    if (mode === 'voltage') {
        const I = Number(inputs.current);
        const R = Number(inputs.resistance);
        return { text: `Voltage = I × R = ${I} A × ${R} Ω = ${(I*R).toFixed(4)} V` };
    }
    if (mode === 'current') {
        const V = Number(inputs.voltage);
        const R = Number(inputs.resistance);
        if(R===0) return { text: "Resistance cannot be zero." };
        return { text: `Current = V / R = ${V} V / ${R} Ω = ${(V/R).toFixed(4)} A` };
    }
    const V = Number(inputs.voltage);
    const I = Number(inputs.current);
    if(I===0) return { text: "Current cannot be zero." };
    return { text: `Resistance = V / I = ${V} V / ${I} A = ${(V/I).toFixed(4)} Ω` };
};

const solveKinematics = (inputs: any): CalculationResult => {
    // Variables: s, u, v, a, t
    // Equations:
    // 1. v = u + at
    // 2. s = ut + 0.5at^2
    // 3. s = vt - 0.5at^2
    // 4. v^2 = u^2 + 2as
    // 5. s = 0.5(u+v)t
    
    const vars = {
        s: inputs.s !== '' ? Number(inputs.s) : null,
        u: inputs.u !== '' ? Number(inputs.u) : null,
        v: inputs.v !== '' ? Number(inputs.v) : null,
        a: inputs.a !== '' ? Number(inputs.a) : null,
        t: inputs.t !== '' ? Number(inputs.t) : null
    };

    const knowns = Object.entries(vars).filter(([_, val]) => val !== null);
    if (knowns.length < 3) return { text: "Please provide at least 3 known variables to solve for the others." };

    let resText = "";
    
    // Attempt to solve for missing
    // Solvers for specific missing variables based on known 3
    // This is a simplified version handling common cases
    
    const s = vars.s, u = vars.u, v = vars.v, a = vars.a, t = vars.t;

    // Case 1: Solve for v and s given u, a, t
    if (u!==null && a!==null && t!==null) {
        const calcV = u + a*t;
        const calcS = u*t + 0.5*a*t*t;
        resText += `Final Velocity (v): ${calcV.toFixed(4)}\nDisplacement (s): ${calcS.toFixed(4)}`;
    }
    // Case 2: Solve for s and t given u, v, a
    else if (u!==null && v!==null && a!==null) {
        if(a===0 && u!==v) return { text: "Invalid input: Constant acceleration 0 implies u=v." };
        const calcT = a !== 0 ? (v - u) / a : 0; // if a=0, time is undefined from this eq unless s given
        const calcS = (v*v - u*u)/(2*a);
        resText += `Time (t): ${calcT.toFixed(4)}\nDisplacement (s): ${calcS.toFixed(4)}`;
    }
    // Case 3: Solve for u and a given s, v, t
    else if (s!==null && v!==null && t!==null) {
         const calcU = (2*s)/t - v;
         const calcA = (v - calcU)/t;
         resText += `Initial Velocity (u): ${calcU.toFixed(4)}\nAcceleration (a): ${calcA.toFixed(4)}`;
    }
    // Case 4: Solve for v and t given s, u, a
    else if (s!==null && u!==null && a!==null) {
        // v^2 = u^2 + 2as
        const v2 = u*u + 2*a*s;
        if(v2 < 0) return { text: "No real solution for final velocity." };
        const calcV = Math.sqrt(v2);
        const calcT = (calcV - u)/a;
        resText += `Final Velocity (v): ±${calcV.toFixed(4)}\nTime (t): ${calcT.toFixed(4)} (using +v)`;
    }
    else {
        resText = "Solver combination not implemented yet. Try providing u, a, t or u, v, a.";
    }

    return { text: resText };
};


// Finance Solvers
const solveSimpleInterest = (inputs: any): CalculationResult => {
    const P = Number(inputs.principal);
    const R = Number(inputs.rate);
    const T = Number(inputs.time);
    const SI = (P * R * T) / 100;
    const A = P + SI;
    return { 
        text: `Simple Interest (SI) = (P × R × T) / 100 = $${SI.toFixed(2)}\nTotal Amount (A) = P + SI = $${A.toFixed(2)}`,
        plotData: {
            type: 'bar',
            data: {
                labels: ['Principal', 'Interest', 'Total'],
                datasets: [{
                    label: 'Amount ($)',
                    data: [P, SI, A],
                    backgroundColor: ['#60a5fa', '#34d399', '#f472b6']
                }]
            }
        }
    };
};

const solveMortgage = (inputs: any): CalculationResult => {
    const P = Number(inputs.principal);
    const r = Number(inputs.rate) / 100 / 12; // monthly rate
    const n = Number(inputs.years) * 12; // months
    
    if (r === 0) return { text: `Monthly Payment: $${(P/n).toFixed(2)}` };

    // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]
    const M = P * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
    const totalPaid = M * n;
    const totalInterest = totalPaid - P;

    return { 
        text: `Monthly Payment: $${M.toFixed(2)}\nTotal Interest Paid: $${totalInterest.toFixed(2)}\nTotal Cost: $${totalPaid.toFixed(2)}`,
        plotData: {
            type: 'doughnut',
            data: { labels: ['Principal', 'Interest'], datasets: [{ label: 'Cost Breakdown', data: [P, totalInterest], backgroundColor: ['#818cf8', '#f43f5e'] }] }
        }
    };
};

const solveLoanComparison = (inputs: any): CalculationResult => {
    const calcLoan = (P: number, rate: number, years: number) => {
        const r = rate / 100 / 12;
        const n = years * 12;
        const M = P * (r * Math.pow(1+r, n)) / (Math.pow(1+r, n) - 1);
        return { monthly: M, total: M*n, interest: M*n - P };
    };
    
    const l1 = calcLoan(Number(inputs.principalA), Number(inputs.rateA), Number(inputs.yearsA));
    const l2 = calcLoan(Number(inputs.principalB), Number(inputs.rateB), Number(inputs.yearsB));
    
    return {
        text: `Loan A:\n  Monthly: $${l1.monthly.toFixed(2)}\n  Total Interest: $${l1.interest.toFixed(2)}\n\nLoan B:\n  Monthly: $${l2.monthly.toFixed(2)}\n  Total Interest: $${l2.interest.toFixed(2)}`,
        plotData: {
            type: 'bar',
            data: { 
                labels: ['Monthly Payment', 'Total Interest'], 
                datasets: [
                    { label: 'Loan A', data: [l1.monthly, l1.interest], backgroundColor: '#60a5fa' },
                    { label: 'Loan B', data: [l2.monthly, l2.interest], backgroundColor: '#f472b6' }
                ]
            }
        }
    };
};

// --- MAIN SOLVE FUNCTION ---
export const solve = (calculatorName: string, inputs: any): CalculationResult => {
    switch (calculatorName) {
        // Basic Math
        case 'Arithmetic Calculator': return solveArithmetic(inputs);
        case 'Percentage Calculator': return solvePercentage(inputs);
        case 'Unit Converter': return solveUnitConverter(inputs);
        
        // Algebra
        case 'Quadratic Equation Solver': return solveQuadratic(inputs);
        case 'Linear Equation Solver': return solveSimpleLinearEquation(inputs);
        case 'Polynomial Root Finder': return solveQuadratic({a:1, b:Number(inputs.coeffsStr?.split(',')[1]), c:Number(inputs.coeffsStr?.split(',')[2])}); // Rudimentary mapping
        case 'System of Equations': return solveLinearSystem(inputs);
        case 'Complex Number Calculator': return solveComplexNumbers(inputs);
        
        // Calculus
        case 'Derivative Calculator': return solveDerivative(inputs);
        case 'Integral Calculator': return solveIntegral(inputs);
        case 'Limit Calculator': return solveLimit(inputs);
        case 'Differential Equation Solver': return solveDifferentialEquation(inputs);
        case 'Laplace Transform Calculator': return solveLaplace(inputs);
        
        // Geometry
        case 'Area & Perimeter': return solveAreaPerimeter(inputs);
        case 'Triangle Solver': return solveTriangleSolver(inputs);
        case 'Circle Calculator': return solveAreaPerimeter({...inputs, shape: 'circle'});
        case 'Distance Formula': return solveDistanceFormula(inputs);
        
        // Trigonometry
        case 'Trigonometry Calculator (sin, cos, tan)': return solveTrigBasics(inputs);
        case 'Trigonometric Equation Solver': return solveTrigEquation(inputs);
        
        // Matrix
        case 'Matrix Multiplication': return solveMatrixMultiplication(inputs);
        case 'Matrix Determinant': return solveMatrixDeterminant(inputs);
        case 'Eigenvalue/Eigenvector': return solveEigen(inputs);
        case 'Vector Cross Product': return solveVectorCross(inputs);
        case 'Fourier Transform Calculator': return solveFourierTransform(inputs);
        
        // Statistics
        case 'Statistics Calculator': {
             // Basic implementation for mean, median etc.
             const data = inputs.dataStr.split(',').map((s:string) => parseFloat(s.trim())).filter((n:number) => !isNaN(n)).sort((a:number, b:number) => a - b);
             if (data.length === 0) return { text: "Please provide a list of numbers." };
             const sum = data.reduce((a:number, b:number) => a + b, 0);
             const avg = sum / data.length;
             const median = data.length % 2 === 0 ? (data[data.length/2 - 1] + data[data.length/2])/2 : data[Math.floor(data.length/2)];
             const range = data[data.length-1] - data[0];
             
             // Mode
             const counts: {[key: number]: number} = {};
             data.forEach((n:number) => counts[n] = (counts[n] || 0) + 1);
             let mode = data[0]; let maxCount = 0;
             for(const n in counts) { if(counts[n] > maxCount) { maxCount = counts[n]; mode = Number(n); } }
             
             // Variance & Std Dev
             const variance = data.reduce((a:number, b:number) => a + Math.pow(b - avg, 2), 0) / data.length;
             const stdDev = Math.sqrt(variance);

             return {
                 text: `Mean (Average): ${avg.toFixed(4)}\nMedian (Middle Value): ${median.toFixed(4)}\nMode (Most Frequent): ${mode}\nRange: ${range}\nStandard Deviation (Population): ${stdDev.toFixed(4)}\nVariance: ${variance.toFixed(4)}`,
                 plotData: {
                     type: 'bar',
                     data: {
                         labels: data.map((_, i) => i+1),
                         datasets: [{ label: 'Data Points', data: data, backgroundColor: 'rgba(52, 211, 153, 0.6)' }]
                     }
                 }
             };
        }
        case 'Binomial Distribution': return solveBinomial(inputs);
        case 'Normal Distribution': return solveNormalDistribution(inputs);
        case 'Linear Regression': return solveLinearRegression(inputs);
        
        // Finance
        case 'Simple Interest Calculator': return solveSimpleInterest(inputs);
        case 'Mortgage Calculator': return solveMortgage(inputs);
        case 'Loan Comparison Calculator': return solveLoanComparison(inputs);
        
        // Physics
        case 'Projectile Motion Calculator': return solveProjectileMotion(inputs);
        case "Ohm's Law Calculator": return solveOhmsLaw(inputs);
        case 'Kinematic Equations Calculator': return solveKinematics(inputs);
        
        // Simple Physics formulas
        case 'Force Calculator (Newton\'s 2nd Law)': return solveForce(inputs);
        case 'Mass Calculator': return solveMass(inputs);
        case 'Density Calculator': return solveDensity(inputs);
        case 'Momentum Calculator': return solveMomentum(inputs);
        case 'Kinetic Energy Calculator': return solveKineticEnergy(inputs);
        case 'Potential Energy Calculator': return solvePotentialEnergy(inputs);
        case 'Work Calculator': return solveWork(inputs);
        case 'Power Calculator': return solvePower(inputs);
        case 'Pressure Calculator': return solvePressure(inputs);
        case 'Torque Calculator': return solveTorque(inputs);
        case 'Angular Acceleration Calculator': return solveAngularAcceleration(inputs);
        case 'Angular Momentum Calculator': return solveAngularMomentum(inputs);
        case 'Velocity Calculator': return solveVelocity(inputs);
        case 'Centrifugal Force Calculator': return solveCentrifugalForce(inputs);
        case 'Coulomb\'s Law Calculator': return solveCoulombsLaw(inputs);
        case 'Displacement Calculator': return solveDisplacement(inputs);
        case 'Falling Object Distance Calculator': return solveFallingObjectDistance(inputs);
        case 'Friction Calculator': return solveFriction(inputs);
        case 'Gravitational Force Calculator': return solveGravitationalForce(inputs);
        case 'Heat Calculator': return solveHeat(inputs);
        case 'Simple Pulley Tension Calculator': return solvePulleyTension(inputs);
        case 'Acceleration Calculator': return solveAcceleration(inputs);
        case 'Absolute Pressure Calculator': return solveAbsolutePressure(inputs);
        case 'Wavelength Calculator': return solveWavelength(inputs);
        case 'Beer\'s Lambert Law Calculator': return solveBeersLaw(inputs);
        case 'Resultant Vector Calculator': return solveResultantVector(inputs);

        default: return { text: "Calculator logic not yet implemented." };
    }
};
