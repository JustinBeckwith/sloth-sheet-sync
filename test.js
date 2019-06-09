// for now this is just running async hook
const sss = require('./index.js');
sss.sync().catch(console.error);
