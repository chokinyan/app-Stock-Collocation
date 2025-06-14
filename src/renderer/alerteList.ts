document.addEventListener("DOMContentLoaded", async () => {

    type Alerte = {
        id_Utilisateur: number;
        id: number;
        Nom_produit: string;
        Date_Peremption: string;
        Container: string;
        ImageUrl: string | null;
    };

    let alerteList: Array<Alerte> = [];
    // @ts-ignore
    alerteList = await window.user.getAlerteListe();

    const alerteUpdate = (container: string) => {
        const alerteListContainer = document.getElementsByClassName("item-container")[0] as HTMLDivElement;
        if (alerteListContainer) {
            alerteListContainer.innerHTML = ""; // Clear previous content
            for (const alerte of alerteList) {
                if (alerte.Container.toLocaleLowerCase() !== container.split(" ")[1].toLocaleLowerCase()) {
                    continue; // Skip if the container does not match
                }
                const alerteItem = document.createElement("div");
                alerteItem.className = "user-item";
                const alerteIcon = document.createElement("img");
                if (alerte.ImageUrl) {
                    alerteIcon.src = alerte.ImageUrl;
                } else {
                    alerteIcon.src = "../../asset/image/icon/Monogram.svg"; // Default icon if no image URL
                }
                const alerteText = document.createElement("p");
                alerteText.innerText = `L'aliment ${alerte.Nom_produit} est périmé depuis le ${alerte.Date_Peremption.split("T")[0]}`;
                alerteItem.appendChild(alerteIcon);
                alerteItem.appendChild(alerteText);

                alerteListContainer.appendChild(alerteItem);

            }
        }
    }

    console.log("Alerte List:", alerteList);
    let alerteType: string = "Compartiment Frais";

    const title = document.getElementById("alerte-header-title");

    if (title) {
        title.innerText = alerteType;
        alerteUpdate(alerteType);
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
            alerteUpdate(name);
        }
    };

});