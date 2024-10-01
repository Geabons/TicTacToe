const DEBUG_LEVELS = {
    critical: 1,
    important: 5,
    everything: 10,
}

const DEBUG = DEBUG_LEVELS.everything;

function debug(msg, lvl = DEBUG_LEVELS.everything) {

    if (DEBUG >= lvl) {
        console.log(msg);
    }
}

export { debug, DEBUG_LEVELS }