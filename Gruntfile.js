module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: { 
        separator: ';'
      },
      dist: {
        src: ['public/client/*.js'],
        dest: 'public/dist/client.js'
      }
    },
    clean: ['public/dist/client.js', 'public/dist/client.min.js'], 
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      target: {
        files: {
          'public/dist/client.min.js': ['public/dist/client.js']
        }
      } 
    },

    eslint: {
      target: [
        // Add list of files to lint here
        'app/**/*.js',
        'lib/**/*.js',
        'public/client/**/*.js',
        './*.js'
      ]
    },

    cssmin: {
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        multiple: {
          command: [
            'git add .',
            'git commit -m "Deploying to Production Server"',
            'git push live master'
          ].join('&&')
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    grunt.task.run([ 'nodemon', 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'clean', 'eslint', 'test', 'concat', 'uglify'
  ]);

  grunt.registerTask('upload', [
    'shell:prodServer'
  ]);
  //   function(n) {
  //   if (grunt.option('prod')) {
  //     // add your production server task here
  //   } else {
  //     grunt.task.run([ 'server-dev' ]);
  //   }
  // });

  grunt.registerTask('deploy', function(n) {
    if (grunt.option('prod')) {
      grunt.task.run([ 'build', 'upload' ]);
    } else {
      grunt.task.run([ 'build', 'server-dev' ]);
    }
  });
 

};
