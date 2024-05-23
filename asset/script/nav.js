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

// handle language selection
const langToFlag = {
    // list of flag representing each language
    vi: 'vn',
    en: 'gb',
    fr: 'fr'
}

// handle the button to open pop-up menu
// first element is the button to pop-up selection
let langBtn = document.querySelector('#nav-lang *');

// open pop-up
langBtn.onclick = () => {
    langBtn.classList.toggle('open')
    langList.style.display = langList.style.display? '' : 'none';
}

// handle icon in the pop-up menu
let langList = document.querySelector('#nav-lang ul');
[...langList.children].forEach(elm => {
    let flag = langToFlag[elm.getAttribute('lang')];
    if (!flag) return; // skip no language
    // add to the anchor itself
    elm.firstChild.innerHTML =
        `<span class="fi fi-${flag}"></span>`
        + elm.innerHTML
});

// handle mobile
{
    let nav = document.querySelector('nav'),
        navMenu = document.getElementById('nav-menu-close');
    document.getElementById('nav-menu').onclick = () => {
        nav.toggleAttribute('open');
        navMenu.toggleAttribute('open');
    };

    navMenu.onclick = () => {
        nav.removeAttribute('open');
        navMenu.removeAttribute('open')
    }
}