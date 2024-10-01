const ESC = '\x1b';
const CSI = ESC + '[';
const CURSOR_UP = CSI + 'A';
const CURSOR_DOWN = CSI + 'B';
const CURSOR_RIGHT = CSI + 'C';
const CURSOR_LEFT = CSI + 'D';
const CLEAR_SCREEN = CSI + '2J';
const CURSOR_HOME = CSI + '1;1H';
const SAVE_CURSOR = ESC + '7';
const RESTORE_CURSOR = ESC + '8';
const moveCursorTo = (row, col) => CSI + row + ';' + col + 'H';
const BELL = '\x07';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

const ANSI = {
    ESC,
    CSI,
    CURSOR_UP,
    CURSOR_DOWN,
    CURSOR_RIGHT,
    CURSOR_LEFT,
    CLEAR_SCREEN,
    CURSOR_HOME,
    SAVE_CURSOR,
    RESTORE_CURSOR,
    BELL,
    RESET,
    moveCursorTo,
    COLOR: {
        GREEN,
        RED,
        YELLOW,
        BLUE
    }
}

export { ANSI }