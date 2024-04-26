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
let postmeta = require('C:/Users/luken/Downloads/iVNgB_postmeta.json');
postmeta = postmeta[2].data;

let posts = [...dom.querySelectorAll('table column[name="post_type"]')];

console.log('Filter post_type from ' + posts.length);
posts = posts.filter(e => e.innerHTML == 'post');

console.log('Writing posts')
for (const key in posts) {
    let table = posts[key].parentNode;

    if (
        table.querySelector('column[name="post_status"]').innerHTML
        == 'draft'
    ) continue;

    let url = table.querySelector('column[name="post_name"]').innerHTML || `${0}`,
        title = table.querySelector('column[name="post_title"]').innerHTML,
        date = new Date(),
        content = table.querySelector('column[name="post_content"]').innerHTML;

    date.setTime(Date.parse(
        table.querySelector('column[name="post_date_gmt"]').innerHTML
    ))
    date = date.valueOf();
    if (isNaN(date)) continue; // skip faulty date

    let thumbnail = table.querySelector('column[name="ID"]').innerHTML; // post ID
    for (const row of postmeta)
        if (
            row.post_id == thumbnail
            && row.meta_key == '_thumbnail_id'
        ) {
            thumbnail = row.meta_value;
            break
        }
    for (const row of postmeta)
        if (
            row.post_id == thumbnail
            && row.meta_key == '_wp_attached_file'
        ) {
            thumbnail = row.meta_value;
            break
        }
    thumbnail = thumbnail.replaceAll('\/', '/');
    thumbnail =
        'https://events.branddoctorgroup.com/wp-content/uploads/'
        + thumbnail;

    content = content
        .replaceAll('&lt;', '<').replaceAll('&gt;', '>')
        .replaceAll('&amp;', '&');

    content = `<a>
    <img src="${thumbnail}">
    <h4></h4>
    <h2>${title}</h2>
    <h3>Nguyễn Khánh Trung</h3>
    <p>${date}</p>
</a>

<aside>
</aside>

<article>${content}</article>`;

    content = new JSDOM(content);
    let window = content.window;
    content = content.window.document;

    for (let elm of [...content.querySelectorAll('img[src]')]) {
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

            res.on('end', () => {
                if (res.statusCode > 400) console.warn(imgUrl)
            })

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

    function textNodesUnder(el) {
        let children = [], // Type: Node[]
            textNode;
        let walker = content.createNodeIterator(el, window.NodeFilter.SHOW_TEXT)
        while((textNode = walker.nextNode()))
            if (textNode.parentElement.nodeName == 'ARTICLE')
                children.push(textNode);
        return children
    }

    // clean up text nodes, require manual check
    let nodes = textNodesUnder(content.querySelector('article')),
        fixCount = 0;
    nodes.forEach(textNode => {
        if (!textNode.textContent.match(/\w+/)) return; // don't match empty space
        fixCount++
        let pNode = content.createElement('p');
        pNode.innerHTML = textNode.textContent.replaceAll('\n\n', '<br>');
        textNode.replaceWith(pNode);
    })

    if (fixCount) console.log(fixCount + ' ' + url)

    fs.writeFileSync(`./tin-tuc/posts/${url}.html`, content.body.innerHTML, 'utf-8');
}
