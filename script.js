document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element References ---
    const form = document.getElementById('rcv-screening-form');
    const housingStatusRadios = document.querySelectorAll('input[name="housing_status"]');
    const homelessDetails = document.getElementById('homeless-details');
    const atRiskDetails = document.getElementById('at-risk-details');
    const riskTerminationNoticeCheckbox = document.getElementById('riskTerminationNotice');
    const terminationDateContainer = document.getElementById('termination-date-container');

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
            toggleCollapsible(otherContainer, e.target.value === 'other');
        }
        if (e.target.classList.contains('debt-type')) {
            const otherContainer = e.target.closest('.debt-item').querySelector('.other-debt-type-container');
            toggleCollapsible(otherContainer, e.target.value === 'other');
        }
        if (e.target.id === 'riskTerminationNotice') {
            toggleCollapsible(terminationDateContainer, e.target.checked);
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

        addIncomeSource(addIncomeBtn);
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
                debt.querySelector('.other-debt-type').name = `household_members[${memberIndex}][debts][${debtIndex}][other_type]`;
                debt.querySelector('.debt-payment-amount').name = `household_members[${memberIndex}][debts][${debtIndex}][payment_amount]`;
                debt.querySelector('.debt-payment-frequency').name = `household_members[${memberIndex}][debts][${debtIndex}][payment_frequency]`;
            });
        });
    }

    function handleFormSubmit(e) {
        e.preventDefault(); // Prevent submission immediately

        // Reset previous validation states
        form.querySelectorAll('.invalid-glow').forEach(el => el.classList.remove('invalid-glow'));

        // Check form validity
        if (!form.checkValidity()) {
            const invalidElements = form.querySelectorAll(':invalid');
            const fieldsetsToGlow = new Set();

            invalidElements.forEach(el => {
                const fieldset = el.closest('fieldset');
                if (fieldset) {
                    fieldsetsToGlow.add(fieldset);
                }
            });

            fieldsetsToGlow.forEach(fieldset => {
                fieldset.classList.add('invalid-glow');
            });

            // Optional: Scroll to the first invalid element
            if (invalidElements.length > 0) {
                invalidElements[0].focus();
                invalidElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return; // Stop the function here
        }

        // If the form is valid, proceed with serialization and redirection
        updateNames(); // Ensure all names are set before serialization
        const formData = new FormData(form);
        const formObject = {};

        // Process top-level fields and multi-select checkboxes
        formData.forEach((value, key) => {
            if (key.startsWith('household_members')) return; // Skip household members, they are handled below

            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!formObject[cleanKey]) {
                    formObject[cleanKey] = [];
                }
                formObject[cleanKey].push(value);
            } else {
                formObject[key] = value;
            }
        });

        // Manually build the household_members array from the DOM
        formObject.household_members = [];
        const members = householdContainer.querySelectorAll('.household-member');
        members.forEach(member => {
            const memberData = { incomes: [], debts: [] };
            memberData.name = member.querySelector('.member-name')?.value || '';

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
                if (debtData.type === 'other') {
                    debtData.other_type = debt.querySelector('.other-debt-type').value;
                }
                debtData.payment_amount = debt.querySelector('.debt-payment-amount').value;
                debtData.payment_frequency = debt.querySelector('.debt-payment-frequency').value;
                memberData.debts.push(debtData);
            });
            formObject.household_members.push(memberData);
        });

        // Store data in sessionStorage and redirect
        try {
            sessionStorage.setItem('rcvFormData', JSON.stringify(formObject));
            window.location.href = 'summary.html';
        } catch (error) {
            console.error('Error saving data to sessionStorage:', error);
            alert('Could not save form data. Please check browser permissions.');
        }
    }

    // --- Initial Setup ---
    toggleCollapsible(householdSection, true);
    addHouseholdMember();
    addHouseholdMemberBtn.style.display = 'block';
});