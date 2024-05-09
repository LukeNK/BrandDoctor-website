const fs = require('fs'),
    { JSDOM } = require('jsdom');

for (let post of fs.readdirSync('tin-tuc/posts')) {
    if (post.startsWith('!')) continue;

    post = 'tin-tuc/posts/' + post;

    // read data
    let data = new JSDOM(fs.readFileSync(post, 'utf-8'));
    data = data.window.document;

    data = {
        title: data.querySelector('a h2').innerHTML,
        thumbnail: data.querySelector('a img').getAttribute('src'),
        category: data.querySelector('a h4').innerHTML,
        author: 'Nguyễn Khánh Trung',
        date: Number(data.querySelector('a p').innerHTML),
        content: data.querySelector('article').innerHTML,
    }

    fs.rmSync(post);

    // fix file name
    post = post.split('.');
    post[post.length - 1] = 'json';
    post = post.join('.');

    fs.writeFileSync(
        post,
        JSON.stringify(data, undefined, '    '),
        'utf-8'
    )
}