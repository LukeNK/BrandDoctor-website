// script to fill table of content <aside> using headings from <article>
(() => {
    let list = document.createElement('ol');

    document.querySelectorAll('section > article > h2')
    .forEach((heading, key) => {
        heading.setAttribute('id', key)
        let li = document.createElement('li');
        li.innerHTML =
            `<a href="#${key}">${heading.innerHTML}</a>`;
        list.append(li);
    });

    document.querySelector('section > div > aside').append(list)
})();
