function roundRobin(length, current){
    current === (length - 1) ? current = 0 : current++; // -> Round Robin Working
    return current;
}

module.exports = roundRobin;
