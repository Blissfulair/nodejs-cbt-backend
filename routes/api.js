const express = require('express')
const bcrypt = require('bcryptjs')
const {Op,or} = require('sequelize')
const db = require('../db/config')
const queryInterface = db.getQueryInterface()
const jwt = require('jsonwebtoken')
const fs = require('fs')
const pa = require('path')
const decompress = require('decompress');
const readXlsxFile = require('read-excel-file/node')
const modelGenerator = require('../generator')
const tableGenerator = require('../table')
require('../helpers')
const Cbt = require('../models/cbt')
const User = require('../models/user')
const Activity = require('../models/activity')
const Admin = require('../models/admin')
const Result = require('../models/result')
const Setting = require('../models/setting')
const Subject = require('../models/subject')
const Upload = require('../models/upload')

Activity.hasMany(Result, {foreignKey:'reg_no', sourceKey:'reg_no'})
Result.belongsTo(Activity, {foreignKey:'reg_no', targetKey:'reg_no'})
Activity.belongsTo(User, {foreignKey:'reg_no', targetKey:'reg_no'})

const Excel = require('excel4node')
const wb = new Excel.Workbook()
const ws = wb.addWorksheet('Sheet 1')

const authMiddleware = require('../middleware/auth')
const authMiddleware2 = require('../middleware/auth2')
const date = new Date()
const month = date.getMonth()+1
const today = date.getFullYear()+''+(month<10?'0'+month:month)+''+(date.getDate()<10?'0'+date.getDate():date.getDate())
const reg = date.getFullYear()+''+(month<10?'0'+month:month)
const router = express.Router()
/**
 * ########################################################
 * FUNCTIONS
 * #######################################################
 */
const uploadFile =async(req, path)=>{
    try{
        if(req.files){
            const file = req.files.file;
            const uploaded = await Upload.findOne({where:{file:`${file.md5}.zip`}})
            if(!uploaded){
                await file.mv(pa.join(__dirname, `/../public/uploads/${path}/${file.md5}.zip`), (e)=>{
                    if(e)
                    return null
                })
                await Upload.create({file:`${file.md5}.zip`})
                return pa.join(__dirname, `/../public/uploads/${path}/${file.md5}.zip`)
            }
            else{
                return 'file'
            }

        }
        else{
            return null
        }
    }
    catch(e){console.log(e)}
}
const uploadImage =async(req, path)=>{
    try{
        if(req.files){
            const file = req.files.image;
            await file.mv(pa.join(__dirname, `/../public/uploads/${path}/${file.md5}.jpg`), (e)=>{
                if(e)
                return null
            })
            return `public/uploads/${path}/${file.md5}.jpg`
    
        }
        else{
            return null
        }
    }
    catch(e){console.log(e)}
}
/**
 * ##############################################################
 * FRONTEND
 * ##############################################################
 */
router.get('/get_center', async(req,res)=>{
    try{
        const cbt = await Cbt.findByPk(1);
        if(cbt)
            res.status(200).json({center:cbt.name})
        else
            res.status(200).json({center:''})
    }
    catch(e){
        console.log(e)
    }
})
router.post('/login', async(req,res)=>{
    const {reg_no} = req.body;
    try{
        const user = await User.findOne({where:{reg_no:reg_no}})
        const setting = await Setting.findByPk(1);
        if(user){
           const login =  await bcrypt.compare(reg_no, user.password)
            if(login){
                const activity = await Activity.findOne({where:{reg_no:reg_no, day:today}, order:[['createdAt', 'DESC']]})
                // if($setting->type != 0){
                    
                    if(activity){
                        if((activity.submitted == 1 || activity.time_left == 0) && activity.day == today){
                           return res.status(200).json({message:'Sorry, you have already taken this Exam', status:401});
                        }
                        else if((activity.submitted == 0 || activity.time_left == 7200) && activity.day == today){
                            //$type = $activity->paper_type >= 2? 0 : ($activity->paper_type)+1;
                            //$activity->paper_type = $type;
                            //activity.time_left = 7200;
                            activity.submitted = 0;
                            if(setting.type != 0)
                            activity.mode = 1;
                            else
                            activity.mode = 0;
                            activity.save(); 
                        }
                    }
                }
                // else{
                //     if(activity){
                //         if(activity.submitted == 1 || activity.time_left == 0){
                //             // $type = $activity->paper_type >= 9? 0 : ($activity->paper_type)+1;
                //             // $activity->paper_type = $type;
                //             activity.time_left = 7200;
                //             activity.submitted = 0;
                //             activity.mode = 0;
                //             activity.save();
                //         }
                //      }
                //  }
                if(user){
                    return res.status(200).json({user:user, status:200, token:jwt.sign({userId:user.id}, 'cbt')});
                }else{
                    return res.status(200).json({user:user, message:'not logged in', status:200});
                }
                
            //}
        }
        return res.status(200).json({status:404, message:'Invalid Reg number'});
    }
    catch(e){console.log(e)}
})

