document.addEventListener("DOMContentLoaded", async () => {
    let user = {
        nom: '',
        prenom: '',
        rfid: '',
        pin: '',
        mdp: '',
        id: (document.getElementById('userId') as HTMLParagraphElement).textContent
    }

    let rfidProcess = false;
    let mdpValid = false;

    const nomInput = document.querySelector('.form-input[name="nom"]') as HTMLInputElement;
    const prenomInput = document.querySelector('.form-input[name="prenom"]') as HTMLInputElement;
    const pinInput = document.querySelector('.form-input[name="pin"]') as HTMLInputElement;
    const mdpInput = document.querySelector('.form-input[name="mdp"]') as HTMLInputElement;

    const cameraButton = document.getElementById('config-camera') as HTMLButtonElement;
    const rfidButton = document.getElementById('config-rfid') as HTMLButtonElement;

    const stopCameraButton = document.getElementById('stop-config-camera') as HTMLButtonElement;

    const screenshots: HTMLCanvasElement[] = [];

    // Initialize KioskBoard with AZERTY layout
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
            "&", "é", "\"", "'", "(", "-", "è", "_", "ç", "à", ")", "=",
            "²", "~", "#", "{", "[", "|", "`", "\\", "^", "@", "]", "}",
            "€", "¤", "µ", "*", "%", "ù", "$", "£", "¨", "^", "¯",
            "!", "?", ".", ";", ":", "/", "§", "+", "°", "¿", "¡"
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

    // Apply KioskBoard to nom input with AZERTY layout
    if (nomInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="nom"]');
        

        nomInput.addEventListener('input', () => {
            user.nom = nomInput.value;
        });
    }

    // Apply KioskBoard to prenom input with AZERTY layout
    if (prenomInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="prenom"]');

        prenomInput.addEventListener('input', () => {
            user.prenom = prenomInput.value;
        });
    }

    // Configure PIN input for numpad only
    if (pinInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="pin"]')

        pinInput.addEventListener('input', () => {
            if (pinInput.value.length !== 4 || !/^\d{4}$/.test(pinInput.value)) {
                pinInput.setCustomValidity("Le code PIN doit contenir exactement 4 chiffres.");
            } else {
                pinInput.setCustomValidity("");
            }
            pinInput.reportValidity();
            user.pin = pinInput.value;
        });
    }

    // Configure password input with full AZERTY keyboard and special characters
    if (mdpInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="mdp"]', {
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
                // Caractères accentués français
                "é", "è", "ê", "ë", "à", "â", "ä", "ù", "û", "ü", "ô", "ö", "î", "ï", "ç",
                // Chiffres de la première ligne AZERTY
                "&", "é", "\"", "'", "(", "-", "è", "_", "ç", "à", ")", "=",
                // Caractères spéciaux AZERTY (AltGr)
                "²", "~", "#", "{", "[", "|", "`", "\\", "^", "@", "]", "}",
                // Symboles monétaires et spéciaux
                "€", "¤", "µ", "*", "%", "ù", "$", "£", "¨", "^", "¯",
                // Ponctuation
                "!", "?", ".", ";", ":", "/", "§", "+", "°", "¿", "¡",
                // Autres caractères utiles pour mots de passe
                "<", ">", ",", "≤", "≥", "≠", "±", "×", "÷", "∞"
            ],
            keysNumpadArrayOfNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
            keysAllowSpacebar: false
        });

        mdpInput.addEventListener('input', () => {
            if (mdpInput.value.length < 6 || !/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?:{}|<>])/.test(mdpInput.value)) {
                mdpInput.setCustomValidity("Le mot de passe doit contenir au moins 6 caractères, une majuscule, un chiffre et un caractère spécial.");
                mdpValid = false;
            } else {
                mdpValid = true;
                mdpInput.setCustomValidity("");
            }
            mdpInput.reportValidity();
            user.mdp = mdpInput.value;
        });
    }

    if (cameraButton) {
        cameraButton.addEventListener('click', async () => {
            user.nom = nomInput.value;
            if (!user.nom || user.nom.trim() === '') {
                alert("Veuillez remplir le champ nom avant de continuer.");
                return;
            }

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(async (stream) => {
                    const video = document.getElementById('camera-preview') as HTMLVideoElement;
                    video.style.display = 'block';
                    video.srcObject = stream;
                    video.play();
                })
                .catch((error) => {
                    console.error("Erreur d'accès à la caméra :", error);
                    alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
                    return;
                });

            await sleep(2000);

            // Créer un élément pour afficher le compte à rebours
            const countdownElement = document.createElement('div');
            countdownElement.id = 'photo-countdown';
            countdownElement.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 10px;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                z-index: 1000;
                display: none;
            `;
            document.body.appendChild(countdownElement);

            let photoCount = 0;
            const screenshotInterval = setInterval(async () => {
                if (screenshots.length < 11) {
                    // Afficher le compte à rebours avant chaque photo
                    countdownElement.style.display = 'block';
                    countdownElement.textContent = `Photo ${photoCount + 1}/11 dans 3`;
                    await sleep(1000);
                    countdownElement.textContent = `Photo ${photoCount + 1}/11 dans 2`;
                    await sleep(1000);
                    countdownElement.textContent = `Photo ${photoCount + 1}/11 dans 1`;
                    await sleep(1000);
                    countdownElement.textContent = '📸 PHOTO !';

                    const video = document.getElementById('camera-preview') as HTMLVideoElement;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        screenshots.push(canvas);
                        photoCount++;
                    }

                    await sleep(500);
                    countdownElement.style.display = 'none';
                } else {
                    clearInterval(screenshotInterval);
                    document.body.removeChild(countdownElement);
                    stopCam();
                    //@ts-ignore
                    window.admin.savePicture(screenshots.map(canvas => canvas.toDataURL('image/png')), user.nom)
                        .then(() => {
                            alert("Les photos ont été enregistrées avec succès.");
                        })
                        .catch((error: any) => {
                            console.error("Erreur lors de l'enregistrement des photos :", error);
                            alert("Une erreur s'est produite lors de l'enregistrement des photos.");
                        });
                }
            }, 4500); // Intervalle de 4.5 secondes (3 sec compte à rebours + 0.5 sec photo + 1 sec pause)

            cameraButton.style.display = 'none';
            stopCameraButton.style.display = 'block';

        });
    }

    if (stopCameraButton) {
        stopCameraButton.addEventListener('click', () => {
            const countdownElement = document.getElementById('photo-countdown');
            if (countdownElement) {
                document.body.removeChild(countdownElement);
            }
            stopCam();
        });
    }

    const stopCam = () => {
        const video = document.getElementById('camera-preview') as HTMLVideoElement;
        const stream = video.srcObject as MediaStream;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            video.style.display = 'none';
        }

        stopCameraButton.style.display = 'none';
        cameraButton.style.display = 'block';
    }

    if (rfidButton) {
        rfidButton.addEventListener('click', async () => {
            user.nom = nomInput.value;

            const rfidText = document.getElementById('rfid-text') as HTMLParagraphElement;
            rfidText.textContent = "Veuillez placer votre badge ou carte RFID";
            rfidText.style.display = 'block';
            rfidButton.style.display = 'none';
            rfidProcess = false;

            await sleep(2000)

            //@ts-ignore
            await window.admin.writeRfid(user.nom);
            rfidProcess = true;

            rfidText.textContent = "RFID enregistré avec succès.";
            rfidText.style.display = 'block';
            await sleep(2000);
            rfidText.style.display = 'none';
            rfidButton.style.display = 'block';

        });
    }

});