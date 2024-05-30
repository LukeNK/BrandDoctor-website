// Find nav links to highlight
{
    let curPage = '/' + document.location.pathname.split('/')[1] + '/',
        anchors = [...document.querySelectorAll('#nav-center > a')];

    for (const link of anchors)
        if (link.getAttribute('href') == curPage) {
            link.classList.add('selected')
            break;
        }
}

// handle mobile
function toggleNav() {
    let nav = document.querySelector('nav'),
        navMenu = document.getElementById('nav-menu-close');
    nav.toggleAttribute('open');
    navMenu.toggleAttribute('open');
}