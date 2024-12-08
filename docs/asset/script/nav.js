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
    document.querySelector('nav').toggleAttribute('open');
    document.getElementById('nav-menu-close').toggleAttribute('open');
    // open language by default
    document.querySelector('#nav-lang details').setAttribute('open', true);
}