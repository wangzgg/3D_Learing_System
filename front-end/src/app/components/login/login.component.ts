import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { ElMessageService } from 'element-angular';
import { ElNotificationService } from 'element-angular'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private notify: ElNotificationService, private message: ElMessageService, public http: HttpClient, private el: ElementRef, private router: Router) { }

  @ViewChild('verifyCanvas', { static: true }) verifyCanvas: ElementRef;

  public user: any = {
    username: '',
    password: '',
    checkCode: ''
  }

  public register: any = {
    username: '',
    email: '',
    password: ''
  }

  public staName: any = {
    status: '',
    message: ''
  }

  public staPas: any = {
    status: '',
    message: ''
  }

  public staCode: any = {
    status: '',
    message: ''
  }

  public staNameR: any = {
    status: '',
    message: ''
  }

  public staPasR: any = {
    status: '',
    message: ''
  }

  public staEmail: any = {
    status: '',
    message: ''
  }

  checkname() {
    if (this.user.username == '') {
      this.staName.status = 'error'
      this.staName.message = '用户名不能为空'
    } else {
      this.staName.status = 'success'
      this.staName.message = ''
    }
  }

  checkpass() {
    if (this.user.password == '') {
      this.staPas.status = 'error'
      this.staPas.message = '密码不能为空'
    } else {
      this.staPas.status = 'success'
      this.staPas.message = ''
    }
  }

  checkcode() {
    if (this.user.checkCode == '') {
      this.staCode.status = 'error'
      this.staCode.message = '验证码不能为空'
    } else {
      this.staCode.status = 'success'
      this.staCode.message = ''
    }
  }

  checknamer() {
    if (this.register.username == '') {
      this.staNameR.status = 'error'
      this.staNameR.message = '用户名不能为空'
    } else {
      this.staNameR.status = 'success'
      this.staNameR.message = ''
    }
  }

  checkemail() {
    if (this.register.email == '') {
      this.staEmail.status = 'error'
      this.staEmail.message = '验证码不能为空'
    } else {
      let check: any = new RegExp(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/);
      if (check.test(this.register.email) == false) {
        this.staEmail.status = 'error'
        this.staEmail.message = '邮箱格式不正确'
      } else {
        this.staEmail.status = 'success'
        this.staEmail.message = ''
      }
    }
  }

  checkpas() {
    if (this.register.password == '') {
      this.staPasR.status = 'error'
      this.staPasR.message = '密码不能为空'
    } else {
      if (this.register.password.length <= 6) {
        this.staPasR.status = 'error'
        this.staPasR.message = '密码不能少于6位'
      } else {
        this.staPasR.status = 'success'
        this.staPasR.message = ''
      }
    }
  }

  checkcodev() {
    if (!this.validate(this.user.checkCode)) {
      this.staCode.status = 'error';
      this.staCode.message = '验证码不正确';
      this.refresh();
    }
  }

  submit() {
    // 校验验证码是否正确
    this.checkname();
    this.checkpass();
    this.checkcode();
    this.checkcodev();
    if (this.staName.status == 'success' && this.staPas.status == "success" && this.staCode.status == 'success') {

      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      var api = "http://127.0.0.1:4523/m1/2633169-0-default/login";
      this.http.post(api, this.user, httpOptions).subscribe((response: any) => {
        if (response.code == 200) {
          // 弹窗
          this.notify['success']('登录成功');
          // 跳转到首页
          // location.href = "http://localhost:4200/index"
          sessionStorage.setItem('token', response.data);
        }
      });
    }
  }

  regi() {
    this.checknamer();
    this.checkemail();
    this.checkpas();
    if (this.staNameR.status == 'success' && this.staPasR.status == "success" && this.staEmail.status == 'success') {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };

      var api = "http://127.0.0.1:4523/m1/2633169-0-default/login";
      this.http.post(api, this.user, httpOptions).subscribe((response: any) => {
        if (response.code == 200) {
          this.notify['success']('登录成功');
        }
      });
    }
  }

  cancel() {
    this.register.username = '';
    this.register.email = '';
    this.register.password = '';
    this.staNameR.status = 'validating'
    this.staNameR.message = ''
    this.staEmail.status = 'validating'
    this.staEmail.message = ''
    this.staPasR.status = 'validating'
    this.staPasR.message = ''
  }

  // 生成验证码
  codeLength = 4; // 设置验证码长度
  public options: any = {
    // 默认options参数值
    id: 'v_container', // 容器Id
    canvasId: 'verifyCanvas', // canvas的ID
    width: 100, // 默认canvas宽度
    height: 40, // 默认canvas高度
    type: 'blend', // 图形验证码默认类型blend:数字字母混合类型、number:纯数字、letter:纯字母
    code: '',
    numArr: [],
    letterArr: [],
  };
  ctx;

  ngOnInit() {
    this.ctx = this.verifyCanvas.nativeElement.getContext('2d');
    this.options.numArr = '0,1,2,3,4,5,6,7,8,9'.split(',');
    this.options.letterArr = this.getAllLetter();
    this.refresh();
  }

  // 生成验证码
  refresh() {
    this.options.code = '';
    this.ctx.textBaseline = 'middle';

    this.ctx.fillStyle = this.randomColor(180, 240);
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);

    let txtArr = [];
    if (this.options.type === 'blend') {
      // 判断验证码类型
      txtArr = this.options.numArr.concat(this.options.letterArr);
    } else if (this.options.type === 'number') {
      txtArr = this.options.numArr;
    } else {
      txtArr = this.options.letterArr;
    }

    for (let i = 1; i <= this.codeLength; i++) {
      const txt = txtArr[this.randomNum(0, txtArr.length)];
      this.options.code += txt;
      this.ctx.font = this.randomNum(this.options.height / 2, this.options.height) + 'px SimHei'; // 随机生成字体大小
      this.ctx.fillStyle = this.randomColor(50, 160); // 随机生成字体颜色
      this.ctx.shadowOffsetX = this.randomNum(-3, 3);
      this.ctx.shadowOffsetY = this.randomNum(-3, 3);
      this.ctx.shadowBlur = this.randomNum(-3, 3);
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      const x = (this.options.width / (this.codeLength + 1)) * i;
      const y = this.options.height / 2;
      const deg = this.randomNum(-30, 30);
      // 设置旋转角度和坐标原点
      this.ctx.translate(x, y);
      this.ctx.rotate((deg * Math.PI) / 180);
      this.ctx.fillText(txt, 0, 0);
      // 恢复旋转角度和坐标原点
      this.ctx.rotate((-deg * Math.PI) / 180);
      this.ctx.translate(-x, -y);
    }
    // 绘制干扰线
    // for (let i = 0; i < 2; i++) {
    //   this.ctx.strokeStyle = this.randomColor(40, 180);
    //   this.ctx.beginPath();
    //   this.ctx.moveTo(this.randomNum(0, this.options.width), this.randomNum(0, this.options.height));
    //   this.ctx.lineTo(this.randomNum(0, this.options.width), this.randomNum(0, this.options.height));
    //   this.ctx.stroke();
    // }
    // 绘制干扰点
    for (let i = 0; i < this.options.width / 2; i++) {
      this.ctx.fillStyle = this.randomColor(0, 255);
      this.ctx.beginPath();
      this.ctx.arc(this.randomNum(0, this.options.width), this.randomNum(0, this.options.height), 1, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }

  // 验证验证码
  validate(code) {
    const code1 = code.toLowerCase();
    const v_code = this.options.code.toLowerCase();
    // console.log(code1 + ' ---- ' + v_code);

    if (code1 === v_code) {
      return true;
    } else {
      this.refresh();
      return false;
    }
  }

  // 生成字母数组
  getAllLetter() {
    const letterStr =
      'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z';
    return letterStr.split(',');
  }

  // 生成一个随机数
  randomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  // 生成一个随机色
  randomColor(min, max) {
    const r = this.randomNum(min, max);
    const g = this.randomNum(min, max);
    const b = this.randomNum(min, max);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
}
