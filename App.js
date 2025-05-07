// Constants
const API_KEY = "0417da33dca944c6ba2beee2a9b90e24";
const MEAL_IMAGES = {
  breakfast: "https://media.istockphoto.com/id/1047798504/photo/bowl-dish-with-brown-rice-cucumber-tomato-green-peas-red-cabbage-chickpea-fresh-lettuce-salad.jpg?s=612x612&w=0&k=20&c=xAXkGII7E_NJ_JH2Sz9oy307EbowN5u_UODDM1K019g=",
  lunch: "https://media.istockphoto.com/id/1136168094/photo/chicken-teriyaki-meal-prep-lunch-box-containers-with-broccoli-rice-and-carrots.jpg?s=612x612&w=0&k=20&c=WNAaGFVX-Kt3l_wrw02Gz6UEg1KOJPByQUYwecIOodc=",
  dinner: "https://media.istockphoto.com/id/168855393/photo/gourmet-salad.jpg?s=612x612&w=0&k=20&c=bnDzlcKlZYR8NZQXOXb1fbF6x3sV8LnE5pu6rQA2LpI="
};

// DOM Elements
const elements = {
  form: document.querySelector("#form"),
  height: document.querySelector("#height"),
  weight: document.querySelector("#weight"),
  age: document.querySelector("#age"),
  gender: document.querySelector("#gender"),
  activity: document.querySelector("#activity__level"),
  submitBtn: document.querySelector("#submit-btn"),
  mealsContainer: document.querySelector("#meals__container"),
  recipeContainer: document.querySelector("#recipe__container"),
  caloriesSummary: document.querySelector("#calories-summary"),
  savedMealsContainer: document.querySelector("#saved-meals"),
  errorContainer: document.querySelector("#error-container")
};

// Event Listeners
elements.form.addEventListener("submit", handleFormSubmit);
document.addEventListener("DOMContentLoaded", showWelcomeMessage);

// Display welcome message on first load
function showWelcomeMessage() {
  elements.mealsContainer.innerHTML = `
    <div class="welcome-message">
      <h2>Welcome to Your Meal Planner</h2>
      <p>Enter your details to generate a personalized daily meal plan.</p>
      <p>We'll calculate your daily calorie needs based on your height, weight, age, gender, and activity level.</p>
    </div>
  `;
  
  // Check for previously saved meal plans
  loadSavedMeals();
}

// Form validation
function validateForm() {
  let isValid = true;
  const errorMessages = [];
  
  // Clear previous errors
  clearErrors();
  
  // Height validation
  if (!elements.height.value.trim()) {
    showError(elements.height, "Height is required");
    errorMessages.push("Height is required");
    isValid = false;
  } else if (isNaN(elements.height.value.trim()) || elements.height.value <= 0) {
    showError(elements.height, "Please enter a valid height");
    errorMessages.push("Please enter a valid height in cm");
    isValid = false;
  }
  
  // Weight validation
  if (!elements.weight.value.trim()) {
    showError(elements.weight, "Weight is required");
    errorMessages.push("Weight is required");
    isValid = false;
  } else if (isNaN(elements.weight.value.trim()) || elements.weight.value <= 0) {
    showError(elements.weight, "Please enter a valid weight");
    errorMessages.push("Please enter a valid weight in kg");
    isValid = false;
  }
  
  // Age validation
  if (!elements.age.value.trim()) {
    showError(elements.age, "Age is required");
    errorMessages.push("Age is required");
    isValid = false;
  } else if (isNaN(elements.age.value.trim()) || elements.age.value <= 0 || elements.age.value > 120) {
    showError(elements.age, "Please enter a valid age (1-120)");
    errorMessages.push("Please enter a valid age (1-120)");
    isValid = false;
  }
  
  // Gender validation
  if (!elements.gender.value) {
    showError(elements.gender, "Please select a gender");
    errorMessages.push("Please select a gender");
    isValid = false;
  }
  
  // Activity level validation
  if (!elements.activity.value) {
    showError(elements.activity, "Please select an activity level");
    errorMessages.push("Please select an activity level");
    isValid = false;
  }

  // Display errors if any
  if (errorMessages.length > 0) {
    displayErrorSummary(errorMessages);
  }
  
  return isValid;
}

