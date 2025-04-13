document.addEventListener("DOMContentLoaded", () => {

    let alerteList: Array<Array<string>> = [];
    let alerteType : string = "Compartiment Frais";
    const title = document.getElementById("alerte-header-title");
    
    if (title) {
        title.innerText = alerteType;
    }

    const alerteButtonChoice: HTMLCollection = document.getElementsByClassName("alerte-button-choice");
    if (alerteButtonChoice) {
        for (let i = 0; i < alerteButtonChoice.length; i++) {
            const button = alerteButtonChoice[i] as HTMLButtonElement;
            button.addEventListener("click", () => {
                const name = button.getAttribute("Alerte-type");
                if (name) {
                    changeTitle(name);
                }
            });
        }
    }

    const changeTitle = (name: string) => {
        if (title) {
            alerteType = name;
            title.innerText = alerteType;
        }
    };
});