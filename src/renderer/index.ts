document.addEventListener("DOMContentLoaded", async () => {

    document.addEventListener("mousemove", (event) => {
        if (event.buttons === 1) {
            const clickDiv = document.createElement("div");
            clickDiv.className = "click";
            clickDiv.style.top = `${event.clientY}px`;
            clickDiv.style.left = `${event.clientX}px`;
            document.body.appendChild(clickDiv);
            setTimeout(() => {
                clickDiv.remove();
            }, 200);
        }
    });

    document.addEventListener("mousedown", (event) => {
        if (event.button === 0) {
            const clickDiv = document.createElement("div");
            clickDiv.className = "click";
            clickDiv.style.top = `${event.clientY}px`;
            clickDiv.style.left = `${event.clientX}px`;
            document.body.appendChild(clickDiv);
            setTimeout(() => {
                clickDiv.remove();
            }, 200);
        }
    });

    const helloMessage = document.getElementById("colloc-head");
    if (helloMessage) {
        const currentHour = new Date().getHours();
        //@ts-ignore
        window.user.info()
            .then((info: { nom: string, prenom: string, alerte: [] }) => { 
                if (5 < currentHour && currentHour < 17) {
                    helloMessage.innerText = `Bonjour ${info.prenom} ${info.nom}`;
                } else {
                    helloMessage.innerText = `bonsoir ${info.prenom} ${info.nom}`;
                }
            })
    }

    const connectBtn = document.getElementById("btn");
    if (connectBtn) {
        connectBtn.addEventListener("click", () => {
            // @ts-ignore
            window.user.connect();
        });
    }

    const disconnectBtn = document.getElementById("disconnect-button");
    if (disconnectBtn) {
        disconnectBtn.addEventListener("click", () => {
            // @ts-ignore
            window.user.disconnect();
        });
    }

    const alerteBtn = document.getElementById("AlerteBtn");
    if (alerteBtn) {
        alerteBtn.addEventListener("click", () => {
            // @ts-ignore
            window.navigation.alerteGo();
        });
    }

    const backBtn = document.getElementsByClassName("back-button");
    if (backBtn) {
        Array.from(backBtn).forEach((btn) => {
            btn.addEventListener("click", () => {
                // @ts-ignore
                window.navigation.back();
            });
        });
    }

    const editContainerBtn = document.getElementById("compartimentBTN");
    if (editContainerBtn) {
        editContainerBtn.addEventListener("click", () => {
            // @ts-ignore
            window.navigation.editContainerGo();
        });
    }


    const temperatureText = document.getElementById("Temparature") as HTMLParagraphElement;
    if (temperatureText) {
        // @ts-ignore
        window.api.temperature()
            .then((value: { temperature?: string }) => {
                temperatureText.innerText = `Temperature du compartiment frais : ${value?.temperature}°C`
            })
            .catch((err: any) => console.error(err))

        setInterval(() => {
            // @ts-ignore
            window.api.temperature()
                .then((value: { temperature?: string }) => {
                    temperatureText.innerText = `Temperature du compartiment frais : ${value?.temperature}°C`
                })
                .catch((err: any) => console.error(err))
        }, 2000)
    }

});