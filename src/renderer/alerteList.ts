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

    //const alerteList = document.getElementById("alerte-list");
    //if (alerteList) {
    //    // @ts-ignore
    //    window.electron.getAlerteList().then((data: string[]) => {
    //        data.forEach((alerte) => {
    //            const alerteDiv = document.createElement("div");
    //            alerteDiv.className = "alerte";
    //            alerteDiv.innerHTML = alerte;
    //            alerteList.appendChild(alerteDiv);
    //        });
    //    });
    //}

    const changeTitle = (name: string) => {
        if (title) {
            alerteType = name;
            title.innerText = alerteType;
        }
    };
});