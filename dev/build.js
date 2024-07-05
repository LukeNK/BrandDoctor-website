const fs = require('fs'),
    { join } = require('path'),
    pug = require('pug');

// todo: consider move config to a different file
const postPerBrowser = 12,
    languageName = {
        en: 'English',
        vi: 'Tiếng Việt'
    }

module.exports = {
    onBuild: (config) => {
        const buildPath = config.buildPath;

        console.log('Moving CNAME')
        fs.copyFileSync(
            join('..', 'dev', 'CNAME'),
            join(buildPath, 'CNAME')
        );

        console.log('Moving index and 404 page');
        fs.copyFileSync(
            join('..', 'dev', 'index.pug'),
            join(buildPath, 'index.pug')
        );
        fs.copyFileSync(
            join('..', 'dev', '404.pug'),
            join(buildPath, '404.pug')
        );
        fs.copyFileSync(
            join('..', 'dev', 'robots.txt'),
            join(buildPath, 'robots.txt')
        );
        config.releaseItems.push('index.pug');
        config.releaseItems.push('404.pug');

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
    },
    onBuildComplete: require('./test').onBuildComplete,
}

function buildPosts(folder, config) {
    const buildPath = config.buildPath;
    let postList = [],
        template = pug.compileFile(join('..', 'layout', 'post.pug'), {basedir: '../'});

    fs.readdirSync(join(buildPath, folder, 'posts'), 'utf-8').forEach(post => {
        if (
            post.startsWith('!')
            || !post.endsWith('.json')
        ) return; // skip template
        postList.push({
            ...JSON.parse(fs.readFileSync(
                join(buildPath, folder, 'posts', post),
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

    const parentTranslation = JSON.parse(fs.readFileSync(
        join(buildPath, folder, 'vi.json'),
        'utf-8'
    ))

    postList.forEach(post => {
        // save to build
        config.releaseItems.push(post.path);

        let build = join(buildPath, post.path)

        fs.mkdirSync(build, { recursive: true })
        fs.writeFileSync(
            join(build, 'index.html'),
            template({
                lang_code: 'vi',
                ...parentTranslation,
                ...post,
                postList: postList,
                config: config
            }),
            'utf-8'
        )
    });

    console.log(`- built ${postList.length} posts of ${folder}`)

    // generate browser pages
    let totalBrowserPage = Math.floor(postList.length / postPerBrowser) + 1;
    // because splice() is in place, only need to check the length
    // 1 index because the user is not a programmer
    for (let index = 1; postList.length > 0; index++) {
        let browserPath = join(folder, index.toString());

        fs.mkdirSync(join(buildPath, browserPath));
        fs.writeFileSync(
            join(buildPath, browserPath, 'vi.json'),
            JSON.stringify({
                ...parentTranslation,
                config: config,
                folder: folder,
                postList: postList.splice(0, postPerBrowser),
                curBrowserPage: index,
                totalBrowserPage: totalBrowserPage
            }),
            'utf-8'
        )

        // copy browser file from parent folder
        fs.copyFileSync(
            join(buildPath, folder, 'index.pug'),
            join(buildPath, browserPath, 'index.pug')
        )

        // add to release
        config.releaseItems.push(browserPath.replaceAll('\\', '/'))
    }

    // write the parent main page as the first page
    fs.copyFileSync(
        join(buildPath, folder, '1', 'vi.json'),
        join(buildPath, folder, 'vi.json')
    )

    // remove original post folder from build
    fs.rmSync(join(buildPath, folder, 'posts'), { recursive: true })
}