router.get('/token', authMiddleware, (req, res)=>{
    res.status(200).json({
        id:req.user.id,
        reg_no:req.user.reg_no,
        subject1:req.user.subject1,
        subject2:req.user.subject2,
        subject3:req.user.subject3,
        subject4:req.user.subject4,
        image:req.user.image,
        name:req.user.name,
        id1:req.user.subject1_id,
        id2:req.user.subject2_id,
        id3:req.user.subject3_id,
        id4:req.user.subject4_id,
        message:'Logged in successfully'
    })
})
router.get('/activity/:id', async(req,res)=>{
    const {id} = req.params
    try{
        const user = await User.findByPk(id);
        let activity = await Activity.findOne({where:{reg_no:user.reg_no, day:today},order:[['createdAt','DESC']]})   
            if(!activity){
                activity = await Activity.create({
                    reg_no:user.reg_no,
                    time_left:7200,
                    day:today,
                    paper_type: 0//substr(str_shuffle('012'), 1,1),
                });
            }
            else if(activity.time_left <= 0){
                return res.status(200).json({activity:activity, message:'Exam has ended'});
            }
        return res.status(200).json({activity:activity, message:'success'});
    }
    catch(e){console.log(e)}
})
router.get('/setting', async(req,res)=>{
    try{
        const setting =  await Setting.findByPk(1);
        if(!setting)
        setting = '';
        return res.status(200).json({setting:setting});
    }
    catch(e){
        console.log(e)
    }
})
router.get('/questions/:reg_no/:subject1/:subject2/:subject3/:subject4', async(req,res)=>{
    const {reg_no, subject1,subject2,subject3,subject4} = req.params
    
    try{
        const activity = await Activity.findOne({where:{reg_no:reg_no, day:today}})
        const subj1 = await Subject.findOne({where:{name:subject1}})
        const s1 = await require(`../models/${subj1.model}`).findAll({where:{paper_type:activity.paper_type}, order:[['createdAt', 'DESC']], limit:60})
        const subj2 = await Subject.findOne({where:{name:subject2}})
        const s2 = await require(`../models/${subj2.model}`).findAll({where:{paper_type:activity.paper_type}, order:[['createdAt', 'DESC']], limit:40})
        const subj3 = await Subject.findOne({where:{name:subject3}})
        const s3 = await require(`../models/${subj3.model}`).findAll({where:{paper_type:activity.paper_type}, order:[['createdAt', 'DESC']], limit:40})
        const subj4 = await Subject.findOne({where:{name:subject4}})
        const s4 = await require(`../models/${subj4.model}`).findAll({where:{paper_type:activity.paper_type}, order:[['createdAt', 'DESC']], limit:40})
    
        return res.status(200).json({
                                subject1:s1, 
                                subject1_id:subj1.id, 
                                subject2:s2, 
                                subject2_id:subj2.id,
                                subject3:s3, 
                                subject3_id:subj3.id,
                                subject4:s4, 
                                subject4_id:subj4.id
                            });
    }
    catch(e){
        console.log(e)
    }
})
router.get('/answered/:reg_no/:s1/:s2/:s3/:s4/:paper_type', async(req,res)=>{
    const {reg_no,s1,s2,s3,s4,paper_type} = req.params
    const subject1 = await Result.findAll({where:{
        reg_no:reg_no,
        paper_type:paper_type,
        day:today,
        subject_id:s1
    }})
    const subject2 = await Result.findAll({where:{
        reg_no:reg_no,
        paper_type:paper_type,
        day:today,
        subject_id:s2
    }})
    const subject3 = await Result.findAll({where:{
        reg_no:reg_no,
        paper_type:paper_type,
        day:today,
        subject_id:s3
    }})
    const subject4 = await Result.findAll({where:{
        reg_no:reg_no,
        paper_type:paper_type,
        day:today,
        subject_id:s4
    }})
    return res.status(200).json({results:{
        subject1:subject1,
        subject2:subject2,
        subject3:subject3,
        subject4:subject4,
    }, total:subject1.length+subject2.length+subject3.length+subject4.length});
})
router.patch('/time', async(req,res)=>{
    const {reg_no,time} = req.body
    try{
        const activity = await Activity.findOne({where:{reg_no:reg_no,day:today},order:[['createdAt', 'DESC']]});
        activity.time_left = time;
        if( activity.save()){
            return res.status(200).json({time:activity.time_left});
        }
    }
    catch(e){console.log(e)}
})
router.post('/save_answers', async(req,res)=>{
    try{
        for(let i=1; i <= 4; i++){
            const questions = req.body['subject'+i]
            if(questions.length > 0){
                questions.forEach(async(quest )=>{
                        let ans = 0
                    if(Object.keys(quest).length == 8){ // number of items in the quest variable
                        if(quest['option'] == quest['answer']){
                            ans = 1;
                        }else{
                            ans = 0;
                        }
                    }
                     else{
                        ans = quest['answer'];
                    }
                    let answer = await Result.findOne({where:{
                        question_id:quest['question_id'],
                        reg_no:quest['reg_no'],
                        day:today,
                        paper_type:quest['paper_type'],
                        subject_id:quest['subject_id']
                    }})
                 if(!answer){
                     answer= await Result.create({
                         reg_no:quest['reg_no'],
                         paper_type:quest['paper_type'],
                         day:today,
                         question_id:quest['question_id'],
                         answer:ans,
                         options:quest['options'],
                         subject_id:quest['subject_id'],
                         amount:quest['amount'],
                     });
                 }else{
                         answer.reg_no=quest['reg_no'];
                         answer.paper_type=quest['paper_type'];
                         answer.day=today;
                         answer.question_id=quest['question_id'];
                         answer.answer=ans;
                         answer.options=quest['options'];
                         answer.subject_id=quest['subject_id'];
                         answer.save();
                 }
                })
            }
        }
    
        return res.status(200).json({
            status:200,
            message:'Saved successfully',
            // request:req 
        });
    }
    catch(e){console.log(e)}
})
router.patch('/end_exam', async(req, res)=>{
    const {reg_no} =req.body
    try{
        const activity = await Activity.findOne({where:{reg_no:reg_no,day:today}});
        if(activity){
            if(activity.time_left > 0){
            activity.time_left = 0;
            }
            activity.submitted = 1;
            if(activity.save()){
                return res.status(200).json({status:'success', message:'successfully submited', activity:activity});
            }
        }
    }
    catch(e){
        console.log(e)
    }
})
/**
 * ##############################################################
 * BACKEND
 * ##############################################################
 */
 router.post('/save_admin', async(req,res)=>{
    const {name,email,phone,password} = req.body
    try{
        let filename = null;
        filename = await uploadImage(req,'admins')
        const pwd = await bcrypt.hash(password, bcrypt.genSaltSync(8));
        let admin = await Admin.findOne({where:{name:name,email:email}})
        if(!admin){
            admin = await Admin.create({
                name:name,
                phone:phone,
                email:email,
                image:filename,
                password:pwd
            });
            if(admin){
                return res.status(200).json({message:'successful'});
            }
        }
        if(admin){
            return res.status(200).json({message:'User Already Exists'});
        }else{
            return res.status(200).json({message:'Operation was not successful'});
        }
    }
    catch(e){console.log}
})
 router.post('/admin_login', async(req,res)=>{
    const {email,password} = req.body;
    try{
        const admin = await Admin.findOne({where:{email:email}})
        if(admin){
           const login =  await bcrypt.compare(password, admin.password)
            if(login){
                    return res.status(200).json({message:'successful', status:200, token:jwt.sign({adminId:admin.id}, 'cbt')});
                }else{
                    return res.status(200).json({message:'not logged in', status:200});
                }
                
            //}
        }
        return res.status(200).json({status:404, message:'User not found'});
    }
    catch(e){console.log(e)}
})
router.get('/token2', authMiddleware2, (req, res)=>{
    res.status(200).json({
        id:req.admin.id,
        email:req.admin.email,
        image:req.admin.image,
        name:req.admin.name,
        message:'Logged in successfully'
    })
})

