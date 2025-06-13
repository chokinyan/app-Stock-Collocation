document.addEventListener("DOMContentLoaded", () => {

    const ItemPriewiewImage = document.getElementById("item-image") as HTMLImageElement;
    const ItemPriewiewName = document.getElementById("item-name") as HTMLInputElement;
    const validationButton = document.getElementById("add-item-button") as HTMLButtonElement;

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
                const rep = await window.api.searchItem(searchItem.value);
                if (rep.product) {
                    if (rep.product.image_url) {
                        ItemPriewiewImage.src = `${rep.product.image_url}`;
                    } else {
                        ItemPriewiewImage.src = "../../../asset/image/icon/Monogram.svg"; // Default icon if no image URL
                    }
                    ItemPriewiewImage.alt = rep.product.product_name || "No name available";
                    if (rep.product.product_name) {
                        ItemPriewiewName.value = rep.product.product_name;
                    }
                }
            }
        });
    }

    if (ItemPriewiewName) {
        KioskBoard.run("#item-name", {
            keysArrayOfObjects: [
                {
                    "0": "A",
                    "1": "Z",
                    "2": "E",
                    "3": "R",
                    "4": "T",
                    "5": "Y",
                    "6": "U",
                    "7": "I",
                    "8": "O",
                    "9": "P"
                },
                {
                    "0": "Q",
                    "1": "S",
                    "2": "D",
                    "3": "F",
                    "4": "G",
                    "5": "H",
                    "6": "J",
                    "7": "K",
                    "8": "L",
                    "9": "M"
                },
                {
                    "0": "W",
                    "1": "X",
                    "2": "C",
                    "3": "V",
                    "4": "B",
                    "5": "N",
                }
            ],
            keysFontSize: "11px",
            keysIconSize: "12px",
            keysAllowSpacebar: true,
        });
    }

    const compartimentSelect = document.getElementById("select-compartiment") as HTMLSelectElement;


    const addItemButton = document.getElementById("add-item-button") as HTMLButtonElement;
    if (addItemButton) {
        addItemButton.addEventListener("click", async () => {
            const item = {
                name: ItemPriewiewName.textContent || "",
                image: ItemPriewiewImage.src || "",
                expirationDate: dateInput.value,
                barcode: searchItem.value
            };

            // @ts-ignore
            await window.user.addItemToContainer(item);
        });
    }


    document.addEventListener("change", async () => {
        const isNameValid = !!(ItemPriewiewName.value && ItemPriewiewName.value.trim());
        const isImageValid = !!(ItemPriewiewImage.src && ItemPriewiewImage.src.trim());
        const isDateValid = !!(dateInput.value && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.value));
        const isCompartimentValid = !!(compartimentSelect && compartimentSelect.value);

        if (validationButton && validationButton instanceof HTMLButtonElement) {

            if (isNameValid && isImageValid && isDateValid && isCompartimentValid) {
                validationButton.classList.remove("disabled");
            } else {
                validationButton.classList.add("disabled");
            }
        }
    });

    if (validationButton && validationButton instanceof HTMLButtonElement) {
        validationButton.addEventListener("click", async () => {
            if (!validationButton.classList.contains("disabled")) {
                const item = {
                    name: ItemPriewiewName.value,
                    image: ItemPriewiewImage.src,
                    expirationDate: dateInput.value,
                    barcode: searchItem.value,
                    compartiment: compartimentSelect.value
                };

                // @ts-ignore
                await window.user.addItemToContainer(item);
                // @ts-ignore
                window.nav.back();
            }
        }
        );
    }

});