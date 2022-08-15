const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const schema=require("./schema");
const app=express();
var current_username="";
var notice=[]
mongoose.connect("mongodb://localhost:27017/srmDB",{useNewUrlParser:true});
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/",(req,res)=>{
    schema.notice.find(function(err,result){
        if(err){
            console.log(err.message);
        }
        else{
            console.log(result);
            if(result==""){
                var arr=[]
                res.render("home",{notice:arr});
            }
            else{
                res.render("home",{notice:result});
                notice=result;
            }
        }
    });
});
app.get("/admin",(req,res)=>{
    res.render("admin");
});
app.get("/student",(req,res)=>{
    res.render("student");
});
app.get("/about",(req,res)=>{
    res.render("about");
})
app.post("/student",(req,res)=>{  
    a=req.body;
    console.log(a);
    schema.student.findOne({class:req.body.class,section:req.body.section,rollNo:req.body.rollNo,password:a.password},function(err,result){
        console.log(result);
        if(err){
            console.log(err.message);
        }
        else{
            console.log(result);
            if(result==null){
                res.render("alert",{message:"Please Enter correct Details",choice:1});
            }
            else{
                const aid=a.class+"-"+a.section;
                schema.class1.findById(aid,function(err1,result1){
                    if(err1){
                        console.log(err1.message);
                    }
                    else{
                        if(result1!=null){
                            res.render("studentResult",{classNum:a.class,section:a.section,rollNo:a.rollNo,firstname:result.firstName,lastname:result.lastName,marks:result.marks,subjects:result1.subjects});
                        }
                        else{
                            res.render("alert",{message:"Please Enter correct Details",choice:1});
                        }   
                    }
                });
            }
        }
    });       
});
app.post("/admin",(req,res)=>{ 
    console.log(req.body);
   if(req.body.username==undefined){
        console.log(current_username);
        schema.admin.findOne({username:current_username},function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                     if(result==null){
                         console.log("invalid credentials");
                         res.render("alert",{message:"Server Restarted...Please Login again",choice:2});
                     }
                     else{
                         console.log(result);
                         console.log("valid credentials");
                         let dashboard ={dnoOfClasses:0,dnoOfStudents:0,dnoOfNotices:0};
                         console.log(dashboard);
                         schema.class1.find(function(err,result){
                          if(err){
                              console.log(err.message);
                           }
                           else{
                               dashboard.dnoOfClasses=result.length;
                               console.log(dashboard.dnoOfClasses);
                           }
                         })
                        schema.student.find(function(err,result){
                          if(err){
                              console.log(err.message);
                           }
                            else{
                                dashboard.dnoOfStudents=result.length;
                            }
                        })
                        schema.notice.find(function(err,result){
                           if(err){
                               console.log(err.message);
                            }
                           else{
                                dashboard.dnoOfNotices=result.length;
                                res.render("main",{classes:dashboard.dnoOfClasses,students:dashboard.dnoOfStudents,notices:dashboard.dnoOfNotices});
                            }
                        })
                        }
                 }
            });
    }    
    else{
    schema.admin.findOne({username:req.body.username,password:req.body.password},function(err,result){
       if(err){
           console.log(err.message);
       }
       else{
        console.log("result:");   
        console.log(result);
        if(result==null){
            console.log("invalid credentials");
            res.render("alert",{message:"Please Enter correct Login Details",choice:2});
            
        }
        else{
            console.log(result);
            console.log("valid credentials");
            let dashboard ={dnoOfClasses:0,dnoOfStudents:0,dnoOfNotices:0};
            schema.class1.find(function(err,result){
                if(err){
                    console.log(err.message);
                 }
                 else{
                     dashboard.dnoOfClasses=result.length;
                 }
               })
              schema.student.find(function(err,result){
                if(err){
                    console.log(err.message);
                 }
                  else{
                      dashboard.dnoOfStudents=result.length;
                  }
              })
              schema.notice.find(function(err,result){
                 if(err){
                     console.log(err.message);
                  }
                 else{
                      dashboard.dnoOfNotices=result.length;
                      res.render("main",{classes:dashboard.dnoOfClasses,students:dashboard.dnoOfStudents,notices:dashboard.dnoOfNotices});
                  }
              })
              console.log(dashboard);
              current_username=result.username;
              console.log(current_username);
            
        }
    } 
    });
    }
});
app.post("/admin/createclass",(req,res)=>{
    res.render("createclass");
});
app.post("/admin/classSubjects",(req,res)=>{
    let a=req.body;
        if((a.class=="--")||(a.section=="--")){
            console.log("enter valid details");
            res.render("alert",{message:"Please Enter correct Class Details",choice:3});
        }
        else{
            schema.class1.find({class:a.class,section:a.section},function(err,result){
                if(err){
                    console.log(err);
                }
                else
                {
                    try{
                        if(result=="")
                        {
                            console.log("confirm");
                            res.render("classSubjects",{classNum:a.class,section:a.section,number:0});
                        }
                        else{
                            console.log("already exists");
                            res.render("alert",{message:"Class already exists",choice:3});
                        }
                        }
                        catch(err){
                            console.log(err);
                        }
                }
                });
            }
    });
