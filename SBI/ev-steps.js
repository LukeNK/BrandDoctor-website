let evSteps = document.getElementById("ev-steps");
[...evSteps.querySelectorAll('h2')]
.forEach((head, index) => {
    head.onclick = () => {
        [...evSteps.querySelectorAll('h2')].forEach(e => e.classList.remove('select'));
        head.classList.add('select');

        [...evSteps.querySelectorAll('p')]
            .forEach(e => e.classList.remove('appear'));
        evSteps.querySelectorAll('.bottom *').item(index)
            .classList.add('appear');
    }
})

let currentHead = 0;
evSteps.querySelector('h2').click();