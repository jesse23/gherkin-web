export default {
    default: {
        import: ['features/**/*.js'],
        format: ['progress-bar', 'html:cucumber-report.html'],
        formatOptions: { snippetInterface: 'async-aware' },
        paths: ["features/**/*.feature"],
        publishQuiet: true
    }
}; 