router.get('/subjects', async(req,res)=>{
    try{
        const subjects = await Subject.findAll();
        const end = 'ABCDEFGHIABCEDFIHHIECDAIEFCAEF'.shuffle().substr(5,2);
        let reg_no = 'GL'+reg;
        const cand = await User.findAll({where:{reg_no:{
            [Op.like]:reg_no+'%'
        }}});
        if(cand.length< 10)
            reg_no += '00'+cand.length+end;
        else if(cand.length >= 10 && cand.length < 100)
            reg_no += '0'+cand.length+end;
        else
            reg_no += cand.length+end;
        return res.status(200).json({subjects:subjects, reg_no:reg_no});
    }
    catch(e){console.log}
})

router.post('/save_candidate', async(req,res)=>{
    const {name,email,phone,reg_no} = req.body
    try{
        const subjects = JSON.parse(req.body.subjects);
        const subjectsID = JSON.parse(req.body.subjectsID)
        let filename = null;
        filename = await uploadImage(req,'candidates')
        //$file = $request->file('file');
        const password = await bcrypt.hash(reg_no, bcrypt.genSaltSync(8));
        let candidate = await User.findOne({where:{name:name,email:email}})
        if(!candidate){
            candidate = await User.create({
                name:name,
                phone:phone,
                email:email,
                reg_no:reg_no,
                subject1:subjects[0],
                subject2:subjects[1],
                subject3:subjects[2],
                subject4:subjects[3],
                subject1_id:subjectsID[0],
                subject2_id:subjectsID[1],
                subject3_id:subjectsID[2],
                subject4_id:subjectsID[3],
                image:filename,
                password:password
            });
            if(candidate){
                return res.status(200).json({message:'successful'});
            }
        }
        if(candidate){
            return res.status(200).json({message:'User Already Exists'});
        }else{
            return res.status(200).json({message:'Operation was not successful'});
        }
    }
    catch(e){console.log}
})

