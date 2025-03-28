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
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 01 B ${String(i + 1).padStart(2, "00")}`),
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 02 B ${String(i + 1).padStart(2, "00")}`),
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 01 C ${String(i + 1).padStart(2, "00")}`),
    ...Array.from({ length: 15 }, (_, i) => `${mainCategory} 02 C ${String(i + 1).padStart(2, "00")}`)
  );
});

// Populate locations for subcategories, including the special case for NBZ
subCategories.forEach(subCategory => {
  categories[subCategory] = [];
  if (subCategory === "NBZ") {
    // Special case for NBZ
    for (let i = 1; i <= 16; i++) {
      const paddedNum = String(i).padStart(2, "00");

      // Add NBZ A locations
      categories["NBZ"].push(`NBZ ${paddedNum} A`);

      // Add NBZ B locations with special rules
      const maxBoxesB = [5, 8, 12, 14].includes(i) ? 9 : 15;
      categories["NBZ"].push(...Array.from(
        { length: maxBoxesB },
        (_, boxIndex) => `NBZ ${paddedNum} B ${String(boxIndex + 1).padStart(2, "00")}`
      ));

      // Add NBZ C locations with special rules
      const maxBoxesC = [5, 8, 12, 14].includes(i) ? 9 : 15;
      categories["NBZ"].push(...Array.from(
        { length: maxBoxesC },
        (_, boxIndex) => `NBZ ${paddedNum} C ${String(boxIndex + 1).padStart(2, "00")}`
      ));
    }
  } else {
    // Standard subcategory logic
    categories[subCategory].push(
      `${subCategory} 01 A`,
      `${subCategory} 02 A`,
      ...Array.from({ length: 15 }, (_, i) => `${subCategory} 01 B ${String(i + 1).padStart(2, "00")}`)
    );
  }
});

// Function to save form data to CSV
function saveToCSV(formData) {
  const csvData = [];
  const headers = Object.keys(formData[0]);
  csvData.push(headers.join(','));

  formData.forEach(row => {
    const values = headers.map(header => row[header]);
    csvData.push(values.join(','));
  });

  const csvContent = csvData.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'form_data.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to read CSV file
function readCSV(file, callback) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const csvData = event.target.result;
    const rows = csvData.split('\n');
    const headers = rows[0].split(',');

    const data = rows.slice(1).map(row => {
      const values = row.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});
    });

    callback(data);
  };
  reader.readAsText(file);
}

// Function to populate table from CSV file
function populateTableFromCSV(file) {
  readCSV(file, function(data) {
    const table = document.querySelector('table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    data.forEach(row => {
      const tr = document.createElement('tr');
      Object.values(row).forEach(value => {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  });
}
