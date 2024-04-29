const fs = require('fs'),
    { join } = require('path'),
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
        freshTemplate = fs.readFileSync(
            join('build', folder, 'posts', '!article.html'),
            'utf-8'
        )

    fs.readdirSync(join('build', folder, 'posts'), 'utf-8').forEach(post => {
        if (post.startsWith('!')) return; // skip template

        let data = new JSDOM(fs.readFileSync(
            join('build', folder, 'posts', post),
            'utf-8')
        ).window.document;

        // handle URL
        data.querySelector('a').setAttribute(
            'href',
            `/${folder}/${post.split('.')[0]}`
        )

        postList.push(data);
    })

    // sort by date
    postList.sort((a, b) =>
        // reverse date sort
        Number(b.querySelector('a p').innerHTML)
        - Number(a.querySelector('a p').innerHTML)
    )

    postList.forEach((data, index) => {
        let template = new JSDOM(freshTemplate);
        template = template.window.document;

        let title = data.querySelector('a h2').innerHTML;
        template.title = title;
        template.querySelector('.article-title h1').innerHTML = title;

        let thumbnail = data.querySelector('a img').getAttribute('src');
        template.querySelector('.article-title img').setAttribute(
            'src',
            thumbnail
        )

        let writer = data.querySelector('a h3').innerHTML;
        let date = Number(data.querySelector('a p').innerHTML);
        date = new Date(date);
        date = date.toLocaleDateString('en-GB');
        data.querySelector('a p').innerHTML = date; // set back for the browser

        // metadata
        template.querySelector('section > div').innerHTML =
            `<h3>${writer}</h3>`
            + data.querySelector('aside').innerHTML
            + `<p>${date}</p>` // dd/mm/yyyy
            + template.querySelector('section > div').innerHTML;

        // post content
        let content = template.querySelector('section > article');
        content.innerHTML =
            data.querySelector('article').innerHTML
            + content.innerHTML;

        // post read time
        let readTime =
            Math.floor(
                data.body.innerHTML.replaceAll(' ', '') // remove space
                .length / 1500 + 1 // CPM, 1 minute is minimum
            )
            + ' phút đọc';
        [...template.querySelectorAll('.article-title p')]
        .at(-1).innerHTML = readTime; // article
        data.querySelector('a p').innerHTML +=
            `<span>${readTime}</span>`; // browser

        // add to browser
        postList[index] = {
            article: template,
            browser: data.querySelector('a')
        }
    });

    postList.forEach(post => {
        // create post recomendation from random posts
        for (let l1 = 0; l1 < 3; l1++)
            post.article.querySelector('.browser-list').innerHTML +=
                postList[Math.floor(Math.random() * postList.length)]
                .browser.outerHTML;

        // save to build
        let build = join('./', post.browser.getAttribute('href'));

        config.releaseItems.push(build.replaceAll('\\', '/'));

        build = join('build', build)

        fs.mkdirSync(build, { recursive: true })
        fs.writeFileSync(
            join(build, 'index.html'),
            post.article.documentElement.outerHTML,
            'utf-8'
        )
        fs.writeFileSync(join(build, 'vi.json'), '{}', 'utf-8');
    });

    console.log(`- built ${postList.length} posts of ${folder}`)

    // save to reduce fs.readFile() call for each browser
    let freshBrowser = fs.readFileSync(
        join('build', folder, 'index.html'),
        'utf-8'
    );

    // generate the navigation then save back to the browser
    {
        freshBrowser = new JSDOM(freshBrowser);
        freshBrowser = freshBrowser.window.document;
        // get element as template
        let tempE = freshBrowser.querySelector('.browser-nav').children[0];
        freshBrowser.querySelector('.browser-nav').innerHTML = '';
        for (let l1 = 0; l1 * postPerBrowser <= postList.length; l1++) {
            // plus 1 to account for 1-index
            tempE.setAttribute('href', `../${l1 + 1}/`);
            tempE.innerHTML = l1 + 1;
            freshBrowser.querySelector('.browser-nav').innerHTML += tempE.outerHTML;
        }
        // save pure text to prevent reference to object
        freshBrowser = freshBrowser.documentElement.outerHTML;
    }

    // generate browser pages
    postList.forEach((post, index) => {
        // make postList only contains raw text
        postList[index] = post.browser.outerHTML // save browser content
    });

    let parentPage = ''; // the content of {folder}/index.html

    // because splice() is in place, only need to check the length
    // 1 index because the user is not a programmer
    for (let index = 1; postList.length > 0; index++) {
        let browser = new JSDOM(freshBrowser);
        browser = browser.window.document;

        // add the list of posts
        browser.querySelector('.browser-list').innerHTML +=
            postList.splice(0, postPerBrowser).join('');

        // highlight navigation
        browser.querySelector('.browser-nav')
        .children[index - 1].classList.add('current'); // -1 because 0-index children

        // copy first page
        if (!parentPage) parentPage = browser.documentElement.outerHTML;

        // write browser file
        let browserPath = join(folder, index.toString());
        fs.mkdirSync(join('build', browserPath));
        fs.writeFileSync(
            join('build', browserPath, 'index.html'),
            browser.documentElement.outerHTML,
            'utf-8'
        )

        // copy translation from parent folder
        fs.copyFileSync(
            join('build', folder, 'vi.json'),
            join('build', browserPath, 'vi.json')
        )

        // add to release
        config.releaseItems.push(browserPath.replaceAll('\\', '/'))
    }

    // write the parent main page as the first page
    parentPage = new JSDOM(parentPage);
    parentPage = parentPage.window.document;
    [...parentPage.querySelectorAll('.browser-nav > *')].forEach(e => {
        e.setAttribute('href', e.innerHTML); // reset relative link
    })
    fs.writeFileSync(
        join('build', folder, 'index.html'),
        parentPage.documentElement.outerHTML,
        'utf-8'
    )

    // remove original post folder from build
    fs.rmSync(join('build', folder, 'posts'), { recursive: true })
}