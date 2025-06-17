document.addEventListener("DOMContentLoaded", () => {

    const ConnectBtn = document.getElementById("loginButton") as HTMLButtonElement;
    const usernameInput = document.getElementById("username") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;

    if (!ConnectBtn || !usernameInput || !passwordInput) {
        console.error("One or more elements are missing in the DOM.");
        return;
    }

    KioskBoard.init({
        keysArrayOfObjects: [
            {
                "0": "a", "1": "z", "2": "e", "3": "r", "4": "t", "5": "y", "6": "u", "7": "i", "8": "o", "9": "p"
            },
            {
                "0": "q", "1": "s", "2": "d", "3": "f", "4": "g", "5": "h", "6": "j", "7": "k", "8": "l", "9": "m"
            },
            {
                "0": "w", "1": "x", "2": "c", "3": "v", "4": "b", "5": "n"
            }
        ],
        keysSpecialCharsArrayOfStrings: [
            "é", "è", "ê", "ë", "à", "â", "ä", "ù", "û", "ü", "ô", "ö", "î", "ï", "ç",
            "&", "é", "\"", "(", "-", "è", "_", "ç", "à", ")", "=",
            "²", "~", "#", "{", "[", "|", "`", "\\", "^", "@", "]", "}",
            "€", "µ", "*", "%", "ù", "$", "£", "¨", "^", "¯",
            "!", "?", ".", ";", "/", "+", "°", "¿"
        ],
        keysNumpadArrayOfNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        language: 'fr',
        theme: 'light',
        autoScroll: true,
        capsLockActive: true,
        allowRealKeyboard: true,
        allowMobileKeyboard: false,
        cssAnimations: true,
        cssAnimationsDuration: 360,
        cssAnimationsStyle: 'slide',
        keysAllowSpacebar: true,
        keysSpacebarText: 'Espace',
        keysFontFamily: 'Arial',
        keysFontSize: '14px',
        keysFontWeight: 'normal',
        keysIconSize: '20px',
        keysEnterText: 'Entrée',
        keysEnterCanClose: true
    });

    //@ts-ignore
    KioskBoard.run('#username');

    // Run KioskBoard for password input with special characters
    //@ts-ignore
    KioskBoard.run('#password');

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