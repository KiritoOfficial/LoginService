const server = require("./http");
const bot = require("./bot");

const PORT = 3000;

server.listen(PORT, () => console.log(`Server running on ${PORT}`));