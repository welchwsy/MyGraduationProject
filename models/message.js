/*
    this is a message class,
    use it send/get message in B/S    
*/
﻿function Message(message){
    this.name = message.name;
    this.info = message.info;
};
module.exports = Message;
