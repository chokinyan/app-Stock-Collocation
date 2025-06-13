interface CompartimentItem {
    id: number;
    Nom_produit: string;
    Date_Peremption: string;
    Container: string;
    ImageUrl?: string;
}
/*
            <div class="compartiment-item">
                <img src="../../asset/image/icon/Monogram.svg" alt="foodIcon" class="compartiment-item-icon">
                <p class="compartiment-item-name">Nom de l'aliment</p>
                <p class="compartiment-item-date">Date de péremption</p>
                <input type="radio" name="compartiment-item">
            </div>
*/
document.addEventListener("DOMContentLoaded", async () => {

    let itemList: Array<CompartimentItem> = [];
    let itemChecked: HTMLDivElement | undefined;
    let compartimentType: string = "Compartiment Sec";
    const title = document.getElementById("compartiment-header-title");

    const deleteItemBtn = document.getElementById("delete-item-icon");

    setItemList();

    async function setItemList() {
        // @ts-ignore
        itemList = (await window.user.getItemListe(compartimentType.toLowerCase().split(" ")[1])).result || [];

        const itemListContainer = document.getElementsByClassName("item-container")[0] as HTMLDivElement;
        if (itemListContainer) {
            itemListContainer.innerHTML = ""; // Clear existing items

            itemList.forEach((item) => {
                console.log(item);

                const itemDiv = document.createElement("div");
                itemDiv.className = "compartiment-item";
                const itemIcon = document.createElement("img");
                if (item.ImageUrl) {
                    itemIcon.src = item.ImageUrl; // Use the image URL from the item
                } else {
                    itemIcon.src = "../../asset/image/icon/Monogram.svg"; // Default icon if no image URL
                }
                itemIcon.className = "compartiment-item-icon";
                const itemName = document.createElement("p");
                itemName.className = "compartiment-item-name";
                itemName.innerText = item.Nom_produit || "Nom de l'aliment"; // Fallback if name is missing
                const itemDate = document.createElement("p");
                itemDate.className = "compartiment-item-date";
                itemDate.innerText = item.Date_Peremption.split("T")[0]; // Format date to YYYY-MM-DD
                const itemInput = document.createElement("input");
                itemInput.type = "radio";
                itemInput.name = "compartiment-item";
                const itemId = document.createElement("p");
                itemId.className = "compartiment-item-id";
                itemId.innerText = item.id.toString(); // Display the item ID
                itemId.style.display = "none"; // Hide the ID from view 
                itemDiv.appendChild(itemIcon);
                itemDiv.appendChild(itemName);
                itemDiv.appendChild(itemDate);
                itemDiv.appendChild(itemInput);
                itemDiv.appendChild(itemId);
                itemListContainer.appendChild(itemDiv);
            });

            let htmlItemList: HTMLCollection = document.getElementsByClassName("compartiment-item");
            for (let i = 0; i < htmlItemList.length; i++) {
            const item = htmlItemList.item(i) as HTMLDivElement;
            item.addEventListener("click", () => {
                item.childNodes.forEach((child) => {
                    if (child instanceof HTMLInputElement) {
                        if (child.checked) {
                            itemChecked = undefined;
                            child.checked = false;
                        }
                        else {
                            itemChecked = item;
                            child.checked = true;
                        }
                    }
                });
                if(itemChecked && deleteItemBtn) {
                    deleteItemBtn.classList.remove("disabled");
                }
                else if(deleteItemBtn) {
                    deleteItemBtn.classList.add("disabled");
                }
            });
        }
        }
    }

    if (title) {
        title.innerText = compartimentType;
    }

    const compartimentButtonChoice: HTMLCollection = document.getElementsByClassName("compartiment-button");
    if (compartimentButtonChoice) {
        for (let i = 0; i < compartimentButtonChoice.length; i++) {
            const button = compartimentButtonChoice[i] as HTMLButtonElement;
            button.addEventListener("click", () => {
                const name = button.getAttribute("Compartiment-type");
                if (name) {
                    changeTitle(name);
                }
            });
        }
    }

    const addItemBtn = document.getElementById("add-item-icon");
    if (addItemBtn) {
        addItemBtn.addEventListener("click", () => {
            // @ts-ignore
            window.nav.addItem();
        });
    }

    const editItemBtn = document.getElementById("edit-item-icon");
    if (editItemBtn) {
        editItemBtn.addEventListener("click", () => {
            if (itemChecked) {

                // @ts-ignore
                window.nav.editItem(itemId);
            }
        });
    }

    if (deleteItemBtn) {
        deleteItemBtn.addEventListener("click", () => {
            if (itemChecked) {
                const itemId = (itemChecked.querySelector(".compartiment-item-id") as HTMLElement | null)?.innerText;
                // @ts-ignore
                window.api.deleteItem(itemId);

                itemChecked.remove();
                itemChecked = undefined;
                deleteItemBtn.classList.add("disabled");
            }
        });
    }

    const changeTitle = (name: string) => {
        if (title) {
            compartimentType = name;
            title.innerText = compartimentType;
            setItemList();
        }
    };

});