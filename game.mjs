import { print, askQuestion } from "./io.mjs";
import { debug, DEBUG_LEVELS } from "./debug.mjs";
import { ANSI } from "./ansi.mjs";
import DICTIONARY from "./language.mjs";
import showSplashScreen from "./splash.mjs";

const GAME_BOARD_SIZE = 3;
const PLAYER_1 = 1;
const PLAYER_2 = -1;

const MENU_CHOICES = {
  MENU_CHOICE_START_GAME: 1,
  MENU_CHOICE_SHOW_SETTINGS: 2,
  MENU_CHOICE_EXIT_GAME: 3,
};

const NO_CHOICE = -1;

let language = DICTIONARY.en;
let gameboard;
let currentPlayer;
let pve = false;

clearScreen();
showSplashScreen();
setTimeout(start, 2500);

//#region game functions -----------------------------

async function start() {
  do {
    let chosenAction = NO_CHOICE;
    chosenAction = await showMenu();

    if (chosenAction == MENU_CHOICES.MENU_CHOICE_START_GAME) {
      await runGame();
    } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_SHOW_SETTINGS) {
      await settings();
    } else if (chosenAction == MENU_CHOICES.MENU_CHOICE_EXIT_GAME) {
      clearScreen();
      process.exit();
    }
  } while (true);
}

async function runGame() {
  let isPlaying = true;

  while (isPlaying) {
    initializeGame();
    isPlaying = await playGame();
  }
}

async function showMenu() {
  let choice = -1;
  let validChoice = false;

  while (!validChoice) {
    clearScreen();
    print(ANSI.COLOR.YELLOW + language.MENU + ANSI.RESET);
    print(language.PLAY_GAME);
    print(language.SETTINGS);
    print(language.EXIT_GAME);

    choice = await askQuestion("");

    if (
      [
        MENU_CHOICES.MENU_CHOICE_START_GAME,
        MENU_CHOICES.MENU_CHOICE_SHOW_SETTINGS,
        MENU_CHOICES.MENU_CHOICE_EXIT_GAME,
      ].includes(Number(choice))
    ) {
      validChoice = true;
    }
  }

  return choice;
}

async function settings() {
  print(language.SWAP_LANGUAGE);
  print(language.SWAP_MODE);
  let answer = await askQuestion("");
  let swapLanguage = 1;
  let swapMode = 2;

  if (answer == swapLanguage) {
    language = language == DICTIONARY.en ? DICTIONARY.no : DICTIONARY.en;
  }
  if (answer == swapMode) {
    pve = pve == false ? true : false;
  }
  if (answer != swapLanguage && answer != swapMode) {
    showMenu();
  }
}

async function playGame() {
  let outcome;
  do {
    clearScreen();
    showGameBoardWithCurrentState();
    showHUD();
    let move = await getGameMoveFromCurrentPlayer();
    updateGameBoardState(move);
    outcome = evaluateGameState();
    changeCurrentPlayer();
  } while (outcome == 0);

  showGameSummary(outcome);

  return await askWantToPlayAgain();
}

async function askWantToPlayAgain() {
  let answer = await askQuestion(language.PLAY_AGAIN_QUESTION);
  let playAgain = true;
  if (answer && answer.toLowerCase()[0] != language.CONFIRM) {
    playAgain = false;
  }
  return playAgain;
}

function showGameSummary(outcome) {
  clearScreen();
  if (outcome == -10) {
    print(language.TIE);
  } else {
    let winningPlayer = outcome > 0 ? 1 : 2;
    print(language.WINNER + winningPlayer);
  }
  showGameBoardWithCurrentState();
  print(language.GAME_OVER);
}

function changeCurrentPlayer() {
  currentPlayer *= -1;
}

