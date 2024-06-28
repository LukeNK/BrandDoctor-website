// create arrows for the prompts
document.querySelectorAll('.time-prompt').forEach(timePrompt => {
    // create arrows for each prompt
    let arrows = document.createElement('div');
    arrows.classList.add('time-arrow')

    for (let l1 = 0; l1 < timePrompt.childElementCount; l1++) {
        let arrow = document.createElement('div');
        arrow.innerText = '▲';
        arrows.append(arrow);
    }

    timePrompt.parentNode.insertBefore(arrows, timePrompt);

    // asign close functions
});

