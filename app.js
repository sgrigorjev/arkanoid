requirejs.config({
    baseUrl: 'js/lib',
    urlArgs: '_=' + (new Date()).getTime(),
    paths: {
        app: '..',
        jquery: 'jquery-1.10.2.min',
        canvaslib: 'canvas/lib-1.7',
        canvasmap: 'canvas/map-1.0',
        bootstrap: '../../bootstrap/js/bootstrap.min',
        'bootstrap-slider': '../../bootstrap/js/bootstrap-slider.min'
    },
    shim: {
        canvaslib: {
            exports: "$lib"
        },
        canvasmap: {
            exports: "Map"
        },
        underscore: {
            exports: "_"
        },
        bootstrap: {
            deps: ['jquery']
        },
        'bootstrap-slider': {
            deps: ['jquery','bootstrap']
        },
        'app/arkanoid': {
            deps: ['jquery','bootstrap','bootstrap-slider']
        }
    }
});
requirejs(['bootstrap','bootstrap-slider','app/arkanoid']);