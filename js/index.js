'use strict';

const apiKey = '9463ed214255043c6c96467d00c2136a';
const imgAddress = 'https://image.tmdb.org/t/p/w1280/'
const searchForm = document.querySelector('.search-form');
const mainContainer = document.querySelector('.main .container');
const query = {
	load: `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}`,
	user: null
}
const input = searchForm.querySelector('input');
const clearInput = searchForm.querySelector('.close-icon');
const modalWindow = document.querySelector('.modal-window');
const overlay = document.querySelector('.overlay');
const closeButton = modalWindow.querySelector('.close-button');
const header = document.querySelector('.header');
//main page filling
const createFilmCard = function (res) {
	let node = document.createElement('div');
	let infoWrapper = document.createElement('div');
	node.classList.add('res-item');
	let filmName = document.createElement('h3');
	let overview = document.createElement('p');
	let img = document.createElement('img');
	let rate = document.createElement('span');

	infoWrapper.classList.add('info-wrapper')
	filmName.classList.add('film-name');
	overview.classList.add('overview');
	img.classList.add('poster');
	rate.classList.add('rate');
	if (res.poster_path) {
		img.setAttribute('src', `${imgAddress}/${res.poster_path}`);
		img.setAttribute('alt', `${res.original_title}`);
	} else {
		img.setAttribute('src', `assets/img/default.jpg`);
		img.setAttribute('alt', `there is no poster for ${res.original_title}`);
	}
	if (res.vote_average >= 7) {
		rate.classList.add('high-rating');
	} else if (res.vote_average < 6) {
		rate.classList.add('low-rating');
	} else {
		rate.classList.add('medium-rating');
	}
	filmName.textContent = res.original_title;
	if (res.overview) {
		overview.textContent = res.overview;
	} else {
		overview.textContent = 'Hello there! There is no overview for this movie in our database, we are sorry for that :('
	}
	rate.textContent = res.vote_average;
	infoWrapper.append(filmName, rate)
	node.append(img, infoWrapper, overview);
	node.setAttribute('data-id', res.id)
	return node;
}

//modal window filling
const fillModal = (data) => {
	let modalData = modalWindow.querySelector('.film-details');
	let genres = modalData.querySelector('.genre');
	let title = modalData.querySelector('.film-title');
	let detailsOverview = modalData.querySelector('.details-overview');
	let releaseDate = modalData.querySelector('.release-date');
	let runtime = modalData.querySelector('.runtime');
	let rating = modalData.querySelector('.rating');
	let tagline = modalData.querySelector('.tagline');
	let image = modalWindow.querySelector('.modal-img');

	if (data.poster_path) {
		image.setAttribute('src', `${imgAddress}/${data.poster_path}`);
		image.setAttribute('alt', `${data.original_title}`);
	} else {
		image.setAttribute('src', `assets/img/default.jpg`);
		image.setAttribute('alt', `there is no poster for ${data.original_title}`);
	}

	title.textContent = data.original_title
	if (data.genres.length > 0) {
		data.genres.forEach((genre) => {
			genres.textContent = genre.name;
		})
	}
	if (data.overview) {
		detailsOverview.textContent = data.overview;
	} else {
		detailsOverview.textContent = 'Hello there! There is no overview for this movie in our database, we are sorry for that :('
	}
	releaseDate.innerHTML = `<b>Release Date: </b> ${data.release_date}`
	if (data.runtime) {
		runtime.innerHTML = `<b>Runtime: </b> ${data.runtime} min`
	} else {
		runtime.textContent = `We don't have any information for how long this film lasts :(`
	}
	rating.innerHTML = `<b>Rating IMDB: </b> ${data.vote_average}`;
	if (data.tagline) {
		tagline.innerHTML = `<b>Tagline: </b> ${data.tagline}`
	} else {
		tagline.textContent = `We did not get info about tagline for this movie`
	}
}
const closeModal = () => {
	modalWindow.classList.remove('active-modal');
	overlay.classList.remove('active-overlay');
	document.documentElement.classList.remove('overlay-is-active');
	header.style.width = `100%`
	mainContainer.style.width = `100%`
}

//main page query to DB
async function fetchFilms(query, e) {
	if (e.type === 'load') {
		const url = query.load;
		const res = await fetch(url);
		const data = await res.json();
		data.results.forEach((res) => {
			let filmCard = createFilmCard(res);
			mainContainer.append(filmCard);
		})
	} else if (e.type === 'submit') {
		const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
		const res = await fetch(url);
		const data = await res.json();
		mainContainer.innerHTML = '';
		if (data.results.length === 0) {
			mainContainer.textContent = 'We did not find any movie with this name. Maybe you will try something else? ❤️'
		}
		data.results.forEach((res) => {
			if (res.original_title.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
				let filmCard = createFilmCard(res);
				mainContainer.append(filmCard);
			} else {
				mainContainer.textContent = `We did not find any movie with this name. Maybe you will try something else? ❤️`
			}
		})
	}
}

//modal window query to DB
async function fetchDetails(movieId) {
	const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response`
	const res = await fetch(url);
	const detailedData = await res.json();
	fillModal(detailedData);
}
window.addEventListener('load', (e) => {
	fetchFilms(query, e);
})
searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	if (input.value !== '') {
		let query = e.target.firstElementChild.value.split(' ').join('+');
		fetchFilms(query, e);
	} else {
		mainContainer.textContent = 'Hello there! You did not pass any query to us. Try to search something ❤️'
	}
})
clearInput.addEventListener('click', () => {
	input.focus();
})
closeButton.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);


//modal window fire event
mainContainer.addEventListener(
	'click', (e) => {
		let coordinateY = window.scrollY + window.innerHeight / 4;
		if (e.target.parentElement.classList.contains('res-item')) {
			let movieId = e.target.parentElement.getAttribute('data-id');
			fetchDetails(movieId, modalWindow);
			modalWindow.style.top = `${coordinateY}px`;
			overlay.style.top = `${window.scrollY}px`
			overlay.classList.add('active-overlay');
			document.documentElement.classList.add('overlay-is-active');
			modalWindow.classList.add('active-modal');
		}
		header.style.width = `${window.innerWidth}px`
		mainContainer.style.width = `${window.innerWidth}px`
	}
)

console.log(`1. Вёрстка +10
2. При загрузке приложения на странице отображаются карточки фильмов с полученными от API данными +10
3. Если в поле поиска ввести слово и отправить поисковый запрос, на странице отобразятся карточки фильмов, в названиях которых есть это слово, если такие данные предоставляет API +10
4. Поиск +30
5. Очень высокое качество оформления приложения и/или дополнительный не предусмотренный в задании функционал, улучшающий качество приложения +10
    -доп. функционал: при клике на карточку видео открывается модальное окошко с дополнительной информацией
	 -качество: свой внешний вид, адаптированно под мобильные устройства`)