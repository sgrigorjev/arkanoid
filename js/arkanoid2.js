define(function (require) {

    var $ = require('jquery');
    var Spaceship = require('app/spaceship');

    console.log("Hey! It's works!: %o, %o", $.fn, new Spaceship());
});