router.get('/candidates/:limit/:offset', async(req,res)=>{
    const {offset,limit} = req.params
    try{
        const num = offset * limit;
        const candidates = await User.findAll({order:[['createdAt', 'DESC']],limit:limit,offset:num})
        return res.status(200).json({candidates:candidates});
    }
    catch(e){console.log}
})
router.get('/candidate/:id', async(req,res)=>{
    const {id}=req.params
    try{
        const candidate = await User.findByPk(id);
        return res.status(200).json({candidate:candidate});
    }
    catch(e){console.log}
})

router.post('/candidate_update', async(req,res)=>{
    const {name,email,phone,user_id} = req.body
    try{
        const subjects = JSON.parse(req.body.subjects);
        const subjectsID = JSON.parse(req.body.subjectsID)
        let filename = null;
        filename = await uploadImage(req,'candidates')

        const candidate = await User.findByPk(user_id);
        if(name != '')
        candidate.name= name;
        if(email != '')
        candidate.email= email;
        if(phone != '')
        candidate.phone= phone;
        if(filename)
        candidate.image= filename;
        if(subjects.length>1){
            candidate.subject2= subjects[1];
            candidate.subject3= subjects[2];
            candidate.subject4= subjects[3];
            candidate.subject2_id= subjectsID[1];
            candidate.subject3_id= subjectsID[2];
            candidate.subject4_id= subjectsID[3];
        }
        // candidate.subject2= $request->subject2;
        // candidate.subject3= $request->subject3;
        // candidate.subject4= $request->subject4;
        if(candidate.save()){
            return res.status(200).json({message:'successful'});
        }else{
            return res.status(200).json({message:'failed'});
        }
    }
    catch(e){console.log}
})

router.get('/destroy_candidate/:id', async(req,res)=>{
    const {id} =req.params
    try{
        const candidate = await User.findByPk(id);
        if(candidate.destroy())
            return res.status(200).json({message:'successful'});
        else
            return res.status(200).json({message:'Delete Operation Failed'});
    }
    catch(e){console.log}
})


