// Tab switching logic
const tabs = document.querySelectorAll('.tab-btn');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
});

// Standard & Scientific Calculator
const calc = {
    display: document.getElementById('calc-display'),
    result: document.getElementById('calc-result'),
    degRadBtn: document.getElementById('deg-rad-btn'),
    currentInput: '',
    isDeg: true,

    toggleMode() {
        this.isDeg = !this.isDeg;
        this.degRadBtn.innerText = this.isDeg ? 'DEG' : 'RAD';
        this.calculate(); // Recalculate if result is there
    },

    append(val) {
        this.currentInput += val;
        this.updateDisplay();
    },

    appendOp(op) {
        this.currentInput += op;
        this.updateDisplay();
    },

    appendFunc(func) {
        if (func === 'pow') {
            this.currentInput += '^';
        } else if (func === 'fact') {
            this.currentInput += 'fact(';
        } else {
            this.currentInput += func + '(';
        }
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

            // Define math functions in scope
            const scope = {
                sin: function(x) { return isDeg ? Math.sin(x * Math.PI / 180) : Math.sin(x); },
                cos: function(x) { return isDeg ? Math.cos(x * Math.PI / 180) : Math.cos(x); },
                tan: function(x) { return isDeg ? Math.tan(x * Math.PI / 180) : Math.tan(x); },
                log: function(x) { return Math.log10(x); },
                ln: function(x) { return Math.log(x); },
                sqrt: function(x) { return Math.sqrt(x); },
                pow: function(b, e) { return Math.pow(b, e); },
                fact: function(n) {
                    if (n < 0) return NaN;
                    let res = 1;
                    for (let i = 2; i <= n; i++) res *= i;
                    return res;
                },
                PI: Math.PI,
                E: Math.E
            };

            // Build evaluation function
            // We use 'with' to easily expose scope properties to evaluation context.
            // Note: 'with' is deprecated in strict mode, so we use new Function with destructuring or arguments.
            // A cleaner way for new Function is passing keys as args.

            const keys = Object.keys(scope);
            const values = Object.values(scope);

            // Replace ^ with ** for power if used as operator, but we have pow() too.
            // If user typed '2^3', JS eval handles ^ as bitwise XOR.
            // So we must replace ^ with **
            let expr = this.currentInput.replace(/\^/g, '**');

            // Handle implied multiplication for things like 2PI, 2sin(x) is hard without a parser.
            // For now, assume explicit operators, except maybe ) ( which isn't standard in JS.

            const func = new Function(...keys, 'return ' + expr);
            const res = func(...values);

            // Format result
            let resStr = res.toString();
            // Round if very close to integer due to float precision (e.g. sin(180) in deg)
            if (Math.abs(res - Math.round(res)) < 1e-10) {
                 resStr = Math.round(res).toString();
            } else {
                 // Limit decimal places
                 resStr = parseFloat(res.toFixed(10)).toString();
            }

            this.result.innerText = '= ' + resStr;
        } catch (e) {
            console.error(e);
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
            // Attempt to parse the last number entered
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
            // Convert Hex numbers to Decimal for calculation
            // Split by operators +, -, *, /
            // This is a simple implementation that assumes well-formed input like "A + B"

            // Replace hex numbers with '0x' prefix so JS can evaluate them
            // We need to be careful not to replace parts of '0x' if already present (though our input prevents that)
            // And ensure we catch standalone hex numbers.

            const expr = this.currentInput.replace(/\b[0-9A-Fa-f]+\b/g, (match) => '0x' + match);

            const result = new Function('return ' + expr)();

            // Convert result back to Hex
            // Use logical shift to handle negative numbers as 32-bit integers if desired, or simple toString
            // Usually programmer calc handles signed ints.
            // If result is negative, toString(16) gives "-a".
            // 2's complement is often expected.

            let hexResult;
            if (result < 0) {
                 // 32-bit 2's complement
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
