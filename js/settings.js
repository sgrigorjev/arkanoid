define(function (require) {
    return {
        width: 800,
        height: 600,
        spaceship: {
            speed: 800,
            accelerate: 250,
            bottomOffset: 10
        },
        bullet: {
            speed: 800
        },
        target: {
            speed: 40,
            shift: 40,
            fallFactor: 0
        },
        fleet: {
            rows: 3,
            cols: 12,
            topOffset: 0,
            rowOffset: 0
        }
    };
});