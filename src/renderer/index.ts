const submitUser : HTMLElement | null = document.getElementById('user');
const submitPass : HTMLElement | null = document.getElementById('password');
const submitBtn : HTMLElement | null = document.getElementById('submit');
const userExist : HTMLElement | null = document.getElementById('userExist');


if(submitUser && submitPass && submitBtn) {
    submitBtn.addEventListener('click', () => {
        const user : string = (submitUser as HTMLInputElement).value;
        const pass : string = (submitPass as HTMLInputElement).value;
        
        // @ts-expect-error
        window.connection.connection(user, pass).then((value : boolean) => {
            console.log("test");
            (userExist as HTMLElement).innerText = String(value);
        });
    });
};

