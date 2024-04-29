# Facebook `<script>` problem when previewing.
As a compromise, Facebook's `<script>` tag was put into `comp/head.html`. This makes Facebook's embed won't work for preview but only when build.

Similarly, the `float-contact` only work when being built because the script is in `/comp/float-contact.html`

# `dev/build.js`
This script contains all of the functions that will run when the website being built by Static Wind. Things that this script do
- Compose posts and post browsers
- Set images without `loading` attribute to lazy load (therefore you need to specify `loading="eager"` if needed)

# Things to check before release
- Site map
- Components (a good indication is usually the nav bar)
- `/news` browser
    - Posts content
    - Posts detail
- Footer
    - Quick links
    - Facebook embed

# Setting up features
## Posts (control by `dev/build.js:buildPosts()`)
This will use `/asset/style/article.css` and `/asset/script/article.js` to set up the general layout and styling, while the build script will use the same CSS class name to build.
1. Create a folder, add that folder to `Static-Wind/config.json`. Create an `index.html` file, which will be used as an template to build posts browser.
1. In that folder, create a `posts` folder to store posts
1. Create an `!article.html` to set up how a post will look like.
1. Follow the layout specified in `tin-tuc/!template.html` for each post in the `posts` folder. The name of the file (excluding `.html`) will be the URL of the post in the specified folder.