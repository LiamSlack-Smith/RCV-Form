document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const form = document.getElementById('rcv-screening-form');
    const housingStatusRadios = document.querySelectorAll('input[name="housing_status"]');
    const homelessDetails = document.getElementById('homeless-details');
    const atRiskDetails = document.getElementById('at-risk-details');

    const householdSection = document.getElementById('household-section');
    const addHouseholdMemberBtn = document.getElementById('add-household-member');
    const householdContainer = document.getElementById('household-members-container');

    // --- Templates ---
    const memberTemplate = document.getElementById('household-member-template');
    const incomeTemplate = document.getElementById('income-source-template');
    const debtTemplate = document.getElementById('debt-template');

    // --- Event Listeners ---

    housingStatusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const isHomeless = radio.value === 'homeless' && radio.checked;
            const isAtRisk = radio.value === 'at_risk' && radio.checked;
            toggleCollapsible(homelessDetails, isHomeless);
            toggleCollapsible(atRiskDetails, isAtRisk);
        });
    });

    addHouseholdMemberBtn.addEventListener('click', addHouseholdMember);

    form.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-member')) {
            e.target.closest('.household-member').remove();
        }
        if (e.target.classList.contains('add-income-source')) {
            addIncomeSource(e.target);
        }
        if (e.target.classList.contains('remove-income')) {
            e.target.closest('.income-source-item').remove();
        }
        if (e.target.classList.contains('add-debt')) {
            addDebt(e.target);
        }
        if (e.target.classList.contains('remove-debt')) {
            e.target.closest('.debt-item').remove();
        }
    });

    form.addEventListener('change', (e) => {
        if (e.target.classList.contains('income-type')) {
            const otherContainer = e.target.closest('.income-source-item').querySelector('.other-income-type-container');
            const showOther = e.target.value === 'other';
            toggleCollapsible(otherContainer, showOther);
        }
    });

    form.addEventListener('submit', handleFormSubmit);

    // --- Functions ---

    function toggleCollapsible(element, show) {
        if (show) {
            element.classList.remove('collapsed');
        } else {
            element.classList.add('collapsed');
        }
    }

    function addHouseholdMember() {
        const memberFragment = memberTemplate.content.cloneNode(true);
        householdContainer.appendChild(memberFragment);

        const newMember = householdContainer.lastElementChild;
        const addIncomeBtn = newMember.querySelector('.add-income-source');
        const addDebtBtn = newMember.querySelector('.add-debt');

        addIncomeSource(addIncomeBtn);
        addDebt(addDebtBtn);
    }

    function addIncomeSource(button) {
        const incomeContainer = button.closest('.household-member').querySelector('.income-sources-list');
        const incomeFragment = incomeTemplate.content.cloneNode(true);
        incomeContainer.appendChild(incomeFragment);
        updateNames();
    }

    function addDebt(button) {
        const debtContainer = button.closest('.household-member').querySelector('.debts-list');
        const debtFragment = debtTemplate.content.cloneNode(true);
        debtContainer.appendChild(debtFragment);
        updateNames();
    }

    function updateNames() {
        const members = householdContainer.querySelectorAll('.household-member');
        members.forEach((member, memberIndex) => {
            const nameInput = member.querySelector('.member-name');
            if (nameInput) {
                nameInput.name = `household_members[${memberIndex}][name]`;
            }

            const incomes = member.querySelectorAll('.income-source-item');
            incomes.forEach((income, incomeIndex) => {
                income.querySelector('.income-amount').name = `household_members[${memberIndex}][incomes][${incomeIndex}][amount]`;
                income.querySelector('.income-frequency').name = `household_members[${memberIndex}][incomes][${incomeIndex}][frequency]`;
                income.querySelector('.income-type').name = `household_members[${memberIndex}][incomes][${incomeIndex}][type]`;
                income.querySelector('.other-income-type').name = `household_members[${memberIndex}][incomes][${incomeIndex}][other_type]`;
            });

            const debts = member.querySelectorAll('.debt-item');
            debts.forEach((debt, debtIndex) => {
                debt.querySelector('.debt-amount').name = `household_members[${memberIndex}][debts][${debtIndex}][amount]`;
                debt.querySelector('.debt-type').name = `household_members[${memberIndex}][debts][${debtIndex}][type]`;
            });
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        updateNames();
        const formData = new FormData(form);
        const formObject = {};

        formData.forEach((value, key) => {
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!formObject[cleanKey]) {
                    formObject[cleanKey] = [];
                }
                formObject[cleanKey].push(value);
            } else {
                if (!key.startsWith('household_members')) {
                     formObject[key] = value;
                }
            }
        });
        
        formObject.household_members = [];
        const members = householdContainer.querySelectorAll('.household-member');
        members.forEach(member => {
            const memberData = { incomes: [], debts: [] };
            
            const nameInput = member.querySelector('.member-name');
            memberData.name = nameInput ? nameInput.value : '';

            member.querySelectorAll('.income-source-item').forEach(income => {
                const incomeData = {};
                incomeData.amount = income.querySelector('.income-amount').value;
                incomeData.frequency = income.querySelector('.income-frequency').value;
                incomeData.type = income.querySelector('.income-type').value;
                if (incomeData.type === 'other') {
                    incomeData.other_type = income.querySelector('.other-income-type').value;
                }
                memberData.incomes.push(incomeData);
            });

            member.querySelectorAll('.debt-item').forEach(debt => {
                const debtData = {};
                debtData.amount = debt.querySelector('.debt-amount').value;
                debtData.type = debt.querySelector('.debt-type').value;
                memberData.debts.push(debtData);
            });
            formObject.household_members.push(memberData);
        });

        console.log('--- Form Submission Data ---');
        console.log(JSON.stringify(formObject, null, 2));
        alert('Form data has been logged to the developer console (F12).');
    }

    // --- Initial Setup ---
    toggleCollapsible(householdSection, true); // Make the section visible
    addHouseholdMember(); // Add the first member automatically
    addHouseholdMemberBtn.style.display = 'block'; // Ensure the 'add' button is visible
});