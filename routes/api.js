const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('../helpers')
const Cbt = require('../models/cbt')
const User = require('../models/user')
const Activity = require('../models/activity')
const Admin = require('../models/admin')
const Result = require('../models/result')
const Setting = require('../models/setting')
const Subject = require('../models/subject')

require('../models/english')
require('../models/mathematics')
require('../models/chemistry')
require('../models/physics')
const authMiddleware = require('../middleware/auth')
const date = new Date()
const today = date.getFullYear()+''+(date.getMonth()+1)+''+(date.getDate()<10?'0'+date.getDate():date.getDate())
const router = express.Router()
console.log(today)
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
                        else if((activity.submitted == 0 || activity.time_left == 120) && activity.day == today){
                            //$type = $activity->paper_type >= 2? 0 : ($activity->paper_type)+1;
                            //$activity->paper_type = $type;
                            activity.time_left = 120;
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
                //             activity.time_left = 120;
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
    console.log(req.user)
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
                    time_left:120,
                    day:today,
                    paper_type: 1 //substr(str_shuffle('012'), 1,1),
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
    // const total = Result::where([
    //     'reg_no'=>$reg_no,
    //     'paper_type'=>$paper_type,
    //     'day'=>date('Ymd')
    // ])->get();
    // $subj1 = Subject::where('name', $subject1)->first();
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
    // $subj2 = Subject::where('name', $subject2)->first();
    // $subject2 = Result::where([
    //     'reg_no'=>$reg_no,
    //     'paper_type'=>$paper_type,
    //     'day'=>date('Ymd')
    // ])->where('subject_id', $subj2->id)->get();
    // $subj3 = Subject::where('name', $subject3)->first();
    // $subject3 = Result::where([
    //     'reg_no'=>$reg_no,
    //     'paper_type'=>$paper_type,
    //     'day'=>date('Ymd')
    // ])->where('subject_id', $subj3->id)->get();
    // $subj4 = Subject::where('name', $subject4)->first();
    // $subject4 = Result::where([
    //     'reg_no'=>$reg_no,
    //     'paper_type'=>$paper_type,
    //     'day'=>date('Ymd')
    // ])->where('subject_id', $subj4->id)->get();
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
/**
 * ##############################################################
 * BACKEND
 * ##############################################################
 */

module.exports = router
