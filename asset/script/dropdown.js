// add to the end of the document
document.querySelectorAll('.dropdown-click')
.forEach(dropdown => {
    dropdown.querySelectorAll('summary')
    .forEach(sum => {
        sum.onclick = () =>
            dropdown.querySelectorAll('details')
                .forEach(elm =>elm.removeAttribute('open'))

        // add button for desktop
        let button = document.createElement('button');
        button.innerHTML = sum.innerHTML;

        button.onclick = () => {
            dropdown.querySelectorAll('button')
                .forEach(btn => btn.removeAttribute('open'));
            button.setAttribute('open', 'true');
            sum.click();
        }

        dropdown.querySelector('.desktop').append(button);
    })
})