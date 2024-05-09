const fs = require('fs'),
    { join } = require('path'),
    pug = require('pug'),
    { JSDOM } = require('jsdom');

// todo: consider move config to a different file
const postPerBrowser = 12,
    languageName = {
        en: 'English',
        vi: 'Tiếng Việt'
    }

module.exports = {
    onBuild: (config) => {
        console.log('Building posts')
        buildPosts('tin-tuc', config)
        // buildPosts('du-an')
    },
    /**
     * Build each individual file before translating
     * @param {String} item The item name of the building target
     * @param {Object} config The configuration data
     */
    onTranslationBuild: (item, config) => {
        console.warn('onTranslationBuild() is currently being skipped for migration')
        return
        // add lazy loading to images
        dom.querySelectorAll('img').forEach(elm => {
            // if the image does not specified loading attr before hand
            if (!elm.getAttribute('loading'))
                elm.setAttribute('loading', 'lazy')
        })

        // load translation's URL to put it into the nav bar language selection
        let navLang = dom.querySelector('#nav-lang ul');
        if (!navLang) return console.warn(`- ${item} does not have #nav-lang`)

        for (const lang of config.languages) {
            let translation = join('build', item, lang + '.json');
            if (!fs.existsSync(translation)) {
                console.warn(`- ${item} ${lang} transaltion does not exist`);
                continue
            }

            translation = fs.readFileSync(translation, 'utf-8');

            let li = dom.createElement('li');
            li.setAttribute('lang', lang);
            li.innerHTML =
                `<a href="${translation.URL || ''}">${languageName[lang]}</a>`;
            navLang.append(li);
        }
    },
    onBuildComplete: require('./test').onBuildComplete,
}

function buildPosts(folder, config) {
    let postList = [],
        template = pug.compileFile(join('..', 'layout', 'post.pug'), {basedir: '../'});

    fs.readdirSync(join('build', folder, 'posts'), 'utf-8').forEach(post => {
        if (
            post.startsWith('!')
            || !post.endsWith('.json')
        ) return; // skip template
        postList.push({
            ...JSON.parse(fs.readFileSync(
                join('build', folder, 'posts', post),
                'utf-8'
            )),
            path: `/${folder}/${post.split('.')[0]}`
        });
    })

    // reverse date sort
    postList.sort((a, b) => b.date - a.date)

    postList.forEach((data, index) => {
        data.date = new Date(data.date);
        data.date = data.date.toLocaleDateString('en-GB');

        // post read time
        data.readTime =
            Math.floor(
                data.content.length / 2000 + 1 // CPM, 1 minute is minimum
            )
            + ' phút đọc';

        // add to browser
        postList[index] = data
    });


    postList.forEach(post => {
        // save to build
        config.releaseItems.push(post.path);

        let build = join('build', post.path)

        fs.mkdirSync(build, { recursive: true })
        fs.writeFileSync(
            join(build, 'index.html'),
            template(post),
            'utf-8'
        )
        fs.writeFileSync(join(build, 'vi.json'), '{}', 'utf-8');
    });

    console.log(`- built ${postList.length} posts of ${folder}`)

    // generate browser pages
    let totalBrowserPage = Math.floor(postList.length / postPerBrowser) + 1;

    // because splice() is in place, only need to check the length
    // 1 index because the user is not a programmer
    for (let index = 1; postList.length > 0; index++) {
        let browserPath = join(folder, index.toString());

        fs.mkdirSync(join('build', browserPath));
        fs.writeFileSync(
            join('build', browserPath, 'vi.json'),
            JSON.stringify({
                // TODO: Spread translation from the main folder
                folder: folder,
                postList: postList.splice(0, postPerBrowser),
                curBrowserPage: index,
                totalBrowserPage: totalBrowserPage
            }),
            'utf-8'
        )

        // copy browser file from parent folder
        fs.copyFileSync(
            join('build', folder, 'index.pug'),
            join('build', browserPath, 'index.pug')
        )

        // add to release
        config.releaseItems.push(browserPath.replaceAll('\\', '/'))
    }

    // write the parent main page as the first page
    fs.copyFileSync(
        join('build', folder, '1', 'vi.json'),
        join('build', folder, 'vi.json')
    )

    // remove original post folder from build
    fs.rmSync(join('build', folder, 'posts'), { recursive: true })
}