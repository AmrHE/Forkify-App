import { elements } from "./base";

//returns the search bar input
export const getInput = () => {
  return elements.searchInput.value;
};

//Clear the input of the old search
export const clearInput = () => {
  elements.searchInput.value = "";
};

//Highlight the selected recipe item (active recipe)
export const highlightSelected = id => {
  const resultsArray = Array.from(document.querySelectorAll('.results__link'));
  resultsArray.forEach(el => {
    el.classList.remove('results__link--active');
  });
  document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
};

/*
//Setup the title of a recipe in one line < 17 characters

//Example: 'Pizza with tuna and bacon'
acc = 0, acc + cur.length = 5 / newTitle = ['Pasta']
acc = 5, acc + cur.length = 9 / newTitle = ['Pasta', 'with']
acc = 9, acc + cur.length = 13 / newTitle = ['Pasta', 'with', 'tuna']
acc= 13, acc + cur.length = 16 / newTitle = ['Pasta', 'with', 'tuna', 'and']
acc= 16, acc + cur.length = 21 / newTitle = ['Pasta', 'with', 'tuna', 'and']
*/
export const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);
    //return the results
    return `${newTitle.join(" ")} ...`;
  } else {
    return title;
  }
};

//Display one recipe
const renderRecipe = recipe => {
  const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
  elements.SearchListItem.insertAdjacentHTML("beforeend", markup);
};

//Create the buttons
//btnType: 'prev' or 'next'
const createButtons = (page, btnType) => `

    <button class="btn-inline results__btn--${btnType}" data-goto=${btnType === "prev" ? page - 1 : page + 1}>
      <span>Page ${btnType === "prev" ? page - 1 : page + 1}</span>    
      <svg class="search__icon">
          <use href="img/icons.svg#icon-triangle-${
            btnType === "prev" ? "left" : "right"
          }"></use>
      </svg>
    </button>
`;

//Display the pagination buttons
const renderButtons = (page, numOfResults, resultsPerPage) => {
  //num of pages
  const pages = Math.ceil(numOfResults / resultsPerPage);
  let button;

  if (page === 1 && pages > 1) {
    //Only Button to go to the next page
    button = createButtons(page, "next");
  } else if (page < pages) {
    //Both Buttons
    button = `
      ${createButtons(page, "prev")}
      ${createButtons(page, "next")}
    `;
  } else if (page === pages && pages > 1) {
    //Only Button to go to the previous page
    button = createButtons(page, "prev");
  } else if (pages === 1) {
    button = "";
  }
  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};

//Display the results on the left coulumn
export const renderResults = (recipes, page = 1, resultsPerPage = 10) => {
  //Display the result of the current page
  const start = (page - 1) * resultsPerPage;
  const end = page * resultsPerPage;

  recipes.slice(start, end).forEach(renderRecipe);

  //Display the pagination buttons
  renderButtons(page, recipes.length, resultsPerPage);
};


//Clear the results of the old search
export const clearResults = () => {
  elements.SearchListItem.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};
