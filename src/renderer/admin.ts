document.addEventListener("DOMContentLoaded", () => {

    const ConnectBtn = document.getElementById("loginButton") as HTMLButtonElement;
    const usernameInput = document.getElementById("username") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;

    if (!ConnectBtn || !usernameInput || !passwordInput) {
        console.error("One or more elements are missing in the DOM.");
        return;
    }

    ConnectBtn.addEventListener("click", async () => {
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username && password) {
            //@ts-ignore
            window.user.adminConnect(username, password);
        } else {
            alert("Veuillez saisir votre nom d'utilisateur et votre mot de passe.");
        }
    });

});