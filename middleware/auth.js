const jwt = require('jsonwebtoken')

const User = require('../models/user')
module.exports = (req, res, next)=>{
    const {authorization} = req.headers
    if(!authorization)
    return res.status(401).json({error:'You must be logged in to accsess this resource'})
    
    const token = authorization.replace('Bearer ', '')
    jwt.verify(token, 'cbt', async(err, payload)=>{
        if(err)
        return res.status(401).json({error:'You must be logged in to accsess this resource'})
        const {userId} = payload
        const user = await User.findById(userId)
        req.user = user
        next()
    })
}