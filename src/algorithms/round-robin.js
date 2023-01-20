function roundRobin(length, current){
    current === (length - 1) ? current = 0 : current++;
    return current;
}

module.exports = roundRobin;
