// const url = `mongodb+srv://givitec:givitec2020@cluster0.sd71d.mongodb.net/cbt?retryWrites=true&w=majority`;
const url = "mongodb://localhost:27017/cbt"
const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}

module.exports = {
    url:url,
    connectionParams:connectionParams
}