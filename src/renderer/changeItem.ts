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

    dateTextInput.addEventListener("blur", () => {
        const date = new Date(dateTextInput.value).toISOString().split("T")[0];
        dateInput.value,dateTextInput.value = date;
    });
});