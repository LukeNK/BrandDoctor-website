const fs = require('fs'),
    { JSDOM } = require('jsdom');

const DOMParser = new JSDOM().window.DOMParser;

console.log('Reading and parsing')
let dom = new DOMParser().parseFromString(
    fs.readFileSync('C:/Users/luken/Downloads/iVNgB_posts.xml', 'utf-8'),
    'text/xml'
);

let posts = [...dom.querySelectorAll('table column[name="post_type"]')];

console.log('Filter post_type from ' + posts.length);
posts = posts.filter(e => e.innerHTML == 'post');

console.log('Writing posts')
for (const key in posts) {
    let table = posts[key].parentNode;
    let url = table.querySelector('column[name="post_name"]').innerHTML || `${Math.random()}`,
        title = table.querySelector('column[name="post_title"]').innerHTML,
        date = new Date(),
        content = table.querySelector('column[name="post_content"]').innerHTML;

    date.setTime(Date.parse(
        table.querySelector('column[name="post_date_gmt"]').innerHTML
    ))
    date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    content = content
        .replaceAll('&lt;', '<').replaceAll('&gt;', '>');

    let output = `<a href="/${url}">
    <img src="/asset/project/61fce.jpg">
    <h4>Category</h4>
    <h2>${title}</h2>
    <h3>Nguyễn Khánh Trung</h3>
    <p>${date}</p>
</a>

<aside>
</aside>

<article>${content}</article>`

    fs.writeFileSync(`./tin-tuc/posts/${url}.html`, output, 'utf-8');
}
