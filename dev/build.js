const fs = require('fs'),
    { join } = require('path'),
    { JSDOM } = require('../Static-Wind/node_modules/jsdom');

module.exports = {
    onBuild: onBuild
}

function onBuild(config) {
    buildPosts('tin-tuc', config)
    // buildPosts('du-an')
}

function buildPosts(folder, config) {
    folder = join(folder, 'posts');

    let postList = [],
        template = new JSDOM(fs.readFileSync(
            join('../', folder, 'template.html'),
            'utf-8'
        ));

    template = template.window.document;

    fs.readdirSync(join('../', folder), 'utf-8').forEach(post => {
        if (post == 'template.html') return; // skip template

        let data = new JSDOM(fs.readFileSync(
            join('../', folder, post),
            'utf-8')
        ).window.document;

        // title
        template.querySelector('.article-title h1').innerHTML =
            data.querySelector('h1').innerHTML;

        [...template.querySelectorAll('.article-title div p')]
        .at(-1).innerHTML =
            data.body.innerHTML.replaceAll(' ', '') // remove space
            .length / 150; // read time 100 CPM

        // metadata
        template.querySelector('section > div').innerHTML =
            data.querySelector('aside').innerHTML +
            template.querySelector('section > div').innerHTML;

        // post content
        template.querySelector('section > article').innerHTML =
            data.querySelector('article').innerHTML;

        // save to build
        let build = join(folder, '../', post.split('.')[0]);

        config.releaseItems.push(build.replaceAll('\\', '/'));

        build = join('build', build)

        fs.mkdirSync(join('build', folder), { recursive: true })
        fs.writeFileSync(
            join(build, 'index.html'),
            template.documentElement.outerHTML,
            'utf-8'
        )
        fs.writeFileSync(join(build, 'vi.json'), '{}', 'utf-8');
    });

    // remove original post file
    fs.rmSync(join('build', folder), { recursive: true })
}