document.addEventListener("DOMContentLoaded", () => {

    const ItemPriewiewImage = document.getElementById("item-image") as HTMLImageElement;
    const ItemPriewiewName = document.getElementById("item-name") as HTMLParagraphElement;


    // @ts-ignore
    window.electron.onItemFound((_event, item) => {
        console.log(item);
    });

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
        if (!/^[0-9-]/.test(dateTextInput.value.charAt(dateTextInput.value.length - 1))) {
            dateTextInput.value = dateTextInput.value.slice(0, -1);
        }
    });

    dateTextInput.addEventListener("blur", () => {
        const date = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateTextInput.value) ? new Date(dateTextInput.value).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];

        dateInput.value, dateTextInput.value = date;
    });

    const cancelButton = document.getElementById("cancel-item-button") as HTMLButtonElement;
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            //@ts-ignore
            window.electron.back();
        });
    }

    const searchItem = document.getElementById("search-item-input") as HTMLInputElement;
    if (searchItem) {
        KioskBoard.run("#search-item-input", {
            keysArrayOfObjects: [{
                "0": "0"
            }],
            keysAllowSpacebar: false
        });

        searchItem.addEventListener("change", async () => {
            if (searchItem.value.length === 13) {
                // @ts-ignore
                const rep = await window.electron.searchItem(searchItem.value);
                if (rep.product) {
                    ItemPriewiewImage.src = `${rep.product.image_url}`;
                    ItemPriewiewImage.alt = rep.product.product_name || "No name available";
                    ItemPriewiewName.textContent = rep.product.product_name;

                }
            }
        });
    }
});