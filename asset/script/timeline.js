// create arrows for the prompts
document.querySelectorAll('.time-prompt').forEach(timePrompt => {
    // create arrows for each prompt
    let arrows = document.createElement('div');
    arrows.classList.add('time-arrow');

    for (let l1 = 0; l1 < timePrompt.childElementCount; l1++) {
        let arrow = document.createElement('div');
        arrow.innerText = '▲';
        arrows.append(arrow);
    }

    timePrompt.parentNode.insertBefore(arrows, timePrompt);

});

// Assign each timeline to a time-prompt
{
    let timeline = document.querySelector('.timeline'),
        timeArrow = document.querySelector('.time-arrow'),
        timePrompt = document.querySelector('.time-prompt');

    timeline.querySelectorAll('div').forEach(button => {
        let index = Array.prototype.indexOf.call(timeline.children, button);
        button.addEventListener('click', () => {
            [...timePrompt.children].forEach(e => e.classList.remove('open'));
            timePrompt.children[index].classList.add('open');

            [...timeArrow.children].forEach(e => e.classList.remove('open'));
            timeArrow.children[index].classList.add('open');        })
    })
}