// script to fill table of content <aside> using headings from <article>
(() => {
    let list = document.createElement('ol'), // list in the table of content
        headings = document.querySelectorAll('section > article > h2');

    if (headings.length == 0)
        document.querySelector('section aside').style.display = 'none';

    headings.forEach((heading, key) => {
        // set heading id
        heading.setAttribute('id', key);

        // add to table of content
        let li = document.createElement('li');
        li.innerHTML =
            `<a href="#${key}">${heading.innerHTML}</a>`;
        list.append(li);
    });
    document.querySelector('section > div > aside').append(list)

    // scroll detection to highlight table of content
    document.addEventListener('scroll', () => {
        [...list.children].forEach(anchor =>
            anchor.classList.remove('current')
        )

        for (let l1 = headings.length - 1; l1 >= 0; l1--) {
            let loc = headings[l1].getBoundingClientRect();
            // because CSS was used to off set when navigate with hash (ID)
            // we need to add 1 pixel so the link actually highlight
            // when the user clicked on the side table of content
            // since the heading will travels to EXACT pixel and <= does not work
            if (loc.top - 1 < 0) {
                list.children[l1].classList.add('current');
                break
            }
        }
    })
})();