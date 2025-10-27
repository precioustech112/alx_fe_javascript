let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do one thing every day that scares you.", category: "Courage" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p><strong>${quote.text}</strong></p>
    <p>— <em>${quote.category}</em></p>
  `;
}

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

    if (text === "" || category === "") {
      alert("Please fill in both fields!");
      return;
    }

    // ✅ Add new quote
    quotes.push({ text, category });

    // ✅ Update DOM
    quoteDisplay.innerHTML = `
      <p><strong>${text}</strong></p>
      <p>— <em>${category}</em></p>
    `;

    quoteInput.value = "";
    categoryInput.value = "";

    alert("New quote added!");
  });

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);
  document.body.appendChild(formDiv);
}

// ✅ Event listener for "Show New Quote"
newQuoteButton.addEventListener("click", showRandomQuote);

// Initialize
showRandomQuote();
createAddQuoteForm();
