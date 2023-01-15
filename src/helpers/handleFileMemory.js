const { readFileSync, existsSync, writeFileSync } = require('fs');

function loadFileMemory(){
    let total = 0,
        success = 0;

    if (!existsSync('./total-reqs.json')) {
        writeFileSync('./total-reqs.json', JSON.stringify({ total, success }));
    } else {
        const lastRunStr = readFileSync('./total-reqs.json');
        const lastRun = JSON.parse(lastRunStr);
        total+= lastRun.total;
        success += lastRun.success;
    }

    return { total, success };
}

module.exports = loadFileMemory;
