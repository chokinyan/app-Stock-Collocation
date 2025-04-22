interface CompartimentItem {
    id: number;
    name: string;
    description: string;
    quantity: number;
}

document.addEventListener("DOMContentLoaded", () => {

    let itemList: Array<CompartimentItem> = [];
    let itemChecked: HTMLDivElement | undefined;
    let compartimentType: string = "Compartiment Sec";
    const title = document.getElementById("compartiment-header-title");

    let htmlItemList: HTMLCollection = document.getElementsByClassName("compartiment-item");
    if (htmlItemList) {
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
            });
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
            window.electron.addItem();
        });
    }

    const editItemBtn = document.getElementById("edit-item-icon");
    if (editItemBtn) {
        editItemBtn.addEventListener("click", () => {
            if (itemChecked) {
                // @ts-ignore
                window.electron.editItem(itemId);
            }
        });
    }

    const deleteItemBtn = document.getElementById("delete-item-icon");
    if (deleteItemBtn) {
    }

    const changeTitle = (name: string) => {
        if (title) {
            compartimentType = name;
            title.innerText = compartimentType;
        }
    };

});