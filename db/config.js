const {Sequelize} = require('sequelize') 

const db = new Sequelize('cbt', 'user', 'pass', {
    dialect:'sqlite',
    host:'./cbt.sqlite'
})

module.exports = db