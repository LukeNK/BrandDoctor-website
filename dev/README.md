# Facebook `<script>` problem when previewing.
As a compromise, Facebook's `<script>` tag was put into `comp/head.html`. This makes Facebook's embed won't work for preview but only when build.

Similarly, the `float-contact` only work when being built because the script is in `/comp/float-contact.html`

# `dev/build.js`
This script contains all of the functions that will run when the website being built by Static Wind.

# Things to check before release
- Site map
- Components (a good indication is usually the nav bar)
- `/news` browser
    - Posts content
    - Posts detail
- Footer
    - Quick links
    - Facebook embed