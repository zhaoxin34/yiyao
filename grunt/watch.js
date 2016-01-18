module.exports = {
	options: {
		debounceDelay: 250,
	    spawn: false // add spawn option in watch task
	},
	yiyao: {
		files: ['./web/**/*.js', './web/**/*.html', './web/**/*.css' ],
		// tasks: ['config:dev', 'sftp:python']
		options: {
			livereload: true,
		}
	},
};
