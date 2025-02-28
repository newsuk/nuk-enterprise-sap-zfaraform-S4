'use strict';

var module = module;

module.exports = function(grunt) {

	grunt.initConfig({

		dir: {
			webapp: 'webapp',
			dist: 'dist'
		},

		connect: {
			options: {
				port: 8080,
				hostname: '*',
				livereload: true
			},
			src: {},
			dist: {}
		},

		openui5_connect: {
			options: {
				proxypath : 'proxy',
				proxyOptions : {
					secure: false
				}
			},
			src: {
				options: {
					appresources: '<%= dir.webapp %>'
				}
			},
			dist: {
				options: {
					appresources: '<%= dir.dist %>'
				}
			}
		},

		openui5_preload: {
			component: {
				options: {
					resources: {
						cwd: '<%= dir.webapp %>',
						prefix: 'news/uk/fara'
					},
					dest: '<%= dir.dist %>'
				},
				components: true
			}
		},

		clean: {
			dist: '<%= dir.dist %>/'
		},

		copy: {
			dist: {
				files: [ {
					expand: true,
					cwd: '<%= dir.webapp %>',
					src: [
						'**',
						'!test/**'
					],
					dest: '<%= dir.dist %>'
				} ]
			}
		},

		eslint: {
			webapp: ['<%= dir.webapp %>']
		}

	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-openui5');
	grunt.loadNpmTasks('grunt-eslint');

	// Server task
	grunt.registerTask('serve', function(target) {
		grunt.task.run('openui5_connect:' + (target || 'src') + ':keepalive');
	});

	// Linting task
	grunt.registerTask('lint', ['eslint']);

	// Build task
	grunt.registerTask('build', ['openui5_preload', 'copy']);

	grunt.registerTask('i18nKeysGenerator', function () {
			var propertiesFileSrc = "webapp/i18n/i18n.properties";

      if (!grunt.file.exists(propertiesFileSrc)) {
          grunt.log.error("file " + propertiesFileSrc + " not found");
          return true;//return false to abort the execution
      }

			var propertiesFile = grunt.file.read(propertiesFileSrc);

			var aLines = propertiesFile.split("\n");

			var oi18nKeys = {};

			for(var i = 0; i < aLines.length; i++){
				var sLine = aLines[i];
				if(sLine && sLine.length > 1 && !sLine.startsWith("#")){
					var sFormattedLine = sLine.split("=")[0].trim();
					oi18nKeys[sFormattedLine] = sFormattedLine;
				}
			}
			grunt.file.write("webapp/resources/jsonModel/i18nKeys.json", JSON.stringify(oi18nKeys, null, "\t"));
			grunt.log.writeln(["i18nKeys.json generated"]);
  });

	// Default task
	grunt.registerTask('default', [
		'lint',
		'clean',
		// 'i18nKeysGenerator',
		'build',
		//Option for build with component preload and minified code
		// 'serve:dist'
		//Option for build without component preload and complete and visible code
		'serve'
	]);
};