function evaluateGameState() {
  const WIN_REQUIREMENT = 3;
  const TIE_REQUIREMENT = -10;
  const EMPTY_POSITION = 0;
  let sum = 0;
  let state = 0;

  for (let row = 0; row < GAME_BOARD_SIZE; row++) {
    for (let col = 0; col < GAME_BOARD_SIZE; col++) {
      sum += gameboard[row][col];
    }

    if (Math.abs(sum) == WIN_REQUIREMENT) {
      state = sum;
    }
    sum = 0;
  }

  for (let col = 0; col < GAME_BOARD_SIZE; col++) {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
      sum += gameboard[row][col];
    }

    if (Math.abs(sum) == WIN_REQUIREMENT) {
      state = sum;
    }

    sum = 0;
  }

  for (let diag = 0; diag < GAME_BOARD_SIZE; diag++) {
    sum += gameboard[diag][diag];
  }

  if (Math.abs(sum) == WIN_REQUIREMENT) {
    state = sum;
  }
  sum = 0;

  for (let diag = 0; diag < GAME_BOARD_SIZE; diag++) {
    sum += gameboard[diag][2 - diag];
  }

  if (Math.abs(sum) == WIN_REQUIREMENT) {
    state = sum;
  }
  sum = 0;

  let winner = state / WIN_REQUIREMENT;

  let tie = true;
  for (let col = 0; col < GAME_BOARD_SIZE; col++) {
    for (let row = 0; row < GAME_BOARD_SIZE; row++) {
      if (gameboard[col][row] == EMPTY_POSITION) {
        tie = false;
      }
    }
  }
  if (tie) {
    return TIE_REQUIREMENT;
  }

  return winner;
}

function updateGameBoardState(move) {
  const ROW_ID = 0;
  const COLUMN_ID = 1;
  gameboard[move[ROW_ID]][move[COLUMN_ID]] = currentPlayer;
}

async function getGameMoveFromCurrentPlayer() {
  if (currentPlayer == PLAYER_2 && pve) {
    return generateBotMove();
  }
  let positions = null;
  do {
    let rawInput = await askQuestion(language.PLACE_YOUR_MARK);
    positions = rawInput.split(" ");
    positions[0] = positions[0] - 1;
    positions[1] = positions[1] - 1;
  } while (isValidPositionOnBoard(positions) == false);
  return positions;
}

function generateBotMove() {
  let max = 2;
  let column = 0;
  let row = 0;
  let generatedPosition = "";
  do {
    column = Math.floor(Math.random() * max);
    row = Math.floor(Math.random() * max);
    generatedPosition = (column + " " + row).split(" ");
  } while (isValidPositionOnBoard(generatedPosition) == false);
  return generatedPosition;
}

function isValidPositionOnBoard(position) {
  if (position.length < 2) {
    return false;
  }

  let isValidInput = true;
  if (position[0] * 1 != position[0] && position[1] * 1 != position[1]) {
    inputWasCorrect = false;
  } else if (position[0] > GAME_BOARD_SIZE && position[1] > GAME_BOARD_SIZE) {
    inputWasCorrect = false;
  } else if (
    Number.parseInt(position[0]) != position[0] &&
    Number.parseInt(position[1]) != position[1]
  ) {
    inputWasCorrect = false;
  }

  return isValidInput;
}

function showHUD() {
  let playerDescription = language.PLAYER_ONE_DESCRIPTION;
  if (PLAYER_2 == currentPlayer) {
    playerDescription = language.PLAYER_TWO_DESCRIPTION;
  }
  print(language.PLAYER + playerDescription + language.YOUR_TURN);
}

function showGameBoardWithCurrentState() {
  for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
    let rowOutput = "";
    for (let currentCol = 0; currentCol < GAME_BOARD_SIZE; currentCol++) {
      let cell = gameboard[currentRow][currentCol];
      if (cell == 0) {
        rowOutput += "\x1b[33m [] ";
      } else if (cell > 0) {
        rowOutput += "\x1b[32m X ";
      } else {
        rowOutput += "\x1b[34m O ";
      }
    }

    print(rowOutput);
  }
}

function initializeGame() {
  gameboard = createGameBoard();
  currentPlayer = PLAYER_1;
}

function createGameBoard() {
  let newBoard = new Array(GAME_BOARD_SIZE);

  for (let currentRow = 0; currentRow < GAME_BOARD_SIZE; currentRow++) {
    let row = new Array(GAME_BOARD_SIZE);
    for (
      let currentColumn = 0;
      currentColumn < GAME_BOARD_SIZE;
      currentColumn++
    ) {
      row[currentColumn] = 0;
    }
    newBoard[currentRow] = row;
  }

  return newBoard;
}

function clearScreen() {
  console.log(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME, ANSI.RESET);
}

//#endregion
