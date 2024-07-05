// auto-close details
document.querySelectorAll('.close-details').forEach(group => {
    let allDetails = group.querySelectorAll('details');
    allDetails.forEach(details =>
        details.querySelector('summary').onclick = () =>
            allDetails.forEach(elm => elm.removeAttribute('open'))
    )
})