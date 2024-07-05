/**
 * Call when a button frol the browser filter being clicked
 * @param {HTMLButtonElement} btn The button that was clicked
 */
function browserFilter(btn) {
    let cat = ''; // category, '' for all category filter
    // change the color of the button
    document.querySelectorAll('.browser-filter > button')
    .forEach((elm, l1) => {
        if (elm == btn) {
            elm.classList.add('selected');
            if (l1 != 0) cat = elm.innerHTML;
        } else
            elm.classList.remove('selected');
    });

    // if the post have the category name
    document.querySelectorAll('.browser-list > a').forEach(post => {
        if (
            post.innerHTML.toLowerCase()
            .includes(cat.toLowerCase())
        )
            post.style.display = '';
        else
            post.style.display = 'none';
    });

    // save category filter when navigate between browsers through URL query
    // document.querySelectorAll('.browser-nav > a').forEach(page => {
    //     let link = page.getAttribute('href');
    //     link += '?filter=' + cat.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    //     page.setAttribute('href', link);
    // })
}

// check window location for filter property
// {
//     let link = new URL(window.location.href);
//     for (let btn of document.querySelectorAll('.browser-filter > button'))
//         if (
//             link.searchParams.get('filter')
//             == btn.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//         ) {
//             console.log(btn.innerHTML.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
//             btn.click();
//             break
//         }
// }