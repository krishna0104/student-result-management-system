const mongoose=require("mongoose");
const studentSchema = new mongoose.Schema({
    class:{
        type : String,
        required:true
    },
    section:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    rollNo:{
        type:Number,
        required:true,
        min:1,
        max:60,
    },
    marks:{
        type:[String],
        required:true
    }
});
const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    }
});
const classSchema=new mongoose.Schema({
    _id:{
        type:String,
        required:true
    },
    class:{
        type:String,
        required:true
    },
    section:{
        type:String,
        required:true
    },
    subjects:{
        type:[String],
        required:true
    },
    noOfStudents:{
        type:String,
        required:true
    }
});
const noticeSchema=new mongoose.Schema({
    subject:{
        type:String,
        required:true
    },
    body:{
        type:String,
        required:true
    }    
});

const notice = mongoose.model("notice",noticeSchema);
const student=mongoose.model("student",studentSchema);
const admin=mongoose.model("admin",adminSchema);
const class1=mongoose.model("class",classSchema);

module.exports = { student,admin,class1,notice };