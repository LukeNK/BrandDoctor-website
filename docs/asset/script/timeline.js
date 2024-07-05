// create arrows for the prompts
let timeline = document.querySelector('.timeline'),
    timePrompt = document.querySelector('.time-prompt');

// create arrows for each prompt
{
    let arrows = document.createElement('div');
    arrows.classList.add('time-arrow');

    for (let l1 = 0; l1 < timePrompt.childElementCount; l1++) {
        let arrow = document.createElement('div');
        arrow.innerText = '▲';
        arrows.append(arrow);
    }

    timePrompt.parentNode.insertBefore(arrows, timePrompt);
}

let timeArrow = document.querySelector('.time-arrow');

// Assign each timeline to a time-prompt and add year for mobile
timeline.querySelectorAll('div').forEach(button => {
    let index = Array.prototype.indexOf.call(timeline.children, button);
    button.addEventListener('click', () => {
        [...timePrompt.children].forEach(e => e.classList.remove('open'));
        timePrompt.children[index].classList.add('open');

        [...timeArrow.children].forEach(e => e.classList.remove('open'));
        timeArrow.children[index].classList.add('open');
    })

    // copy year
    timePrompt.children[index].innerHTML =
        timeline.children[index].innerHTML
        + timePrompt.children[index].innerHTML;
});

// activate the first element
timeline.children[0].click()