router.post('/save_question', async(req,res)=>{
        const {question,a,b,c,d,answer} = req.body
       let filename = null;
       filename = await uploadImage(req,'questions')

          const subject = await Subject.findByPk(req.body.subject);
          const check_exist = await require(`../models/${subject.model}`).findOne({where:{question:question}});
          if(!check_exist){
              if(subject){
                  const quest= await require(`../models/${subject.model}`).create({
                       question:question,
                       a:a,
                       b:b,
                       c:c,
                       d:d,
                       answer:answer.toLowerCase(),
                       paper_type: '012'.shuffle().substr(0,1),
                       image:filename
                  });
                   if(quest)
                       return res.status(200).json({message:'successful'});
                   else
                       return res.status(200).json({message:'Post  failed to create'});
               }else
                   return res.status(200).json({message:'Post post with this title already exists'});
   
          }
})
router.post('/update_question', async(req,res)=>{
    const {question,a,b,c,d,answer,question_id, paper_type} = req.body
    try{
        let filename = null;
        filename =  await uploadImage(req,'questions')

            const subject = await Subject.findByPk(req.body.subject);
            const quest = await require(`../models/${subject.model}`).findByPk(question_id);
            if(quest){
                if(quest != '')
                quest.question=question;
                if(a != '')
                quest.a=a;
                if(b != '')
                quest.b=b;question
                if(c != '')
                quest.c=c;
                if(d != '')
                quest.d=d;
                if(answer != '')
                quest.answer=answer.toLowerCase();
                if(paper_type != '')
                quest.paper_type=paper_type;//substr(str_shuffle('0123456789'), 5,1),
                if(filename)
                quest.image=filename;
                    if(quest.save())
                        return res.status(200).json({message:'successful'});
                    else
                        return res.status(200).json({message:'Post  failed to update'});

            }
    }
    catch(e){console.log}
})
router.get('/manage_question/:id/:limit/:offset', async(req,res)=>{
    const {id,limit,offset} = req.params
    try{
        const num = offset * limit;
            const subject = await Subject.findByPk(id);
            const questions = await require(`../models/${subject.model}`).findAll({order:[['createdAt', 'DESC']], limit:limit, offset:num});
            return res.status(200).json({message:'updated', subject:subject.name, questions:questions});
    }
    catch(e){console.log}
})
router.get('/get_question/:subject_id/:question_id', async(req,res)=>{
    const {subject_id,question_id} = req.params
    try{
        const subject = await Subject.findByPk(subject_id);
        const question = await require(`../models/${subject.model}`).findByPk(question_id);
        return res.status(200).json({question:question});
    }
    catch(e){console.log}
})
router.get('/destroy_question/:subject_id/:question_id', async(req,res)=>{
    const {subject_id,question_id} = req.params
    try{
        const subject = await Subject.findByPk(subject_id);
        const question = await require(`../models/${subject.model}`).findByPk(question_id);
        if(question.destroy())
        return res.status(200).json({message:'successful'});
    else
        return res.status(200).json({message:'Delete Operation Failed'});
    }
    catch(e){console.log}
})
router.post('/save_subject', async(req,res)=>{
    
    const {name} = req.body
    const model = name.charAt(0).toUpperCase()+name.substr(1)
    const content = modelGenerator(model)
    const tableContent = tableGenerator()
    let subject = await Subject.findOne({where:{name:model}});
    const filename = name.toLowerCase().replace(/[.]/g,'').replace(/\s/g, '_').replace(/[-]/g,'_')
    if(!subject){
       subject = await Subject.create({
            name:model,
            model:filename
       });
        if(subject)
            {
                try{
                    await fs.writeFileSync(__dirname+`/../models/${filename}.js`,content)
                    queryInterface.createTable(filename,tableContent)
                    return res.status(200).json({message:`subject ${model} was created successfully`});
                }
                catch(e){
                    console.log(e)
                }

            }
        else
            return res.status(200).json({message:`subject ${model} failed to create`});
    }else
        return res.status(200).json({message:`subject ${model} already exists`});
})
router.get('/manage_results/:limit/:offset', async(req,res)=>{
    const {limit,offset} = req.params
    try{
        const num = offset * limit;
        const results = await Activity.findAll({attributes:['day'],order:[['createdAt', 'DESC']],group:['day'], limit:limit, offset:num})
        return res.status(200).json({results:results});
    }
    catch(e){console.log}
})
router.get('/view_results/:day/:limit/:offset',async(req,res)=>{
    const {day,limit,offset} = req.params
    try{
        num = offset * limit;
        let details = {};
        const count = await Activity.findAll({where:{day:day}});
        const submitted = await Activity.findAll({where:{submitted:1, day:day}});
        const results = await Activity.findAll({where:{day:day}, limit:limit, offset:num, include:[User,Result]});
        
        results.forEach((result)=>{
            const subject_id1 =result.user.subject1_id;
            const subject_id2=result.user.subject2_id;
            const subject_id3 =result.user.subject3_id;
            const subject_id4 =result.user.subject4_id;
            const attempted = result.results.filter(r=>(r.day==day && r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal1 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id1 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal2 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id2 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal3 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id3 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal4 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id4 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));

            const c1 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id1 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const c2 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id2 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const c3 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id3 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const c4 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id4 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const qt1 = qtotal1.length> 0? qtotal1[0].amount: 1
            const qt2 = qtotal2.length> 0? qtotal2[0].amount: 1
            const qt3 = qtotal3.length> 0? qtotal3[0].amount: 1
            const qt4 = qtotal4.length> 0? qtotal4[0].amount: 1
            const total1 = Math.ceil(c1.length*(100/ (qt1)));
            const total2 = Math.ceil(c2.length*(100/ (qt2)));
            const total3 = Math.ceil(c3.length*(100/ (qt3)));
            const total4 = Math.ceil(c4.length*(100/ (qt4)));
            details[result.reg_no] = {
                name:result.user.name,
                subject1:result.user.subject1,
                subject2:result.user.subject2,
                subject3:result.user.subject3,
                subject4:result.user.subject4,
                qtotal1:qt1,
                qtotal2:qt2,
                qtotal3:qt3,
                qtotal4:qt4,
                total1:total1,
                total2:total2,
                total3:total3,
                total4:total4,
                qtotal:qt1+qt2+qt3+qt4,
                //'qtotal'=>'180',
                total:total1+total2+total3+total4,
                submitted:result.submitted?'<span class="btn btn-primary btn-xs">true</span>':'<span class="btn btn-danger btn-xs">false</span>',
                attempted:attempted.length,
            };
        })
        details['count']=count.length;
        details['submitted']=submitted.length;
        return res.status(200).json({results:results, details:details})
    }
    catch(e){console.log}
})
router.get('/update_setting/:mode', async(req,res)=>{
    const {mode} = req.params
    try{
        const setting = await Setting.findByPk(1);
        if(!setting){
            await Setting.create({
                type:mode
            })
            return res.status(200).json({message:'sucessful'});
        }
        setting.type= mode;
        if(setting.save()){
            return res.status(200).json({message:'sucessful'});
        }else{
            return res.status(200).json({message:'failed'});
        }
    }
    catch(e){console.log}
})
router.post('/center', async(req,res)=>{
    const {name} = req.body
    try{
        let center = await Cbt.findByPk(1);
        if(!center){
            center = await Cbt.create({
                            name:name
            });
            if(center)
                return res.status(200).json({message:'Created Successfully'});
        }else{
            center.name = name;
            if(center.save())
                return res.status(200).json({message:'Updated Successfully'});
        }
    }
    catch(e){console.log}
})
router.get('/relogin/:reg_no', async(req,res)=>{
    const {reg_no} = req.params
    const user = await Activity.findOne({where:{reg_no:reg_no, day:today}, order:[['createdAt', 'DESC']]});
    if(user){
        const type = user.paper_type >= 2? 0 : (user.paper_type)+1;
        user.submitted = 0;
        user.paper_type = type;
        user.time_left = 7200;
        if(user.save())
            return res.status(200).json({message:'successful'});
        else
            return res.status(200).json({message:'Re-Login Failed, Please Try Again!!'});
    }
    return res.status(200).json({message:'This Candidate Has Not Started Exam'});
})
router.get('/export_candidate/:start/:end', async(req, res)=>{
    const{start,end}=req.params
    const candidate = await User.findAll({where:{createdAt:{[Op.gte]:start}, createdAt:{[Op.lte]:end}}});
    return res.status(200).json({candidate:candidate});
})
router.get('/candidate_export/:start/:end', async(req, res)=>{
    const{start,end}=req.params
    const center = await Cbt.findByPk(1);
    const candidates = await User.findAll({where:{createdAt:{[Op.gte]:start}, createdAt:{[Op.lte]:end}}});
    ws.cell(1,1,1,8, true).string(`LIST OF REGISTERED CANDIDATES FROM ${start} TO ${end}`).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:14},alignment:{horizontal:['center']}})
    ws.cell(2,1).string('S/N').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,2,2,3, true).string('NAMES').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,4).string('REG NO').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,5,2,8, true).string('SUBJECTS').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    candidates.forEach((candidate, i)=>{
        ws.cell(i+3,1).number(i+1).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9},alignment:{horizontal:['center']}})
        ws.cell(i+3,2,i+3,3, true).string(candidate.name).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,4).string(candidate.reg_no).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9},alignment:{horizontal:['center']}})
        ws.cell(i+3,5).string('Use of English').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,6).string(candidate.subject2).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,7).string(candidate.subject3).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,8).string(candidate.subject4).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
    })
    return wb.write(`${center.name.toLowerCase()} candidate list for ${start} to ${end}.xlsx`, res)
})

