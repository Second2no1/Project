// Confirm JavaScript is running
console.log("JavaScript is running!");

// Configuration for categories and locations
const categories = {};

// Generate main categories (NA to NZ)
const mainCategories = Array.from({ length: 26 }, (_, i) => `N${String.fromCharCode(65 + i)}`);

// Generate subcategories for NAA-NAZ and NBA-NBZ
const subCategories = [
  ...Array.from({ length: 26 }, (_, i) => `NA${String.fromCharCode(65 + i)}`), // NAA-NAZ
  ...Array.from({ length: 26 }, (_, i) => `NB${String.fromCharCode(65 + i)}`), // NBA-NBZ
];

// Populate locations for main categories
mainCategories.forEach(mainCategory => {
  categories[mainCategory] = [];
  categories[mainCategory].push(
    `${mainCategory} 01 A`,
    `${mainCategory} 02 A`,
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 01 B ${String(i + 1).padStart(2, "0")}`),
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 02 B ${String(i + 1).padStart(2, "0")}`),
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 01 C ${String(i + 1).padStart(2, "0")}`),
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 02 C ${String(i + 1).padStart(2, "0")}`)
  );
});

// Populate locations for subcategories, including the special case for NBZ
subCategories.forEach(subCategory => {
  categories[subCategory] = [];
  if (subCategory === "NBZ") {
    // Special case for NBZ
    for (let i = 1; i <= 16; i++) {
      const paddedNum = String(i).padStart(2, "0");

      // Add NBZ A locations
      categories["NBZ"].push(`NBZ ${paddedNum} A`);

      // Add NBZ B locations with special rules
      const maxBoxesB = [5, 8, 12, 14].includes(i) ? 9 : 15;
      categories["NBZ"].push(...Array.from(
        { length: maxBoxesB },
        (_, boxIndex) => `NBZ ${paddedNum} B ${String(boxIndex + 1).padStart(2, "0")}`
      ));

      // Add NBZ C locations with special rules
      const maxBoxesC = [5, 8, 12, 14].includes(i) ? 9 : 15;
      categories["NBZ"].push(...Array.from(
        { length: maxBoxesC },
        (_, boxIndex) => `NBZ ${paddedNum} C ${String(boxIndex + 1).padStart(2, "0")}`
      ));
    }
  } else {
    // Standard subcategory logic
    categories[subCategory].push(
      `${subCategory} 01 A`,
      `${subCategory} 02 A`,
      ...Array.from({ length: 15 }, (_, i) => `${subCategory} 01 B ${String(i + 1).padStart(2, "0")}`),
      ...Array.from({ length: 15 }, (_, i) => `${subCategory} 02 B ${String(i + 1).padStart(2, "0")}`),
      ...Array.from({ length: 15 }, (_, i) => `${subCategory} 01 C ${String(i + 1).padStart(2, "0")}`),
      ...Array.from({ length: 15 }, (_, i) => `${subCategory} 02 C ${String(i + 1).padStart(2, "0")}`)
    );
  }
});

console.log(categories); // Debugging: Log the categories object to verify structure

// Show the contents page
function showContents() {
  document.getElementById("contentsPage").classList.remove("hidden");
  document.getElementById("locationsPage").classList.add("hidden");
}

// Show the locations page for a specific category
function showCategory(category) {
  const locations = categories[category];
  const tableBody = document.getElementById("locationTable");
  const categoryTitle = document.getElementById("categoryTitle");

  tableBody.innerHTML = "";
  categoryTitle.textContent = `Locations for Category: ${category}`;

  locations.forEach(location => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${location}</td>
      <td><input type="text" data-location="${location}" onchange="logCheck(this)"></td>
      <td id="lastChecked-${location.replace(/ /g, "")}">Not yet checked</td>
      <td id="history-${location.replace(/ /g, "")}">No history</td>
    `;
    tableBody.appendChild(row);

    // Load check history for the location
    loadCheckHistory(location);
  });

  document.getElementById("contentsPage").classList.add("hidden");
  document.getElementById("locationsPage").classList.remove("hidden");
}

// Handle logging of checks
const checkHistory = {};
function logCheck(input) {
  const location = input.dataset.location;
  const officerNumber = input.value;
  const timestamp = new Date(); // Ensure this is a valid Date object
  const formattedTimestamp = timestamp.toLocaleString();

  // Initialize history for the location if it doesn't exist
  if (!checkHistory[location]) checkHistory[location] = [];
  
  // Add new check to the history
  checkHistory[location].push({ officer: officerNumber, time: formattedTimestamp });
  
  // Remove oldest entry if history exceeds 10 entries
  if (checkHistory[location].length > 10) {
    checkHistory[location].shift();
  }

  // Update Last Checked
  document.getElementById(`lastChecked-${location.replace(/ /g, "")}`).innerText =
    `Checked by ${officerNumber} on ${formattedTimestamp}`;

  // Save history to localStorage
  localStorage.setItem(`history-${location}`, JSON.stringify(checkHistory[location]));

  // Update Audit History UI
  const historyElement = document.getElementById(`history-${location.replace(/ /g, "")}`);
  historyElement.innerHTML = checkHistory[location]
    .map(entry => `${entry.time} (Officer: ${entry.officer})`)
    .join("<br>");

  input.value = ""; // Clear the input field
}

// Load check history from localStorage
function loadCheckHistory(location) {
  const history = JSON.parse(localStorage.getItem(`history-${location}`)) || [];
  checkHistory[location] = history;

  const historyElement = document.getElementById(`history-${location.replace(/ /g, "")}`);
  historyElement.innerHTML = history.map(entry => `${entry.time} (Officer: ${entry.officer})`).join("<br>");

  const lastCheck = history[history.length - 1];
  if (lastCheck) {
    document.getElementById(`lastChecked-${location.replace(/ /g, "")}`).innerText =
      `Checked by ${lastCheck.officer} on ${lastCheck.time}`;
  }
}
// Reset the form and data
function resetForm() {
  // Clear all input fields
  const inputs = document.querySelectorAll("input[type='text']");
  inputs.forEach(input => {
    input.value = "";
  });

  // Reset displayed data (Last Checked and History)
  const locationElements = document.querySelectorAll("[id^='lastChecked-'], [id^='history-']");
  locationElements.forEach(element => {
    element.innerText = element.id.startsWith("history-") ? "No history" : "Not yet checked";
  });

  // Clear all stored histories in localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("history-")) {
      localStorage.removeItem(key);
    }
  });

  // Clear in-memory history object
  Object.keys(checkHistory).forEach(location => {
    checkHistory[location] = [];
  });

  console.log("Form and data have been reset.");
}

// Password-protected reset button
function passwordProtectedReset() {
  // Prompt the user for a password
  const userPassword = prompt("Enter the password to reset everything:");

  // The predefined password
  const correctPassword = "18707";

  // Check if the entered password matches
  if (userPassword === correctPassword) {
    resetForm(); // Call the resetForm function if the password is correct
    alert("Everything has been successfully reset!");
  } else {
    alert("Incorrect password. Reset canceled.");
  }
}

// Generate category links for both main and subcategories
const categoryLinks = document.getElementById("categoryLinks");
Object.keys(categories).forEach(category => {
  const link = document.createElement("a");
  link.href = "#";
  link.textContent = category;
  link.onclick = () => showCategory(category);
  categoryLinks.appendChild(link);
});
