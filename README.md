# DMS-join-request-practice

`
로그인과 회원가입 기능. 
잔류신청(잔류,금요귀가,토요귀가,토요귀사), 외출신청(토요외출,일요외출) 기능. 
메인페이지에서 자신의 아이디와 이름을 확인하는 마이페이지 기능 이있다.

MONGO DB로 데이터베이스와 연동하였고
회원가입 시에 데이터베이스에 id,password,name을 추가하여
로그인 시에 비교하여 승인하는 형식이다.

아직 모듈분리가 익숙하지 않아 JS파일은 하나에 모든 코드가 들어가있어 가독성이 떨어지는 것이 문제다.
서버를 테스트 할 수 있도록 main.html : 메인페이지 , adduser.html : 회원가입 , login.html : 로그인 을 확인할 수 있다.
public폴더를 static으로 오픈되도록 설정하였기 때문에 접속할때 ip:3000/public/______.html로 접속해야 한다.

사용한 데이터베이스 name 은 local이다.

코드에서 사용한 모듈은 express, http, path, body-parser, cookie-parser, serve-static, express-error-handler, express-session, mongoose 등이 있다. 코드를 정상적으로 확인하기 위해서는 위의 모듈들을 모두 npm에서 설치해야 한다.


 
`
