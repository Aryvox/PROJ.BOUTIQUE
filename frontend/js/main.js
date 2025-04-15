const url = 'http://localhost:3000';
const btn = document.querySelector('.btn');
const modalBtn = document.querySelector('.modal-btn');
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.close-btn');
const backdrop = document.querySelector('.backdrop');

modalBtn.addEventListener('click', () => {
    modal.classList.add('open');
    backdrop.classList.add('open');
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
});


btn.addEventListener('click', getSneakers);

function getSneakers() {
    fetch(`${url}/sneakers`)
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(err => console.log(err));
}