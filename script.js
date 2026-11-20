const wordPairForm = document.getElementById("word-pair-form");
const englishWordInput = document.getElementById("english-word");
const germanWordInput = document.getElementById("german-word");
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
}

// Removes custom validation messages when the user edits the form.
function clearValidationMessages() {
  englishWordInput.setCustomValidity("");
  germanWordInput.setCustomValidity("");
}

wordPairForm.addEventListener("submit", addWordPair);
wordPairForm.addEventListener("input", clearValidationMessages);