# Meal Planner - Personalized Daily Meal Generator

A web-based meal planning application that creates personalized daily meal plans based on your physical characteristics and activity level.

## Features

- Personalized meal recommendations based on:
  - Height
  - Weight
  - Age
  - Gender
  - Activity Level
- BMR (Basal Metabolic Rate) calculation using Harris-Benedict equation
- Daily calorie needs calculation
- Three meals per day (Breakfast, Lunch, Dinner)
- Detailed recipe view for each meal
- Save favorite meals functionality
- Nutrition summary for daily meal plan
- Responsive design for all devices

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla)
- Spoonacular API for meal data
- Font Awesome for icons

## Setup Instructions

1. Clone the repository
2. Get an API key from [Spoonacular API](https://spoonacular.com/food-api)
3. Create a configuration file for your API key
4. Open `index.html` in your browser

## How to Use

1. Fill in your details in the form:
   - Enter height (in cm)
   - Enter weight (in kg)
   - Enter age (in years)
   - Select gender
   - Choose activity level
2. Click "Generate Meals" to get your personalized meal plan
3. View meal details by clicking "Get Recipe"
4. Save your favorite meals for future reference

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - Stylesheet for the application
- `App.js` - Core JavaScript functionality

## API Integration

This project uses the Spoonacular API to fetch meal and recipe data. The API provides:
- Meal recommendations
- Nutritional information
- Detailed recipes
- Cooking instructions

## License

Open source project - Feel free to use and modify as needed.