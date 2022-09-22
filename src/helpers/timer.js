function timer(start, end)
{
    // return Math.floor(((end - start) % (1000 * 60)) / 1000)
    return ((end - start) % (1000 * 60))/1000
}

module.exports = timer;
