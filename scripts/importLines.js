const fetch = require("fetch-everywhere");

fetch("http://www.i-learner.edu.hk/mtr/api/v1/lines").then(async r => {
    const data = await r.json();

    const lines = data.lines.map(l => ({ code: l.code, name: l.name, nameZH: l.nameZH }));

    console.log(JSON.stringify(lines, null, 4));
});