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
        if (key.length === 1 && /[0-9]/.test(key)) {
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
        if (key.length === 1 && /[0-9a-fA-F]/.test(key)) {
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
    groupCount: 0,

    init() {
        // Initialize with one group if empty
        if (this.groupCount === 0) {
            this.addGroup();
        }
    },

    toggleWeighting() {
        const useWeighting = document.getElementById('use-weighting').checked;
        document.getElementById('weighting-options').style.display = useWeighting ? 'block' : 'none';
        document.getElementById('warikan-result').style.display = 'none'; // Hide result when toggling

        if (useWeighting && this.groupCount === 0) {
            this.addGroup();
        }
        this.updateRegularCount();
    },

    addGroup() {
        this.groupCount++;
        const container = document.getElementById('group-container');
        const groupId = `group-${Date.now()}`;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'form-group group-row';
        groupDiv.id = groupId;
        groupDiv.style.border = '1px solid #ddd';
        groupDiv.style.padding = '10px';
        groupDiv.style.borderRadius = '8px';
        groupDiv.style.marginBottom = '10px';
        groupDiv.style.position = 'relative';

        groupDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <label style="font-weight: bold;">グループ ${this.groupCount}</label>
                <button class="btn clear" onclick="warikanCalc.removeGroup('${groupId}')" style="width: auto; padding: 2px 8px; font-size: 12px;">削除</button>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                <div style="flex: 1;">
                    <label style="font-size: 12px; color: #666;">人数 (人)</label>
                    <input type="number" class="group-count" placeholder="例: 1" oninput="warikanCalc.updateRegularCount()">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 12px; color: #666;">支払比率 (倍)</label>
                    <input type="number" class="group-ratio" value="1.5" step="0.1" oninput="warikanCalc.updateRegularCount()">
                </div>
            </div>
        `;

        container.appendChild(groupDiv);
        this.updateRegularCount();
    },

    removeGroup(id) {
        const group = document.getElementById(id);
        if (group) {
            group.remove();
            this.updateRegularCount();
        }
    },

    updateRegularCount() {
        const peopleTotalInput = document.getElementById('people-count').value;
        const peopleTotal = parseInt(peopleTotalInput) || 0;

        const groupCounts = document.querySelectorAll('.group-count');
        let specialCount = 0;

        groupCounts.forEach(input => {
            const val = parseInt(input.value) || 0;
            specialCount += val;
        });

        const regularCount = peopleTotal - specialCount;
        const regularDisplay = document.getElementById('regular-count-display');

        regularDisplay.innerText = regularCount >= 0 ? regularCount : 'エラー';
        regularDisplay.style.color = regularCount >= 0 ? 'inherit' : 'red';
    },

    calculate() {
        const total = parseFloat(document.getElementById('total-amount').value);
        const people = parseInt(document.getElementById('people-count').value);
        const useWeighting = document.getElementById('use-weighting').checked;
        const round100 = document.getElementById('round-100').checked;

        if (!total || !people || people <= 0) {
            alert('有効な数値を入力してください。');
            return;
        }

        let remainder = 0;

        if (useWeighting) {
            // Collect groups
            const groupRows = document.querySelectorAll('.group-row');
            let specialGroups = [];
            let totalSpecialPeople = 0;
            let totalWeightedRatioSum = 0; // Sum of (count * ratio)

            let isValid = true;
            groupRows.forEach((row, index) => {
                const countInput = row.querySelector('.group-count');
                const ratioInput = row.querySelector('.group-ratio');
                const count = parseInt(countInput.value) || 0;
                const ratio = parseFloat(ratioInput.value) || 0;

                if (count <= 0) return; // Skip invalid or empty groups? Or alert? Let's ignore 0 count.
                if (ratio <= 0) {
                    alert(`グループ ${index + 1} の比率は0より大きくしてください。`);
                    isValid = false;
                }

                specialGroups.push({ count, ratio, element: row });
                totalSpecialPeople += count;
                totalWeightedRatioSum += count * ratio;
            });

            if (!isValid) return;

            const regularCount = people - totalSpecialPeople;

            if (regularCount < 0) {
                alert('グループの人数の合計が全体の人数を超えています。');
                return;
            }

            // Pay_regular * regularCount + Sum(Pay_group_i * count_i) = Total
            // Pay_group_i = Pay_regular * ratio_i
            // Pay_regular * regularCount + Sum(Pay_regular * ratio_i * count_i) = Total
            // Pay_regular * (regularCount + Sum(ratio_i * count_i)) = Total

            const denominator = regularCount + totalWeightedRatioSum;
            if (denominator === 0) {
                 alert('計算できません（人数が0です）。');
                 return;
            }

            let regularPay = total / denominator;
            if (round100) {
                regularPay = Math.ceil(regularPay / 100) * 100;
            } else {
                regularPay = Math.floor(regularPay);
            }

            // Calculate total paid so far
            let currentTotal = regularPay * regularCount;

            // Generate result HTML
            let resultHtml = '';
            specialGroups.forEach((g, i) => {
                let pay = regularPay * g.ratio;
                if (round100) {
                    pay = Math.ceil(pay / 100) * 100;
                } else {
                    pay = Math.floor(pay);
                }

                currentTotal += pay * g.count;
                // Add to result list
                // Find label or just use Group index
                const label = g.element.querySelector('label').innerText;
                resultHtml += `<p>${label} (1人あたり): <span class="highlight">${pay.toLocaleString()}</span> 円</p>`;
            });

            // If rounding up, we might collect more than total, so remainder (surplus) is currentTotal - total
            // If normal (floor), we collect less, so remainder is total - currentTotal
            // To be consistent: Remainder usually means "Money left over" or "Shortage".
            // If round100 (Ceil), we have excess. Remainder = currentTotal - total (Surplus)
            // If normal (Floor), we have shortage (but kept as 'remainder' to be paid by organizer?).
            // Usually "Remainder" in Warikan means "The amount that couldn't be split evenly".
            // If I collect 1200 for 1000 bill, the "Remainder" is 200 (surplus).

            if (round100) {
                remainder = currentTotal - total;
            } else {
                remainder = total - currentTotal;
            }

            document.getElementById('weighted-result-list').innerHTML = resultHtml;
            document.getElementById('regular-pay').innerText = regularPay.toLocaleString();

            document.getElementById('simple-result').style.display = 'none';
            document.getElementById('weighted-result').style.display = 'block';

        } else {
            let perPerson = total / people;

            if (round100) {
                perPerson = Math.ceil(perPerson / 100) * 100;
                // Total collected = perPerson * people
                // Surplus = (perPerson * people) - total
                remainder = (perPerson * people) - total;
            } else {
                perPerson = Math.floor(perPerson);
                remainder = total % people;
            }

            document.getElementById('per-person').innerText = perPerson.toLocaleString();

            document.getElementById('simple-result').style.display = 'block';
            document.getElementById('weighted-result').style.display = 'none';
        }

        document.getElementById('remainder').innerText = remainder.toLocaleString();
        document.getElementById('warikan-result').style.display = 'block';
    }
};

// Add listener to update regular count when total people changes
document.getElementById('people-count').addEventListener('input', () => {
    if (document.getElementById('use-weighting').checked) {
        warikanCalc.updateRegularCount();
    }
});
