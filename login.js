const elForm = document.querySelector('.form');
const elInputLogin = document.querySelector('.input-login');
const elInputPassword = document.querySelector('.input-pass');

elForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const InputLoginValue = elInputLogin.value;
    const InputPassValue = elInputPassword.value;

    if (InputLoginValue && InputPassValue) {
        requestLogin(InputLoginValue, InputPassValue);
    }
});

const requestLogin = (email, password) => {
    fetch("https://reqres.in/api/login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        }),
    }).then(res => res.json()).then(data => {
        if (data?.token) {
            window.localStorage.setItem("token", data.token);
            window.location.replace('./home.htm');
        } else {
            console.error('Login failed:', data);
            alert('Login failed. Please check your USER NAME and PASSWORD.');
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('An error occurred. Please try again later.');
    });
}
