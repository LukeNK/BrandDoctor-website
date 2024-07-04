let prev = document.createElement('button'),
    next = document.createElement('button');

prev.innerText = 'Quay lại';
next.innerText = 'Tiếp';

document.querySelectorAll('main > details').forEach((details, index) => {
    details.setAttribute('index', index);

    let nprev = prev.cloneNode(true),
        nnext = next.cloneNode(true);

    nprev.onclick = () => {
        let elm =
            document.querySelector(`details[index="${index - 1}"] > summary`);
        elm.click();
        elm.scrollIntoView(true);
    }
    nnext.onclick = () => {
        let elm =
            document.querySelector(`details[index="${index + 1}"] > summary`);
        elm.click();
        elm.scrollIntoView(true);
    }

    details.append(nprev);
    details.append(nnext);
});

