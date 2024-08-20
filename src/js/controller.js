import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookMarksView from './views/bookMarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'regenerator-runtime/runtime';
import 'core-js/stable';

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

//hot module not from core JS using from parcel
// if (module.hot) {
//   module.hot.accept();
// }

// loading recipe
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    //0) update  results view to mark selected search results
    resultsView.update(model.getSearchResultsPage());
    bookMarksView.update(model.state.bookmarks);

    //1) loading recipe
    await model.loadRecipe(id);
    // const { recipe } = model.state;

    //2) rendering recipe
    recipeView.render(model.state.recipe);
    // const recipeView = new recipeView(model.state.recipe);
  } catch (err) {
    console.error(`${err} 🥲`);
    recipeView.renderError();
  }
};
// controlRecipes();

// //listen for url change
// window.addEventListener('hashchange', controlRecipes);
// //listen for load
// window.addEventListener('load', controlRecipes);

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1. get search query
    const query = searchView.getQuery();

    if (!query) return;

    //2. load search results
    await model.loadSearchResults(query);

    //3. Render results
    console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //render intial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
// controlSearchResults();

const controlPagination = function (gotoPage) {
  console.log(gotoPage);
  //1)render new results
  resultsView.render(model.getSearchResultsPage(gotoPage));

  //2)render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings(in state)
  model.updateServings(newServings);

  //update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  //1) add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookMark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);

  // console.log(model.state.recipe);

  //2) update recipe view
  recipeView.update(model.state.recipe);

  //3) Render Bookmarks
  bookMarksView.render(model.state.bookmarks);
};

const controlBookMarks = function () {
  bookMarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //show spinner
    addRecipeView.renderSpinner();

    // console.log(newRecipe);

    //upload new recipe data
    await model.uploadRecipe(newRecipe);

    // console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    //Success message
    addRecipeView.renderMessage();

    //render the bookmark view
    bookMarksView.render(model.state.bookmarks);

    //change ID in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`); //state, title, URL

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err, '🥲');
    addRecipeView.renderError(err.message);
  }
};

//---publish subscriber pattern
const init = function () {
  bookMarksView.addHandlerRender(controlBookMarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookMark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView._addHandlerUpload(controlAddRecipe);
};
init();
