var express = require('express'), http = require('http'), path = require('path');

var bodyParser = require('body-parser'), cookieParser = require('cookie-parser'),static=require('serve-static');
//body-parser : POST 요청 처리를 다룸
var expressErrorHandler = require('express-error-handler');

var expressSession = require('express-session');

var mongoose = require('mongoose');

var app =express();

var stay = 0;//0:잔류, 1:금요귀가, 2:토요귀가, 3:토요귀사
var satout = 0;//토요외출
var sunout = 0;//일요외출


app.set('port',3000);

app.use(bodyParser.urlencoded({extended:false}));

app.use(bodyParser.json());
//public 폴더를 static으로 오픈
app.use('/public',static(path.join(__dirname,'public')));

app.use(cookieParser());
//session  초기화
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUnitialized:true
}));

var rname;
var rid;

var database;

var UserSchema;

var UserModel;

function connectDB(){
    var databaseUrl = 'mongodb://localhost:27017/local';
    
    console.log('데이터베이스 연결을 시도합니다.');
    mongoose.Promise = global.Promise;
    mongoose.connect(databaseUrl);
    database = mongoose.connection;
    
    database.on('error',console.error.bind(console,'mongoose connection error.'));
    database.on('open',()=>{
        console.log('데이터베이스에 연결되었습니다.' + databaseUrl);
    
    UserSchema = mongoose.Schema({
        id : String,
        name : String,
        password : String
    });
    console.log('UserSchema 정의함');
    
    UserModel = mongoose.model("users",UserSchema);
    console.log('Usermodel 정의함');
});

    database.on('disconnected',function(){
        console.log('연결이 끊어졌습니다. 5초 후에 다시 연결합니다.');
        setInterval(connectDB,5000);
    });
}


app.post('/login',(req,res)=>{
    console.log('/login호출됨');
    
    var paramID = req.param('id');
    var parmaPW = req.param('password');
    
    if(database) {
        authUser(database,paramID,parmaPW,(err,docs)=>{
            if (err) {throw err;}
            
            if (docs){
                console.dir(docs);
                var username = docs[0].name;
                rid=paramID;
                rname=username;
                stay=0;
                satout=0;
                sunout=0;
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 :'+ paramID +'</p></div>');
                res.write('<div><p>사용자 이름 :'+ username +'</p></div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인 하기</a>");
                res.write("<br><br><a href='/public/main.html'>DMS 메인 페이지로 가기</a>");
                res.end();
            }else{
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href ='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    } else {
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }
});


var authUser = (database,id,password,callback)=> {
    console.log('authur 호출됨 : '+id+','+password);
    
    UserModel.find({"id":id,"password":password},(err,results)=>{
        if(err){
            callback(err,null);
            return;
        }
        
        console.log('아이디 [%s], 비밀번호[%s]로 사용자 검색 결과',id,password);
        console.dir(results);
        if(results.length > 0){
            console.log('일치하는 사용자 찾음.',id,password);
            callback(null,results);
        } else {
            console.log('일치하는 사용자 찾지 못함.');
            callback(null,null);
        }
    });
}


var addUser = (database,id,password,name,callback)=> {
    console.log('authser 호출됨.'+id+','+password);
    
    var user = new UserModel({"id":id,"password":password,"name":name});
    user.save((err)=>{
        if(err){
            callback(err,null);
            return;
        }
        console.log("사용자 데이터 추가함.");
        callback(null,user);
        
    });
    
};


var router = express.Router();

router.route('/me').post((req,res)=>{
    var paramID = req.param('id');
    var paramNM = req.param('name');
    
    res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
    res.write('<p>이름:'+rname+'<p>');
    res.write('<p>아이디:'+rid+'<p>');
    res.write("<br><a href='/public/main.html'>메인페이지로</a>");
    res.end();
})

router.route('/chks').post((req,res)=>{
    if(stay==0){
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<br><h3>잔류 :현재 잔류 신청 상태입니다.</h3>');
        res.write("<br><a href='/public/main.html'>DMS 메인 페이지로 가기</a>");
        res.end();
    }else if(stay==1){
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<br><h3>귀가 :현재 금요귀가 신청 상태입니다.</h3>');
        res.write("<br><a href='/public/main.html'>DMS 메인 페이지로 가기</a>");
        res.end();
    }else if(stay==2){
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<br><h3>귀가 :현재 토요귀가 신청 상태입니다.</h3>');
        res.write("<br><a href='/public/main.html'>DMS 메인 페이지로 가기</a>");
        res.end();
    }else{
        res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
        res.write('<br><h3>귀가 :현재 토요귀사 신청 상태입니다.</h3>');
        res.write("<br><a href='/public/main.html'>DMS 메인 페이지로 가기</a>");
        res.end();
    }
});

router.route('/chko').post((req,res)=>{
    console.log('chko 호출됨.');
    res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
    if(satout==1){
        res.write('<br><h3>외출 : 현재 토요외출 신청 상태입니다.</h3>');   
    }else{
        res.write('<br><h3>토요외출 : 현재 신청 되지않은 상태입니다.</h3>');
    }
    if(sunout==1){
        res.write('<br><h3>외출 : 현재 일요외출 신청 상태입니다.</h3>');
    }else{
        res.write('<br><h3>일요외출 : 현재 신청 되지않은 상태입니다.</h3>');
    }
    res.write("<br><a href='/public/main.html'>DMS 메인 페이지로 가기</a>");
    res.end();
});

router.route('/stay').post((req,res)=>{
    console.log('/stay호출됨.');
    stay=0;
    res.redirect('./public/main.html');
})

router.route('/frih').post((req,res)=>{
    console.log('/frih호출됨.');
    stay=1;
    res.redirect('./public/main.html');
})

router.route('/sath').post((req,res)=>{
    console.log('/sath호출됨.');
    stay=2;
    res.redirect('./public/main.html');
})

router.route('/satd').post((req,res)=>{
    console.log('/satd호출됨.');
    stay=3;
    res.redirect('./public/main.html');
})

router.route('/satout').post((req,res)=>{
    console.log('/satout호출됨.');
    if(satout==1){
        satout=0;
    }
    else{
        satout = 1;    
    }
    res.redirect('./public/main.html');
})
router.route('/sunout').post((req,res)=>{
    console.log('/sunout호출됨.');
    if(sunout==1){
        sunout=0;
    }
    else{
        sunout=1;
    }
})


router.route('/adduser').post((req,res)=>{
    console.log('/adduser 호출됨');
    
    var paramId = req.body.id;
    var paramPassword = req.body.password;
    var paramName = req.body.name;
    
    console.log('요청 파라미터 : '+paramId+','+paramPassword+','+paramName);
    
    if(database) {
        addUser(database,paramId,paramPassword,paramName,(err,result)=>{
            if(err) {throw err;}
            
            if(result && result.insertedCount ==null) {
                
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.write("<br><br><a href ='/public/login.html'>로그인하러가기</a>")
                res.end();
            }else {
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    }else {
        res.writeHead('200',{'Content-Type':'text/html;chatset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
});

//라우터 객체 등록
app.use('/',router);


//404오류페이지처리
app.all('*',(req,res)=>{
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});


//서버시작
http.createServer(app).listen((app.get('port')),()=>{
    console.log('서버가 시작되었습니다. 포트 : '+app.get('port'));
    
    connectDB();
})