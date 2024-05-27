document.addEventListener("DOMContentLoaded", function() {
for(const dropdown of [...document.querySelectorAll('.dropdown-click')]) {
    dropdown.onclick = () => {
        [...dropdown.querySelectorAll('details')].forEach(e => {
            e.removeAttribute('open')
        })
    }
}
})