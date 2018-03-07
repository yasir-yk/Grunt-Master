module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Paths
  var PathConfig = {
    sassDir:        'scss/',
    cssDir:         'css/',
    jsDir:          'js/',
    imgDir:         'images/',
    imgSourceDir:   'sourceimages/',
    tempDir:        'temp/',
    distDir:        'production/',

    // sftp server
    sftpServer:      'exaple.com',
    sftpPort:        '2121',
    sftpLogin:       'login',
    sftpPas:         'password',
    sftpDestination: '/pathTo/css'
  };

  // tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    config: PathConfig,

    //clean files
    clean: {
      options: { force: true },
      all: {
        src: ["<%= config.cssDir %>", "<%= config.imgDir %>"]
      },
      css: {
        src: ["<%= config.cssDir %>**/*.map"]
      }
    },

    // autoprefixer
    autoprefixer: {
      options: {
        browsers: ['last 4 version', 'ie 8', 'ie 9']
      },

      multiple_files: {
        options: {
            map: true
        },
        expand: true,
        flatten: true,
        src: '<%= config.cssDir %>app.css',
        //dest: '<%= config.cssDir %>'
        //dest: '<%= config.tempDir %>css/'
      },

      dist: {
        src: '<%= config.cssDir %>*.css'
      },
    },

    //sass
    sass: {
      options: {
        includePaths: ['bower_components/foundation/scss']
      },
      dev: {
        options: {
          sourceMap: true,
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: '<%= config.sassDir %>',
          src: ['*.scss'],
          dest: '<%= config.cssDir %>',
          ext: '.css'
        }]
      },
      dist: {
        options: {
          sourceMap: false,
          style: 'expanded'
        },
        files: [{
          expand: true,
          cwd: '<%= config.sassDir %>',
          src: ['*.scss'],
          dest: '<%= config.cssDir %>',
          ext: '.css'
        }]
      },
      min: {
        options: {
          sourceMap: false,
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: '<%= config.sassDir %>',
          src: ['**/*.scss'],
          dest: '<%= config.cssDir %>',
          ext: '.min.css'
        }]
      }
    },

    //watcher project
    watch: {
      options: {
        debounceDelay: 1,
        // livereload: true,
      },
      images: {
        files: ['<%= config.imgSourceDir %>**/*.*'],
        tasks: ['newer:pngmin:all', 'newer:imagemin:jpg'],
        options: {
            spawn: false
        }
      },
      css: {
        files: ['<%= config.sassDir %>**/*.scss'],
        tasks: ['sass:dev'/*, 'newer:autoprefixer:dist'*/],
        options: {
            spawn: false,
        }
      }
    },

    //Keep multiple browsers & devices in sync when building websites.
    browserSync: {
      dev: {
        bsFiles: {
          src : ['**/*.html','<%= config.cssDir %>**/*.css']
          //src : 'assets/css/*.css'
        },
        options: {
          server: {
            baseDir: "./",
            index: "index.html",
            directory: true
          },
          watchTask: true
        }
      }
    },

    notify: {
      options: {
        enabled: true,
        max_js_hint_notifications: 5,
        title: "Project"
      },
      watch: {
        options: {
          title: 'Task Complete',  // optional
          message: 'SASS finished running', //required
        }
      },
    },

    //copy files
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: './',
            src: [
              '**',

              '!scss/**',
              '!**/**/.svn/**',
              '!css/**',
            ],
            dest: '<%= config.distDir %>'
          } // makes all src relative to cwd
        ]
      },
    },


    //minify images
    imagemin: {
      jpg: {
        options: {
          progressive: true,
          optimizationLevel: 7
        },
        files: [{
          expand: true,
          cwd: '<%= config.imgSourceDir %>',
          src: ['**/*.jpg'],
          dest: '<%= config.imgDir %>',
          ext: '.jpg'
        }]
      },

      dist: {
        options: {
          optimizationLevel: 7,
          progressive: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= config.imgSourceDir %>',
            src: ['**/*.{png,jpg,gif}'],
            dest: '<%= config.imgDir %>',
          }
        ],
      },
    },

    // lossy image optimizing (compress png images with pngquant)
    pngmin: {
      all: {
        options: {
          ext: '.png',
          force: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= config.imgSourceDir %>',
            src: ['**/*.png'],
            dest: '<%= config.imgDir %>',
            ext: '.png'
          }
        ]
      },
    },

    csscomb: {
      dist: {
        expand: true,
        cwd: '<%= config.cssDir %>',
        src: ['*.css'],
        dest: '<%= config.cssDir %>',
        ext: '.css'
      }
    },

    cmq: {
      options: {
        log: false
      },
      your_target: {
        files: {
          '<%= config.cssDir %>app.css' : '<%= config.cssDir %>app.css'
        },
      }
    },

    'sftp-deploy': {
      build: {
        auth: {
          host: '<%= config.sftpServer %>',
          port: '<%= config.sftpPort %>',
          authKey: {
                    "username": "<%= config.sftpLogin %>",
                    "password": "<%= config.sftpPas %>"
                  }
        },
        cache: 'sftpCache.json',
        src: 'css',
        dest: '<%= config.sftpDestination %>',
        //exclusions: ['/path/to/source/folder/**/.DS_Store', '/path/to/source/folder/**/Thumbs.db', 'dist/tmp'],
        serverSep: '/',
        concurrency: 4,
        progress: true
      }
    }

  });

// run task
//dev
  //watch
  grunt.registerTask('w', ['watch']);
  //browser sync
  grunt.registerTask('bs', ['browserSync']);

  //watch + browser sync
  grunt.registerTask('dev', ['browserSync', 'watch']);
  grunt.registerTask('default', ['dev']);

  // upload to server
  grunt.registerTask('sftp', ['sftp-deploy']);

//finally
  //css beautiful
  grunt.registerTask('cssbeauty', ['sass:dist', 'cmq', 'autoprefixer:dist', 'csscomb:dist']);
  //img minify
  grunt.registerTask('imgmin', ['pngmin:all', 'imagemin:jpg']);

  //final build
  grunt.registerTask('dist', ['clean:css', 'cssbeauty', 'newer:pngmin:all', 'newer:imagemin:jpg'/*, 'copy:dist','imgmin', 'cssbeauty'*/ ]);

};