// Show error for a specific field
function showError(element, message) {
  // Remove any existing error for this element
  const existingError = element.nextElementSibling;
  if (existingError && existingError.classList.contains('validation-error')) {
    existingError.remove();
  }
  
  // Create and append new error message
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('validation-error');
  errorDiv.textContent = message;
  
  // Insert after the element
  element.parentNode.insertBefore(errorDiv, element.nextSibling);
  
  // Highlight the input
  element.classList.add('error-input');
}

// Clear all error messages
function clearErrors() {
  // Clear field-specific errors
  document.querySelectorAll('.validation-error').forEach(error => error.remove());
  document.querySelectorAll('.error-input').forEach(input => input.classList.remove('error-input'));
  
  // Clear summary errors
  if (elements.errorContainer) {
    elements.errorContainer.innerHTML = '';
    elements.errorContainer.classList.add('hidden');
  }
}

// Display summary of errors
function displayErrorSummary(messages) {
  if (!elements.errorContainer) return;
  
  elements.errorContainer.innerHTML = `
    <div class="error-summary">
      <h3>Please fix the following errors:</h3>
      <ul>
        ${messages.map(msg => `<li>${msg}</li>`).join('')}
      </ul>
    </div>
  `;
  elements.errorContainer.classList.remove('hidden');
}

// Form submission handler
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Show loading state
  elements.submitBtn.disabled = true;
  elements.submitBtn.innerHTML = '<span class="spinner"></span> Generating...';
  elements.mealsContainer.innerHTML = `<div class="loader"></div>`;
  elements.recipeContainer.innerHTML = '';
  
  try {
    // Calculate BMR and daily calories
    const { height, weight, age, gender, activity } = getFormValues();
    const bmr = calculateBMR(gender, height, weight, age);
    const dailyCalories = Math.round(bmr * activity);
    
    // Fetch meal plan from API
    const mealData = await fetchMealPlan(dailyCalories);
    
    // Display nutrition summary
    displayNutritionSummary(mealData.nutrients);
    
    // Generate meal cards
    generateMealCards(mealData);
    
    // Reset form
    resetForm();
    
  } catch (error) {
    console.error('Error:', error);
    elements.mealsContainer.innerHTML = `
      <div class="error-message">
        <h3>Oops! Something went wrong</h3>
        <p>${error.message || 'Failed to generate meal plan. Please try again.'}</p>
      </div>
    `;
  } finally {
    // Reset button state
    elements.submitBtn.disabled = false;
    elements.submitBtn.innerHTML = 'Generate Meals';
  }
}

// Get form values
function getFormValues() {
  return {
    height: parseFloat(elements.height.value.trim()),
    weight: parseFloat(elements.weight.value.trim()),
    age: parseFloat(elements.age.value.trim()),
    gender: elements.gender.value,
    activity: parseFloat(elements.activity.value)
  };
}

// Reset form fields
function resetForm() {
  elements.height.value = '';
  elements.weight.value = '';
  elements.age.value = '';
}

// Calculate BMR (Basal Metabolic Rate)
function calculateBMR(gender, height, weight, age) {
  switch (gender) {
    case "male":
      return 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
    case "female":
      return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
    default:
      throw new Error("Please select a valid gender");
  }
}

// Fetch meal plan from API
async function fetchMealPlan(targetCalories) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/mealplanner/generate?apiKey=${API_KEY}&timeFrame=day&targetCalories=${targetCalories}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch meal plan. Please try again later.");
  }
}

