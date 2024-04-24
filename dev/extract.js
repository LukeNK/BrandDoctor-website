const fs = require('fs'),
    { JSDOM } = require('jsdom'),
    https = require('https');
const { extname } = require('path');

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

    content = `<a href="/${url}">
    <img src="/asset/project/61fce.jpg">
    <h4>Category</h4>
    <h2>${title}</h2>
    <h3>Nguyễn Khánh Trung</h3>
    <p>${date}</p>
</a>

<aside>
</aside>

<article>${content}</article>`;

    content = new JSDOM(content);
    content = content.window.document;

    for (let elm of [...content.querySelectorAll('article img[src]')]) {
        // change URL to events
        let imgUrl = elm.getAttribute('src');
        imgUrl = imgUrl.split('.');
        // only migrate old database to the new one
        if (imgUrl[0] == 'https://sever') imgUrl[0] = 'https://events';
        imgUrl = imgUrl.join('.');

        const imgPath = '/tin-tuc/img/' + imgUrl.split('/').at(-1);

        elm.setAttribute('src', imgPath)

        // download image with relative path
        let img = fs.createWriteStream('.' + imgPath, {autoClose: true});
        https.get(imgUrl, res => {
            res.pipe(img);

            img.on('finish', () => {
                img.close();
            });
        }).on('error', err => {
            console.error(`Error downloading image: ${imgUrl}`);
        });
    }

    // remove classes
    content.querySelectorAll('[class]').forEach(elm => elm.removeAttribute('class'))
    content.querySelectorAll('[width]').forEach(elm => elm.removeAttribute('width'))
    content.querySelectorAll('[height]').forEach(elm => elm.removeAttribute('height'))

    // remove strong in headings
    content.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(elm => {
        if (!elm.children[0]) return;
        elm.innerHTML = elm.children[0].innerHTML;
    })

    fs.writeFileSync(`./tin-tuc/posts/${url}.html`, content.documentElement.outerHTML, 'utf-8');
}
