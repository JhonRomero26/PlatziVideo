const $animationContainer = document.getElementById("animation-container");
const $actionContainer = document.getElementById("action-container");
const $dramaContainer = document.getElementById("drama-container");
const $popularContainer = document.getElementById("rating-container");
const $resultsContainer = document.getElementById("results-container");
const $searchBox = document.getElementById("search-box");
const $body = document.body;
const $form = document.getElementById("form");

const $popularCarousel = $popularContainer.querySelector(".carousel-body");
const $animationCarousel = $animationContainer.querySelector(".carousel-body");
const $actionCarousel = $actionContainer.querySelector(".carousel-body");
const $dramaCarousel = $dramaContainer.querySelector(".carousel-body");
const $resultsCarousel = document.querySelector(".carousel-body");

const API = "https://yts.mx/api/v2/";

this.data = {
  movies: [],
};

function createLoading() {
  const loader = document.createElement("div");
  loader.classList.add("section-loading");

  loader.innerHTML = `
    <div class="lds-grid">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>`;

  return loader;
}

// Crea el componente HTML
function cardMovieGenerator(movie) {
  const card = document.createElement("article");
  card.classList.add("carousel-item");
  setAttributes(card, {
    onclick: `showModal(${movie.id})`,
    "data-id": `${movie.id}`,
  });

  card.innerHTML = `
    <img class="carousel-item-img" src="${movie.medium_cover_image}" alt="Poster de ${movie.title}" />
    <div class="carousel-details">
      <div class="buttons-contact">
        <a href="${movie.torrents[0].url}">
        <img src="./src/img/icons8-play-64.png" alt="Ver pelicula" srcset="">
        </a>
        <img src="./src/img/icons8-plus-64.png" alt="Agregar" srcset="">
      </div>
      <p class="carousel-item-title ellipsis">${movie.title}</p>
      <p class="carousel-item-subtitle">${movie.year} ${movie.language} ${movie.runtime} min</p>
    </div>`;

  return card;
}

function modalMovieDescriptionGenerator(movie) {
  const modal = document.createElement("div");
  modal.setAttribute("id", "modal");
  modal.innerHTML = `
    <div class="overlay"></div>
    <div class="modal">
      <div class="modal-content">
        <img src="${movie.medium_cover_image}" alt="" width="170" height="256">
        <h2>${movie.title}</h2>
        <p>${movie.synopsis}</p>
      </div>
      <div class="modal-buttons">
      <a href="${movie.torrents[0].url}" class="modal-btn warning">Descargar Torrent</a>
      <button class="modal-btn primary" onclick="hideModal()">Cerrar Modal</button>
      </div>
    </div>`;

  return modal;
}

function removeChild($container, $child) {
  const child = $container.querySelector($child);
  $container.removeChild(child);
}

function removeChildrens($container) {
  while ($container.firstChild) {
    $container.removeChild($container.firstChild);
  }
}

function setAttributes($element, attributes) {
  for (const attribute in attributes) {
    $element.setAttribute(attribute, attributes[attribute]);
  }
}

function addLoading($container) {
  const loader = createLoading();
  $container.append(loader);
}

const showModal = (id) => {
  const modal = findMovieById(id);
  modal.querySelector(".overlay").classList.add("active");
  modal.querySelector(".modal").style.animation = "modalIn .8s forwards";
  $body.appendChild(modal);
};

function hideModal() {
  const hideModalCard = document.querySelector("#modal");
  hideModalCard.querySelector(".overlay").classList.remove("active");
  hideModalCard.querySelector(".modal").style.animation =
    "modalOut .8s forwards";
  setTimeout(() => $body.removeChild(hideModalCard), 1000);
}

///////////////////////////
//      Main Script      //
//////////////////////////
const getMovies = async (search) => {
  const reponse = await fetch(`${API}list_movies.json?${search}`);
  const {
    data: { movies },
  } = await reponse.json();
  if (movies) return movies;
  throw new Error("No se econtro ningun resultado");
};

function findMovieById(id) {
  const movie = data.movies.find((movie) => movie.id === parseInt(id));
  return modalMovieDescriptionGenerator(movie);
}

function loadInDataMovies(array) {
  array.map((movie) => {
    const existMovie = data.movies.find(item => movie.id === item.id);
    if (!existMovie) data.movies.push(movie);
  });
}

// Recorre un array e imprime un componente especificado por el usuario al igual
// que su posicion
function renderArrayInComponent(array, renderConponent, $container) {
  if (array) {
    array.forEach((item) => {
      const component = renderConponent(item);
      $container
        .appendChild(component)
        .animate([{ opacity: 0 }, { opacity: 1 }], 500);
    });
  }
}

async function existInLocalstorage(type, search) {
  if (type != undefined) {
    const cacheList = localStorage.getItem(type);
    if (cacheList) return JSON.parse(cacheList);
    const data = await getMovies(search);
    localStorage.setItem(type, JSON.stringify(data));
    return data;
  }
}

const loadMovieData = async (search, $container) => {
  removeChildrens($container, 'carousel-item')
  addLoading($container);
  const regex = search.match(/.*&.*=(.*)/);
  const type = regex[1];
  try {
    const response = await existInLocalstorage(type, search);
    loadInDataMovies(response);
    renderArrayInComponent(response, cardMovieGenerator, $container);
  } catch (error) {
    $container.innerHTML += `<h3 class="section-loading">${error.message}</h3>`;
  }
  removeChild($container, ".section-loading");
};

loadMovieData("limit=50&sort_by=like_count", $popularCarousel);
loadMovieData("limit=50&genre=action", $actionCarousel);
loadMovieData("limit=50&genre=drama", $dramaCarousel);
loadMovieData("limit=50&genre=animation", $animationCarousel);

function newRecharge() {
  localStorage.clear();
  loadMovieData("limit=50&sort_by=like_count", $popularCarousel);
  loadMovieData("limit=50&genre=action", $actionCarousel);
  loadMovieData("limit=50&genre=drama", $dramaCarousel);
  loadMovieData("limit=50&genre=animation", $animationCarousel);
}

$form.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData($form);
  if ($resultsContainer.classList.contains("is-hide"))
    $resultsContainer.classList.remove("is-hide");
  removeChildrens($resultsCarousel);
  loadMovieData(`limit=50&query_term=${form.get("movie")}`, $resultsCarousel);
});
