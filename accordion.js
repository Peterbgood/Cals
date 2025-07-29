document.addEventListener('DOMContentLoaded', () => {
  const foodAccordion = document.getElementById('foodAccordion');

  // Function to generate accordion HTML from JSON data
  function generateAccordionHTML(data) {
    return data
      .map(
        (section) => `
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${section.collapseId}" aria-expanded="false" aria-controls="${section.collapseId}">
                <i class="${section.icon} me-2"></i> ${section.category}
              </button>
            </h2>
            <div id="${section.collapseId}" class="accordion-collapse collapse" data-bs-parent="#foodAccordion">
              <div class="accordion-body">
                ${section.items
                  .map(
                    (item) => `
                      <button type="button" class="btn btn-primary add-calorie-button m-1 animate__animated animate__pulse" data-name="${item.name}" data-calories="${item.calories}" data-type="${item.type}" data-icon="${item.icon}">
                        <i class="${item.icon} me-1"></i> ${item.name} (${item.calories})
                      </button>
                    `
                  )
                  .join('')}
              </div>
            </div>
          </div>
        `
      )
      .join('');
  }

  // Fetch JSON data and populate accordion
  fetch('foodData.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      // Validate JSON structure
      if (!Array.isArray(data) || !data.every(section => 
        section.category && section.icon && section.collapseId && Array.isArray(section.items)
      )) {
        throw new Error('Invalid JSON structure');
      }

      foodAccordion.innerHTML = generateAccordionHTML(data);

      // Add event listeners to the dynamically created buttons
      document.querySelectorAll('.add-calorie-button').forEach((button) => {
        button.addEventListener('click', () => {
          const dateStr = getDateString(currentDate);
          const calories = parseInt(button.dataset.calories);
          const name = button.dataset.name;

          if (!foodLog[dateStr]) {
            foodLog[dateStr] = [];
          }

          // Note: This logic may need adjustment if items with the same name have different calories
          const existingFoodIndex = foodLog[dateStr].findIndex((entry) => entry.name === name && entry.calories === calories);
          if (existingFoodIndex !== -1) {
            foodLog[dateStr][existingFoodIndex].calories += calories;
          } else {
            foodLog[dateStr].push({ name, calories });
          }

          updateUI();
          if (isDateInCurrentWeek(currentDate)) updateWeeklyUI();
          saveData();
        });
      });
    })
    .catch((error) => {
      console.error('Error loading food data:', error);
      foodAccordion.innerHTML = '<p class="text-danger text-center">Error loading food data. Please try again later.</p>';
    });
});
