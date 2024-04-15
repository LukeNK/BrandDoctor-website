const fs = require('fs'),
    { join } = require('path'),
    { JSDOM } = require('../node_modules/jsdom');


module.exports = {
    onBuild: (config) => {
        buildPosts('tin-tuc', config)
        // buildPosts('du-an')

    },
    /**
     * Build each individual file before translating
     * @param {Document} dom The document tree of the building file
     * @param {String} item The item name of the building target
     * @param {Object} config The config file
     */
    onTranslationBuild: (dom, item, config) => {
        // add lazy loading to images
        dom.querySelectorAll('img').forEach(elm => {
            // if the image does not specified loading attr before hand
            if (!elm.getAttribute('loading'))
                elm.setAttribute('loading', 'lazy')
        })
    },
}

function buildPosts(folder, config) {
    folder = join(folder, 'posts');

    let postList = [],
        browser = new JSDOM(fs.readFileSync(
            join('build', folder, '../', 'index.html'),
            'utf-8'
        )),
        freshTemplate = fs.readFileSync(
            join('build', folder, 'template.html'),
            'utf-8'
        )

    browser = browser.window.document

    fs.readdirSync(join('build', folder), 'utf-8').forEach(post => {
        if (post == 'template.html') return; // skip template

        let template = new JSDOM(freshTemplate);
        template = template.window.document;

        let data = new JSDOM(fs.readFileSync(
            join('build', folder, post),
            'utf-8')
        ).window.document;

        let title = data.querySelector('a h2').innerHTML;
        template.querySelector('.article-title h1').innerHTML = title;

        let readTime =
            Math.floor(
                data.body.innerHTML.replaceAll(' ', '') // remove space
                .length / 1000 + 1 // CPM, 1 minute is minimum
            )
            + ' phút đọc';
        [...template.querySelectorAll('.article-title p')]
        .at(-1).innerHTML =
            readTime;

        let thumbnail = data.querySelector('a img').getAttribute('src');
        template.querySelector('.article-title img').setAttribute(
            'src',
            thumbnail
        )

        let writer = data.querySelector('a h3').innerHTML;
        let date = data.querySelector('a p').innerHTML

        // metadata
        template.querySelector('section > div').innerHTML =
            `<h3>${writer}</h3>`
            + data.querySelector('aside').innerHTML
            + `<p>${date}</p>`
            + template.querySelector('section > div').innerHTML;

        // post content
        template.querySelector('section > article').innerHTML =
            data.querySelector('article').innerHTML;

        // save to build
        let build = join(folder, '../', post.split('.')[0]);

        config.releaseItems.push(build.replaceAll('\\', '/'));

        build = join('build', build)

        fs.mkdirSync(build, { recursive: true })
        fs.writeFileSync(
            join(build, 'index.html'),
            template.documentElement.outerHTML,
            'utf-8'
        )
        fs.writeFileSync(join(build, 'vi.json'), '{}', 'utf-8');

        // process read time
        data.querySelector('a p').innerHTML +=
            `<span>${readTime}</span>`
        // add to browser
        browser.querySelector('.browser-list').innerHTML +=
            `<a href="${post.split('.')[0]}">`
            + data.querySelector('a').innerHTML
            + '</a>';
    });

    // write browser file
    fs.writeFileSync(
        join('build', folder, '../', 'index.html'),
        browser.documentElement.outerHTML,
        'utf-8'
    )

    // remove original post file
    fs.rmSync(join('build', folder), { recursive: true })
}