document.addEventListener("DOMContentLoaded", async () => {

    //@ts-ignore
    const userUn = await window.admin.collocInfo("1");
    //@ts-ignore
    const userDeux = await window.admin.collocInfo("2");

    if (!userUn || !userDeux) {
        console.error("Failed to fetch user information.");
        return;
    }

    const parsedUserUn = JSON.parse(userUn);
    const parsedUserDeux = JSON.parse(userDeux);


    document.getElementsByClassName("user-item")[0].getElementsByClassName("user-name")[0].textContent = `${JSON.parse(userUn).prenom} ${JSON.parse(userUn).nom}`;
    document.getElementsByClassName("user-item")[1].getElementsByClassName("user-name")[0].textContent = `${JSON.parse(userDeux).prenom} ${JSON.parse(userDeux).nom}`;

    document.getElementsByClassName("user-item")[0].addEventListener("click", () => {
        //@ts-ignore
        window.nav.goEditUser(JSON.parse(userUn),"1");
    });

    document.getElementsByClassName("user-item")[1].addEventListener("click", () => {
        //@ts-ignore
        window.nav.goEditUser(JSON.parse(userDeux),"2");
    });
});