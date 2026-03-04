const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
try {
    const id = new mongoose.Types.ObjectId();
    console.log("Testing with ObjectId:");
    jwt.sign({ id }, "secret");
    console.log("Success with ObjectId!");
} catch (e) {
    console.error("Error with ObjectId:", e.message);
}

try {
    const id = new mongoose.Types.ObjectId();
    console.log("Testing with plain string:");
    jwt.sign({ id: id.toString() }, "secret");
    console.log("Success with plain string!");
} catch (e) {
    console.error("Error with string:", e.message);
}
