//The App Controller
import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/shoppingList";
import Likes from "./models/likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as ListView from "./views/ShoppingListView";
import * as LikesView from "./views/likesView";
import { elements, loaderSpinner, clearLoader } from "./views/base";

// The Global State of the App
/* 
- search object
- Current recipe object
- shopping list object
- liked recipes object
*/
const state = {};

/*
SEARCH CONTROLLER
*/
const controlSearch = async () => {
  //1.get the query from the view
  const query = searchView.getInput();

  if (query) {
    //2. new search object and add it to state object
    state.search = new Search(query);

    //3. Prepare UI for results (loading spinner + clear the old input and results)
    searchView.clearInput();
    searchView.clearResults();
    loaderSpinner(elements.resultParent);

    try{
      //4. Search for recipes
      await state.search.getResults();
  
      //5. clear the loader spinner
      clearLoader();
  
      //6. Display results on UI
      searchView.renderResults(state.search.result);
    } catch(err){
      alert('Error processing Search');
      clearLoader();
    }
  }
};

//Adding the Event handler to the search button
elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});


/*
RECIPE CONTROLLER
*/
const controlRecipe = async () => {
  //Get the ID from the URL {"window.location === url"}
  const id = window.location.hash.replace('#', '');
  if(id) {
    //1.prepare UI for changes
    recipeView.clearRecipe();
    loaderSpinner(elements.recipe);

    //Highlight selected search item
    if(state.search) searchView.highlightSelected(id);

    //2. Create new recipe object
    state.recipe = new Recipe(id);

    try{
      //3.Get recipe data and parse the ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //4.calculate servings & time
      state.recipe.calcTime();
      state.recipe.calcServings();


      //5.render the recipe
      clearLoader();
	  recipeView.renderRecipe(
		  state.recipe,
		  state.likes.isLiked(id) 
		  );
	  

    }catch(err){
      alert('Error Processing Recipe');
      console.log(err)
    }
    
  }
};

//Add 'hashchange' event listener to catch the id of the selected recipe

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/*
SHOPPING LIST CONTROLLER
*/

const controlList = () => {
  //1.Creating new List if there is none yet
  if(!state.List) state.List = new List();

  //Add each ingredient to the list and UI
  state.recipe.ingredients.forEach(el=> {
    const item = state.List.addItem(el.count, el.unit, el.ingredient);
    ListView.renderItem(item);

  });
};



/*
LIKES LIST CONTROLLER
*/
const controlLike = () => {
  if(!state.likes) state.likes = new Likes();

  const currentID = state.recipe.id;

  //User has not yet liked the recipe yet
  if(!state.likes.isLiked(currentID)){
    //1.add Like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.image
    );

	//2.Toggle the like button
	LikesView.toggleLikeButton(true);

	//3.Add like to the UI list
	LikesView.renderLikes(newLike);
    
  //User has already liked the current recipe 
  }else{

    //1.Remove Like from the state
    state.likes.deleteLike(currentID);
    
	//2.Toggle the like button
	LikesView.toggleLikeButton(false);

	//3.Remove like from the UI list
	LikesView.deleteLike(currentID);
  }

  //Toggle the likes Menu visibility
  LikesView.toggleLikeMenu(state.likes.getLikesNumber());
};



//Restore like recipes on page load
window.addEventListener('load', () => {
	state.likes = new Likes();

	//restore likes from localStorage
	state.likes.readStorage();

	//Toggle the likes 'Menu'
	LikesView.toggleLikeMenu(state.likes.getLikesNumber());

	//Render the existing like in the menu
	state.likes.likes.forEach(like => LikesView.renderLikes(like));
})




/*
EVENTS DELEGATION
*/

//Handling the shopping list buttons clicks "delete", "value changer"
elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
      //Delete from the state
      state.List.deleteItem(id);

      //Delete from the UI
      ListView.deleteItem(id);

      //Handle the count update of shopping list
    } else if(e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        state.List.updateCount(id, val);
    }
});



//Handling recipe "inc", "dec", "add to shopping list" buttons "clicks"
elements.recipe.addEventListener('click', e => {
  if(e.target.matches('.btn-dec, .btn-dec *')) {
    // "decrease" button is clicked
    if(state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
    recipeView.updateServingIngredients(state.recipe);
    }

  }else if(e.target.matches('.btn-inc, .btn-inc *')) {
    // "increase" button is clicked
   state.recipe.updateServings('inc');
    recipeView.updateServingIngredients(state.recipe);

  }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    //"Add to shopping list" button is clicked
    controlList();

  }else if(e.target.matches('.recipe__love, .recipe__love *')) {
    //"Like" button is clicked
    controlLike();
  }
});