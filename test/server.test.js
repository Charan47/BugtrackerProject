let chai=require('chai');
let chaiHttp = require("chai-http");
let R = require('../server');
const conn =  require('../server');
const app = require('../server');
const request = require('request');

chai.should();


chai.use(chaiHttp);

// describe("Field test",function(){
//   let num = 6;
//   it('check the function is numeric',function(){
//     assert.isString(num);
//   });
// });

describe('TasksAPI',() => {

//Test the GET route
  describe("GET/login",() => {
    it("It should get tasks done",(done)=> {
      str1 = "abc@gmail.com";
      chai.request(R)
        .get("/login"+str1)
        .end((err,response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
        //  response.body.should.have.property("designation");
        done();
        })
      })
  })
//Test another get method
describe("GET/settings",() => {
  it("It should get tasks done",(done)=> {
    chai.request(R)
      .get("/settings")
      .end((err,response) => {
        response.should.have.status(200);
      //  response.body.should.be.a("array");
      done();
      })
    })
})

//Test the POST route
// describe("POST/register",() => {
// //
//     // before((done)=>{
//        conn.connect()
//     //   .then(()=>done())
//     //   .catch((err)=>done(err));
//     // })
//     // after((done)=>{
//     //   conn.close()
//     //   .then(()=>done())
//     //   .catch((err)=>done(err));
//     // })
//     chai.request(R)
//     it("It should create a user with some attributes",(done)=> {
//       request(app).post("/register")
//       .send({
//         name : "Abhinku",
//         designation : "tester",
//         email : "asdjhs@gmail.com"
//
//       })
//       .then((res) => {
//       //  response.should.have.status(200);
//       const body = response.body;
//       expect(body).to.contain.property('name');
//       expect(body).to.contain.property('designation');
//         response.body.should.be.a("object");
//         //response.body.should.have.property('name').eq("AbhinavKumar");
//       done();
//       })
//     })
// })

describe("POST/register",() => {


    it("It should create a user with some attributes",(done)=> {
      const user = {
        name : "Abhink",
        designation : "tester",
        email : "abhink@gmail.com"
      };
      chai.request(R)
      .post("/register")
      .send(user)
      .end((err,response) => {
       response.should.have.status(200);
      //const body = response.body;
      //expect(body).to.contain.property('name');
      //expect(body).to.contain.property('designation');
      //  response.body.should.be.a("object");
        //response.body.should.have.property('name').eq("AbhinavKumar");
      done();
      })
    })
})




})
