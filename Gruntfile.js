'use strict';
/**
 * Message Server项目管理4个子项目
 * 1. Nginx
 *    包括nginx配置文件，lua脚本。
 * 2. Message Server Web
 *    包括tracker网站的js
 * 3. Message Server Collector
 *    信息的收集器，由python撰写
 * 4. Logstash
 *    数据的清洗器
 *
 * @param  {[type]} grunt [description]
 * @return {[type]}       [description]
 */
module.exports = function (grunt) {
    require('time-grunt')(grunt);
    // path
    var path = require('path');
    // 获得发布的环境，如开发环境(dev)还是生产环境(prod)
    var profile = grunt.option('profile') || 'dev';

    require('load-grunt-config')(grunt, {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'grunt'),
        // auto grunt.initConfig
        init: true,
        // data passed into config.  Can use with <%= test %>
        data: {
            pkg: grunt.file.readJSON('package.json'),
            banner: '/* <%= pkg.description %> */\n',
            profile: profile
        },
        // can optionally pass options to load-grunt-tasks.
        // If you set to false, it will disable auto loading tasks.
        loadGruntTasks: {
            pattern: 'grunt-*',
            config: require('./package.json'),
            scope: 'devDependencies'
        }
    });


    // 打包dev环境，包括合并压缩文件，生成到web目录到dist
    grunt.registerTask('distMessageServerWeb', ['config:' + profile, 'clean:messageServerWeb', 'copy:messageServerWeb', 'concat:messageServerWeb', 'replace:messageServerWeb', 'uglify:messageServerWeb', 'clean:messageServerWebSrc']);
    grunt.registerTask('distMessageServerCollector', ['config:' + profile, 'clean:messageServerCollector', 'copy:messageServerCollector']);
    // grunt.registerTask('dev', ['clean', 'config:dev', 'copy:web', 'concat', 'replace']);
    // 将dist发不到服务器上，服务器配置见config.js
    // grunt.registerTask('deployWeb', ['packageWeb', 'sftp:web']);
    // 发布nginx，测试nginx文件的有效性并且重启
    // grunt.registerTask('distNginx', ['config:' + profile, 'clean:nginx', 'copy:nginx', 'replace:nginx', 'sftp:nginx', 'sshexec:nginxTest', 'sshexec:nginxRestart']);
    grunt.registerTask('distNginx', ['config:' + profile, 'clean:nginx', 'copy:nginx', 'replace:nginx']);
    // 发布message_server logstash配置文件到指定目录
    // grunt.registerTask('deployLogstash', ['config:' + profile, 'copy:logstash', 'replace:logstash', 'sftp:logstash']);
    grunt.registerTask('distLogstash', ['config:' + profile, 'clean:logstash', 'copy:logstash', 'replace:logstash']);

    grunt.registerTask('distAll', ['distMessageServerWeb', 'distMessageServerCollector', 'distNginx', 'distLogstash']);

    grunt.registerTask('deployNginx', ['distNginx', 'sftp:nginx', 'sshexec:nginxTest', 'sshexec:nginxRestart']);
    grunt.registerTask('deployMessageServerWeb', ['distMessageServerWeb', 'sftp:messageServerWeb']);
    grunt.registerTask('deployLogstash', ['distLogstash', 'sftp:logstash', 'sshexec:logstash']);
    grunt.registerTask('deployMessageServerCollector', ['distMessageServerCollector', 'sftp:messageServerCollector', 'sshexec:messageServerCollector']);

    grunt.registerTask('deployAll', ['deployNginx', 'deployMessageServerWeb', 'deployLogstash', 'deployMessageServerCollector']);

    // grunt.registerTask('deployAll', ['deployWeb', 'deployNginx', 'deployLogstash']);
    grunt.registerTask('default', ['clean']);

    // 更新web目录下的文件自动更新到服务器上
    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln('=============' + target + '========' + action + "=====" + filepath);
        if (target === 'messageServerWeb') {
            grunt.config('sftp.messageServerWeb.files', {'./': filepath});
        } else if (target === 'nginxLua') {
            grunt.config('sftp.nginx.files', {'./': filepath});
            grunt.config('sftp.nginx.options.srcBasePath', 'main/nginx_conf/');
        } else if (target === 'logstash') {
            grunt.config('sftp.logstash.files', {'./': filepath});
            grunt.config('sftp.logstash.options.srcBasePath', 'main/logstash_conf/');
        }
    });
};
