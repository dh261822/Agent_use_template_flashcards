const wordPairForm = document.getElementById("word-pair-form");
const englishWordInput = document.getElementById("english-word");
const germanWordInput = document.getElementById("german-word");
const emptyListMessage = document.getElementById("empty-list-message");
const wordPairList = document.getElementById("word-pair-list");
const storageErrorMessage = document.getElementById("storage-error");
const flashcard = document.getElementById("flashcard");
const nextCardButton = document.getElementById("next-card");
const markKnownButton = document.getElementById("mark-known");
const knownCountMessage = document.getElementById("known-count");
const storageKey = "vocabularyFlashcardsWordPairs";
let storageReady = true;

// Shows an error when browser storage cannot be used.
function showStorageError(message) {
  storageErrorMessage.textContent = message;
  storageErrorMessage.hidden = false;
}

// Reads saved data and reports browser storage access errors.
function readStoredData() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch (error) {
    if (!(error instanceof DOMException)) {
      throw error;
    }

    storageReady = false;
    showStorageError("Wortpaare konnten nicht aus dem Browserspeicher geladen werden.");
    return null;
  }
}

// Checks that saved data contains English and German words.
function hasValidWordPairs(pairs) {
  if (!Array.isArray(pairs)) {
    return false;
  }

  for (let index = 0; index < pairs.length; index += 1) {
    const pair = pairs[index];
    if (!pair || typeof pair.english !== "string" || typeof pair.german !== "string") {
      return false;
    }
  }

  return true;
}

// Parses saved data and reports invalid JSON or pair formats.
function parseStoredData(savedData) {
  let savedPairs;
  try {
    savedPairs = JSON.parse(savedData);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }

    storageReady = false;
    showStorageError("Gespeicherte Wortpaare sind ungültig und konnten nicht geladen werden.");
    return [];
  }

  if (!hasValidWordPairs(savedPairs)) {
    storageReady = false;
    showStorageError("Gespeicherte Wortpaare haben ein ungültiges Format.");
    return [];
  }

  return savedPairs;
}

// Saves the current word pairs in browser storage.
function saveWordPairs() {
  if (!storageReady) {
    return false;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(wordPairs));
    storageErrorMessage.hidden = true;
    return true;
  } catch (error) {
    if (!(error instanceof DOMException)) {
      throw error;
    }

    showStorageError("Wortpaare konnten nicht im Browserspeicher gespeichert werden.");
    return false;
  }
}

const storedData = readStoredData();
const wordPairs = storedData === null ? [] : parseStoredData(storedData);
const knownPairs = [];
let currentCardIndex = 0;
let answerIsVisible = false;

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

  wordPairs.push({ english: englishWord, german: germanWord });
  if (!saveWordPairs()) {
    wordPairs.pop();
    return;
  }

  wordPairForm.reset();
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

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Löschen";
    deleteButton.dataset.index = index;
    listItem.appendChild(deleteButton);
    wordPairList.appendChild(listItem);
  }

  renderPracticeCard();
}

// Shows the English word or its German translation on the card.
function renderPracticeCard() {
  nextCardButton.disabled = wordPairs.length < 2;
  markKnownButton.disabled =
    wordPairs.length === 0 || isCurrentCardMarkedKnown();

  if (wordPairs.length === 0) {
    flashcard.disabled = true;
    flashcard.textContent = "Füge zuerst ein Wortpaar hinzu.";
    return;
  }

  flashcard.disabled = false;
  const currentPair = wordPairs[currentCardIndex];
  flashcard.textContent = answerIsVisible
    ? currentPair.german
    : currentPair.english;
}

// Reveals or hides the translation when the card is clicked.
function togglePracticeCard() {
  if (wordPairs.length === 0) {
    return;
  }

  answerIsVisible = !answerIsVisible;
  renderPracticeCard();
}

// Shows a random card that is different from the current card.
function showNextCard() {
  if (wordPairs.length < 2) {
    return;
  }

  const randomIndex = Math.floor(Math.random() * (wordPairs.length - 1));
  currentCardIndex =
    randomIndex >= currentCardIndex ? randomIndex + 1 : randomIndex;
  answerIsVisible = false;
  renderPracticeCard();
}

// Checks whether the current card was already marked this session.
function isCurrentCardMarkedKnown() {
  if (wordPairs.length === 0) {
    return false;
  }

  const currentPair = wordPairs[currentCardIndex];
  for (let index = 0; index < knownPairs.length; index += 1) {
    if (knownPairs[index] === currentPair) {
      return true;
    }
  }

  return false;
}

// Marks the current card as known and updates the session count.
function markCurrentCardKnown() {
  if (wordPairs.length === 0 || isCurrentCardMarkedKnown()) {
    return;
  }

  knownPairs.push(wordPairs[currentCardIndex]);
  knownCountMessage.textContent = "I knew it: " + knownPairs.length;
  renderPracticeCard();
}

// Deletes a word pair after the user confirms the action.
function deleteWordPair(event) {
  if (event.target.tagName !== "BUTTON") {
    return;
  }

  const pairIndex = Number(event.target.dataset.index);
  if (
    !Number.isInteger(pairIndex) ||
    pairIndex < 0 ||
    pairIndex >= wordPairs.length
  ) {
    return;
  }

  const shouldDelete = window.confirm("Möchtest du dieses Wortpaar löschen?");
  if (!shouldDelete) {
    return;
  }

  const deletedPair = wordPairs[pairIndex];
  wordPairs.splice(pairIndex, 1);
  if (!saveWordPairs()) {
    wordPairs.splice(pairIndex, 0, deletedPair);
    return;
  }

  currentCardIndex = 0;
  answerIsVisible = false;
  renderWordPairs();
}

wordPairForm.addEventListener("submit", addWordPair);
wordPairForm.addEventListener("input", clearValidationMessages);
wordPairList.addEventListener("click", deleteWordPair);
flashcard.addEventListener("click", togglePracticeCard);
nextCardButton.addEventListener("click", showNextCard);
markKnownButton.addEventListener("click", markCurrentCardKnown);
renderWordPairs();