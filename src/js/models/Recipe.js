import axios from "axios";
export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.image = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (error) {
      console.log(error);
      alert("Oppps! Something went wrong :(" + " " + error);
    }
  }

  calcTime() {
    //Assuming that it takes 15 mins for each 3 ingredients
    const ingredientsNum = this.ingredients.length;
    const periods = Math.ceil(ingredientsNum / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds",
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
    ];

    const units = [...unitsShort, 'kg', 'g'];

    const newIngredients = this.ingredients.map((el) => {
        //1.Uniform units
        let ingredient = el.toLowerCase();
        unitsLong.forEach((unit, i) => {
            ingredient = ingredient.replace(unit, units[i]);
        });

        //2.Remove parentheses
        ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

        //3.parse ingredients into count, unit and ingredient
        const arrIngredient = ingredient.split(" ");
        const unitIndex = arrIngredient.findIndex((el2) =>
            unitsShort.includes(el2)
        );

        let objIngredient;

        if (unitIndex > -1) {
            //There is a unit
            //EX. 4 1/2 cups, arrCount is [4, 1/2]
            //EX. 4 cups , arrCount is [4]
            const arrCount = arrIngredient.slice(0, unitIndex);
            let count;

            if(arrCount.length === 1){
                count = eval(arrIngredient[0].replace('-', '+'));
            }else{
                count = eval(arrIngredient.slice(0, unitIndex).join('+'))
            }

            objIngredient = {
                count, 
                unit: arrIngredient[unitIndex],
                ingredient: arrIngredient.slice(unitIndex + 1).join(' ')
            };

        }else if (parseInt(arrIngredient[0], 10)) {
            // There is No units but 1st element is a number
            objIngredient = {
            count: parseInt(arrIngredient[0], 10),
            unit: "",
            ingredient: arrIngredient.slice(1).join(" "),
            };

        }else if (unitIndex === -1) {
            //There is no units and no numbers in 1st positinon
            objIngredient = {
            count: 1,
            unit: "",
            ingredient,
            };
        }

        return objIngredient;
    });
    this.ingredients = newIngredients;
  }

  updateServings(type) {
    //type 'dec' or 'inc'

    //Update Servings
    const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;

    //Update ingredients
    this.ingredients.forEach(ing => {
      ing.count *= (newServings / this.servings);
    });

    this.servings = newServings;
  }
}
