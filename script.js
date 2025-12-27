// Tab switching logic
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');
let activeTab = 'calculator';

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        document.getElementById(activeTab).classList.add('active');
    });
});

// Keyboard Support
document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Ignore if typing in an input field (e.g. Warikan inputs), but main display is readonly
    // Exception: Warikan inputs are not readonly.
    if (activeTab === 'warikan') {
        // If Enter is pressed in Warikan mode, calculate
        if (key === 'Enter') {
            event.preventDefault();
            warikanCalc.calculate();
        }
        return;
    }

    // Map keys for Calculator
    if (activeTab === 'calculator') {
        if (/[0-9]/.test(key)) {
            calc.append(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            calc.appendOp(key);
        } else if (key === '.') {
            calc.append('.');
        } else if (key === '(' || key === ')') {
            calc.append(key);
        } else if (key === '%') {
            calc.append('%');
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            calc.calculate();
        } else if (key === 'Backspace') {
            calc.backspace();
        } else if (key === 'Escape') {
            calc.clear();
        }
        // Shortcuts (optional, not strictly requested but helpful)
        // e -> E (constant) or EXP? Let's stick to simple mapping.
    }

    // Map keys for Hex Calculator
    else if (activeTab === 'hex') {
        if (/[0-9a-fA-F]/.test(key)) {
            hexCalc.append(key.toUpperCase());
        } else if (['+', '-', '*', '/'].includes(key)) {
            hexCalc.appendOp(key);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            hexCalc.calculate();
        } else if (key === 'Backspace') {
            hexCalc.backspace();
        } else if (key === 'Escape') {
            hexCalc.clear();
        }
    }
});

// Standard & Scientific Calculator
const calc = {
    display: document.getElementById('calc-display'),
    result: document.getElementById('calc-result'),
    degRadBtn: document.getElementById('deg-rad-btn'),
    radIndicator: document.getElementById('rad-indicator'),
    currentInput: '',
    ans: 0, // Store previous answer
    isDeg: true,
    isInv: false,

    toggleMode() {
        this.isDeg = !this.isDeg;
        // Update UI
        if (this.isDeg) {
            this.degRadBtn.style.color = '#202124';
            this.degRadBtn.style.fontWeight = 'bold';
            this.radIndicator.style.color = '#5f6368';
            this.radIndicator.style.fontWeight = 'normal';
        } else {
            this.degRadBtn.style.color = '#5f6368';
            this.degRadBtn.style.fontWeight = 'normal';
            this.radIndicator.style.color = '#202124';
            this.radIndicator.style.fontWeight = 'bold';
        }
        this.calculate(); // Recalculate if result is there
    },

    toggleInv() {
        this.isInv = !this.isInv;
        document.getElementById('btn-inv').style.background = this.isInv ? '#bdc1c6' : ''; // Darker when active

        // Update button labels
        document.getElementById('btn-sin').innerText = this.isInv ? 'sin⁻¹' : 'sin';
        document.getElementById('btn-cos').innerText = this.isInv ? 'cos⁻¹' : 'cos';
        document.getElementById('btn-tan').innerText = this.isInv ? 'tan⁻¹' : 'tan';
        document.getElementById('btn-ln').innerText = this.isInv ? 'eˣ' : 'ln';
        document.getElementById('btn-log').innerText = this.isInv ? '10ˣ' : 'log';
        document.getElementById('btn-sqrt').innerText = this.isInv ? 'x²' : '√';
        document.getElementById('btn-pow').innerText = this.isInv ? 'ʸ√x' : 'xʸ';
    },

    append(val) {
        this.currentInput += val;
        this.updateDisplay();
    },

    appendAns() {
        this.currentInput += 'Ans';
        this.updateDisplay();
    },

    appendOp(op) {
        this.currentInput += op;
        this.updateDisplay();
    },

    appendFunc(func) {
        let text = '';
        if (this.isInv) {
            switch(func) {
                case 'sin': text = 'asin('; break;
                case 'cos': text = 'acos('; break;
                case 'tan': text = 'atan('; break;
                case 'ln': text = 'exp('; break; // e^x
                case 'log': text = 'tenpow('; break; // 10^x
                case 'sqrt': text = 'sq('; break; // x^2
                case 'pow': text = 'root('; break; // y root of x? actually x^(1/y)
                default: text = func + '(';
            }
        } else {
            if (func === 'pow') {
                text = '^';
            } else if (func === 'fact') {
                text = 'fact(';
            } else {
                text = func + '(';
            }
        }
        this.currentInput += text;
        this.updateDisplay();
    },

    appendConstant(constName) {
        if (constName === 'PI') {
            this.currentInput += 'PI';
        } else if (constName === 'E') {
            this.currentInput += 'E';
        }
        this.updateDisplay();
    },

    clear() {
        this.currentInput = '';
        this.result.innerText = '= 0';
        this.updateDisplay();
    },

    backspace() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateDisplay();
    },

    updateDisplay() {
        this.display.value = this.currentInput;
    },

    calculate() {
        try {
            if (!this.currentInput) return;

            const isDeg = this.isDeg;
            const ansValue = this.ans;

            // Define math functions in scope
            const scope = {
                sin: function(x) { return isDeg ? Math.sin(x * Math.PI / 180) : Math.sin(x); },
                cos: function(x) { return isDeg ? Math.cos(x * Math.PI / 180) : Math.cos(x); },
                tan: function(x) { return isDeg ? Math.tan(x * Math.PI / 180) : Math.tan(x); },
                asin: function(x) { return isDeg ? Math.asin(x) * 180 / Math.PI : Math.asin(x); },
                acos: function(x) { return isDeg ? Math.acos(x) * 180 / Math.PI : Math.acos(x); },
                atan: function(x) { return isDeg ? Math.atan(x) * 180 / Math.PI : Math.atan(x); },
                log: function(x) { return Math.log10(x); },
                ln: function(x) { return Math.log(x); },
                exp: function(x) { return Math.exp(x); },
                tenpow: function(x) { return Math.pow(10, x); },
                sqrt: function(x) { return Math.sqrt(x); },
                sq: function(x) { return x * x; },
                pow: function(b, e) { return Math.pow(b, e); },
                root: function(x, y) { return Math.pow(x, 1/y); }, // y root of x
                fact: function(n) {
                    if (n < 0) return NaN;
                    let res = 1;
                    for (let i = 2; i <= n; i++) res *= i;
                    return res;
                },
                Ans: ansValue,
                PI: Math.PI,
                E: Math.E
            };

            const keys = Object.keys(scope);
            const values = Object.values(scope);

            // Normalize input
            let expr = this.currentInput;

            // Replace ^ with **
            expr = expr.replace(/\^/g, '**');

            // Handle scientific notation.
            // If we encounter 'E' that is intended as EXP (scientific notation),
            // it usually follows a number. However, we also have constant 'E'.
            // In this simple implementation, both use the symbol 'E'.
            // Standard JS evaluation might treat 2E3 as scientific notation if E was not a variable.
            // Since we define E in scope, we need to be careful.
            // A simple heuristic: if E is preceded by a number, treat as e (scientific).
            // This is not perfect but covers common use cases like 2E5.
            // Note: This replaces all occurrences.
            expr = expr.replace(/(\d)E(\+?-?\d)/g, '$1e$2');

            const func = new Function(...keys, 'return ' + expr);
            const res = func(...values);

            this.ans = res; // Update Ans

            // Format result
            let resStr = res.toString();
            if (Math.abs(res - Math.round(res)) < 1e-10) {
                 resStr = Math.round(res).toString();
            } else {
                 resStr = parseFloat(res.toFixed(10)).toString();
            }

            this.result.innerText = '= ' + resStr;
        } catch (e) {
            // console.error(e);
            this.result.innerText = 'Error';
        }
    }
};

