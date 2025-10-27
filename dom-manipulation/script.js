// script.js - Dynamic Quote Generator with Filtering, Web Storage, JSON, and Server Sync

let quotes = [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { id: 3, text: "Do one thing every day that scares you.", category: "Courage" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

// ---------------------------
// STORAGE FUNCTIONS
// ---------------------------

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) quotes = JSON.parse(storedQuotes);
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ---------------------------
// CATEGORY FILTERING
// ---------------------------

function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) categoryFilter.value = savedFilter;
}

function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote();
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>${quote.text}</strong></p>
    <p>— <em>${quote.category}</em></p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  localStorage.setItem("selectedCategory", selectedCategory);
}

// ---------------------------
// ADDING QUOTES
// ---------------------------

function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", function () {
    const text = quoteInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
      alert("Please fill in both fields!");
      return;
    }

    const newQuote = { id: Date.now(), text, category };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();

    quoteInput.value = "";
    categoryInput.value = "";
    alert("New quote added successfully!");
  });

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);
  document.body.appendChild(formDiv);
}

// ---------------------------
// IMPORT / EXPORT
// ---------------------------

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ---------------------------
// SERVER SYNC SIMULATION
// ---------------------------

// Simulated server endpoint (you can replace this with JSONPlaceholder if online)
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

// Fetch from "server" and merge with local data
async function syncWithServer() {
  syncStatus.textContent = "Syncing with server...";
  try {
    // Fetch sample data (simulate new quotes from server)
    const response = await fetch(serverUrl + "?_limit=5");
    const serverData = await response.json();

    // Convert server data to quote format
    const serverQuotes = serverData.map(item => ({
      id: item.id,
      text: item.title,
      category: "Server"
    }));

    // Merge: server wins on conflict
    const merged = mergeQuotes(quotes, serverQuotes);

    quotes = merged;
    saveQuotes();
    populateCategories();

    syncStatus.textContent = "✅ Sync complete — server data merged successfully.";
  } catch (error) {
    console.error(error);
    syncStatus.textContent = "❌ Sync failed. Please check your connection.";
  }
}

// Conflict resolution: server wins
function mergeQuotes(local, server) {
  const mergedMap = new Map();

  // Add local quotes first
  local.forEach(q => mergedMap.set(q.id, q));

  // Overwrite with server quotes if conflict
  server.forEach(sq => mergedMap.set(sq.id, sq));

  return Array.from(mergedMap.values());
}

// ---------------------------
// INITIALIZATION
// ---------------------------

function init() {
  loadQuotes();
  populateCategories();

  const lastViewed = sessionStorage.getItem("lastViewedQuote");
  if (lastViewed) {
    const quote = JSON.parse(lastViewed);
    quoteDisplay.innerHTML = `
      <p><strong>${quote.text}</strong></p>
      <p>— <em>${quote.category}</em></p>
    `;
  } else {
    showRandomQuote();
  }

  newQuoteButton.addEventListener("click", showRandomQuote);
  createAddQuoteForm();

  // Optional: auto-sync every 30 seconds
  setInterval(syncWithServer, 30000);
}

init();
