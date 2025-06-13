document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
        fetch('http://localhost:5000')
            .then(response => {
                if (response.ok) {
                    //@ts-ignore
                    window.api.loadConnection();
                } else {
                    console.error('Failed to load the page:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error fetching status:', error);
            });
    }
        , 5000);
});