app.post("/admin/createclass/subjects",(req,res)=>{
    let a=req.body;
    console.log(a);
    let noOfSubjects="";
    let aclass=a.btn.slice(0,a.btn.length-2);
    let asection=a.btn.slice(-1);
    if(a.subjects==""){
        noOfSubjects=0;
    }
    else{
        noOfSubjects = Number(a.subjects);
    }
    if(a.subject==undefined){
        res.render("classSubjects",{classNum:aclass,section:asection,number:noOfSubjects});
    }
    else{
        let flag=1;
        for(let i=0;i<a.subject.length;i++){
            if(a.subject[i]==""){
                flag=0;
                break;
            }
        }
        if(flag==0){
            console.log("subject cannot be empty");
            res.render("classSubjects",{classNum:aclass,section:asection,number:noOfSubjects});
        }else{
            schema.class1.create({_id:a.btn,class:aclass,section:asection,subjects:a.subject,noOfStudents:0},function(err,result){
                if(err){
                    console.log(err);
                }else{
                    console.log(result);
                }
            });
            res.render("alert",{message:"Class Created Successfully",choice:3});
        }    
    }
    
});
app.post("/admin/createstudent",(req,res)=>{
        res.render("createStudent");
});
app.post("/admin/createstudent/subjects",(req,res)=>{
    let a=req.body;
    console.log(a);
    console.log(a.firstName);
    if(a.firstname==undefined){
        console.log("firstname");
        console.log(a.firstName);
        aid=a.class+"-"+a.section;
        schema.class1.findById(aid,function(err,result){
            if(err){
                console.log(err);
            }else{console.log("class");
                console.log(result);
                if(result==undefined){
                    res.render("alert",{message:"Class Does Not Exist",choice:3});
                }
                else{
                    
                    console.log(result.subjects);
                    res.render("createStudentSubjects",{classNum:a.class,section:a.section,subjects:result.subjects,rollNo:Number(result.noOfStudents)+1});
                }
            }
        });
    }
    else{
        let flag=0;
        b=req.body
        for(let i=0;i<b.marks.length;i++){
            if(b.marks[i]==""){
                flag=1;
                break;
            }
        }
        if((b.firstname=="")||(b.lastname=="")||(b.password=="")){
            flag=1;
        }
        if(flag==1){
            res.render("alert",{message:"Please Enter All Details",choice:3});
        }
        else{
        let b=req.body;
        console.log("b body");
        console.log(b);
        let aclass=b.btn.slice(0,b.btn.length-2);
        let asection=b.btn.slice(-1);
        schema.student.create({class:aclass,section:asection,firstName:b.firstname,lastName:b.lastname,rollNo:b.rollNo,marks:b.marks,password:b.password},function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log("schema");
                console.log(a.rollNo);
                console.log(result);
                schema.class1.findByIdAndUpdate(b.btn,{noOfStudents:b.rollNo},function(err1,result1){
                    if(err){
                        console.log(err1);
                    }
                    else{
                        console.log(result1);
                    }
                });
                res.render("alert",{message:"Student Created Successfully",choice:3});
            }
        });
    }
   }
});
app.post("/admin/editclass",(req,res)=>{
    const a=req.body;
    console.log(a);
    if((a.class==undefined)||(a.class=="--")||(a.section=="--")){
        res.render("editclass");
        console.log("welcome");
    }
    else{
        schema.class1.find({class:a.class,section:a.section},function(err,result){
            if(err){
                console.log(err);
            }
            else
            {
                try{
                    if(result=="")
                    {
                        console.log("class does not exit");
                        res.render("alert",{message:"Class Does Not Exist",choice:3});
                    }    
                    else{
                        console.log("class exists");

                        res.render("editclass2",{classNum:a.class,section:a.section,subjects:result[0].subjects});
                    }
                }
                catch(err){
                    console.log(err);
                }
                
            }
        });
    }
});
app.post("/admin/editclass2",(req,res)=>{
    const b = req.body;
    console.log(b);
    schema.class1.findOne({class:b.class,section:b.section},function(err,result){
        if(err){
            console.log(err);
        }
        else{
            console.log(result);
            if(result==null){
                res.render("alert",{message:"Class Does Not Exist",choice:3});
            }
            else{
            let subject=result.subjects;
            for(let i=0;i<subject.length;i++){
                if(b.subjects[i]!=""){
                    subject[i]=b.subjects[i];
                }
            }
            schema.class1.findByIdAndUpdate(b.btn,{subjects:subject},function(err,result){
                if(err){
                    console.log(err.message);
                }
                else{
                    console.log("replaced");
                    res.render("alert",{message:"Class Edited Successfully",choice:3});
                }
            });
        }
    }
    });
});
app.post("/admin/deleteclass",(req,res)=>{
    a=req.body;
    console.log(a);
    if((a.class==undefined)||(a.class=="--")||(a.section=="--")){
        res.render("deleteclass");
        console.log("welcome");
    }
    else{
        const id=a.class+"-"+a.section;
        schema.class1.findByIdAndDelete(id,function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                if(result!=null){
                    schema.student.deleteMany({class:a.class,section:a.section},function(err1,result1){
                        console.log("student section");
                        if(err1){
                            console.log(err1);
                        }
                        else{
                            console.log(result1);
                            res.render("alert",{message:"Class Deleted Successfully",choice:3});
                        }
                    });
                }
                else{
                    res.render("alert",{message:"Class Does Not Exist",choice:3});
                }
            }
        });
    }
});
app.post("/admin/editstudent",(req,res)=>{
    const a=req.body;
    if((a.class==undefined)||(a.class=="--")||(a.section=="--")||(a.rollNo=="")){
        res.render("editstudent");
        console.log("welcome");
    }
    else{
        schema.student.findOne({class:a.class,section:a.section,rollNo:a.rollNo},function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                const aid=a.class+"-"+a.section;
                console.log(result);
                if(result!=null){
                    schema.class1.findById(aid,function(err1,result1){
                        if(err1){
                            console.log(err1.message);
                        }
                        else{
                            console.log("class subjects");
                            console.log(result1);
                            res.render("editstudent2",{classNum:result.class,section:result.section,
                                rollNo:result.rollNo,marks:result.marks,subjects:result1.subjects,
                                firstname:result.firstName,lastname:result.lastName});
                        }
                    });
                }
                else{
                    res.render("alert",{message:"Student Does Not Exist",choice:3});
                }
            }
        });
    }
});
app.post("/admin/editstudent2",(req,res)=>{
    a=req.body;
    let aclass=a.btn.slice(0,a.btn.length-2);
    let asection=a.btn.slice(-1);
    schema.student.findOne({class:aclass,section:asection,rollNo:a.rollNo},function(err,result){
        if(err){
            console.log(err.message);
        }
        else{
            let amarks=result.marks;
            let afirstname=result.firstName;
            let alastname=result.lastName;
            if((afirstname!=a.firstname)&&(a.firstname!="")){
                afirstname=a.firstname;
            }
            if((alastname!=a.lastname)&&(a.lastname!="")){
                alastname=a.lastname;
            }
            for(i=0;i<amarks.length;i++){
                if(amarks[i]!=a.marks[i]){
                    amarks[i]=a.marks[i];
                }
            }
            schema.student.updateOne({class:aclass,section:asection,rollNo:a.rollNo},{marks:amarks,firstName:afirstname,lastName:alastname},function(err1,result1){
                if(err1){
                    console.log(err.message);
                }
                else{
                    console.log(result1);
                    res.render("alert",{message:"Student Edited Successfully",choice:3});
                }
            });
        }
    });
    
});
app.post("/admin/deletestudent",(req,res)=>{
    a=req.body;
    if((a.class==undefined)||(a.class=="--")||(a.section=="--")||(a.rollNo=="")){
        res.render("deletestudent");
    }
    else{
        schema.student.findOne({class:a.class,section:a.section,rollNo:a.rollNo},function(err,result){
            if(err){
                console.log(err);
            }
            else{
                console.log(result);
                if(result==null){
                    res.render("alert",{message:"Please Enter proper student details",choice:3});
                }
                else{
                    const aid=a.class+"-"+a.section;
                    schema.class1.findById(aid,function(err1,result1){
                        if(err1){
                            console.log(err1.message);
                        }
                        else{
                            if(result1!=null){
                                res.render("deletestudent2",{classNum:a.class,section:a.section,rollNo:a.rollNo,firstname:result.firstName,lastname:result.lastName,marks:result.marks,subjects:result1.subjects});
                            }
                            else{
                                res.render("deletestudent");
                            }   
                        }
                    });
                }
            }
        });
    }
});
app.post("/admin/deletestudent2",(req,res)=>{
    a=req.body;
    console.log(a);
    schema.student.deleteOne({class:a.class,section:a.section,rollNo:a.rollNo},function(err,result){
        if(err){
            console.log(err.message);
        }
        else{
            console.log(result);
            schema.class1.findOne({class:a.class,section:a.section},function(err1,result1){
                if(err){
                    console.log(err.message);
                }
                else{
                    let kk=result.noOfStudents-1;
                    schema.class1.updateOne({class:a.class,section:a.section},{noOfStudents:kk})
                }
            })
            console.log("student deleted");
            res.render("alert",{message:"Student Deleted Successfully",choice:3});
        }
    });
});
app.post("/admin/createnotice",(req,res)=>{
    a=req.body;
    if((a.subject==undefined)||(a.body=="")||(a.subject=="")){
        res.render("createnotice");
    }
    else{
        schema.notice.create({subject:a.subject,body:a.body},function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                res.render("alert",{message:"Notice Created Successfully",choice:3});
            }
        })
    }
});
app.post("/admin/editnotice",(req,res)=>{
    a=req.body;
    console.log(a);
    if((a.btn==undefined)){
        schema.notice.find(function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                res.render("editnotice",{notice:result});
            }
        });
    }
    else{
        schema.notice.find(function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                let c=Number(a.btn)
                console.log(result[c]);
                res.render("editnotice2",{notice:result[c],num:c});
            }
        });
    }
});
app.post("/admin/editnotice2",(req,res)=>{
    const a=req.body;
    console.log(a);
    if((a.subject=="")||(a.body=="")){
        res.render("alert",{message:"Subject and Body Cannot Be Empty",choice:3});
    }
    else{let c=Number(a.btn)
        schema.notice.find(function(err,result){
            if(err){
                console.log(err.message);
            }else{
                schema.notice.updateOne({_id:result[c]._id},{subject:a.subject,body:a.body},function(err,result){
                    if(err){
                        console.log(err.message);
                    }
                    else{
                        console.log(result);
                        res.render("alert",{message:"Notice Edited Successfully",choice:3});
                    }
                });
            }
        })
    }
})
app.post("/admin/deletenotice",(req,res)=>{
    a=req.body;
    console.log(a);
    if(a.btn!=undefined){
        schema.notice.find(function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                let c=Number(a.btn)
                console.log(typeof(a.btn));
                console.log(c);
                schema.notice.deleteOne({_id:result[c]._id},function(err1,result1){
                    if(err1){
                        console.log(err.message);
                    }
                    else{
                        console.log("deleted successfully");
                        console.log(result1);
                        schema.notice.find(function(err,result){
                            if(err){
                                console.log(err.message);
                            }
                            else{
                                console.log(result);
                                res.render("deletenotice",{notice:result});
                            }
                        });
                    }
                })
            }
        });
    }
    else{
        schema.notice.find(function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                res.render("deletenotice",{notice:result});
            }
        });
    }
    
});
app.post("/admin/changepassword",(req,res)=>{
    a=req.body;
    console.log(a);
    console.log(current_username);
    if(a.current_password==undefined){
        res.render("changepassword",{username:current_username});
    }
    else{
        schema.admin.findOne({username:current_username,password:a.current_password},function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                if(result==null){
                    res.render("alert",{message:"Current Password is wrong",choice:3});
                }
                else{
                    schema.admin.updateOne({username:current_username},{password:a.new_password},function(err1,result1){
                        if(err1){
                            console.log(err1.message);
                        }
                        else{
                            console.log(result1);
                            console.log("changed password successfully");
                            res.render("alert",{message:"Password Changed Successfully",choice:3});
                        }
                    });
                }
            }
        });
    }
});
app.post("/admin/showstudents",(req,res)=>{
    a=req.body;
    console.log(a);
    let students=[]
    if(a.class==undefined){
        res.render("showstudents",{classNum:"-",section:"-",students:students});
    }
    else{
        schema.student.find({class:a.class,section:a.section},function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                if(result==""){
                    res.render("alert",{message:"Class Does Not Exist",choice:3});
                }
                else{
                    students=result;
                    res.render("showstudents",{classNum:a.class,section:a.section,students:students});
                }   
            }
        })
        
    }
})
app.post("/admin/showclasses",(req,res)=>{
    let classes=[]
        schema.class1.find(function(err,result){
            if(err){
                console.log(err.message);
            }
            else{
                console.log(result);
                if(result==""){
                    res.render("alert",{message:"No Classes Exist",choice:3});
                }
                else{
                    classes=result;
                    res.render("showclasses",{classes:classes});
                }   
            }
        })
})

app.listen(process.env.PORT,()=>{
    console.log("server running at port 3000...");
});
