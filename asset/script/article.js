// script to fill table of content <aside> using headings from <article>
(() => {
    let list = document.createElement('ol'),
        headings = document.querySelectorAll('section > article > h2');

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
        [...list.children].forEach(anchor => anchor.classList.remove('active'))

        for (let l1 = 0; l1 < headings.length; l1--) {
            let loc = headings[l1].getBoundingClientRect();
            if (loc.top + loc.height > 0) {
                list.children[l1].classList.add('active');
                break
            }
        }
    })
})();