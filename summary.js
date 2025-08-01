document.addEventListener('DOMContentLoaded', () => {
    const formDataString = sessionStorage.getItem('rcvFormData');

    if (!formDataString) {
        alert('No summary data found. Redirecting to form.');
        window.location.href = 'index.html';
        return;
    }

    const formData = JSON.parse(formDataString);
    const currencyFormatter = new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
    });

    // --- Calculation Functions ---
    const normalizeToWeekly = (amount, frequency) => {
        const numericAmount = parseFloat(amount) || 0;
        if (numericAmount === 0) return 0;

        switch (frequency) {
            case 'fortnightly':
                return numericAmount / 2;
            case 'monthly':
                return (numericAmount * 12) / 52;
            case 'weekly':
            default:
                return numericAmount;
        }
    };

    // --- Process Data ---
    let totalWeeklyIncome = 0;
    let totalWeeklyDebtPayment = 0;
    const incomeBreakdown = [];

    formData.household_members?.forEach(member => {
        member.incomes?.forEach(income => {
            const weeklyAmount = normalizeToWeekly(income.amount, income.frequency);
            totalWeeklyIncome += weeklyAmount;
            const incomeType = income.type === 'other' ? income.other_type : income.type;
            incomeBreakdown.push({
                source: incomeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                memberName: member.name,
                yearlyAmount: weeklyAmount * 52,
            });
        });

        member.debts?.forEach(debt => {
            const weeklyPayment = normalizeToWeekly(debt.payment_amount, debt.payment_frequency);
            totalWeeklyDebtPayment += weeklyPayment;
        });
    });

    // --- Populate Income Breakdown Table ---
    const incomeTableBody = document.querySelector('#income-summary-table tbody');
    if(incomeBreakdown.length > 0) {
        incomeBreakdown.forEach(item => {
            const row = incomeTableBody.insertRow();
            row.insertCell(0).textContent = item.source;
            row.insertCell(1).textContent = item.memberName;
            row.insertCell(2).textContent = currencyFormatter.format(item.yearlyAmount);
        });
    } else {
        const row = incomeTableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.textContent = 'No income sources provided.';
        cell.style.textAlign = 'center';
    }
    

    // --- Populate Totals Table ---
    const totalWeeklyNet = totalWeeklyIncome - totalWeeklyDebtPayment;

    // Gross Income
    document.getElementById('total-income-weekly').textContent = currencyFormatter.format(totalWeeklyIncome);
    document.getElementById('total-income-monthly').textContent = currencyFormatter.format(totalWeeklyIncome * 52 / 12);
    document.getElementById('total-income-yearly').textContent = currencyFormatter.format(totalWeeklyIncome * 52);

    // Debt Payments
    document.getElementById('total-debt-weekly').textContent = currencyFormatter.format(totalWeeklyDebtPayment);
    document.getElementById('total-debt-monthly').textContent = currencyFormatter.format(totalWeeklyDebtPayment * 52 / 12);
    document.getElementById('total-debt-yearly').textContent = currencyFormatter.format(totalWeeklyDebtPayment * 52);

    // Net Income
    document.getElementById('net-income-weekly').textContent = currencyFormatter.format(totalWeeklyNet);
    document.getElementById('net-income-monthly').textContent = currencyFormatter.format(totalWeeklyNet * 52 / 12);
    document.getElementById('net-income-yearly').textContent = currencyFormatter.format(totalWeeklyNet * 52);
});