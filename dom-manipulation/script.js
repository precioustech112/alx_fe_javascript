// -------------------------
// Step 0: Initial Quotes
// -------------------------
let quotes = [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { id: 3, text: "Do one thing every day that scares you.", category: "Courage" }
];

// -------------------------
// Step 1: Select elements
// -------------------------
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const addQuoteButton = document.getElementById("addQuote");

// -------------------------
// Step 2: Local Storage
// -------------------------
const LOCAL_STORAGE_KEY = "quotes";

// Load from localStorage if exists
function loadLocalQuotes() {
  const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
  if (stored && stored.length) {
    quotes = stored;
  }
}

// Save to localStorage
function saveLocalQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// -------------------------
// Step 3: Server functions (mock server using JSONPlaceholder)
// -------------------------
const API_URL = "https://jsonplaceholder.typicode.com/posts";

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data.slice(0, 10).map(item => ({
      id: item.id,
      text: item.title,
      category: `User ${item.userId}`
    }));
  } catch (error) {
    console.error("Error fetching from server:", error);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const result = await res.json();
    console.log("Quote synced to server:", result);
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// -------------------------
// Step 4: Conflict resolution
// -------------------------
function resolveConflicts(localQuotes, serverQuotes) {
  const merged = [...serverQuotes];

  localQuotes.forEach(local => {
    const exists = serverQuotes.find(s => s.id === local.id);
    if (!exists) merged.push(local);
  });

  return merged;
}

// -------------------------
// Step 5: Sync quotes with server
// -------------------------
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const mergedQuotes = resolveConflicts(quotes, serverQuotes);
  quotes = mergedQuotes;
  saveLocalQuotes();
  notifyUser("Quotes synced with server!");
}

// -------------------------
// Step 6: Display random quote
// -------------------------
function showRandomQuote() {
  if (quotes.length === 0) return;
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>${quote.text}</strong></p>
    <p>— <em>${quote.category}</em></p>
  `;
}

// -------------------------
// Step 7: Add new quote
// -------------------------
async function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newQuoteText === "" || newQuoteCategory === "") {
    alert("Please fill in both fields!");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text: newQuoteText,
    category: newQuoteCategory
  };

  // Add locally
  quotes.push(newQuote);
  saveLocalQuotes();

  // Update UI
  showRandomQuote();

  // Post to server
  await postQuoteToServer(newQuote);

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  notifyUser("New quote added and synced!");
}

// -------------------------
// Step 8: Notifications
// -------------------------
function notifyUser(message) {
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    document.body.insertBefore(notification, document.body.firstChild);
  }
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => notification.style.display = "none", 3000);
}

// -------------------------
// Step 9: Event listeners
// -------------------------
newQuoteButton.addEventListener("click", showRandomQuote);
addQuoteButton.addEventListener("click", addQuote);

// -------------------------
// Step 10: Initialize app
// -------------------------
loadLocalQuotes();
showRandomQuote();
syncQuotes(); // initial sync
setInterval(syncQuotes, 60000); // sync every minute