router.get('/export/:day', async(req, res)=>{
    const{day}=req.params
    const center = await Cbt.findByPk(1);
    const results = await Activity.findAll({where:{day:day}, include:[User,Result]});
    ws.cell(1,1,1,13, true).string(`${center.name} RESULT FOR ${day}`).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:14},alignment:{horizontal:['center']}})
    ws.cell(2,1).string('S/N').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,2,2,3, true).string('NAME').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,4).string('REG NO').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,5,2,12, true).string('SUBJECTS').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    ws.cell(2,13).string('TOTAL').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:10},alignment:{horizontal:['center']}})
    results.forEach((result,i)=>{
        const subject_id1 =result.user.subject1_id;
        const subject_id2=result.user.subject2_id;
        const subject_id3 =result.user.subject3_id;
        const subject_id4 =result.user.subject4_id;
        const qtotal1 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id1 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
        const qtotal2 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id2 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
        const qtotal3 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id3 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
        const qtotal4 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id4 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));

        const c1 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id1 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
        const c2 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id2 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
        const c3 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id3 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
        const c4 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id4 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
        const qt1 = qtotal1.length> 0? qtotal1[0].amount: 1
        const qt2 = qtotal2.length> 0? qtotal2[0].amount: 1
        const qt3 = qtotal3.length> 0? qtotal3[0].amount: 1
        const qt4 = qtotal4.length> 0? qtotal4[0].amount: 1
        const total1 = Math.ceil(c1.length*(100/ (qt1)));
        const total2 = Math.ceil(c2.length*(100/ (qt2)));
        const total3 = Math.ceil(c3.length*(100/ (qt3)));
        const total4 = Math.ceil(c4.length*(100/ (qt4)));
        ws.cell(i+3,1).number(i+1).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9},alignment:{horizontal:['center']}})
        ws.cell(i+3,2,i+3,3, true).string(result.user.name).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,4).string(result.reg_no).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9},alignment:{horizontal:['center']}})
        ws.cell(i+3,5).string('Use of English').style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,6).number(total1).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,7).string(result.user.subject2).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,8).number(total2).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,9).string(result.user.subject3).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,10).number(total3).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,11).string(result.user.subject4).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,12).number(total4).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:9}})
        ws.cell(i+3,13).number(total1+total2+total3+total4).style({border:{bottom:{style:['thin'],color:'black'},top:{style:['thin'],color:'black'},right:{style:['thin'],color:'black'},left:{style:['thin'],color:'black'}},font:{size:12, bold:true},alignment:{horizontal:['center']}})
    })

    return wb.write(`${center.name.toLowerCase()} result for ${day}.xlsx`, res)
})
router.post('/import_questions', async(req,res)=>{
    const path = 'db'
    try{
        const file = await uploadFile(req, path)
        if(file == 'file')
        return  res.status(200).json({message:'This file is already uploaded'})
        const destination = pa.join(__dirname, `/../public/uploads/questions/`)
       if(file){
           const files = await decompress(file, destination)
           files.forEach(async f=>{
               if(f.path.includes('.xlsx')){
                   const modelName = f.path.split('.xlsx')[0]
                   const data = []
                   const rows = await readXlsxFile(destination + f.path)
                   rows.forEach(row=>{
                       data .push({
                           question :row[1],
                           image:row[2]=='NULL'?null:'public/uploads/questions/'+row[2],
                           a:row[3],
                           b:row[4],
                           c:row[5],
                           d:row[6],
                           answer:row[7],
                           paper_type:row[8]
                       })

                   })

                  const create= await require(`../models/${modelName}`).bulkCreate(data)
                  if(create){
                      fs.unlinkSync(destination + f.path)
                  }
               }
           })
           fs.unlinkSync(file)
           return  res.status(200).json({message:'Uploaded Successfully'})
       }
       return res.status(200).json({message:'Required Files are missing'})
    }
    catch(e){console.log(e)}
    
})
router.get('/filter_question/:id/:search/:limit', async(req,res)=>{
    const {id, search, limit} =req.params
    const subject = await Subject.findByPk(id);

    const questions = await require(`../models/${subject.model}`).findAll({where:or(
        {question:{[Op.like]:`%${search}%`}},
        {a:{[Op.like]:`%${search}%`}},
        {b:{[Op.like]:`%${search}%`}},
        {c:{[Op.like]:`%${search}%`}},
        {d:{[Op.like]:`%${search}%`}},
        {answer:{[Op.like]:`%${search}%`}},
    ),
    limit:limit
    })
    return res.status(200).json({questions:questions});
})
router.get('/filter/:search/:limit',async(req,res)=>{
    const {search,limit} =req.params
    const candidates = await User.findAll({where:or(
        {reg_no:{[Op.like]:`%${search}%`}},
        {name:{[Op.like]:`%${search}%`}},
        {phone:{[Op.like]:`%${search}%`}}
    ),
    limit:limit
    })
    return res.status(200).json({candidates:candidates});
})
router.get('/results_filter/:day/:search/:limit/:offset', async(req,res)=>{
    const {day,search,limit,offset} = req.params
    try{
        num = offset * limit;
        let details = {};
        const results = await Activity.findAll({where:{day:day}, limit:limit, offset:num, include:[{
            model:User,
            where:or(
                {reg_no:{[Op.like]:`%${search}%`}},
                {name:{[Op.like]:`%${search}%`}}
            )
        },Result]});
 
        results.forEach((result)=>{
            const subject_id1 =result.user.subject1_id;
            const subject_id2=result.user.subject2_id;
            const subject_id3 =result.user.subject3_id;
            const subject_id4 =result.user.subject4_id;
            const attempted = result.results.filter(r=>(r.day==day && r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal1 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id1 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal2 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id2 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal3 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id3 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));
            const qtotal4 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id4 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no));

            const c1 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id1 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const c2 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id2 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const c3 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id3 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const c4 = result.results.filter(r=>(r.day==day && r.subject_id==subject_id4 &&  r.paper_type == result.paper_type && r.reg_no == result.reg_no && r.answer == 1));
            const qt1 = qtotal1.length> 0? qtotal1[0].amount: 1
            const qt2 = qtotal2.length> 0? qtotal2[0].amount: 1
            const qt3 = qtotal3.length> 0? qtotal3[0].amount: 1
            const qt4 = qtotal4.length> 0? qtotal4[0].amount: 1
            const total1 = Math.ceil(c1.length*(100/ (qt1)));
            const total2 = Math.ceil(c2.length*(100/ (qt2)));
            const total3 = Math.ceil(c3.length*(100/ (qt3)));
            const total4 = Math.ceil(c4.length*(100/ (qt4)));
            details[result.reg_no] = {
                name:result.user.name,
                subject1:result.user.subject1,
                subject2:result.user.subject2,
                subject3:result.user.subject3,
                subject4:result.user.subject4,
                qtotal1:qt1,
                qtotal2:qt2,
                qtotal3:qt3,
                qtotal4:qt4,
                total1:total1,
                total2:total2,
                total3:total3,
                total4:total4,
                qtotal:qt1+qt2+qt3+qt4,
                //'qtotal'=>'180',
                total:total1+total2+total3+total4,
                submitted:result.submitted?'<span class="btn btn-primary btn-xs">true</span>':'<span class="btn btn-danger btn-xs">false</span>',
                attempted:attempted.length,
            };
        })
        return res.status(200).json({results:results, details:details})
    }
    catch(e){console.log}
})
router.get('/refresh', async(req,res)=>{
    const subjects = await Subject.findAll();
    subjects.forEach(async subject=>{
        const questions = await require(`../models/${subject.model}`).findAll();
        questions.forEach(question=>{
            const paper_type = '012'.shuffle().substr(2,1);
            question.paper_type =paper_type;
            question.save();
        })
    })
    return res.status(200).json({message:'Questions Refreshed'});
})
module.exports = router
