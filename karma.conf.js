module.exports = function(config) { //NOSONAR
    config.set({
        frameworks: ['jasmine'], 
        reporters: ['progress', 'junit', 'coverage'],
        junitReporter: {
        outputDir: 'test-results',
        outputFile: 'test-results.xml',
        useBrowserName: false
        },
        coverageReporter: {
            dir: require('node:path').join(__dirname, 'coverage'),
            subdir: '.',
            reporters: [
                { type: 'html'         },
                { type: 'lcov'         },
                { type: 'text-summary' }
            ]
        },
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
        ChromeHeadlessNoSandbox: {
            base: 'ChromeHeadless',
            flags: [
                '--no-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage'
            ]
        }
        },
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-junit-reporter'),
            require('karma-coverage')
        ],
        singleRun: true
    });
};