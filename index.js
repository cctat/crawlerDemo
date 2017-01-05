var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var dir = './meizi';

function run(high,low) {
    if(high<low) return;
    spider('/ooxx/page-'+high,function (html) {
        var images = [];
        var $ = cheerio.load(html);  //cheerio解析data
        var meizi = $('.text img').toArray();  //将所有的img放到一个数组中
        var len = meizi.length;
        for (var i=0; i<len; i++) {
            var imgsrc = 'http:' + meizi[i].attribs.src;  //用循环读出数组中每个src地址
            images.unshift(imgsrc);                //输出地址
        }
        var page = i;
        var proms = images.map((x,i,a)=>{
            // console.log(x);
            return new Promise((resolve,reject)=>{
                var req = http.get(x,function (res) {
                    res.on('error',function (err) {
                        console.error(err);
                        resolve('fail');
                    });
                    var filename = x.substr(x.lastIndexOf('/')+1);
                    download(dir+'/'+filename,res);
                    console.log('PAGE:'+page+'...'+filename+'...'+(i+1)+'/'+a.length);
                    resolve('done');
                }).end();
            });
        });
        Promise.all(proms)
            .then((values)=>{
                run(high-1,low);
            });
    });
}
function spider(path,callback){
    http.request(
        {
            headers : {
                Host: "jandan.net",
                Connection: "keep-alive",
                "Cache-Control": "max-age=0",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Upgrade-Insecure-Requests": 1,
                "User-Agent": "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
                Referer: "http://jandan.net/v",
                "Accept-Language": "zh-CN,zh;q=0.8",
            },
            hostname: "jandan.net",
            path: path
        },
        function (res) {
            var html = '';
            res.setEncoding('utf-8');
            res.on('data',function (chunk) {
                html+=chunk;
            });
            res.on('end',function () {
                callback(html);
            })
        }
    ).end();
}

function download(filename,readable){
    var file = fs.createWriteStream(filename);
    file.on('error',function () {
        file.end()
    })
    readable.pipe(file);
}

//2302 - 1780
run(2034,2034);


process.on('uncaughtException', function (err) {
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});
