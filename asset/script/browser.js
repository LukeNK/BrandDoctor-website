// TODO: find out why this did not work
// somehow the click event wasn't assigned to the element despite added event
// document.querySelectorAll('.browser-filter > button').forEach((elm, key) => {
//     elm.addEventListener('click', () => {
//         projectFilter(key)
//     });
// });


function browserFilter(key) {
    // change the color of the button
    document.querySelectorAll('.browser-filter > button')
    .forEach((elm, l1) => {
        if (key == l1) elm.classList.add('selected');
        else elm.classList.remove('selected');
    });
}