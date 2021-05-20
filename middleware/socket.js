const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("time", response);
  };
// const setTimer = socket=>{
//     socket.on('timeLeft', async (data)=>{
//         const {reg_no,time} = data
//         try{
//             const activity = await Activity.findOne({reg_no:reg_no},null, {sort:{createdAt:-1}})//order:[['createdAt', 'DESC']]});
//             activity.time_left = time--;
//             activity.save()
//         }
//         catch(e){console.log(e)}
//     })
// }
  let interval;
module.exports = (io)=>{
    io.on('connection', (socket) => {
        console.log('Greetings from RN app',);
        if (interval) {
            clearInterval(interval);
          }
          interval = setInterval(() =>{
            getApiAndEmit(socket)
            // setTimer(socket)
          }, 1000);
          socket.on('disconnect', ()=>{
            console.log('disconnected socket')
        })
    })

    // websocket.emit('channel2', 'new channel');
    // websocket.on('channel1', (obj) => {
    // console.log('Object from RN app', obj);
    // })
}