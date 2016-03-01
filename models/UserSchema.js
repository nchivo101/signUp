var mongoose = require('mongoose');

module.exports = mongoose.model('eins', {
    name: String,
    password: String
});
