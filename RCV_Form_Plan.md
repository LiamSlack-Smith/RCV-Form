### UPDATED Project Plan: RCV Screening Form

--- 

### **1. HTML Structure (The Skeleton)**

The structure will mirror the reference form's layout and class conventions to ensure stylistic consistency.

*   **Main Wrapper:** The entire application will be wrapped in `<div class="app-wrapper"><div id="formContainer">...</div></div>`.
*   **Main Form Element:** `<form id="rcv-screening-form">` will wrap all sections.
*   **Grouping with Fieldsets:** Each logical group of questions will be contained within a `<fieldset>` with a `<legend>` tag, which is the primary structural element in the reference form.

*   **Section 1: Housing Situation**
    *   `<fieldset>` with `<legend>Current Housing Situation</legend>`.
    *   Use the `.custom-options-grid` structure for the radio buttons:
        ```html
        <div class="custom-options-grid grid-normalize-height">
            <div class="custom-option"><input type="radio" id="housingStatusHomeless" name="housing_status" value="homeless" required><label for="housingStatusHomeless">Homeless</label></div>
            <div class="custom-option"><input type="radio" id="housingStatusAtRisk" name="housing_status" value="at_risk" required><label for="housingStatusAtRisk">At Risk of Homelessness</label></div>
        </div>
        ```
    *   Conditional containers will use the `.collapsible` and `.collapsed` classes for smooth transitions: `<div id="homeless-details" class="collapsible collapsed">...</div>` and `<div id="at-risk-details" class="collapsible collapsed">...</div>`.

*   **Section 2: Household Members, Income, and Debt**
    *   A primary container: `<div id="household-members-container"></div>`.
    *   An "Add" button styled like the main form buttons: `<button type="button" id="add-household-member">+ Add Household Member</button>`.

*   **HTML Templates (for cloning with JS):**
    *   **Household Member Template:** This will be a `<fieldset>` itself to maintain visual consistency.
        ```html
        <fieldset class="household-member-template collapsible">
            <legend>Household Member</legend>
            <!-- Member Name, Income/Debt containers and buttons -->
        </fieldset>
        ```
    *   **Income Source & Debt Templates:** These will be simple `div`s with a border, nested inside the household member `fieldset` to show hierarchy. They will contain the necessary inputs and a remove button.

*   **Submission Button:**
    *   `<button type="submit" id="submit-rcv-form">Submit Screening Form</button>`

--- 

### **2. CSS Styling (The Look & Feel)**

The CSS will be a direct implementation of the reference `style.css` dark theme.

*   **Color Palette:**
    *   **Background:** `#121212`
    *   **Form Container BG:** `#1e1e1e`
    *   **Text:** `#e0e0e0`
    *   **Accent/Primary:** `#FE391F` (for headers, buttons, highlights)
    *   **Input BG:** `#2c2c2c`
    *   **Borders:** `#4a4a4a`
*   **Typography:** `font-family: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", "Helvetica", "Arial", sans-serif;`
*   **Layout Elements:**
    *   Style `fieldset` and `legend` as per the reference: `border: 1px solid #4a4a4a;`, `border-radius: 8px;`, and `legend` with the accent color `#FE391F`.
    *   Style all standard `input`, `select`, and `textarea` elements with the dark theme (`background-color: #2c2c2c`, etc.).
*   **Custom Radio/Checkbox Buttons:**
    *   Implement the `.custom-options-grid` and `.custom-option` classes exactly as in the reference `style.css`. This is the most important aesthetic feature to replicate. The `label` will be styled as a button, and the `:checked` state will change its background and add an accent-colored border.
*   **Buttons:** All `<button>` elements will be styled to be full-width, with a `border-radius: 25px`, and the `#FE391F` background color.
*   **Animations & Transitions:** The `.collapsible.collapsed` classes will be used to animate the showing/hiding of conditional sections, matching the smooth transitions of the reference form.

--- 

### **3. JavaScript Functionality (The Brains)**

The logic will be self-contained and require no backend server, perfect for a prototype.

*   **Event Handling:**
    *   **Conditional Visibility:** `change` listeners on radio buttons will toggle the `.collapsed` class on target sections (e.g., showing `#homeless-details` when `housing_status` is 'homeless').
    *   **Dynamic Elements:** Use event delegation on the main form container to handle clicks for adding/removing household members, incomes, and debts.
*   **DOM Manipulation:**
    *   When adding elements, clone the corresponding HTML template, update the `name` attributes with array-based indices (e.g., `household_members[0][incomes][0][amount]`), and append it to the correct container.
*   **No Backend - Local Prototype Submission:**
    *   An event listener on the main form's `submit` event will call `event.preventDefault()`.
    *   A function will then be called to serialize the entire form's data into a structured JSON object.
    *   The final action will be to output this JSON object to the browser's developer console using `console.log()`. This provides a clear way to verify the captured data without any server-side processing.