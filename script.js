const wordPairForm = document.getElementById("word-pair-form");
const englishWordInput = document.getElementById("english-word");
const germanWordInput = document.getElementById("german-word");
const emptyListMessage = document.getElementById("empty-list-message");
const wordPairList = document.getElementById("word-pair-list");
const wordPairs = [];

// Stores a valid word pair and clears the form.
function addWordPair(event) {
  event.preventDefault();

  const englishWord = englishWordInput.value.trim();
  const germanWord = germanWordInput.value.trim();

  if (englishWord === "" || germanWord === "") {
    englishWordInput.setCustomValidity(
      englishWord === "" ? "Bitte ein englisches Wort eingeben." : ""
    );
    germanWordInput.setCustomValidity(
      germanWord === "" ? "Bitte ein deutsches Wort eingeben." : ""
    );
    wordPairForm.reportValidity();
    return;
  }

  wordPairForm.reset();
  wordPairs.push({ english: englishWord, german: germanWord });
  renderWordPairs();
}

// Removes custom validation messages when the user edits the form.
function clearValidationMessages() {
  englishWordInput.setCustomValidity("");
  germanWordInput.setCustomValidity("");
}

// Displays every word pair currently in memory.
function renderWordPairs() {
  wordPairList.textContent = "";
  emptyListMessage.hidden = wordPairs.length > 0;

  for (let index = 0; index < wordPairs.length; index += 1) {
    const listItem = document.createElement("li");
    listItem.textContent =
      wordPairs[index].english + " — " + wordPairs[index].german;
    wordPairList.appendChild(listItem);
  }
}

wordPairForm.addEventListener("submit", addWordPair);
wordPairForm.addEventListener("input", clearValidationMessages);
renderWordPairs();