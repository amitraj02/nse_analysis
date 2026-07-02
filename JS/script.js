document.addEventListener('DOMContentLoaded', () => {
    // Add interactive click animations to the flowchart elements
    const flowSteps = document.querySelectorAll('.flow-step');
    const setupSteps = document.querySelectorAll('.setup-step');
    const actionBoxes = document.querySelectorAll('.action-box');

    // Helper function to trigger a pulse animation
    function triggerPulse(element) {
        element.classList.add('active');
        setTimeout(() => {
            element.classList.remove('active');
        }, 400);
    }

    flowSteps.forEach(step => {
        step.addEventListener('click', () => {
            triggerPulse(step);
        });
    });

    setupSteps.forEach(step => {
        step.addEventListener('click', () => {
            triggerPulse(step);
        });
    });

    actionBoxes.forEach(box => {
        box.addEventListener('click', () => {
            // Additional alert for buying actions just to showcase JS functionality
            const tradeType = box.classList.contains('buy-ce') ? 'CALL' : 'PUT';
            alert(`Execution triggered for ${tradeType} option.\nAll conditions are met!`);
        });
    });
});
