document.addEventListener("DOMContentLoaded", () => {

    let itemList: Array<string> = [];
    let compartimentType : string = "Compartiment Frais";
    const title = document.getElementById("compartiment-header-title");

    let htmlItemList: HTMLCollection = document.getElementsByClassName("compartiment-item");
    if (htmlItemList) {
        for(let i = 0; i < htmlItemList.length; i++) {
            const item = htmlItemList.item(i) as HTMLDivElement;
            item.addEventListener("click", () => {
                item.childNodes.forEach((child) => {
                    if(child instanceof HTMLInputElement) {
                        (child as HTMLInputElement).checked ? child.checked = false : child.checked = true;
                    }
                });
            });
        }
    }

    if (title) {
        title.innerText = compartimentType;
    }

    const compartimentButtonChoice: HTMLCollection = document.getElementsByClassName("compartiment-button-choice");
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

    const changeTitle = (name: string) => {
        if (title) {
            compartimentType = name;
            title.innerText = compartimentType;
        }
    };

});