


import { Calculator, Question } from './types';

export const CALCULATOR_CATEGORIES = [
  "Basic Math", "Algebra", "Calculus", "Geometry", "Trigonometry", "Matrix & Linear Algebra", "Statistics & Probability", "Finance", "Physics"
];

export const CALCULATORS: Calculator[] = [
  // Basic Math
  {
    name: 'Arithmetic Calculator', description: 'Perform basic arithmetic operations: addition, subtraction, multiplication, division.', category: 'Basic Math',
    instructions: "This calculator performs basic arithmetic operations.\n\n1.  Enter the first number in the 'Number 1' field.\n2.  Select an operation (+, -, ×, ÷) from the dropdown.\n3.  Enter the second number in the 'Number 2' field.\n4.  Click Calculate to see the result.",
    inputs: [
      { name: 'num1', label: 'Number 1', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
      {
        name: 'operation', label: 'Operation', type: 'select', defaultValue: '+', options: [
          { value: '+', label: '+' },
          { value: '-', label: '-' },
          { value: '*', label: '×' },
          { value: '/', label: '÷' },
        ],
      },
      { name: 'num2', label: 'Number 2', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
    ],
    gridCols: 3,
    hasCustomizableGraph: true,
  },
  {
    name: 'Percentage Calculator', description: 'Calculate what percentage one number is of another.', category: 'Basic Math',
    instructions: "Calculates the percentage of a part value relative to a total value.\n\nFormula: (Part / Total) * 100\n\n1.  Enter the Part Value (e.g., your score).\n2.  Enter the Total Value (e.g., the maximum possible score).\n3.  Click Calculate.",
    inputs: [
      { name: 'part', label: 'Part Value', type: 'number', required: true, placeholder: 'e.g., 20', step: 'any', tooltip: "The value that is a part of the total." },
      { name: 'total', label: 'Total Value', type: 'number', required: true, placeholder: 'e.g., 80', step: 'any', tooltip: "The whole amount from which the percentage is calculated." },
    ],
    gridCols: 2,
    hasCustomizableGraph: true,
  },
  {
    name: 'Unit Converter',
    description: 'Convert between various units of length, mass, temperature, volume, and data storage.',
    category: 'Basic Math',
    instructions: "1. Select the type of conversion.\n2. Enter the value you want to convert.\n3. Choose the units to convert from and to.\n4. Click Calculate.",
    inputs: [
      {
        name: 'conversionType',
        label: 'Conversion Type',
        type: 'select',
        defaultValue: 'length',
        options: [
          { value: 'length', label: 'Length' },
          { value: 'mass', label: 'Mass' },
          { value: 'temperature', label: 'Temperature' },
          { value: 'volume', label: 'Volume' },
          { value: 'data', label: 'Data Storage' },
        ],
      },
      {
        name: 'value',
        label: 'Value to Convert',
        type: 'number',
        required: true,
        placeholder: 'e.g., 10',
        step: 'any',
      },
      // Length Units
      {
        name: 'lengthUnits',
        type: 'group',
        label: '',
        dependsOn: 'conversionType',
        showWhen: ['length'],
        gridCols: 2,
        inputs: [
          { name: 'lengthFrom', label: 'From', type: 'select', defaultValue: 'm', options: [
              { value: 'm', label: 'Meter' }, { value: 'km', label: 'Kilometer' }, { value: 'cm', label: 'Centimeter' }, { value: 'mm', label: 'Millimeter' }, { value: 'mi', label: 'Mile' }, { value: 'yd', label: 'Yard' }, { value: 'ft', label: 'Foot' }, { value: 'in', label: 'Inch' }
          ]},
          { name: 'lengthTo', label: 'To', type: 'select', defaultValue: 'ft', options: [
              { value: 'm', label: 'Meter' }, { value: 'km', label: 'Kilometer' }, { value: 'cm', label: 'Centimeter' }, { value: 'mm', label: 'Millimeter' }, { value: 'mi', label: 'Mile' }, { value: 'yd', label: 'Yard' }, { value: 'ft', label: 'Foot' }, { value: 'in', label: 'Inch' }
          ]}
        ]
      },
      // Mass Units
      {
        name: 'massUnits',
        type: 'group',
        label: '',
        dependsOn: 'conversionType',
        showWhen: ['mass'],
        gridCols: 2,
        inputs: [
          { name: 'massFrom', label: 'From', type: 'select', defaultValue: 'kg', options: [
              { value: 'kg', label: 'Kilogram' }, { value: 'g', label: 'Gram' }, { value: 'mg', label: 'Milligram' }, { value: 't', label: 'Metric Ton' }, { value: 'lb', label: 'Pound' }, { value: 'oz', label: 'Ounce' }
          ]},
          { name: 'massTo', label: 'To', type: 'select', defaultValue: 'lb', options: [
              { value: 'kg', label: 'Kilogram' }, { value: 'g', label: 'Gram' }, { value: 'mg', label: 'Milligram' }, { value: 't', label: 'Metric Ton' }, { value: 'lb', label: 'Pound' }, { value: 'oz', label: 'Ounce' }
          ]}
        ]
      },
      // Temperature Units
      {
        name: 'tempUnits',
        type: 'group',
        label: '',
        dependsOn: 'conversionType',
        showWhen: ['temperature'],
        gridCols: 2,
        inputs: [
          { name: 'tempFrom', label: 'From', type: 'select', defaultValue: 'C', options: [
              { value: 'C', label: 'Celsius' }, { value: 'F', label: 'Fahrenheit' }, { value: 'K', label: 'Kelvin' }
          ]},
          { name: 'tempTo', label: 'To', type: 'select', defaultValue: 'F', options: [
              { value: 'C', label: 'Celsius' }, { value: 'F', label: 'Fahrenheit' }, { value: 'K', label: 'Kelvin' }
          ]}
        ]
      },
      // Volume Units
      {
        name: 'volumeUnits',
        type: 'group',
        label: '',
        dependsOn: 'conversionType',
        showWhen: ['volume'],
        gridCols: 2,
        inputs: [
          { name: 'volumeFrom', label: 'From', type: 'select', defaultValue: 'L', options: [
              { value: 'L', label: 'Liter' }, { value: 'mL', label: 'Milliliter' }, { value: 'm3', label: 'Cubic Meter' }, { value: 'gal', label: 'Gallon (US)' }, { value: 'qt', label: 'Quart (US)' }, { value: 'pt', label: 'Pint (US)' }, { value: 'cup', label: 'Cup (US)' }, { value: 'floz', label: 'Fluid Ounce (US)' }
          ]},
          { name: 'volumeTo', label: 'To', type: 'select', defaultValue: 'gal', options: [
              { value: 'L', label: 'Liter' }, { value: 'mL', label: 'Milliliter' }, { value: 'm3', label: 'Cubic Meter' }, { value: 'gal', label: 'Gallon (US)' }, { value: 'qt', label: 'Quart (US)' }, { value: 'pt', label: 'Pint (US)' }, { value: 'cup', label: 'Cup (US)' }, { value: 'floz', label: 'Fluid Ounce (US)' }
          ]}
        ]
      },
      // Data Storage Units
      {
        name: 'dataUnits',
        type: 'group',
        label: '',
        dependsOn: 'conversionType',
        showWhen: ['data'],
        gridCols: 2,
        inputs: [
          { name: 'dataFrom', label: 'From', type: 'select', defaultValue: 'MB', options: [
              { value: 'b', label: 'Bit' }, { value: 'B', label: 'Byte' }, { value: 'KB', label: 'Kilobyte' }, { value: 'MB', label: 'Megabyte' }, { value: 'GB', label: 'Gigabyte' }, { value: 'TB', label: 'Terabyte' }, { value: 'PB', label: 'Petabyte' }
          ]},
          { name: 'dataTo', label: 'To', type: 'select', defaultValue: 'GB', options: [
              { value: 'b', label: 'Bit' }, { value: 'B', label: 'Byte' }, { value: 'KB', label: 'Kilobyte' }, { value: 'MB', label: 'Megabyte' }, { value: 'GB', label: 'Gigabyte' }, { value: 'TB', label: 'Terabyte' }, { value: 'PB', label: 'Petabyte' }
          ]}
        ]
      },
    ]
  },

  // Algebra
  {
    name: 'Quadratic Equation Solver', description: 'Solve equations of the form ax²+bx+c=0.', category: 'Algebra',
    instructions: "This tool solves quadratic equations of the standard form ax² + bx + c = 0.\n\n1.  Identify the coefficients 'a', 'b', and 'c' from your equation.\n2.  Enter these values into the corresponding input fields.\n3.  Click Calculate to find the roots (solutions for x).\n\nThe calculator uses the quadratic formula: x = [-b ± sqrt(b² - 4ac)] / 2a.",
    inputs: [
      { name: 'a', label: "Variable 'a' (from ax²+bx+c=0)", type: 'number', required: true, placeholder: 'e.g., 1', step: 'any', tooltip: "The coefficient of the x² term. Cannot be zero." },
      { name: 'b', label: "Variable 'b'", type: 'number', required: true, placeholder: 'e.g., -5', step: 'any', tooltip: "The coefficient of the x term." },
      { name: 'c', label: "Variable 'c'", type: 'number', required: true, placeholder: 'e.g., 6', step: 'any', tooltip: "The constant term." },
    ],
    gridCols: 3,
    hasCustomizableGraph: true,
  },
  {
    name: 'Linear Equation Solver', description: 'Solve single and multiple variable linear equations.', category: 'Algebra',
    instructions: "Solves linear equations of the form ax + b = c.\n\n1.  Identify the coefficient 'a' and constant 'b' from the left side of your equation, and the constant 'c' from the right side.\n2.  Enter these values into the respective fields.\n3.  Click Calculate to find the value of x.",
    inputs: [
      { name: 'a', label: 'a', type: 'number', required: true, placeholder: '2', step: 'any', tooltip: "Coefficient of x. Cannot be zero." },
      { name: 'b', label: 'b', type: 'number', required: true, placeholder: '5', step: 'any', tooltip: "Constant term on the left side." },
      { name: 'c', label: 'c', type: 'number', required: true, placeholder: '15', step: 'any', tooltip: "Constant term on the right side." },
    ],
    gridCols: 3,
  },
  {
    name: 'Polynomial Root Finder', description: 'Find the roots of polynomial equations (up to degree 2).', category: 'Algebra',
    instructions: "Finds the roots for linear or quadratic polynomials. Enter the coefficients separated by commas, from the highest power down to the constant term.\n\n- For Linear (ax + b = 0): Enter a, b.\n- For Quadratic (ax² + bx + c = 0): Enter a, b, c.",
    inputs: [
      { name: 'coeffsStr', label: 'Coefficients (highest power to constant)', type: 'textarea', required: true, placeholder: 'e.g., 1, -5, 6', tooltip: "Enter coefficients from the highest power to the constant term, separated by commas. E.g., for x² - 5x + 6, enter: 1, -5, 6" },
    ],
    hasCustomizableGraph: true, // It can fall back to the quadratic solver which has a graph
  },
  {
    name: 'System of Equations', description: 'Solve sets of 2 linear equations with 2 variables.', category: 'Algebra',
    instructions: "Solves a system of two linear equations with two variables (x and y).\n\nEquation 1: a₁x + b₁y = c₁\nEquation 2: a₂x + b₂y = c₂\n\n1.  For each equation, enter the coefficients 'a', 'b', and the constant 'c' in the designated fields.\n2.  Click Calculate to find the values of x and y that satisfy both equations.",
    inputs: [
      {
        name: 'equation1', type: 'group', label: 'Equation 1: a₁x + b₁y = c₁', inputs: [
          { name: 'a1', label: 'a₁', type: 'number', required: true, placeholder: '2', step: 'any' },
          { name: 'b1', label: 'b₁', type: 'number', required: true, placeholder: '3', step: 'any' },
          { name: 'c1', label: 'c₁', type: 'number', required: true, placeholder: '6', step: 'any' },
        ],
        gridCols: 3,
      },
      {
        name: 'equation2', type: 'group', label: 'Equation 2: a₂x + b₂y = c₂', inputs: [
          { name: 'a2', label: 'a₂', type: 'number', required: true, placeholder: '4', step: 'any' },
          { name: 'b2', label: 'b₂', type: 'number', required: true, placeholder: '1', step: 'any' },
          { name: 'c2', label: 'c₂', type: 'number', required: true, placeholder: '25', step: 'any' },
        ],
        gridCols: 3,
      },
    ],
    hasCustomizableGraph: true,
  },
  {
    name: 'Complex Number Calculator',
    description: 'Perform arithmetic operations (addition, subtraction, multiplication, division) on complex numbers.',
    category: 'Algebra',
    instructions: "Performs arithmetic on two complex numbers of the form a + bi.\n\n1. For each complex number, enter its real part (a) and imaginary part (b).\n2. Select the operation (+, -, ×, ÷).\n3. Click Calculate.",
    inputs: [
      {
        name: 'c1', type: 'group', label: 'Complex Number 1 (a + bi)', gridCols: 2, inputs: [
          { name: 'c1_real', label: 'Real Part (a)', type: 'number', required: true, placeholder: '3', step: 'any' },
          { name: 'c1_imag', label: 'Imaginary Part (b)', type: 'number', required: true, placeholder: '2', step: 'any' },
        ]
      },
      {
        name: 'operation', label: 'Operation', type: 'select', defaultValue: '+', options: [
          { value: '+', label: '+' },
          { value: '-', label: '-' },
          { value: '*', label: '×' },
          { value: '/', label: '÷' },
        ],
      },
      {
        name: 'c2', type: 'group', label: 'Complex Number 2 (c + di)', gridCols: 2, inputs: [
          { name: 'c2_real', label: 'Real Part (c)', type: 'number', required: true, placeholder: '1', step: 'any' },
          { name: 'c2_imag', label: 'Imaginary Part (d)', type: 'number', required: true, placeholder: '1', step: 'any' },
        ]
      }
    ],
  },
  
  // Calculus
  {
    name: 'Derivative Calculator',
    description: 'Find first and second order derivatives using various numerical methods.',
    category: 'Calculus',
    instructions: "Numerically approximates the derivative of a function. Supports explicit functions y=f(x) and parametric equations x(t), y(t).\n\n1.  Select Input Type (Explicit or Parametric).\n2.  Enter the function(s).\n3.  Enter the evaluation point (x or t).\n4.  Click Calculate.",
    inputs: [
      {
          name: 'inputType', label: 'Input Type', type: 'radio', defaultValue: 'explicit',
          options: [
              { label: 'Explicit: y = f(x)', value: 'explicit' },
              { label: 'Parametric: x(t), y(t)', value: 'parametric' }
          ]
      },
      { name: 'func', label: 'Function f(x)', type: 'textarea', required: true, placeholder: 'e.g., x^3 * sin(x)', tooltip: "Enter a function in terms of x.", dependsOn: 'inputType', showWhen: ['explicit'] },
      {
          name: 'parametricGroup', type: 'group', label: 'Parametric Equations', dependsOn: 'inputType', showWhen: ['parametric'], gridCols: 2,
          inputs: [
              { name: 'funcX', label: 'x(t)', type: 'textarea', required: true, placeholder: 'e.g., t^2' },
              { name: 'funcY', label: 'y(t)', type: 'textarea', required: true, placeholder: 'e.g., t + 1' }
          ]
      },
      {
        name: 'settings', type: 'group', label: 'Configuration', gridCols: 2, inputs: [
            { name: 'point', label: 'Evaluation Point (x or t)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
            { name: 'h', label: 'Step Size (h)', type: 'number', defaultValue: 0.0001, step: '0.00001' },
            { name: 'order', label: 'Order', type: 'select', defaultValue: '1', options: [
                { value: '1', label: 'First Derivative' },
                { value: '2', label: 'Second Derivative' }
            ]},
            { name: 'method', label: 'Method', type: 'select', defaultValue: 'central', options: [
                { value: 'central', label: 'Central Diff' },
                { value: 'forward', label: 'Forward Diff' },
                { value: 'backward', label: 'Backward Diff' },
                { value: 'fivepoint', label: 'Five-Point Stencil' }
            ]}
        ]
      }
    ],
    hasCustomizableGraph: true,
    referenceMaterial: [
      {
        title: "Standard Derivative Rules",
        content: "Constant Rule: d/dx[c] = 0\nPower Rule: d/dx[x^n] = nx^(n-1)\nSum Rule: d/dx[f+g] = f' + g'\nProduct Rule: d/dx[uv] = u'v + uv'\nQuotient Rule: d/dx[u/v] = (u'v - uv')/v^2\nChain Rule: d/dx[f(g(x))] = f'(g(x))g'(x)"
      },
      {
        title: "Common Functions",
        content: "d/dx[sin(x)] = cos(x)\nd/dx[cos(x)] = -sin(x)\nd/dx[tan(x)] = sec^2(x)\nd/dx[e^x] = e^x\nd/dx[ln(x)] = 1/x"
      },
      {
        title: "Parametric Differentiation",
        content: "Given x(t) and y(t):\ndy/dx = (dy/dt) / (dx/dt)\nd^2y/dx^2 = (d/dt(dy/dx)) / (dx/dt)"
      }
    ]
  },
  {
    name: 'Integral Calculator', description: 'Numerically evaluate definite integrals of a function.', category: 'Calculus',
    instructions: "Numerically approximates the definite integral of a function f(x) between two points, which represents the area under the curve.\n\n1.  Function f(x): Enter the function to integrate.\n2.  Lower limit a: The starting point of the integration interval.\n3.  Upper limit b: The ending point of the integration interval.\n4.  Click Calculate.",
    inputs: [
      { name: 'func', label: 'Function f(x)', type: 'textarea', required: true, placeholder: 'e.g., x^2', tooltip: "Enter a function in terms of x. Use standard mathematical notation, e.g., x^2, sin(x), exp(x)." },
      { name: 'lower', label: 'Lower limit a', type: 'number', required: true, placeholder: 'e.g., 0', step: 'any', tooltip: "For a definite integral, provide the lower bound." },
      { name: 'upper', label: 'Upper limit b', type: 'number', required: true, placeholder: 'e.g., 1', step: 'any', tooltip: "For a definite integral, provide the upper bound." },
    ],
    gridCols: 2,
    hasCustomizableGraph: true,
  },
  {
    name: 'Limit Calculator', description: 'Compute the limit of a function at a point.', category: 'Calculus',
    instructions: "Computes the limit of a function f(x) as x approaches a specific point 'a'.\n\n1.  Function f(x): Enter the function.\n2.  Limit point a: Enter the value that x approaches.\n3.  Click Calculate.",
    inputs: [
      { name: 'func', label: 'Function f(x)', type: 'textarea', required: true, placeholder: 'e.g., (x^2 - 1)/(x - 1)', tooltip: "Enter a function in terms of x. Use standard mathematical notation, e.g., x^2, sin(x), exp(x)." },
      { name: 'point', label: 'Limit point a', type: 'number', required: true, placeholder: 'e.g., 1', step: 'any', tooltip: "The point 'a' that x approaches." },
    ]
  },
  {
    name: 'Differential Equation Solver', description: 'Solve ordinary differential equations (ODEs).', category: 'Calculus',
    instructions: "Numerically solves a first-order ordinary differential equation (ODE) of the form y' = f(x, y) using an initial condition y(x₀) = y₀.\n\n1.  ODE y' = f(x, y): Enter the expression for f(x, y).\n2.  Initial condition x₀, y₀: Provide the known point on the solution curve.\n3.  Click Calculate to see the numerical solution.",
    inputs: [
      { name: 'func', label: "ODE: y' = f(x, y)", type: 'textarea', required: true, placeholder: 'e.g., x*y', tooltip: "Enter the right-hand side of a first-order ODE. Use x and y as variables." },
      { name: 'x0', label: 'Initial condition x₀', type: 'number', placeholder: 'e.g., 0', step: 'any', tooltip: "The x-value for an initial condition y(x₀)=y₀." },
      { name: 'y0', label: 'Initial condition y₀', type: 'number', placeholder: 'e.g., 1', step: 'any', tooltip: "The y-value for an initial condition y(x₀)=y₀." },
    ],
    gridCols: 2,
    hasCustomizableGraph: true,
  },
  {
    name: 'Laplace Transform Calculator',
    description: 'Find the Laplace Transform of common functions of time (t).',
    category: 'Calculus',
    instructions: "Finds the Laplace Transform F(s) for a given function f(t).\n\n1.  Enter the function f(t) in the textbox.\n2.  Click Calculate.\n\nSupported functions:\n- Constant: `c` (e.g., `5`)\n- Power: `t^n` (for non-negative integer n, e.g., `t^2`)\n- Exponential: `exp(a*t)` (e.g., `exp(-3*t)`)\n- Sine: `sin(a*t)` (e.g., `sin(4*t)`)\n- Cosine: `cos(a*t)` (e.g., `cos(2*t)`)",
    inputs: [
      { name: 'func', label: 'Function f(t)', type: 'textarea', required: true, placeholder: 'e.g., sin(5*t)', tooltip: "Enter a supported function in terms of t. Use * for multiplication." },
    ]
  },

  // Geometry
  {
    name: 'Area & Perimeter', description: 'Calculate area and perimeter for shapes like rectangles, circles, squares, triangles, and more.', category: 'Geometry',
    instructions: "Calculates the area and perimeter for various geometric shapes.\n\n1.  Select a shape from the dropdown menu.\n2.  Enter the required dimensions for the chosen shape (e.g., side for a square, radius for a circle).\n3.  Click Calculate.",
    inputs: [
      {
        name: 'shape', label: 'Shape', type: 'select', defaultValue: 'square', options: [
          { value: 'square', label: 'Square' }, { value: 'rectangle', label: 'Rectangle' }, { value: 'circle', label: 'Circle' }, { value: 'triangle', label: 'Triangle' }, { value: 'trapezoid', label: 'Trapezoid' }, { value: 'parallelogram', label: 'Parallelogram' }
        ]
      },
      {
        name: 'squareInputs', type: 'group', label: '', dependsOn: 'shape', showWhen: ['square'], inputs: [
          { name: 'side', label: 'Side', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' }
        ]
      },
      {
        name: 'rectangleInputs', type: 'group', label: '', dependsOn: 'shape', showWhen: ['rectangle'], gridCols: 2, inputs: [
          { name: 'length', label: 'Length', type: 'number', required: true, placeholder: 'e.g., 6', step: 'any' },
          { name: 'width', label: 'Width', type: 'number', required: true, placeholder: 'e.g., 4', step: 'any' }
        ]
      },
      {
        name: 'circleInputs', type: 'group', label: '', dependsOn: 'shape', showWhen: ['circle'], inputs: [
          { name: 'radius', label: 'Radius', type: 'number', required: true, placeholder: 'e.g., 3', step: 'any' }
        ]
      },
      {
        name: 'triangleInputs', type: 'group', label: '', dependsOn: 'shape', showWhen: ['triangle'], inputs: [
          { name: 'triangleMethod', label: 'Method', type: 'radio', defaultValue: 'baseHeight', options: [{ value: 'baseHeight', label: 'Base & Height' }, { value: 'sss', label: 'Three Sides (SSS)' }] },
          { name: 'baseHeightGroup', type: 'group', label: '', dependsOn: 'triangleMethod', showWhen: ['baseHeight'], gridCols: 2, inputs: [
              { name: 'base', label: 'Base', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
              { name: 'height', label: 'Height', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' }
          ]},
          { name: 'sssGroup', type: 'group', label: '', dependsOn: 'triangleMethod', showWhen: ['sss'], gridCols: 3, inputs: [
              { name: 's1', label: 'Side a', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
              { name: 's2', label: 'Side b', type: 'number', required: true, placeholder: 'e.g., 6', step: 'any' },
              { name: 's3', label: 'Side c', type: 'number', required: true, placeholder: 'e.g., 7', step: 'any' }
          ]}
        ]
      },
      {
        name: 'trapezoidInputs', type: 'group', label: '', dependsOn: 'shape', showWhen: ['trapezoid'], gridCols: 3, inputs: [
            { name: 'pa', label: 'Parallel Side a', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
            { name: 'pb', label: 'Parallel Side b', type: 'number', required: true, placeholder: 'e.g., 7', step: 'any' },
            { name: 'height', label: 'Height', type: 'number', required: true, placeholder: 'e.g., 4', step: 'any' },
        ]
      },
      {
        name: 'parallelogramInputs', type: 'group', label: '', dependsOn: 'shape', showWhen: ['parallelogram'], gridCols: 2, inputs: [
            { name: 'base', label: 'Base', type: 'number', required: true, placeholder: 'e.g., 6', step: 'any' },
            { name: 'height', label: 'Height', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
        ]
      }
    ]
  },
  {
    name: 'Triangle Solver', description: 'Calculate missing sides and angles of a triangle.', category: 'Geometry',
    instructions: "Calculates the missing angles of a triangle given the lengths of all three sides (SSS).\n\nFormula: Uses the Law of Cosines.\n\n1.  Enter the lengths of the three sides: 'a', 'b', and 'c'.\n2.  Click Calculate to find the corresponding opposite angles A, B, and C.",
    inputs: [
      { name: 's1', label: 'Side a', type: 'number', required: true, tooltip: "Length of side 'a'. The sum of any two sides must be greater than the third.", step: 'any' },
      { name: 's2', label: 'Side b', type: 'number', required: true, tooltip: "Length of side 'b'. The sum of any two sides must be greater than the third.", step: 'any' },
      { name: 's3', label: 'Side c', type: 'number', required: true, tooltip: "Length of side 'c'. The sum of any two sides must be greater than the third.", step: 'any' },
    ],
    gridCols: 3
  },
  {
    name: 'Circle Calculator', description: 'Find area, circumference, and arc length.', category: 'Geometry',
    instructions: "Calculates the area and circumference of a circle.\n\nFormulas:\n- Area = πr²\n- Circumference = 2πr\n\n1.  Enter the Radius (r) of the circle.\n2.  Click Calculate.",
    inputs: [
      { name: 'radius', label: 'Radius', type: 'number', required: true, tooltip: "The distance from the center of the circle to any point on its circumference.", step: 'any' }
    ]
  },
  {
    name: 'Distance Formula', description: 'Calculate the distance between two points in a plane.', category: 'Geometry',
    instructions: "Calculates the straight-line distance between two points (x₁, y₁) and (x₂, y₂) in a Cartesian plane.\n\nFormula: d = sqrt((x₂ - x₁)² + (y₂ - y₁)²)\n\n1.  Enter the coordinates for Point A (x₁, y₁).\n2.  Enter the coordinates for Point B (x₂, y₂).\n3.  Click Calculate.",
    inputs: [
      { name: 'pointA', label: 'Point A', type: 'group', inputs: [
          { name: 'x1', label: 'x₁', type: 'number', required: true, tooltip: "The x-coordinate of the first point.", step: 'any' },
          { name: 'y1', label: 'y₁', type: 'number', required: true, tooltip: "The y-coordinate of the first point.", step: 'any' },
      ], gridCols: 2 },
      { name: 'pointB', label: 'Point B', type: 'group', inputs: [
          { name: 'x2', label: 'x₂', type: 'number', required: true, tooltip: "The x-coordinate of the second point.", step: 'any' },
          { name: 'y2', label: 'y₂', type: 'number', required: true, tooltip: "The y-coordinate of the second point.", step: 'any' },
      ], gridCols: 2 },
    ]
  },

  // Trigonometry
  {
    name: 'Trigonometry Calculator (sin, cos, tan)', description: 'Calculate sine, cosine, and tangent for a given angle in degrees or radians.', category: 'Trigonometry',
    instructions: "Calculates the primary trigonometric functions for a given angle.\n\n1.  Enter the angle value.\n2.  Select the unit of the angle: Degrees or Radians.\n3.  Click Calculate.",
    inputs: [
      { name: 'angle', label: 'Angle', type: 'number', required: true, tooltip: "The angle value to calculate trigonometric functions for.", step: 'any' },
      { name: 'unit', label: 'Unit', type: 'radio', defaultValue: 'deg', options: [
        { value: 'deg', label: 'Degrees' }, { value: 'rad', label: 'Radians' }
      ]}
    ]
  },
  {
    name: 'Trigonometric Equation Solver', description: 'Solve equations involving trig functions.', category: 'Trigonometry',
    instructions: "Attempts to solve equations containing trigonometric functions.\n\n1.  Enter the full equation in terms of 'x' (e.g., 2*sin(x) = 1).\n2.  Click Calculate. Note: Symbolic solving is complex and support is limited.",
    inputs: [
      { name: 'eqn', label: 'Trigonometric Equation', type: 'textarea', required: true, placeholder: 'e.g., 2*sin(x) = 1', tooltip: "Enter an equation with a variable x and trig functions like sin(x), cos(x), tan(x)." }
    ]
  },

  // Matrix & Linear Algebra
  {
    name: 'Matrix Multiplication', description: 'Multiply two matrices together.', category: 'Matrix & Linear Algebra',
    instructions: "Multiplies two 2x2 matrices, A and B.\n\nProcess: The element in the i-th row and j-th column of the resulting matrix is the dot product of the i-th row of matrix A and the j-th column of matrix B.\n\n1.  Fill in the values for Matrix A.\n2.  Fill in the values for Matrix B.\n3.  Click Calculate.",
    inputs: [
        { name: 'm1', label: 'Matrix A', type: 'group', gridCols: 2, inputs: [
          { name: 'm1_00', label: 'a₁₁', type: 'number', step: 'any', required: true },
          { name: 'm1_01', label: 'a₁₂', type: 'number', step: 'any', required: true },
          { name: 'm1_10', label: 'a₂₁', type: 'number', step: 'any', required: true },
          { name: 'm1_11', label: 'a₂₂', type: 'number', step: 'any', required: true },
        ]},
        { name: 'm2', label: 'Matrix B', type: 'group', gridCols: 2, inputs: [
          { name: 'm2_00', label: 'b₁₁', type: 'number', step: 'any', required: true },
          { name: 'm2_01', label: 'b₁₂', type: 'number', step: 'any', required: true },
          { name: 'm2_10', label: 'b₂₁', type: 'number', step: 'any', required: true },
          { name: 'm2_11', label: 'b₂₂', type: 'number', step: 'any', required: true },
        ]}
    ]
  },
  {
    name: 'Matrix Determinant', description: 'Calculate the determinant of a square matrix.', category: 'Matrix & Linear Algebra',
    instructions: "Calculates the determinant of a 2x2 matrix.\n\nFormula: For a matrix [[a, b], [c, d]], the determinant is ad - bc.\n\n1.  Fill in the values for the matrix.\n2.  Click Calculate.",
    inputs: [
        { name: 'm', label: 'Matrix', type: 'group', gridCols: 2, inputs: [
          { name: 'm_00', label: 'a₁₁', type: 'number', step: 'any', required: true },
          { name: 'm_01', label: 'a₁₂', type: 'number', step: 'any', required: true },
          { name: 'm_10', label: 'a₂₁', type: 'number', step: 'any', required: true },
          { name: 'm_11', label: 'a₂₂', type: 'number', step: 'any', required: true },
        ]}
    ]
  },
  {
    name: 'Eigenvalue/Eigenvector', description: 'Compute eigenvalues and eigenvectors of a matrix.', category: 'Matrix & Linear Algebra',
    instructions: "Computes the eigenvalues and corresponding eigenvectors for a 2x2 matrix.\n\nConcept: For a matrix A, a non-zero vector v is an eigenvector if Av = λv, where λ is a scalar known as the eigenvalue.\n\n1.  Fill in the values for the matrix.\n2.  Click Calculate.",
    inputs: [
        { name: 'm', label: 'Matrix', type: 'group', gridCols: 2, inputs: [
          { name: 'm_00', label: 'a₁₁', type: 'number', step: 'any', required: true },
          { name: 'm_01', label: 'a₁₂', type: 'number', step: 'any', required: true },
          { name: 'm_10', label: 'a₂₁', type: 'number', step: 'any', required: true },
          { name: 'm_11', label: 'a₂₂', type: 'number', step: 'any', required: true },
        ]}
    ]
  },
  {
    name: 'Vector Cross Product', description: 'Calculate the cross product of two vectors.', category: 'Matrix & Linear Algebra',
    instructions: "Calculates the cross product of two 3D vectors.\n\nResult: A new vector that is perpendicular to both of the original vectors.\n\n1.  Enter the x, y, and z components for Vector A.\n2.  Enter the x, y, and z components for Vector B.\n3.  Click Calculate.",
    inputs: [
        { name: 'v1', label: 'Vector A', type: 'group', gridCols: 3, inputs: [
          { name: 'v1x', label: 'x₁', type: 'number', step: 'any', required: true },
          { name: 'v1y', label: 'y₁', type: 'number', step: 'any', required: true },
          { name: 'v1z', label: 'z₁', type: 'number', step: 'any', required: true },
        ]},
        { name: 'v2', label: 'Vector B', type: 'group', gridCols: 3, inputs: [
          { name: 'v2x', label: 'x₂', type: 'number', step: 'any', required: true },
          { name: 'v2y', label: 'y₂', type: 'number', step: 'any', required: true },
          { name: 'v2z', label: 'z₂', type: 'number', step: 'any', required: true },
        ]}
    ]
  },
  {
    name: 'Fourier Transform Calculator',
    description: 'Numerically compute the Discrete Fourier Transform (DFT) of a sequence of numbers.',
    category: 'Matrix & Linear Algebra',
    instructions: "Calculates the Discrete Fourier Transform (DFT) of a signal.\n\n1.  Enter the signal as a series of comma-separated numbers (e.g., 1, 2, 3, 2, 1).\n2.  Click Calculate to see the frequency components (magnitude and phase).",
    inputs: [
      { name: 'signalStr', label: 'Signal Data (comma-separated real numbers)', type: 'textarea', required: true, placeholder: 'e.g., 1, 0, -1, 0', tooltip: "Enter the sequence of values representing your discrete-time signal." },
    ],
    hasCustomizableGraph: true,
  },
  
  // Statistics & Probability
  {
    name: 'Statistics Calculator', description: 'Calculate mean, median, mode, variance, and standard deviation for a dataset.', category: 'Statistics & Probability',
    instructions: "Computes key descriptive statistics for a given dataset.\n\n1.  Enter your data as a series of comma-separated numbers.\n2.  Click Calculate to see the mean, median, mode, variance, and standard deviation.",
    inputs: [
        { name: 'dataStr', label: 'Data (comma-separated numbers)', type: 'textarea', required: true, placeholder: 'e.g., 1, 5, 2, 8, 2, 9, 15, -4', tooltip: "Enter numbers separated by commas. Any non-numeric values will be ignored." }
    ],
    hasCustomizableGraph: true,
  },
  {
    name: 'Binomial Distribution', description: 'Calculate probabilities for a binomial distribution.', category: 'Statistics & Probability',
    instructions: "Calculates the probability of achieving a specific number of successes in a set number of trials.\n\nFormula: P(X=k) = C(n, k) * p^k * (1-p)^(n-k)\n\n1.  Number of trials (n): Total number of experiments.\n2.  Success probability (p): The probability of success in a single trial (0 to 1).\n3.  Number of successes (k): The exact number of successes you want to find the probability for.\n4.  Click Calculate.",
    inputs: [
        { name: 'n', label: 'Number of trials (n)', type: 'number', required: true, placeholder: '10', tooltip: "The total number of trials or experiments." },
        { name: 'p', label: 'Success probability (p)', type: 'number', required: true, placeholder: '0.5', step: '0.01', min: 0, max: 1, tooltip: "The probability of success on a single trial (must be between 0 and 1)." },
        { name: 'k', label: 'Number of successes (k)', type: 'number', required: true, placeholder: '3', tooltip: "The exact number of successful outcomes." },
    ],
    gridCols: 3,
    hasCustomizableGraph: true,
  },
  {
    name: 'Normal Distribution',
    description: 'Calculate probabilities for a normal distribution given mean and standard deviation.',
    category: 'Statistics & Probability',
    instructions: "Calculates the probability of a random variable falling within a certain range of a normal distribution.\n\n1.  Enter the Mean (μ) and Standard Deviation (σ) of the distribution.\n2.  Select the type of probability you want to find (e.g., P(X < x)).\n3.  Enter the value(s) for x.\n4.  Click Calculate to get the probability and see a visualization of the area under the curve.",
    inputs: [
      { name: 'mean', label: 'Mean (μ)', type: 'number', defaultValue: 0, required: true, placeholder: 'e.g., 0', step: 'any', tooltip: "The center of the distribution." },
      { name: 'stdDev', label: 'Standard Deviation (σ)', type: 'number', defaultValue: 1, required: true, placeholder: 'e.g., 1', step: 'any', min: 0, tooltip: "The spread of the distribution. Must be positive." },
      {
        name: 'probType',
        label: 'Probability Type',
        type: 'radio',
        defaultValue: 'lessThan',
        options: [
          { value: 'lessThan', label: 'P(X < x)' },
          { value: 'greaterThan', label: 'P(X > x)' },
          { value: 'between', label: 'P(x₁ < X < x₂)' },
        ]
      },
      {
        name: 'xValueGroup',
        type: 'group',
        label: '',
        dependsOn: 'probType',
        showWhen: ['lessThan', 'greaterThan'],
        inputs: [
            { name: 'x1', label: 'Value (x)', type: 'number', required: true, placeholder: 'e.g., 1.96', step: 'any' },
        ]
      },
       {
        name: 'betweenGroup',
        type: 'group',
        label: '',
        dependsOn: 'probType',
        showWhen: ['between'],
        gridCols: 2,
        inputs: [
            { name: 'x1', label: 'Lower Value (x₁)', type: 'number', required: true, placeholder: 'e.g., -1.96', step: 'any' },
            { name: 'x2', label: 'Upper Value (x₂)', type: 'number', required: true, placeholder: 'e.g., 1.96', step: 'any' },
        ]
      },
    ],
    hasCustomizableGraph: true,
  },
  {
    name: 'Linear Regression', description: 'Find the line of best fit for a set of data.', category: 'Statistics & Probability',
    instructions: "Finds the 'line of best fit' for a set of paired data points (x, y).\n\n1.  Enter your data pairs with one (x, y) pair per line, separated by a comma (e.g., 1,2).\n2.  Click Calculate to get the regression equation (y = mx + b) and correlation coefficient.",
    inputs: [
        { name: 'dataStr', label: 'Data pairs (x, y) - one pair per line', type: 'textarea', required: true, placeholder: "e.g.,\n1,2\n3,5.5\n4,7", tooltip: "Enter each (x, y) pair on a new line, with x and y separated by a comma. e.g., '1,2'" }
    ],
    hasCustomizableGraph: true,
  },

  // Finance
  {
    name: 'Simple Interest Calculator', description: 'Calculate simple interest on a principal amount.', category: 'Finance',
    instructions: "Calculates simple interest earned over a period.\n\nFormula: Interest = Principal × Rate × Time\n\n1.  Principal Amount ($): The initial amount of money.\n2.  Annual Interest Rate (%): The yearly interest rate.\n3.  Time (Years): The duration of the investment/loan.\n4.  Click Calculate.",
    inputs: [
        { name: 'principal', label: 'Principal Amount ($)', type: 'number', required: true, placeholder: 'e.g., 1000', step: 'any', tooltip: "The initial amount of money." },
        { name: 'rate', label: 'Annual Interest Rate (%)', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any', tooltip: "The rate of interest per year in percent." },
        { name: 'time', label: 'Time (Years)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any', tooltip: "The duration for which the money is borrowed/invested." },
    ],
    gridCols: 3,
    hasCustomizableGraph: true,
  },
  {
    name: 'Mortgage Calculator', description: 'Estimate your monthly mortgage payments.', category: 'Finance',
    instructions: "Estimates the fixed monthly payment for a mortgage.\n\n1.  Principal Loan Amount ($): The total amount borrowed.\n2.  Annual Interest Rate (%): The yearly interest rate for the loan.\n3.  Loan Term (Years): The total duration to repay the loan.\n4.  Click Calculate.",
    inputs: [
        { name: 'principal', label: 'Principal Loan Amount ($)', type: 'number', required: true, placeholder: '300000', tooltip: "The total amount of the loan you are borrowing.", min: 1000, max: 10000000, step: 1000 },
        { name: 'rate', label: 'Annual Interest Rate (%)', type: 'number', required: true, placeholder: '6.5', step: '0.01', tooltip: "The annual interest rate for the loan, as a percentage (e.g., 6.5).", min: 0.1, max: 20 },
        { name: 'years', label: 'Loan Term (Years)', type: 'number', required: true, placeholder: '30', tooltip: "The duration of the loan in years.", min: 1, max: 50, step: 1 },
    ],
    gridCols: 3,
    hasCustomizableGraph: true,
  },
  {
    name: 'Loan Comparison Calculator',
    description: 'Compare monthly payments and total interest for different loan scenarios.',
    category: 'Finance',
    instructions: "Enter the details for two different loans to see a side-by-side comparison of their monthly payments, total interest paid, and total overall cost.\n\nThis can help you decide between different loan terms, interest rates, or loan amounts.",
    inputs: [
      {
        name: 'loanA',
        type: 'group',
        label: 'Loan A Scenario',
        gridCols: 3,
        inputs: [
          { name: 'principalA', label: 'Principal ($)', type: 'number', required: true, placeholder: '300000', step: 'any', tooltip: "The total amount for Loan A." },
          { name: 'rateA', label: 'Annual Rate (%)', type: 'number', required: true, placeholder: '6.5', step: '0.01', tooltip: "The annual interest rate for Loan A." },
          { name: 'yearsA', label: 'Term (Years)', type: 'number', required: true, placeholder: '30', tooltip: "The duration of Loan A in years." },
        ]
      },
      {
        name: 'loanB',
        type: 'group',
        label: 'Loan B Scenario',
        gridCols: 3,
        inputs: [
          { name: 'principalB', label: 'Principal ($)', type: 'number', required: true, placeholder: '300000', step: 'any', tooltip: "The total amount for Loan B." },
          { name: 'rateB', label: 'Annual Rate (%)', type: 'number', required: true, placeholder: '6.0', step: '0.01', tooltip: "The annual interest rate for Loan B." },
          { name: 'yearsB', label: 'Term (Years)', type: 'number', required: true, placeholder: '15', tooltip: "The duration of Loan B in years." },
        ]
      },
    ],
    hasCustomizableGraph: true,
  },
  
  // Physics
  {
    name: 'Projectile Motion Calculator',
    description: 'Calculate the trajectory, range, and flight time of a projectile.',
    category: 'Physics',
    formulas: [
      { equation: 'y(t) = y₀ + v₀sin(θ)t - ½gt²', description: 'Vertical Position' },
      { equation: 'x(t) = v₀cos(θ)t', description: 'Horizontal Position' },
      { equation: 'R = (v₀²/g)sin(2θ)', description: 'Range (on level ground)' },
    ],
    instructions: "Calculates the key metrics for a projectile's motion under constant gravity.\n\n1.  Enter the Initial Velocity at which the projectile is launched.\n2.  Enter the Launch Angle in degrees (0° is horizontal, 90° is straight up).\n3.  (Optional) Enter an Initial Height above the ground.\n4.  Click Calculate to see the time of flight, maximum height, and horizontal range.\n\nAssumes no air resistance and a constant gravitational acceleration (g = 9.81 m/s²).",
    inputs: [
      { 
          name: 'initialVelocity', 
          label: 'Initial Velocity', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 50', 
          step: 'any', 
          min: 0, 
          max: 500,
          tooltip: "The speed at which the projectile is launched.",
          availableUnits: [
              { label: 'm/s', value: 1 },
              { label: 'km/h', value: 0.277778 },
              { label: 'mph', value: 0.44704 },
              { label: 'ft/s', value: 0.3048 }
          ]
      },
      { name: 'launchAngle', label: 'Launch Angle (°)', type: 'number', required: true, placeholder: 'e.g., 45', step: 'any', min: 0, max: 90, tooltip: "The angle of launch relative to the horizontal." },
      { 
          name: 'initialHeight', 
          label: 'Initial Height', 
          type: 'number', 
          defaultValue: 0, 
          placeholder: 'e.g., 10', 
          step: 'any', 
          min: 0, 
          max: 1000,
          tooltip: "The starting height of the projectile above the ground.",
          availableUnits: [
              { label: 'm', value: 1 },
              { label: 'ft', value: 0.3048 },
              { label: 'km', value: 1000 }
          ]
      },
    ],
    gridCols: 3,
    hasCustomizableGraph: true,
  },
  {
    name: "Ohm's Law Calculator",
    description: "Calculate voltage, current, or resistance using Ohm's Law (V = IR).",
    category: 'Physics',
    instructions: "Ohm's Law states that the voltage across a conductor is directly proportional to the current flowing through it, provided all physical conditions and temperature remain constant.\n\nFormula: V = I × R\n\n1. Select which variable you want to solve for (Voltage, Current, or Resistance).\n2. Enter the other two known values.\n3. Click Calculate.",
    inputs: [
      {
        name: 'solveFor',
        label: 'What to Solve For',
        type: 'radio',
        defaultValue: 'voltage',
        options: [
          { value: 'voltage', label: 'Voltage (V)' },
          { value: 'current', label: 'Current (I)' },
          { value: 'resistance', label: 'Resistance (R)' },
        ]
      },
      // Inputs for solving for Voltage
      {
        name: 'voltageInputs',
        type: 'group',
        label: '',
        dependsOn: 'solveFor',
        showWhen: ['voltage'],
        gridCols: 2,
        inputs: [
          { name: 'current', label: 'Current (Amperes)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
          { name: 'resistance', label: 'Resistance (Ohms)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any', min: 0 }
        ]
      },
      // Inputs for solving for Current
      {
        name: 'currentInputs',
        type: 'group',
        label: '',
        dependsOn: 'solveFor',
        showWhen: ['current'],
        gridCols: 2,
        inputs: [
          { name: 'voltage', label: 'Voltage (Volts)', type: 'number', required: true, placeholder: 'e.g., 20', step: 'any' },
          { name: 'resistance', label: 'Resistance (Ohms)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any', min: 0 }
        ]
      },
      // Inputs for solving for Resistance
      {
        name: 'resistanceInputs',
        type: 'group',
        label: '',
        dependsOn: 'solveFor',
        showWhen: ['resistance'],
        gridCols: 2,
        inputs: [
          { name: 'voltage', label: 'Voltage (Volts)', type: 'number', required: true, placeholder: 'e.g., 20', step: 'any' },
          { name: 'current', label: 'Current (Amperes)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' }
        ]
      },
    ],
    hasCustomizableGraph: true,
  },
  {
    name: 'Kinematic Equations Calculator',
    description: 'Solve for displacement, velocity, acceleration, or time using kinematic equations for constant acceleration.',
    category: 'Physics',
    instructions: "This calculator solves problems of motion with constant acceleration.\n\nEnter any three of the five variables (Displacement, Initial Velocity, Final Velocity, Acceleration, Time), leave the variable you want to solve for blank, and click Calculate.",
    inputs: [
      { name: 's', label: 'Displacement (s)', type: 'number', placeholder: 'e.g., 100 (meters)', step: 'any', tooltip: "Also known as distance or position. Leave blank to solve for this." },
      { name: 'u', label: 'Initial Velocity (u)', type: 'number', placeholder: 'e.g., 0 (m/s)', step: 'any', tooltip: "The starting velocity. Leave blank to solve for this." },
      { name: 'v', label: 'Final Velocity (v)', type: 'number', placeholder: 'e.g., 20 (m/s)', step: 'any', tooltip: "The velocity at the end of the time period. Leave blank to solve for this." },
      { name: 'a', label: 'Acceleration (a)', type: 'number', placeholder: 'e.g., 9.81 (m/s²)', step: 'any', tooltip: "Constant acceleration. Leave blank to solve for this." },
      { name: 't', label: 'Time (t)', type: 'number', placeholder: 'e.g., 5 (seconds)', step: 'any', tooltip: "The time elapsed. Leave blank to solve for this." },
    ],
    gridCols: 3,
  },
  {
    name: 'Absolute Pressure Calculator', description: 'Calculate absolute pressure from gauge and atmospheric pressure.', category: 'Physics',
    inputs: [
      { name: 'gaugePressure', label: 'Gauge Pressure (Pa)', type: 'number', required: true, placeholder: 'e.g., 101325', step: 'any' },
      { name: 'atmosphericPressure', label: 'Atmospheric Pressure (Pa)', type: 'number', required: true, placeholder: 'e.g., 101325', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Acceleration Calculator', description: 'Calculate acceleration from initial velocity, final velocity, and time.', category: 'Physics',
    inputs: [
      { name: 'initialVelocity', label: 'Initial Velocity (m/s)', type: 'number', required: true, placeholder: 'e.g., 0', step: 'any' },
      { name: 'finalVelocity', label: 'Final Velocity (m/s)', type: 'number', required: true, placeholder: 'e.g., 20', step: 'any' },
      { name: 'time', label: 'Time (s)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Angular Acceleration Calculator', description: 'Calculate angular acceleration from angular velocities and time.', category: 'Physics',
    inputs: [
      { name: 'initialAngularVelocity', label: 'Initial Angular Velocity (rad/s)', type: 'number', required: true, placeholder: 'e.g., 0', step: 'any' },
      { name: 'finalAngularVelocity', label: 'Final Angular Velocity (rad/s)', type: 'number', required: true, placeholder: 'e.g., 50', step: 'any' },
      { name: 'time', label: 'Time (s)', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Angular Momentum Calculator', description: 'Calculate angular momentum from moment of inertia and angular velocity.', category: 'Physics',
    inputs: [
      { name: 'momentOfInertia', label: 'Moment of Inertia (kg·m²)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
      { name: 'angularVelocity', label: 'Angular Velocity (rad/s)', type: 'number', required: true, placeholder: 'e.g., 15', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Velocity Calculator', description: 'Calculate velocity (average speed) from distance and time.', category: 'Physics',
    inputs: [
      { name: 'distance', label: 'Total Distance (m)', type: 'number', required: true, placeholder: 'e.g., 100', step: 'any' },
      { name: 'time', label: 'Total Time (s)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Beer\'s Lambert Law Calculator', description: 'Calculate absorbance using Beer\'s Law.', category: 'Physics',
    inputs: [
      { name: 'absorptivity', label: 'Molar Absorptivity (L mol⁻¹cm⁻¹)', type: 'number', required: true, placeholder: 'e.g., 6220', step: 'any' },
      { name: 'pathLength', label: 'Path Length (cm)', type: 'number', required: true, defaultValue: 1, step: 'any' },
      { name: 'concentration', label: 'Concentration (mol/L)', type: 'number', required: true, placeholder: 'e.g., 0.0001', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Centrifugal Force Calculator', description: 'Calculate the centrifugal force on an object.', category: 'Physics',
    inputs: [
      { name: 'mass', label: 'Mass (kg)', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
      { name: 'velocity', label: 'Velocity (m/s)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
      { name: 'radius', label: 'Radius (m)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Coulomb\'s Law Calculator', description: 'Calculate the electrostatic force between two charges.', category: 'Physics',
    inputs: [
      { name: 'charge1', label: 'Charge 1 (C)', type: 'number', required: true, placeholder: 'e.g., 1.6e-19', step: 'any' },
      { name: 'charge2', label: 'Charge 2 (C)', type: 'number', required: true, placeholder: 'e.g., -1.6e-19', step: 'any' },
      { name: 'distance', label: 'Distance (m)', type: 'number', required: true, placeholder: 'e.g., 1e-10', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Density Calculator',
    description: 'Calculate density from mass and volume.',
    category: 'Physics',
    formulas: [
      { equation: 'ρ = m / V', description: 'Density Formula' }
    ],
    inputs: [
      { 
          name: 'mass', 
          label: 'Mass', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 10', 
          step: 'any',
          availableUnits: [
              { label: 'kg', value: 1 },
              { label: 'g', value: 0.001 },
              { label: 'lb', value: 0.453592 }
          ]
      },
      { 
          name: 'volume', 
          label: 'Volume', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 2', 
          step: 'any',
          availableUnits: [
              { label: 'm³', value: 1 },
              { label: 'cm³', value: 0.000001 },
              { label: 'L', value: 0.001 }
          ]
      },
    ], 
    gridCols: 2
  },
  {
    name: 'Displacement Calculator', description: 'Calculate displacement from initial and final positions.', category: 'Physics',
    inputs: [
      { name: 'initialPosition', label: 'Initial Position (x₀)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
      { name: 'finalPosition', label: 'Final Position (x)', type: 'number', required: true, placeholder: 'e.g., 50', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Falling Object Distance Calculator', description: 'Calculate the distance an object falls under gravity.', category: 'Physics',
    inputs: [
      { name: 'initialVelocity', label: 'Initial Velocity (m/s)', type: 'number', required: true, defaultValue: 0, step: 'any' },
      { name: 'time', label: 'Time (s)', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Force Calculator (Newton\'s 2nd Law)',
    description: 'Calculate force using F=ma.',
    category: 'Physics',
    formulas: [
      { equation: 'F = m * a', description: 'Newton\'s Second Law of Motion' }
    ],
    inputs: [
      { 
          name: 'mass', 
          label: 'Mass', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 10', 
          step: 'any',
          availableUnits: [
              { label: 'kg', value: 1 },
              { label: 'g', value: 0.001 },
              { label: 'lb', value: 0.453592 }
          ]
      },
      { 
          name: 'acceleration', 
          label: 'Acceleration', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 9.81', 
          step: 'any',
          availableUnits: [
              { label: 'm/s²', value: 1 },
              { label: 'km/s²', value: 1000 },
              { label: 'ft/s²', value: 0.3048 }
          ]
      },
    ], 
    gridCols: 2
  },
  {
    name: 'Friction Calculator', description: 'Calculate the force of friction.', category: 'Physics',
    inputs: [
      { name: 'normalForce', label: 'Normal Force (N)', type: 'number', required: true, placeholder: 'e.g., 100', step: 'any' },
      { name: 'frictionCoefficient', label: 'Coefficient of Friction (μ)', type: 'number', required: true, placeholder: 'e.g., 0.4', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Gravitational Force Calculator', description: 'Calculate gravitational force between two masses.', category: 'Physics',
    inputs: [
      { name: 'mass1', label: 'Mass 1 (kg)', type: 'number', required: true, placeholder: 'e.g., 5.972e24', step: 'any' },
      { name: 'mass2', label: 'Mass 2 (kg)', type: 'number', required: true, placeholder: 'e.g., 70', step: 'any' },
      { name: 'distance', label: 'Distance (m)', type: 'number', required: true, placeholder: 'e.g., 6.371e6', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Heat Calculator', description: 'Calculate the heat energy transferred.', category: 'Physics',
    inputs: [
      { name: 'mass', label: 'Mass (kg)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
      { name: 'specificHeat', label: 'Specific Heat (J/kg°C)', type: 'number', required: true, placeholder: 'e.g., 4186', step: 'any' },
      { name: 'temperatureChange', label: 'Temperature Change (°C)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Kinetic Energy Calculator',
    description: 'Calculate the kinetic energy of an object.',
    category: 'Physics',
    formulas: [
      { equation: 'KE = 0.5 * m * v²', description: 'Kinetic Energy Formula' }
    ],
    inputs: [
      { 
          name: 'mass', 
          label: 'Mass', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 5', 
          step: 'any',
          availableUnits: [
              { label: 'kg', value: 1 },
              { label: 'g', value: 0.001 },
              { label: 'lb', value: 0.453592 }
          ]
      },
      { 
          name: 'velocity', 
          label: 'Velocity', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 10', 
          step: 'any',
          availableUnits: [
              { label: 'm/s', value: 1 },
              { label: 'km/h', value: 0.277778 },
              { label: 'mph', value: 0.44704 },
              { label: 'ft/s', value: 0.3048 }
          ]
      },
    ], 
    gridCols: 2
  },
  {
    name: 'Power Calculator', description: 'Calculate power from work and time.', category: 'Physics',
    inputs: [
      { name: 'work', label: 'Work (J)', type: 'number', required: true, placeholder: 'e.g., 1000', step: 'any' },
      { name: 'time', label: 'Time (s)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Pressure Calculator', description: 'Calculate pressure from force and area.', category: 'Physics',
    inputs: [
      { name: 'force', label: 'Force (N)', type: 'number', required: true, placeholder: 'e.g., 100', step: 'any' },
      { name: 'area', label: 'Area (m²)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Potential Energy Calculator',
    description: 'Calculate gravitational potential energy.',
    category: 'Physics',
    formulas: [
      { equation: 'PE = m * g * h', description: 'Potential Energy Formula' }
    ],
    inputs: [
      { 
          name: 'mass', 
          label: 'Mass', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 10', 
          step: 'any',
          availableUnits: [
              { label: 'kg', value: 1 },
              { label: 'g', value: 0.001 },
              { label: 'lb', value: 0.453592 }
          ]
      },
      { 
          name: 'height', 
          label: 'Height', 
          type: 'number', 
          required: true, 
          placeholder: 'e.g., 5', 
          step: 'any',
          availableUnits: [
              { label: 'm', value: 1 },
              { label: 'ft', value: 0.3048 },
              { label: 'km', value: 1000 }
          ]
      },
    ], 
    gridCols: 2
  },
  {
    name: 'Simple Pulley Tension Calculator', description: 'Calculate tension in a simple pulley system.', category: 'Physics',
    inputs: [
      { name: 'mass', label: 'Mass (kg)', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
    ]
  },
  {
    name: 'Resultant Vector Calculator', description: 'Calculate the resultant of two vectors.', category: 'Physics',
    inputs: [
      { name: 'magnitudeA', label: 'Vector A Magnitude', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
      { name: 'magnitudeB', label: 'Vector B Magnitude', type: 'number', required: true, placeholder: 'e.g., 8', step: 'any' },
      { name: 'angle', label: 'Angle Between Vectors (°)', type: 'number', required: true, placeholder: 'e.g., 60', step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Torque Calculator', description: 'Calculate torque from force, lever arm, and angle.', category: 'Physics',
    inputs: [
      { name: 'force', label: 'Force (N)', type: 'number', required: true, placeholder: 'e.g., 20', step: 'any' },
      { name: 'leverArm', label: 'Lever Arm (m)', type: 'number', required: true, placeholder: 'e.g., 0.5', step: 'any' },
      { name: 'angle', label: 'Angle (°)', type: 'number', required: true, defaultValue: 90, step: 'any' },
    ], gridCols: 3
  },
  {
    name: 'Wavelength Calculator', description: 'Calculate wavelength from wave speed and frequency.', category: 'Physics',
    inputs: [
      { name: 'waveSpeed', label: 'Wave Speed (m/s)', type: 'number', required: true, placeholder: 'e.g., 343', step: 'any' },
      { name: 'frequency', label: 'Frequency (Hz)', type: 'number', required: true, placeholder: 'e.g., 440', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Work Calculator', description: 'Calculate work done by a force.', category: 'Physics',
    inputs: [
      { name: 'force', label: 'Force (N)', type: 'number', required: true, placeholder: 'e.g., 50', step: 'any' },
      { name: 'distance', label: 'Distance (m)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
      { name: 'angle', label: 'Angle (°)', type: 'number', required: true, defaultValue: 0, step: 'any', tooltip: 'Angle between force and displacement vectors.' },
    ], gridCols: 3
  },
  {
    name: 'Mass Calculator', description: 'Calculate mass from density and volume.', category: 'Physics',
    inputs: [
      { name: 'density', label: 'Density (kg/m³)', type: 'number', required: true, placeholder: 'e.g., 1000', step: 'any' },
      { name: 'volume', label: 'Volume (m³)', type: 'number', required: true, placeholder: 'e.g., 2', step: 'any' },
    ], gridCols: 2
  },
  {
    name: 'Momentum Calculator', description: 'Calculate the momentum of an object.', category: 'Physics',
    inputs: [
      { name: 'mass', label: 'Mass (kg)', type: 'number', required: true, placeholder: 'e.g., 5', step: 'any' },
      { name: 'velocity', label: 'Velocity (m/s)', type: 'number', required: true, placeholder: 'e.g., 10', step: 'any' },
    ], gridCols: 2
  },
];

// Due Date Generation for Mock Data
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
const inTwelveHours = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();

export const STUDENT_HISTORY = {
  calculations: [
    { id: 1, query: 'Derivative of x^2 * sin(x)', result: '2x*sin(x) + x^2*cos(x)'},
    { id: 2, query: 'Solve 2x^2 - 5x + 3 = 0', result: 'x=1, x=1.5'},
  ],
  questions: [
    { id: 1, text: "What is the physical meaning of the divergence of a vector field?", status: 'Answered', answer: "The divergence of a vector field at a point measures the 'outflow' or 'source strength' of the field at that point...", dueDate: lastWeek},
    { id: 2, text: "Can you explain the difference between a Taylor series and a Maclaurin series?", status: 'Open', dueDate: inTwelveHours},
  ]
};

export const EXPERT_QUESTIONS: Question[] = [
    { id: 3, text: "How does the Fourier Transform work in signal processing?", student: "Jane Smith", status: 'Open', dueDate: tomorrow },
    { id: 4, text: "Explain the concept of eigenvalues and eigenvectors in a simple way.", student: "Mike Johnson", status: 'Open', dueDate: yesterday },
    { id: 1, text: "What is the physical meaning of the divergence of a vector field?", student: "Alex Doe", status: 'Answered', answer: "The divergence of a vector field at a point measures the 'outflow' or 'source strength' of the field at that point...", dueDate: lastWeek},
    { id: 8, text: "What are Lagrange points in celestial mechanics?", student: "Emily White", status: 'Answered', answer: "A Lagrange point is a location in space where the combined gravitational forces of two large bodies, such as the Earth and the Sun, produce enhanced regions of attraction and repulsion...", dueDate: lastWeek },
];

export const AVAILABLE_QUESTIONS: Question[] = [
    { id: 5, text: "What is the difference between supervised and unsupervised machine learning?", student: "Chris Lee", status: 'Open', dueDate: nextWeek },
    { id: 6, text: "Can you explain the principles of General Relativity?", student: "Sam Williams", status: 'Open', dueDate: tomorrow },
    { id: 7, text: "How does a blockchain work?", student: "Patricia Green", status: 'Open', dueDate: inTwelveHours },
];

export const EXPERT_EARNINGS_HISTORY = {
  labels: ['7 days ago', '6 days ago', '5 days ago', '4 days ago', '3 days ago', 'Yesterday', 'Today'],
  data: [75.50, 90.25, 65.00, 110.75, 80.00, 125.50, 150.25],
};
