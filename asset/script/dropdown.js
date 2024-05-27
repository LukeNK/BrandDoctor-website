// add to the end of the document
document.querySelectorAll('.dropdown-click')
.forEach(dropdown => {
    dropdown.querySelectorAll('summary')
    .forEach(sum =>
        sum.onclick = () =>
            dropdown.querySelectorAll('details')
            .forEach(det =>
                det.removeAttribute('open')
            )
    )
})