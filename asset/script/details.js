// script to fill table of content <aside> using headings from <article>
(() => {
    let list = document.createElement('ol');

    document.querySelectorAll('section > article > h2').forEach(heading => {
        let li = document.createElement('li');
        li.innerText = heading.innerText;
        list.append(li);
    });

    document.querySelector('section > div > aside').append(list)
})();
