document.addEventListener('DOMContentLoaded', function () {

    const pinButton = document.querySelector('.pin-button')
    const rfidButton = document.querySelector('.rfid-button')
    const photoButton = document.querySelector('.photo-button')
    const photoIcon = document.querySelector('.photo-icon')
    const cameraFeed = document.getElementById('cameraFeed')
    const pinInput = document.querySelector('.pin-input')
    const buttons = document.querySelectorAll('.photo-button, .pin-button, .rfid-button')
    const container = document.querySelector('.button-container')
    const backButton = document.querySelector('.back-button')
    let faceCheckInterval = null
    let weatherInterval = null

    // Dans le fichier main.js, ajoute cette fonction
    function toggleTimeDisplay(show) {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            if (show) {
                timeElement.classList.remove('hidden');
            } else {
                timeElement.classList.add('hidden');
            }
        }
    }

    // Appelle cette fonction quand le mode PIN est activé
    // toggleTimeDisplay(false); // pour cacher l'heure
    // toggleTimeDisplay(true);  // pour montrer l'heure

    const keyButtons = document.querySelectorAll('.key-btn')
    const clearBtn = document.querySelector('.clear-btn')
    const enterBtn = document.querySelector('.enter-btn')

    keyButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation()
            const key = this.getAttribute('data-key')
            if (key && pinInput.value.length < 4) {
                pinInput.value += key
            }
        })
    })

    clearBtn.addEventListener('click', function (e) {
        e.stopPropagation()
        pinInput.value = ''
    })

    enterBtn.addEventListener('click', function (e) {
        e.stopPropagation()
        const pin = pinInput.value.trim()
        if (pin) {
            verificationPin(pin)
        }
    })

    function verificationPin(pin) {
        window.user.connect('pin', pin)
        /*fetch('/auth/pin', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: 'pin=' + encodeURIComponent(pin)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = "profile.php"
            } else {
                alert(data.message)
            }
        })
        .catch(err => console.error(err))*/
    }

    pinInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const pin = pinInput.value.trim()
            verificationPin(pin)
        }
    })

    rfidButton.addEventListener('click', function () {
        fetch('/auth/rfid', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.user.connect('rfid', data.id)
                } else {
                    alert(data.message)
                }
            })
            .catch(err => console.error(err))
    })

    photoButton.addEventListener('click', function () {
        fetch('/start_camera', { method: 'POST' })
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    photoIcon.style.display = 'none'
                    cameraFeed.style.display = 'block'
                    cameraFeed.src = '/video_feed'
                    startFaceChecking()
                }
            })
            .catch(e => console.error(e))
    })

    function startFaceChecking() {
        if (faceCheckInterval) return
        faceCheckInterval = setInterval(() => {
            fetch('/auth/face', { method: 'POST' })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        window.user.connect('visage', data.nom)
                    }
                })
                .catch(e => console.error(e))
        }, 2000)
    }

    function stopFaceChecking() {
        if (faceCheckInterval) {
            clearInterval(faceCheckInterval)
            faceCheckInterval = null
        }
    }

    buttons.forEach(b => {
        b.addEventListener('click', function () {
            buttons.forEach(btn => btn.classList.remove('active'))
            this.classList.add('active')
            container.classList.add('has-active')
            backButton.style.display = 'block'
            if (this.classList.contains('pin-button')) {
                toggleTimeDisplay(false)
                setTimeout(() => pinInput.focus(), 500)
            }
        })
    })

    backButton.addEventListener('click', function (e) {
        e.stopPropagation()
        fermerCamera()
        reinitialiser()
        toggleTimeDisplay(true)
    })

    function fermerCamera() {
        stopFaceChecking()
        fetch('/stop_camera', { method: 'POST' })
            .then(() => {
                cameraFeed.src = ''
                cameraFeed.style.display = 'none'
                photoIcon.style.display = 'block'
            })
            .catch(err => console.error(err))
    }

    function reinitialiser() {
        buttons.forEach(btn => btn.classList.remove('active'))
        container.classList.remove('has-active')
        pinInput.value = ''
        backButton.style.display = 'none'
    }

    document.addEventListener('click', function (e) {
        if (
            !e.target.closest('.button-container') &&
            !e.target.closest('.pin-input-container') &&
            !e.target.closest('.back-button') &&
            !e.target.closest('.virtual-keyboard')
        ) {
            fermerCamera()
            reinitialiser()
        }
    })

    function afficherMeteo() {
        const url = 'https://api.openweathermap.org/data/2.5/weather?lat=46&lon=9&appid=35d18c7aea38ce3e7e9234396e5f3c18'
        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error("Erreur réseau")
                return r.json()
            })
            .then(data => {
                const tCelsius = Math.round(data.main.temp - 273.15)
                const iconeUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
                document.querySelector('.temperature').innerHTML = `
                <div class="weather-display">
                    <img src="${iconeUrl}" alt="${data.weather[0].description}" class="weather-icon">
                    <div class="weather-info">
                        <p>${tCelsius}°C</p>
                    </div>
                </div>
            `

                const weatherCondition = data.weather[0].main;
                const backgroundVideo = document.getElementById('background-video');

                document.body.classList.remove('rainy-weather', 'cloudy-weather', 'clear-weather');

                if (weatherCondition.includes('Rain') || weatherCondition.includes('Drizzle')) {
                    backgroundVideo.src = 'videos/Rain.mp4';
                    document.body.classList.add('rainy-weather');
                } else if (weatherCondition.includes('Clear')) {
                    backgroundVideo.src = 'videos/Blue-sky.mp4';
                    document.body.classList.add('clear-weather');
                } else if (weatherCondition.includes('Clouds')) {
                    backgroundVideo.src = 'videos/Clouds.mp4';
                    document.body.classList.add('cloudy-weather');
                } else {
                    backgroundVideo.src = 'videos/Blue-sky.mp4';
                    document.body.classList.add('clear-weather');
                }

                backgroundVideo.load();
                backgroundVideo.play().catch(e => console.log('Auto-play prevented:', e));
            })
            .catch(e => {
                console.error(e)
                document.querySelector('.temperature').innerHTML = '<p>Impossible de charger la météo</p>'
            })
    }

    function majHeure() {
        const d = new Date()
        const heures = d.getHours().toString().padStart(2, '0')
        const minutes = d.getMinutes().toString().padStart(2, '0')
        const formatedHeure = `${heures}:${minutes}`
        const jour = d.getDate().toString().padStart(2, '0')
        const mois = (d.getMonth() + 1).toString().padStart(2, '0')
        const annee = d.getFullYear()
        document.querySelector('.clock').textContent = formatedHeure
        document.querySelector('.date').textContent = `${jour}.${mois}.${annee}`
    }

    function startWeatherUpdates() {
        afficherMeteo();
        weatherInterval = setInterval(afficherMeteo, 600000);
    }

    function stopWeatherUpdates() {
        if (weatherInterval) {
            clearInterval(weatherInterval);
            weatherInterval = null;
        }
    }

    majHeure()
    setInterval(majHeure, 1000)
    startWeatherUpdates()

    window.addEventListener('beforeunload', function () {
        stopFaceChecking();
        stopWeatherUpdates();
    });
})
