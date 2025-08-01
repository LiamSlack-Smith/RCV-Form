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

    // Listener to remove validation glow on user interaction
    form.addEventListener('input', (e) => {
        if (e.target.classList.contains('validation-glow')) {
            e.target.classList.remove('validation-glow');
        }
    });
    form.addEventListener('change', (e) => {
        let target = e.target;
        if (target.classList.contains('validation-glow')) {
            target.classList.remove('validation-glow');
        }
        // Special case for radio buttons where the glow is on the parent
        if (target.type === 'radio') {
            const parentGrid = target.closest('.custom-options-grid');
            if (parentGrid && parentGrid.classList.contains('validation-glow')) {
                parentGrid.classList.remove('validation-glow');
            }
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
        e.preventDefault();

        // Reset previous validation states
        form.querySelectorAll('.validation-glow').forEach(el => el.classList.remove('validation-glow'));

        let isFormValid = true;

        // Check each fieldset individually to apply the correct glow logic
        form.querySelectorAll('fieldset').forEach(fieldset => {
            const requiredElements = [...fieldset.querySelectorAll('[required]')];
            if (requiredElements.length === 0) return;

            const requiredUnits = new Set();
            requiredElements.forEach(el => {
                if (el.type === 'radio') {
                    requiredUnits.add(el.name);
                } else {
                    requiredUnits.add(el);
                }
            });

            const invalidUnits = new Set();
            requiredUnits.forEach(unit => {
                if (typeof unit === 'string') { // Radio group name
                    if (!form.querySelector(`input[name="${unit}"]:checked`)) {
                        invalidUnits.add(unit);
                    }
                } else { // Standard element
                    if (!unit.checkValidity()) {
                        invalidUnits.add(unit);
                    }
                }
            });

            if (invalidUnits.size > 0) {
                isFormValid = false;
                if (invalidUnits.size === requiredUnits.size) {
                    fieldset.classList.add('validation-glow');
                } else {
                    invalidUnits.forEach(unit => {
                        let target;
                        if (typeof unit === 'string') {
                            target = form.querySelector(`input[name="${unit}"]`).closest('.custom-options-grid');
                        } else {
                            target = unit;
                        }
                        if (target) target.classList.add('validation-glow');
                    });
                }
            }
        });

        if (isFormValid) {
            updateNames();
            const formData = new FormData(form);
            const formObject = {};

            formData.forEach((value, key) => {
                if (key.startsWith('household_members')) return;
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

            try {
                sessionStorage.setItem('rcvFormData', JSON.stringify(formObject));
                window.location.href = 'summary.html';
            } catch (error) {
                console.error('Error saving data to sessionStorage:', error);
                alert('Could not save form data. Please check browser permissions.');
            }
        } else {
            const firstInvalid = form.querySelector('.validation-glow');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // --- Initial Setup ---
    toggleCollapsible(householdSection, true);
    addHouseholdMember();
    addHouseholdMemberBtn.style.display = 'block';
});