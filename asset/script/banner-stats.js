// THIS SCRIPT DOES NOT WORK WITH PREVIEW.JS
// BECAUSE THE BANNER-STATS COMP LOADS MUCH LATER

// Init stat animation
const stats = {};
let statsAnimationTrigger = false; // if the has been triggered
document.querySelectorAll('#banner-stats > .banner h2').forEach(elm => {
    // save stat numbers
    stats[elm.id] = {
        num: Number(elm.innerHTML),
        elm: elm,
        inc: 0, // increment
    }
    elm.innerHTML = 0;
});
document.addEventListener('scroll', () => {
    // get surrounding div of the stats
    const rect =
        document.querySelector('#banner-stats > .banner')
        .getBoundingClientRect();

    // run animation if in viewport
    if (
        statsAnimationTrigger
        || rect.top > (window.innerHeight || document.documentElement.clientHeight)
    ) return
    statsAnimationTrigger = true;
    for (const id in stats) {
        stats[id].interval = setInterval(() => {
            let cur = Number(document.getElementById(id).innerHTML);
            stats[id].inc = ~~((stats[id].num - cur) / 50) + 1;
            // remove interval at number
            if (cur >= stats[id].num)
                clearInterval(stats[id].interval);
            else
                document.getElementById(id).innerHTML = cur + stats[id].inc;
        }, 1000 / 60); // 60fps
    }
});