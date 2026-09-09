
/**
 * @jest-environment jsdom
 */
import { solve } from './calculatorService';

// Mock describe and it for environments that don't have a test runner built-in
const describe = (description: string, fn: () => void) => {
  console.log(`DESCRIBE: ${description}`);
  fn();
};
const it = (description: string, fn: () => void) => {
    console.log(`IT: ${description}`);
    try {
        fn();
        console.log('... PASSED');
    } catch (error) {
        console.error('... FAILED', error);
    }
};
const expect = (received: any) => ({
    toBe: (expected: any) => {
        if (received !== expected) throw new Error(`Expected ${received} to be ${expected}`);
    },
    toContain: (substring: string) => {
        if (!received.includes(substring)) throw new Error(`Expected "${received}" to contain "${substring}"`);
    },
    toBeCloseTo: (expected: number, precision = 2) => {
        const pass = Math.abs(expected - received) < Math.pow(10, -precision) / 2;
        if (!pass) throw new Error(`Expected ${received} to be close to ${expected}`);
    },
    toBeDefined: () => {
        if (received === undefined || received === null) throw new Error(`Expected value to be defined, but it was ${received}`);
    },
     toBeNull: () => {
        if (received !== null) throw new Error(`Expected value to be null, but it was ${received}`);
    },
    toEqual: (expected: any) => {
        if (JSON.stringify(received) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`);
    }
});

// Full Test Suite
describe('Calculator Service: Full Test Suite', () => {

    // --- Basic Math ---
    describe('Arithmetic Calculator', () => {
        it('should add two numbers', () => {
            const result = solve('Arithmetic Calculator', { num1: 5, num2: 3, operation: '+' });
            expect(result.text).toBe('5 + 3 = 8');
            expect(result.plotData).toBeDefined();
        });
        it('should subtract two numbers', () => {
            const result = solve('Arithmetic Calculator', { num1: 5, num2: 3, operation: '-' });
            expect(result.text).toBe('5 - 3 = 2');
        });
        it('should multiply two numbers', () => {
            const result = solve('Arithmetic Calculator', { num1: 5, num2: 3, operation: '*' });
            expect(result.text).toBe('5 × 3 = 15');
        });
        it('should divide two numbers', () => {
            const result = solve('Arithmetic Calculator', { num1: 6, num2: 3, operation: '/' });
            expect(result.text).toBe('6 ÷ 3 = 2');
        });
        it('should handle division by zero', () => {
            const result = solve('Arithmetic Calculator', { num1: 5, num2: 0, operation: '/' });
            expect(result.text).toContain('Error: Division by zero');
        });
    });

    describe('Percentage Calculator', () => {
        it('should calculate a simple percentage', () => {
            const result = solve('Percentage Calculator', { part: 20, total: 80 });
            expect(result.text).toBe('20 is 25.00% of 80.');
            expect(result.plotData).toBeDefined();
        });
        it('should handle zero total', () => {
            const result = solve('Percentage Calculator', { part: 20, total: 0 });
            expect(result.text).toContain('Error: Total value cannot be zero');
        });
    });
    
    describe('Unit Converter', () => {
        it('should convert meters to feet', () => {
            const result = solve('Unit Converter', { conversionType: 'length', value: 10, fromUnit: 'm', toUnit: 'ft' });
            expect(result.text).toBe('10 Meter = 32.8084 Feet');
        });
        it('should convert kilograms to pounds', () => {
            const result = solve('Unit Converter', { conversionType: 'mass', value: 5, fromUnit: 'kg', toUnit: 'lb' });
            expect(result.text).toBe('5 Kilogram = 11.0231 Pounds');
        });
        it('should convert celsius to fahrenheit', () => {
            const result = solve('Unit Converter', { conversionType: 'temperature', value: 100, fromUnit: 'C', toUnit: 'F' });
            expect(result.text).toBe('100 Celsius = 212.0000 Fahrenheit');
        });
         it('should convert gallons to liters', () => {
            const result = solve('Unit Converter', { conversionType: 'volume', value: 1, fromUnit: 'gal', toUnit: 'L' });
            expect(result.text).toBe('1 Gallon (US) = 3.7854 Liters');
        });
        it('should convert megabytes to gigabytes', () => {
            const result = solve('Unit Converter', { conversionType: 'data', value: 2048, fromUnit: 'MB', toUnit: 'GB' });
            expect(result.text).toBe('2048 Megabyte = 2.0000 Gigabyte');
        });
    });

    // --- Algebra ---
    describe('Quadratic Equation Solver', () => {
        it('should solve for two real roots', () => {
            const result = solve('Quadratic Equation Solver', { a: 1, b: -3, c: 2 }); // x^2 - 3x + 2 = 0 -> x=1, x=2
            expect(result.text).toContain('x₁ = 2.0000');
            expect(result.text).toContain('x₂ = 1.0000');
            expect(result.plotData).toBeDefined();
        });
        it('should solve for one real root', () => {
            const result = solve('Quadratic Equation Solver', { a: 1, b: -2, c: 1 }); // x^2 - 2x + 1 = 0 -> x=1
            expect(result.text).toContain('x = 1.0000');
        });
        it('should solve for complex roots', () => {
            const result = solve('Quadratic Equation Solver', { a: 1, b: 2, c: 5 });
            expect(result.text).toContain('two complex roots');
            expect(result.text).toContain('x₁ = -1.0000 + 2.0000i');
        });
        it('should handle a=0', () => {
            const result = solve('Quadratic Equation Solver', { a: 0, b: 2, c: 4 });
            expect(result.text).toContain('not a quadratic equation');
        });
    });

    describe('Linear Equation Solver', () => {
        it('should solve ax + b = c', () => {
            const result = solve('Linear Equation Solver', { a: 2, b: 5, c: 15 }); // 2x + 5 = 15 -> x = 5
            expect(result.text).toContain('x = 5.0000');
        });
        it('should handle a=0', () => {
            const result = solve('Linear Equation Solver', { a: 0, b: 5, c: 15 });
            expect(result.text).toContain('a cannot be 0');
        });
    });

    describe('Polynomial Root Finder', () => {
        it('should solve a linear equation', () => {
            const result = solve('Polynomial Root Finder', { coeffsStr: '2, -10' }); // 2x - 10 = 0 -> x=5
            expect(result.text).toContain('Root: x = 5.0000');
        });
        it('should solve a quadratic equation', () => {
            const result = solve('Polynomial Root Finder', { coeffsStr: '1, -3, 2' }); // x^2 - 3x + 2 = 0
            expect(result.text).toContain('x₁ = 2.0000');
            expect(result.text).toContain('x₂ = 1.0000');
        });
        it('should report higher degrees as unsupported', () => {
            const result = solve('Polynomial Root Finder', { coeffsStr: '1, 0, 0, -8' }); // x^3 - 8 = 0
            expect(result.text).toContain('not supported');
        });
    });
    
     describe('System of Equations', () => {
        it('should solve a 2x2 system', () => {
            // 2x + 3y = 6
            // 4x + y = 25
            // Solution: x=6.9, y=-2.6
            const result = solve('System of Equations', { a1: 2, b1: 3, c1: 6, a2: 4, b2: 1, c2: 25 });
            expect(result.text).toContain('x = 6.9000');
            expect(result.text).toContain('y = -2.6000');
            expect(result.plotData).toBeDefined();
        });
         it('should detect parallel lines (no solution)', () => {
             // 2x + 3y = 6
             // 4x + 6y = 10
            const result = solve('System of Equations', { a1: 2, b1: 3, c1: 6, a2: 4, b2: 6, c2: 10 });
            expect(result.text).toContain('No unique solution');
        });
    });
    
    describe('Complex Number Calculator', () => {
        it('should add complex numbers', () => {
            const result = solve('Complex Number Calculator', { c1_real: 3, c1_imag: 2, c2_real: 1, c2_imag: 7, operation: '+' });
            expect(result.text).toContain('= 4.0000 + 9.0000i');
        });
         it('should subtract complex numbers', () => {
            const result = solve('Complex Number Calculator', { c1_real: 3, c1_imag: 2, c2_real: 1, c2_imag: 7, operation: '-' });
            expect(result.text).toContain('= 2.0000 - 5.0000i');
        });
         it('should multiply complex numbers', () => {
            const result = solve('Complex Number Calculator', { c1_real: 3, c1_imag: 2, c2_real: 1, c2_imag: 7, operation: '*' });
            expect(result.text).toContain('= -11.0000 + 23.0000i');
        });
        it('should divide complex numbers', () => {
            const result = solve('Complex Number Calculator', { c1_real: 3, c1_imag: 2, c2_real: 1, c2_imag: 7, operation: '/' });
            expect(result.text).toContain('= 0.3400 - 0.3800i');
        });
         it('should handle division by zero', () => {
            const result = solve('Complex Number Calculator', { c1_real: 3, c1_imag: 2, c2_real: 0, c2_imag: 0, operation: '/' });
            expect(result.text).toContain('Error: Division by zero');
        });
    });

    // --- Calculus ---
    describe('Derivative Calculator', () => {
        it('should calculate the derivative of x^2 at x=2', () => {
            const result = solve('Derivative Calculator', { func: 'x^2', point: 2 });
            expect(result.text).toContain("f'(2) ≈ 4.000000");
            expect(result.plotData).toBeDefined();
        });
        it('should calculate the derivative of sin(x) at x=0', () => {
            const result = solve('Derivative Calculator', { func: 'sin(x)', point: 0 });
            const derivative = parseFloat(result.text.split('≈ ')[1]);
            expect(derivative).toBeCloseTo(1.0, 5);
        });
        it('should return error for invalid function', () => {
            const result = solve('Derivative Calculator', { func: 'invalidFunc(x)', point: 1 });
            expect(result.text).toContain('Invalid function');
        });
    });

    describe('Integral Calculator', () => {
        it('should calculate the integral of x^2 from 0 to 1', () => {
            const result = solve('Integral Calculator', { func: 'x^2', lower: 0, upper: 1 }); // Should be 1/3
            const integral = parseFloat(result.text.split('≈ ')[1]);
            expect(integral).toBeCloseTo(0.333, 3);
            expect(result.plotData).toBeDefined();
        });
        it('should handle lower limit >= upper limit', () => {
            const result = solve('Integral Calculator', { func: 'x', lower: 1, upper: 0 });
            expect(result.text).toContain('Lower limit must be less than upper limit');
        });
    });
    
    describe('Limit Calculator', () => {
        it('should find the limit of (x^2-1)/(x-1) as x->1', () => {
            const result = solve('Limit Calculator', { func: '(x^2-1)/(x-1)', point: 1 });
            expect(result.text).toContain('Limit ≈ 2.0000000');
        });
        it('should detect when a limit does not exist', () => {
            const result = solve('Limit Calculator', { func: 'abs(x)/x', point: 0 });
            expect(result.text).toContain('limit does not exist');
        });
    });

    describe('Laplace Transform Calculator', () => {
        it('should find the transform of a constant', () => {
            const result = solve('Laplace Transform Calculator', { func: '5' });
            expect(result.text).toBe('L{5} = 5/s');
        });
        it('should find the transform of t^n', () => {
            const result = solve('Laplace Transform Calculator', { func: 't^3' });
            expect(result.text).toBe('L{t^3} = 6 / s^4');
        });
        it('should find the transform of exp(at)', () => {
            const result = solve('Laplace Transform Calculator', { func: 'exp(-2*t)' });
            expect(result.text).toBe('L{exp(-2*t)} = 1 / (s - -2)');
        });
        it('should find the transform of sin(at)', () => {
            const result = solve('Laplace Transform Calculator', { func: 'sin(4*t)' });
            expect(result.text).toBe('L{sin(4*t)} = 4 / (s^2 + 16)');
        });
         it('should find the transform of cos(at)', () => {
            const result = solve('Laplace Transform Calculator', { func: 'cos(3*t)' });
            expect(result.text).toBe('L{cos(3*t)} = s / (s^2 + 9)');
        });
    });

    // --- Geometry & Trig ---
    describe('Area & Perimeter', () => {
        it('should calculate area for a triangle using SSS', () => {
            const result = solve('Area & Perimeter', { shape: 'triangle', triangleMethod: 'sss', s1: 3, s2: 4, s3: 5});
            expect(result.text).toContain("Area (Heron's Formula) = 6.0000");
            expect(result.text).toContain('Perimeter = a + b + c = 12.0000');
        });
         it('should reject invalid triangle sides', () => {
            const result = solve('Area & Perimeter', { shape: 'triangle', triangleMethod: 'sss', s1: 1, s2: 2, s3: 5});
            expect(result.text).toContain('Invalid triangle');
        });
    });

    describe('Triangle Solver', () => {
        it('should solve a 3-4-5 triangle', () => {
            const result = solve('Triangle Solver', { s1: 3, s2: 4, s3: 5 });
            expect(result.text).toContain('Angle A (opposite side a): 36.87°');
            expect(result.text).toContain('Angle B (opposite side b): 53.13°');
            expect(result.text).toContain('Angle C (opposite side c): 90.00°');
        });
    });
    
    describe('Distance Formula', () => {
        it('should calculate distance between two points', () => {
            const result = solve('Distance Formula', { x1: 0, y1: 0, x2: 3, y2: 4 });
            expect(result.text).toBe('Distance = 5.0000');
        });
    });

    describe('Trigonometry Calculator', () => {
        it('should calculate sin, cos, tan for 90 degrees', () => {
            const result = solve('Trigonometry Calculator (sin, cos, tan)', { angle: 90, unit: 'deg' });
            expect(result.text).toContain('sin(90°) = 1.000000');
            const cosVal = parseFloat(result.text.match(/cos\(90°\) = ([-.0-9e]+)/)![1]);
            expect(cosVal).toBeCloseTo(0, 6);
        });
    });

    // --- Matrix & Linear Algebra ---
     describe('Matrix Multiplication', () => {
        it('should multiply two 2x2 matrices', () => {
            const result = solve('Matrix Multiplication', {
                m1_00: 1, m1_01: 2, m1_10: 3, m1_11: 4,
                m2_00: 2, m2_01: 0, m2_10: 1, m2_11: 2,
            });
            // [1 2] * [2 0] = [4 4]
            // [3 4]   [1 2]   [10 8]
            expect(result.text).toContain('[ 4, 4 ]');
            expect(result.text).toContain('[ 10, 8 ]');
        });
    });

    describe('Matrix Determinant', () => {
        it('should calculate the determinant of a 2x2 matrix', () => {
            const result = solve('Matrix Determinant', { m_00: 4, m_01: 6, m_10: 3, m_11: 8 }); // 4*8 - 6*3 = 32 - 18 = 14
            expect(result.text).toBe('Determinant = 14');
        });
    });
    
    describe('Eigenvalue/Eigenvector', () => {
        it('should find eigenvalues for a simple matrix', () => {
            // Matrix: [[2, 1], [1, 2]]
            // Eigenvalues: 3, 1
            const result = solve('Eigenvalue/Eigenvector', { m_00: 2, m_01: 1, m_10: 1, m_11: 2 });
            expect(result.text).toContain('λ₁ = 3.0000');
            expect(result.text).toContain('λ₂ = 1.0000');
        });
    });
    
    describe('Vector Cross Product', () => {
        it('should calculate cross product of i and j', () => {
            // i x j = k => [1,0,0] x [0,1,0] = [0,0,1]
            const result = solve('Vector Cross Product', {
                v1x: 1, v1y: 0, v1z: 0,
                v2x: 0, v2y: 1, v2z: 0,
            });
            expect(result.text).toBe('Cross Product = [0, 0, 1]');
        });
    });

    // --- Statistics & Probability ---
    describe('Statistics Calculator', () => {
        it('should calculate all statistics for a dataset', () => {
            const result = solve('Statistics Calculator', { dataStr: '1, 2, 3, 4, 5, 5' });
            expect(result.text).toContain('Mean (Average): 3.3333');
            expect(result.text).toContain('Median (Middle Value): 3.5000');
            expect(result.text).toContain('Mode (Most Frequent): 5');
            expect(result.text).toContain('Standard Deviation (Population): 1.4907');
            expect(result.plotData).toBeDefined();
        });
        it('should handle single number input correctly', () => {
            // This test case ensures the regression fix (Number('5') vs String('5')) works
            const result = solve('Statistics Calculator', { dataStr: '5' });
            expect(result.text).toContain('Mean (Average): 5.0000');
            expect(result.text).toContain('Range: 0');
        });
        it('should handle empty data', () => {
            const result = solve('Statistics Calculator', { dataStr: '' });
            expect(result.text).toContain('Please provide a list of numbers');
        });
    });
    
    describe('Binomial Distribution', () => {
        it('should calculate binomial probability', () => {
            // 3 successes in 5 trials with p=0.5
            const result = solve('Binomial Distribution', { n: 5, p: 0.5, k: 3 });
            expect(result.text).toContain('P(X=3) = C(5, 3) * 0.5^3 * (1-0.5)^(5-3) = 0.312500');
            expect(result.plotData).toBeDefined();
        });
    });

    describe('Normal Distribution Calculator', () => {
        const stdNormal = { mean: 0, stdDev: 1 };
        it('should calculate P(X < x) for a standard normal distribution', () => {
            const result = solve('Normal Distribution', { ...stdNormal, probType: 'lessThan', x1: 0 });
            expect(result.text).toContain('P(X < 0) = 0.500000');
            expect(result.plotData).toBeDefined();
        });
        it('should calculate P(X > x) for a standard normal distribution', () => {
            const result = solve('Normal Distribution', { ...stdNormal, probType: 'greaterThan', x1: 1.96 });
            const prob = parseFloat(result.text.split('= ')[1]);
            expect(prob).toBeCloseTo(0.025, 3);
        });
        it('should calculate P(x1 < X < x2) for a standard normal distribution', () => {
            const result = solve('Normal Distribution', { ...stdNormal, probType: 'between', x1: -1, x2: 1 });
            const prob = parseFloat(result.text.split('= ')[1]);
            expect(prob).toBeCloseTo(0.682, 3);
        });
        it('should return an error for non-positive standard deviation', () => {
            const result = solve('Normal Distribution', { mean: 0, stdDev: 0, probType: 'lessThan', x1: 1 });
            expect(result.text).toContain('Error: Standard Deviation must be a positive number.');
        });
    });

    describe('Linear Regression Calculator', () => {
        it('should perform linear regression', () => {
            const dataStr = "1,1\n2,2\n3,3\n4,4.5";
            const result = solve('Linear Regression', { dataStr });
            expect(result.text).toContain('Equation: y = 1.1000x + -0.1500');
            expect(result.text).toContain('Correlation Coefficient (R): 0.9923');
            expect(result.plotData).toBeDefined();
        });
    });
    
    // --- Finance ---
    describe('Simple Interest Calculator', () => {
        it('should calculate simple interest correctly', () => {
            const result = solve('Simple Interest Calculator', { principal: 1000, rate: 5, time: 2 });
            expect(result.text).toContain('Simple Interest (SI) = (P × R × T) / 100 = $100.00');
            expect(result.text).toContain('Total Amount (A) = P + SI = $1100.00');
            expect(result.plotData).toBeDefined();
        });
    });
    
     describe('Mortgage Calculator', () => {
        it('should calculate monthly mortgage payments', () => {
            const result = solve('Mortgage Calculator', { principal: 300000, rate: 6.5, years: 30 });
            expect(result.text).toContain('Monthly Payment: $1896.20');
            expect(result.text).toContain('Total Interest Paid: $382633.08');
            expect(result.plotData).toBeDefined();
        });
    });

    describe('Loan Comparison Calculator', () => {
        it('should compare two different loan scenarios correctly', () => {
            const result = solve('Loan Comparison Calculator', {
                principalA: 200000, rateA: 5, yearsA: 30,
                principalB: 200000, rateB: 4.5, yearsB: 15
            });
            // Loan A (30yr @ 5%): Monthly: $1073.64, Total Interest: $186511.57
            // Loan B (15yr @ 4.5%): Monthly: $1529.99, Total Interest: $75398.58
            expect(result.text).toContain('1073.64');
            expect(result.text).toContain('186511.57');
            expect(result.text).toContain('1529.99');
            expect(result.text).toContain('75398.58');
            expect(result.plotData).toBeDefined();
        });
    });
    
    // --- Physics ---
    describe('Projectile Motion Calculator', () => {
        it('should calculate motion for a 45-degree launch from the ground', () => {
            const result = solve('Projectile Motion Calculator', { initialVelocity: 50, launchAngle: 45, initialHeight: 0 });
            expect(result.text).toContain('Time of Flight: 7.21 s');
            expect(result.text).toContain('Maximum Height: 63.71 m');
            expect(result.text).toContain('Horizontal Range: 254.84 m');
            expect(result.plotData).toBeDefined();
        });
    });

    describe("Ohm's Law Calculator", () => {
        it('should calculate voltage', () => {
            const result = solve("Ohm's Law Calculator", { solveFor: 'voltage', current: 2, resistance: 10 });
            expect(result.text).toContain('Voltage = 2 A × 10 Ω = 20.0000 V');
            expect(result.plotData).toBeDefined();
        });
        it('should calculate current', () => {
            const result = solve("Ohm's Law Calculator", { solveFor: 'current', voltage: 20, resistance: 10 });
            expect(result.text).toContain('Current = 20 V / 10 Ω = 2.0000 A');
        });
        it('should calculate resistance', () => {
            const result = solve("Ohm's Law Calculator", { solveFor: 'resistance', voltage: 20, current: 2 });
            expect(result.text).toContain('Resistance = 20 V / 2 A = 10.0000 Ω');
        });
        it('should handle division by zero for current', () => {
            const result = solve("Ohm's Law Calculator", { solveFor: 'current', voltage: 20, resistance: 0 });
            expect(result.text).toContain('Resistance cannot be zero');
        });
    });

    describe('Kinematic Equations Calculator', () => {
        it('should solve for displacement (s) and time (t)', () => {
            const result = solve('Kinematic Equations Calculator', { s: '', u: 0, v: 10, a: 2, t: '' });
            expect(result.text).toContain('Displacement (s): 25.0000');
            expect(result.text).toContain('Time (t): 5.0000');
        });
    
        it('should solve for final velocity (v) and time (t)', () => {
            const result = solve('Kinematic Equations Calculator', { s: 100, u: 0, v: '', a: 4, t: '' });
            const finalVelocity = parseFloat(result.text.match(/Final Velocity \(v\): ([-.0-9e]+)/)![1]);
            const time = parseFloat(result.text.match(/Time \(t\): ([-.0-9e]+)/)![1]);
            expect(finalVelocity).toBeCloseTo(28.2843, 4);
            expect(time).toBeCloseTo(7.0711, 4);
        });
        
        it('should return error for invalid string input', () => {
            const result = solve('Kinematic Equations Calculator', { s: 'abc', u: 0, v: '', a: 2, t: 10 });
            expect(result.text).toContain('Invalid input detected for: Displacement (s)');
        });
    
        it('should return error for insufficient variables', () => {
            const result = solve('Kinematic Equations Calculator', { s: '', u: 0, v: '', a: 2, t: 10 });
            expect(result.text).toContain('Please provide at least 3 known variables');
        });
    });
    
    describe('Simple Physics Formula Calculators', () => {
        it('Force Calculator (Newton\'s 2nd Law) should calculate force', () => {
            const result = solve('Force Calculator (Newton\'s 2nd Law)', { mass: 10, acceleration: 9.81 });
            expect(result.text).toContain('F = F=ma = 10 × 9.81 = 98.1000');
        });
    
        it('Momentum Calculator should calculate momentum', () => {
            const result = solve('Momentum Calculator', { mass: 5, velocity: 10 });
            expect(result.text).toContain('p = p=mv = 5 × 10 = 50.0000');
        });
    
        it('Kinetic Energy Calculator should calculate kinetic energy', () => {
            const result = solve('Kinetic Energy Calculator', { mass: 5, velocity: 10 });
            expect(result.text).toContain('KE = KE=0.5mv² = 0.5 × 5 × 10² = 250.0000');
        });
    
        it('Potential Energy Calculator should calculate potential energy', () => {
            const result = solve('Potential Energy Calculator', { mass: 10, height: 5 });
            const expectedPE = (10 * 9.80665 * 5).toFixed(4);
            expect(result.text).toContain(`PE = PE=mgh = 10 × 9.81 × 5 = ${expectedPE}`);
        });
    
        it('Density Calculator should calculate density', () => {
            const result = solve('Density Calculator', { mass: 100, volume: 10 });
            expect(result.text).toContain('ρ = ρ=m/V = 100 / 10 = 10.0000');
        });
    
        it('Mass Calculator should calculate mass', () => {
            const result = solve('Mass Calculator', { density: 10, volume: 5 });
            expect(result.text).toContain('M = M=ρV = 10 × 5 = 50.0000');
        });
    
        it('Work Calculator should calculate work', () => {
            const result = solve('Work Calculator', { force: 50, distance: 10, angle: 0 });
            expect(result.text).toContain('W = W=Fd = 50 × 10 × cos(0°) = 500.0000');
        });
    });

    // Test unimplemented calculator
    describe('Unimplemented Calculator', () => {
        it('should return a not implemented message', () => {
            const result = solve('Imaginary Number Calculator', {});
            expect(result.text).toContain('not yet implemented');
        });
    });
});
