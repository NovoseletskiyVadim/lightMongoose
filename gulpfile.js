// var gulp=require('gulp');

// gulp.task('mytask', function() {
//     console.log('Привет, я таск!');
// });



var gulp = require('gulp'),
sass=require('gulp-sass'),
browserSync= require('browser-sync'),
concat      = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
uglify      = require('gulp-uglifyjs'), // Подключаем gulp-uglify; 

cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
rename      = require('gulp-rename'), // Подключаем библиотеку дл
del         = require('del'), // Подключаем библиотеку для удал


imagemin    = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
pngquant    = require('imagemin-pngquant'),    // Подключаем библиотеку для работы с png

cache       = require('gulp-cache'), // Подключаем библиотеку кеширования

git =require('git'),

runSeq = require('run-sequence');








gulp.task('sass', function(){ 
    return gulp.src('app/sass/**/*.scss') // Берем источник
    .pipe(sass()) 
    .pipe(gulp.dest('app/css')) 
    .pipe(browserSync.reload({stream: true})) 
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        server: { // Определяем параметры сервера
            baseDir: 'dist' // Директория для сервера - app
        },
        notify: false // Отключаем уведомления
    });
});


gulp.task('html',function(){
    return gulp.src('app/**/*.html')
    .pipe(browserSync.reload({stream:true}))

});

gulp.task('js',function(){
    return gulp.src('app/js/**/*.js')
    .pipe(browserSync.reload({stream:true}))

});

// Создаем task  для сборки и сжатия всех библиотек (перед watch):
gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs',  function() {
    return gulp.src('app/css/libs.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});



gulp.task('watch', function() {
    gulp.watch('app/sass/**/*.scss', gulp.parallel('sass')); // Наблюдение за sass файлами
    // Наблюдение за другими типами файлов
    // gulp.watch('*.html', browserSync.reload); //это наблюдение за HTML не работает 
    gulp.watch('app/**/*.html',gulp.parallel('html'));//Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/**/*.js', gulp.parallel('js')); // Н
});

// таск img для сжатия изображений на продакшен и вызовем его после очистки
gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('dist/img')); // Выгружаем на продакшен
});


// автономный таск для очистки кеша Gulp
gulp.task('clear', function () {
    return cache.clearAll();
})



// task удаления папки dist перед сборкой
gulp.task('clean', function() {
    return del.sync('dist'); // Удаляем папку dist перед сборкой
});

// task сборка проэкта в продакшен
gulp.task('build',  function() {
    gulp.series('clean')
    gulp.series('img')
    gulp.series('sass')
    gulp.series('scripts')

    var buildCss = gulp.src([ // Переносим CSS стили в продакшен
        'app/css/main.css',
        'app/css/libs.min.css'
        ])
    .pipe(gulp.dest('dist/css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('dist/fonts'))

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('dist/js'))

    var buildHtml = gulp.src('app/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('dist'))

    return buildCss,buildFonts ,buildJs, buildHtml;

});

gulp.task('heroku-postbuild', function(){
    runSeq('clean', 'build')
  });

gulp.task('deploy', function(){
    return git.push('heroku', 'master', function(err){
        if (err){console.log(err);throw err;}
    });
}) ; 

gulp.task('default', gulp.parallel('watch','browser-sync','sass','css-libs','scripts'));