// Hexadecimal Calculator
const hexCalc = {
    display: document.getElementById('hex-display'),
    result: document.getElementById('hex-result'),
    decPreview: document.getElementById('dec-preview'),
    currentInput: '',

    append(val) {
        this.currentInput += val;
        this.updateDisplay();
        this.updatePreview();
    },

    appendOp(op) {
        this.currentInput += ' ' + op + ' ';
        this.updateDisplay();
    },

    clear() {
        this.currentInput = '';
        this.result.innerText = '= 0';
        this.decPreview.innerText = 'DEC: 0';
        this.updateDisplay();
    },

    backspace() {
        this.currentInput = this.currentInput.trimEnd().slice(0, -1);
        this.updateDisplay();
        this.updatePreview();
    },

    updateDisplay() {
        this.display.value = this.currentInput;
    },

    updatePreview() {
        try {
            const parts = this.currentInput.split(' ');
            const lastNum = parts[parts.length - 1];
            if (lastNum && /^[0-9A-Fa-f]+$/.test(lastNum)) {
                const dec = parseInt(lastNum, 16);
                if (!isNaN(dec)) {
                    this.decPreview.innerText = 'DEC: ' + dec;
                }
            } else {
                 this.decPreview.innerText = 'DEC: -';
            }
        } catch(e) {
            this.decPreview.innerText = 'DEC: -';
        }
    },

    calculate() {
        try {
            const expr = this.currentInput.replace(/\b[0-9A-Fa-f]+\b/g, (match) => '0x' + match);
            const result = new Function('return ' + expr)();

            let hexResult;
            if (result < 0) {
                 hexResult = (result >>> 0).toString(16).toUpperCase();
            } else {
                 hexResult = Math.floor(result).toString(16).toUpperCase();
            }

            this.result.innerText = '= ' + hexResult;
            this.decPreview.innerText = 'DEC: ' + Math.floor(result);

        } catch (e) {
            this.result.innerText = 'Error';
        }
    }
};

// Warikan Calculator
const warikanCalc = {
    calculate() {
        const total = parseFloat(document.getElementById('total-amount').value);
        const people = parseInt(document.getElementById('people-count').value);

        if (!total || !people || people <= 0) {
            alert('有効な数値を入力してください。');
            return;
        }

        const perPerson = Math.floor(total / people);
        const remainder = total % people;

        document.getElementById('per-person').innerText = perPerson.toLocaleString();
        document.getElementById('remainder').innerText = remainder.toLocaleString();
        document.getElementById('warikan-result').style.display = 'block';
    }
};
