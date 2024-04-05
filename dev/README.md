# Facebook `<script>` problem when previewing.
As a compromise, Facebook's `<script>` tag was put into `comp/head.html`. This makes Facebook's embed won't work for preview but only when build.

Similarly, the `float-contact` only work when being built because the script is in `/comp/float-contact.html`