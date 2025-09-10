let fs = require('fs');

// convert json files to jekyll with front matter
let files = fs.readdirSync('./posts');
files.forEach(file => {
    let content = fs.readFileSync(`./posts/${file}`, 'utf-8');
    let json = JSON.parse(content);
    let frontMatter = `---
layout: post
permalink: "${file.replace('.json', '')}"
title: "${json.title}"
thumbnail: "${json.thumbnail}"
author: "${json.author}"
tag: ${json.category}
---
${json.content.replaceAll('\t', '    ')}`

    let time = new Date(json.date);
    time = time.getFullYear() + '-' + (time.getMonth() + 1).toString().padStart(2, '0') + '-' + time.getDate().toString().padStart(2, '0');
    let filename =  time + '-' + file.replace('.json', '.html');
    fs.writeFileSync(`./_posts/${filename}`, frontMatter);
})
console.log('Migration complete with ' + files.length + ' files.');