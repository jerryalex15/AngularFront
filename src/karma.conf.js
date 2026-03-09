module.exports = function(config) { //NOSONAR
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-junit-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        reporters: ['progress', 'junit', 'coverage'],
        junitReporter: {
            outputDir: 'test-results',
            outputFile: 'test-results.xml',
            useBrowserName: false
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                { type: 'html'         },
                { type: 'lcov'         }, // ← lu par SonarCloud
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
                    '--disable-dev-shm-usage' // ← évite crash mémoire sur VM Linux
                ]
            }
        },
        singleRun: true,
        restartOnFileChange: false
    });
};