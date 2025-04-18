document.addEventListener("DOMContentLoaded", () => {
    
    document.addEventListener("mousemove", (event) => {
        if(event.buttons === 1) {
            const clickDiv = document.createElement("div");
            clickDiv.className = "click";
            clickDiv.style.top = `${event.clientY}px`;
            clickDiv.style.left = `${event.clientX}px`;
            document.body.appendChild(clickDiv);
            setTimeout(() => {
                clickDiv.remove();
            }
            , 200);
        }
    });

    document.addEventListener("mousedown", (event) => {
        if(event.button === 0) {
            const clickDiv = document.createElement("div");
            clickDiv.className = "click";
            clickDiv.style.top = `${event.clientY}px`;
            clickDiv.style.left = `${event.clientX}px`;
            document.body.appendChild(clickDiv);
            setTimeout(() => {
                clickDiv.remove();
            }
            , 200);
        }
    });

    const helloMessage = document.getElementById("colloc-head");
    if (helloMessage) {
        const currentHour = new Date().getHours();
        if (5 < currentHour && currentHour < 17) {
            helloMessage.innerHTML = "Bonjour John DOE";
        } else {
            helloMessage.innerHTML = "bonsoir John DOE";
        }
    }

    const connectBtn = document.getElementById("btn");
    if (connectBtn) {
        connectBtn.addEventListener("click", () => {
            // @ts-ignore
            window.electron.connect();
        });
    }

    const disconnectBtn = document.getElementById("disconnect-button");
    if (disconnectBtn) {
        disconnectBtn.addEventListener("click", () => {
            // @ts-ignore
            window.electron.disconnect();
        });
    }

    const alerteBtn = document.getElementById("AlerteBtn");
    if (alerteBtn) {
        alerteBtn.addEventListener("click", () => {
            // @ts-ignore
            window.electron.alerteGo();
        });
    }

    const backBtn = document.getElementsByClassName("back-button");
    if (backBtn) {
        Array.from(backBtn).forEach((btn) => {
            btn.addEventListener("click", () => {
                // @ts-ignore
                window.electron.back();
            });
        });
    }

    const editContainerBtn = document.getElementById("compartimentBTN");
    if (editContainerBtn) {
        editContainerBtn.addEventListener("click", () => {
            // @ts-ignore
            window.electron.editContainerGo();
        });
    }

});