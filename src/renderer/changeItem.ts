document.addEventListener("DOMContentLoaded", () => {

    const dateInput = document.getElementById("date-expiration-input") as HTMLInputElement;
    dateInput.value = new Date().toISOString().split("T")[0];
    dateInput.min = new Date().toISOString().split("T")[0];

    const dateTextInput = document.getElementById("date-expiration-input-text") as HTMLInputElement;
    dateTextInput.value = new Date().toISOString().split("T")[0];
    dateTextInput.addEventListener("click", () => {
        dateInput.showPicker();
    });

    dateInput.addEventListener("change", () => {
        dateTextInput.value = dateInput.value;
    });

    dateTextInput.addEventListener("input", () => {
        if(!/^[0-9-]/.test(dateTextInput.value.charAt(dateTextInput.value.length - 1))){
            dateTextInput.value = dateTextInput.value.slice(0, -1);
        }
    });

    dateTextInput.addEventListener("blur", () => {
        const date = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateTextInput.value) ? new Date(dateTextInput.value).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

        dateInput.value,dateTextInput.value = date;
    });
});