// Display nutrition summary
function displayNutritionSummary(nutrients) {
  if (!elements.caloriesSummary) return;
  
  elements.caloriesSummary.innerHTML = `
    <h3>Daily Nutrition Summary</h3>
    <div class="nutrient-grid">
      <div class="nutrient-item">
        <span class="nutrient-value">${Math.round(nutrients.calories)}</span>
        <span class="nutrient-label">Calories</span>
      </div>
      <div class="nutrient-item">
        <span class="nutrient-value">${Math.round(nutrients.protein)}g</span>
        <span class="nutrient-label">Protein</span>
      </div>
      <div class="nutrient-item">
        <span class="nutrient-value">${Math.round(nutrients.fat)}g</span>
        <span class="nutrient-label">Fat</span>
      </div>
      <div class="nutrient-item">
        <span class="nutrient-value">${Math.round(nutrients.carbohydrates)}g</span>
        <span class="nutrient-label">Carbs</span>
      </div>
    </div>
  `;
  
  // Show the nutrition summary
  elements.caloriesSummary.classList.remove('hidden');
}

// Generate meal cards
function generateMealCards(mealData) {
  const { nutrients, meals } = mealData;
  elements.mealsContainer.innerHTML = '';
  
  // Associate each meal with a meal type
  const mealTypes = ["breakfast", "lunch", "dinner"];
  
  meals.forEach((meal, index) => {
    const mealType = mealTypes[index];
    const mealCard = createMealCard(meal, mealType, nutrients.calories);
    elements.mealsContainer.appendChild(mealCard);
  });
  
  // Save meal plan to localStorage
  saveMealPlan(mealData);
}

// Create a meal card DOM element
function createMealCard(meal, mealType, totalCalories) {
  const card = document.createElement('section');
  card.className = 'card';
  card.innerHTML = `
    <span class="header">${mealType}</span>
    <img src="${MEAL_IMAGES[mealType]}" alt="${meal.title}">
    <div class="card__action">
      <h2>${meal.title}</h2>
      <span>Ready in ${meal.readyInMinutes} mins</span>
      <span>Calories: ~${Math.round(totalCalories / 3)}</span>
      <div class="card-buttons">
        <button class="recipe-btn" onclick="getRecipe(${meal.id})">Get Recipe</button>
        <button class="save-btn" onclick="saveMealToFavorites(${meal.id}, '${mealType}', '${encodeURIComponent(meal.title)}')">
          <i class="fas fa-heart"></i>
        </button>
      </div>
    </div>
  `;
  return card;
}

