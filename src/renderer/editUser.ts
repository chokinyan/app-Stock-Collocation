document.addEventListener("DOMContentLoaded", async () => {
    // Fix: Vérification sécurisée de l'ID utilisateur
    await sleep(3000); // Attendre que le DOM soit complètement chargé

    const userIdElement = document.getElementById('userId') as HTMLParagraphElement;
    if (!userIdElement || !userIdElement.textContent) {
        console.error("ID utilisateur non trouvé");
        return;
    }

    let user = {
        nom: '',
        prenom: '',
        rfid: '',
        pin: '',
        mdp: '',
        id: userIdElement.textContent.trim()
    }

    let rfidProcess = false;
    let mdpValid = false;
    let screenshotInterval: NodeJS.Timeout | null = null; // Fix: Référence pour nettoyer l'intervalle

    const nomInput = document.querySelector('.form-input[name="nom"]') as HTMLInputElement;
    const prenomInput = document.querySelector('.form-input[name="prenom"]') as HTMLInputElement;
    const pinInput = document.querySelector('.form-input[name="pin"]') as HTMLInputElement;
    const mdpInput = document.querySelector('.form-input[name="mdp"]') as HTMLInputElement;

    const cameraButton = document.getElementById('config-camera') as HTMLButtonElement;
    const rfidButton = document.getElementById('config-rfid') as HTMLButtonElement;

    const stopCameraButton = document.getElementById('stop-config-camera') as HTMLButtonElement;

    const addBtn = document.getElementById("add-btn");
    const removeBtn = document.getElementById("delete-user");

    const screenshots: HTMLCanvasElement[] = [];

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

    if (nomInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="nom"]');

        nomInput.addEventListener('change', () => {
            user.nom = nomInput.value;
        });
    }

    // Apply KioskBoard to prenom input with AZERTY layout
    if (prenomInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="prenom"]');

        prenomInput.addEventListener('change', () => {
            console.log("Prénom saisi :", prenomInput.value);
            user.prenom = prenomInput.value;
        });
    }

    // Configure PIN input for numpad only
    if (pinInput) {
        //@ts-ignore
        KioskBoard.run('.form-input[name="pin"]')

        pinInput.addEventListener('change', () => {
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

        mdpInput.addEventListener('change', () => {
            // Regex mise à jour pour inclure les caractères spéciaux AZERTY
            const hasSpecialChar = /[&é"'(\-è_çà)=²~#{[|`\\^@\]}€¤µ*%ù$£¨¯!?\.;:\/§+°¿¡<>,≤≥≠±×÷∞]/.test(mdpInput.value);
            const hasUpperCase = /[A-Z]/.test(mdpInput.value);
            const hasNumber = /[0-9]/.test(mdpInput.value);

            if (mdpInput.value.length < 6 || !hasUpperCase || !hasNumber || !hasSpecialChar) {
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
            // Désactiver le bouton pour éviter les clics multiples
            cameraButton.disabled = true;

            user.nom = nomInput.value;
            if (!user.nom || user.nom.trim() === '') {
                alert("Veuillez remplir le champ nom avant de continuer.");
                cameraButton.disabled = false;
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.getElementById('camera-preview') as HTMLVideoElement;
                video.style.display = 'block';
                video.srcObject = stream;
                await video.play();

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
                screenshotInterval = setInterval(async () => {
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
                        if (screenshotInterval) {
                            clearInterval(screenshotInterval);
                            screenshotInterval = null;
                        }
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

            } catch (error) {
                console.error("Erreur d'accès à la caméra :", error);
                alert("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
                cameraButton.disabled = false;
                return;
            }
        });
    }

    // Fix: Amélioration de l'arrêt de la caméra
    const stopCam = () => {
        // Nettoyer l'intervalle si il existe
        if (screenshotInterval) {
            clearInterval(screenshotInterval);
            screenshotInterval = null;
        }

        const video = document.getElementById('camera-preview') as HTMLVideoElement;
        const stream = video.srcObject as MediaStream;

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            video.style.display = 'none';
        }

        stopCameraButton.style.display = 'none';
        cameraButton.style.display = 'block';
        cameraButton.disabled = false; // Réactiver le bouton
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

            user.rfid = user.nom;

        });
    }

    if (removeBtn) {
        removeBtn.addEventListener("click", () => {
            //@ts-ignore
            window.admin.dlUser(user.id, nomInput.value);
        });
    }

    // Fix: Validation améliorée avant ajout
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            // Vérifications complètes
            const isNomValid = !!(user.nom && user.nom.trim());
            const isPrenomValid = !!(user.prenom && user.prenom.trim());
            const isPin = !!(pinInput.value && pinInput.value.length === 4 && /^\d{4}$/.test(pinInput.value));
            const isScreenshot = !!(screenshots.length === 11);

            if (!isNomValid) {
                alert("Le nom est obligatoire.");
                return;
            }
            if (!isPrenomValid) {
                alert("Le prénom est obligatoire.");
                return;
            }
            if (!rfidProcess) {
                alert("Veuillez enregistrer le badge RFID.");
                return;
            }
            if (!mdpValid) {
                alert("Le mot de passe ne respecte pas les critères requis.");
                return;
            }
            if (!isPin) {
                alert("Le code PIN doit contenir exactement 4 chiffres.");
                return;
            }
            if (!isScreenshot) {
                alert("Veuillez prendre les 11 photos requises.");
                return;
            }

            //@ts-ignore
            window.admin.addUser(user);
        });
    }

});