// Get recipe details
async function getRecipe(id) {
  // Show loading state
  elements.recipeContainer.innerHTML = `<div class="loader"></div>`;
  elements.recipeContainer.scrollIntoView({ behavior: "smooth" });
  
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&includeNutrition=false`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const recipe = await response.json();
    displayRecipe(recipe);
    
  } catch (error) {
    console.error("Recipe API Error:", error);
    elements.recipeContainer.innerHTML = `
      <div class="error-message">
        <h3>Failed to load recipe</h3>
        <p>Please try again later</p>
      </div>
    `;
  }
}

// Display recipe information
function displayRecipe(recipe) {
  // Create ingredients table
  const tableRows = recipe.extendedIngredients.map(ingredient => {
    return `
      <tr>
        <td>${ingredient.name}</td>
        <td>${ingredient.original}</td>
        <td>${ingredient.measures.metric.amount}${ingredient.measures.metric.unitShort || ingredient.unit}</td>
      </tr>
    `;
  }).join('');
  
  // Create instructions section
  let instructionsHtml = '';
  if (recipe.instructions) {
    instructionsHtml = `
      <div class="recipe-instructions">
        <h3>Instructions</h3>
        <ol>
          ${recipe.analyzedInstructions[0]?.steps.map(step => 
            `<li>${step.step}</li>`
          ).join('') || `<li>${recipe.instructions}</li>`}
        </ol>
      </div>
    `;
  }
  
  // Display full recipe
  elements.recipeContainer.innerHTML = `
    <div class="recipe-container">
      <h2 class="recipe-title">${recipe.title}</h2>
      <img class="recipe-image" src="${recipe.image}" alt="${recipe.title}">
      
      <div class="recipe-info">
        <span><i class="fas fa-clock"></i> Ready in ${recipe.readyInMinutes} minutes</span>
        <span><i class="fas fa-utensils"></i> Serves ${recipe.servings}</span>
        ${recipe.vegetarian ? '<span class="tag vegetarian">Vegetarian</span>' : ''}
        ${recipe.vegan ? '<span class="tag vegan">Vegan</span>' : ''}
        ${recipe.glutenFree ? '<span class="tag gluten-free">Gluten Free</span>' : ''}
        ${recipe.dairyFree ? '<span class="tag dairy-free">Dairy Free</span>' : ''}
      </div>
      
      <h3>Ingredients</h3>
      <table class="recipie_table">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      ${instructionsHtml}
      
      <button class="print-btn" onclick="window.print()">
        <i class="fas fa-print"></i> Print Recipe
      </button>
    </div>
  `;
}

// Save meal plan to localStorage
function saveMealPlan(mealData) {
  try {
    const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
    
    // Add date to the plan
    const planWithDate = {
      ...mealData,
      date: new Date().toISOString(),
      id: Date.now()
    };
    
    // Keep only 5 most recent plans
    if (savedPlans.length >= 5) {
      savedPlans.shift(); // Remove oldest plan
    }
    
    savedPlans.push(planWithDate);
    localStorage.setItem('mealPlans', JSON.stringify(savedPlans));
    
  } catch (error) {
    console.error('Error saving meal plan:', error);
  }
}

// Load saved meal plans
function loadSavedMeals() {
  if (!elements.savedMealsContainer) return;
  
  try {
    const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
    
    if (savedPlans.length === 0) {
      elements.savedMealsContainer.innerHTML = `
        <p>No saved meal plans yet. Generate your first plan!</p>
      `;
      return;
    }
    
    // Display the most recent plan
    const latestPlan = savedPlans[savedPlans.length - 1];
    const date = new Date(latestPlan.date).toLocaleDateString();
    
    elements.savedMealsContainer.innerHTML = `
      <h3>Previously Generated Plan (${date})</h3>
      <div class="saved-meals-grid">
        ${latestPlan.meals.map((meal, index) => `
          <div class="saved-meal">
            <h4>${meal.title}</h4>
            <button onclick="getRecipe(${meal.id})">View Recipe</button>
          </div>
        `).join('')}
      </div>
      <button class="load-plan-btn" onclick="loadMealPlan(${latestPlan.id})">
        Load This Plan
      </button>
    `;
    
  } catch (error) {
    console.error('Error loading saved meals:', error);
  }
}

// Load a specific saved meal plan
function loadMealPlan(planId) {
  try {
    const savedPlans = JSON.parse(localStorage.getItem('mealPlans') || '[]');
    const plan = savedPlans.find(p => p.id === planId);
    
    if (plan) {
      // Display nutrition summary
      displayNutritionSummary(plan.nutrients);
      
      // Generate meal cards
      generateMealCards(plan);
      
      // Scroll to meals
      elements.mealsContainer.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error loading meal plan:', error);
  }
}

// Save a meal to favorites
function saveMealToFavorites(id, type, title) {
  try {
    title = decodeURIComponent(title);
    const favorites = JSON.parse(localStorage.getItem('favoriteMeals') || '[]');
    
    // Check if meal already exists in favorites
    if (!favorites.some(meal => meal.id === id)) {
      favorites.push({ id, type, title });
      localStorage.setItem('favoriteMeals', JSON.stringify(favorites));
      showNotification('Meal added to favorites!');
    } else {
      showNotification('Meal already in favorites!');
    }
  } catch (error) {
    console.error('Error saving to favorites:', error);
  }
}

// Show a temporary notification
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Helper function to create DOM elements from HTML string
function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

// Make functions available globally
window.getRecipe = getRecipe;
window.loadMealPlan = loadMealPlan;
window.saveMealToFavorites = saveMealToFavorites;