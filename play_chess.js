var discord = require('discord.js')
var bot = new discord.Client({maxCachedMessages: 0})
var request = require('request')
var mysql      = require('mysql')
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'user',
  password : 'password',
  database : 'discord_chess'
})
bot.login('[discord key here]')

// Start

bot.on('ready', function (){
    console.log("ChessGame connected")
    setInterval(function(){
        var number_serv = bot.guilds.size
        var debug_mode = 0
        if(debug_mode === 1){
            bot.user.setGame('Maintenance :(', 'https://www.twitch.tv/chessbot').catch(console.error)
        } else if(number_serv >= 2){
            bot.user.setGame(number_serv+' servers | !ch help', 'https://www.twitch.tv/chessbot').catch(console.error)
        } else {
            bot.user.setGame(number_serv+' server | !ch help', 'https://www.twitch.tv/chessbot').catch(console.error)
        }
        request.post({
              url: 'https://bots.discord.pw/api/bots/328151387579875339/stats',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': '[key here]'
              },
              body: '{"server_count":'+number_serv+'}'
        }, function (error, response, body){})
        request.post({
              url: 'https://discordbots.org/api/bots/328151387579875339/stats',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': '[key here]'
              },
              body: '{"server_count":'+number_serv+'}'
        }, function (error, response, body){})
    }, 30000)
    setInterval(function(){
        var local_time = Math.round(new Date().getTime()/1000)
        for (var index in db) {
            if((local_time - db[index]['timestamp']) >= 43200){
                db[index]['message'].clearReactions()
                delete db[index]
            }
        }
    }, 900000)
})

var db = {}

function create_tbl(){
    return [["","1","2","3","4","5","6","7","8"],
            ["A","%E2%99%96","%E2%99%99","","","","","%E2%99%9F","%E2%99%9C"],
            ["B","%E2%99%98","%E2%99%99","","","","","%E2%99%9F","%E2%99%9E"],
            ["C","%E2%99%97","%E2%99%99","","","","","%E2%99%9F","%E2%99%9D"],
            ["D","%E2%99%95","%E2%99%99","","","","","%E2%99%9F","%E2%99%9B"],
            ["E","%E2%99%94","%E2%99%99","","","","","%E2%99%9F","%E2%99%9A"],
            ["F","%E2%99%97","%E2%99%99","","","","","%E2%99%9F","%E2%99%9D"],
            ["G","%E2%99%98","%E2%99%99","","","","","%E2%99%9F","%E2%99%9E"],
            ["H","%E2%99%96","%E2%99%99","","","","","%E2%99%9F","%E2%99%9C"]]
}

function text_construct(id, callback){
    request('http://olavache.ovh/discord_chess_game.php?key=chess_some_key&insert='+JSON.stringify(db[id]['tbl'][db[id]['tbl'].length-1])+'&rotation='+db[id]['rotation'], function (response, body) {
    if(body != undefined){
      var url_http = 'http://olavache.ovh/discord_chess_game.php?r='+JSON.parse(body.body)['num_id']
      if(db[id]['tour_de'] == 'red'){
          var text = 'It\'s the turn of @'+db[id]['user'][0].username+' (:white_circle:)'
      } else {
          var text = 'It\'s the turn of @'+db[id]['user'][1].username+' (:black_circle:)'
      }
      var text_construct = {embed: {
                                color: 8872507,
                                author: {
                                  name: 'Party #'+db[id]['party_number'],
                                  icon_url: 'https://image.prntscr.com/image/wt8VKWhFTneGxFvT1P0LOw.png'
                                },
                                title: text,
                                description: '@'+db[id]['user'][0].username+' vs @'+db[id]['user'][1].username,
                                image:{
                                    url: url_http
                                },
                                footer: {
                                  icon_url: bot.users.get('218369745664081920').displayAvatarURL,
                                  text: 'Chess by '+bot.users.get('218369745664081920').tag
                                },
                                thumbnail: {
                                  url: 'https://image.prntscr.com/image/wt8VKWhFTneGxFvT1P0LOw.png'
                                }
                              }
                            }
     callback(text_construct)
    }
    });
}
function lettre_to_num(lettre){
    if(lettre == 'a'){
        return 1
    } else if(lettre == 'b'){
        return 2
    } else if(lettre == 'c'){
        return 3
    } else if(lettre == 'd'){
        return 4
    } else if(lettre == 'e'){
        return 5
    } else if(lettre == 'f'){
        return 6
    } else if(lettre == 'g'){
        return 7
    } else {
        return 8
    }
}
function switch_color_player(id){
    if(db[id]['tour_de'] == 'red'){
          db[id]['tour_de'] = 'blue'
      } else {
          db[id]['tour_de'] = 'red'
      }
}
function db_contain_id(id){
    for (var index in db) {
            if(db[index]['user'][0].id == id || db[index]['user'][1].id == id){
                return index
            }
    }
    return false
}

bot.on('message', message => {
  if(message.content.split(' ')[0] == '!ch'){
  if(message.content.search('!ch play') >= 0 && message.mentions.users.size === 1 && message.mentions.users.first().id !== bot.user.id && message.channel.type == 'text' && !db_contain_id(message.author.id) && !db_contain_id(message.mentions.users.first().id)){
      connection.query('INSERT INTO `number_party_started` (`date`, `number`) VALUES (CURRENT_DATE(), 1) ON DUPLICATE KEY UPDATE `number`=`number`+1', function(err) {if (err) throw err})
      var author_0 = message.author
      var author_1 = message.mentions.users.first()
      message.channel.send({embed: {color: 8872507,author: {name: 'Initialisation...',icon_url: 'https://image.prntscr.com/image/wt8VKWhFTneGxFvT1P0LOw.png'},thumbnail: {url: 'https://image.prntscr.com/image/wt8VKWhFTneGxFvT1P0LOw.png'}}})
        .then(message => {
          db[message.id] = new Array()
          db[message.id]['message'] = message
          db[message.id]['tbl'] = new Array()
          db[message.id]['tbl'].push(create_tbl())
          db[message.id]['tour_de'] = 'red'
          db[message.id]['timestamp'] = Math.round(new Date().getTime()/1000)
          db[message.id]['rotation'] = 0
          db[message.id]['user'] = new Array()
          db[message.id]['user'][0] = author_0
          db[message.id]['user'][1] = author_1
          connection.query('SELECT SUM(number) FROM number_party_started', function(err, rows) {if (err) throw err
          db[message.id]['party_number'] = rows[0]['SUM(number)']                                                                         
          text_construct(message.id, function(returnValue){
            message.edit(returnValue).catch()
            message.react('↩').then(MessageReaction => {
                message.react('❌').then(MessageReaction => {
                    message.react('🔁').catch()
                }).catch()
            }).catch()
          })
          })
        })
        .catch()
  } else if(message.content.search('!ch play') >= 0 && message.mentions.users.size === 1 && message.mentions.users.first().id !== bot.user.id && message.channel.type == 'text' && (db_contain_id(message.author.id) || db_contain_id(message.mentions.users.first().id))){
    message.reply('❗️ *Player(s) already on party*\n```!ch party leave```')
  } else if (message.content.search('!ch play') >= 0 && message.mentions.users.size === 1 && message.mentions.users.first().id === bot.user.id && message.channel.type == 'text'){
       message.reply('Playing with the bot is impossible for the moment :(')      
  }
    
  if(message.content.search('!ch party') >= 0 && 
     db[db_contain_id(message.author.id)] &&
     message.content.split(' ')[2] == 'move' &&
     message.content.split(' ')[3] &&
     message.content.split(' ')[3].length === 4 &&
     ( (db[db_contain_id(message.author.id)]['user'][0].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'red') 
        || 
       (db[db_contain_id(message.author.id)]['user'][1].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'blue') 
     ) 
    ){
      var id = db_contain_id(message.author.id)
      var move_string = message.content.split(' ')[3]
      var pos11 = lettre_to_num(move_string.split('')[0])
      var pos12 = move_string.split('')[1]
      var pos21 = lettre_to_num(move_string.split('')[2])
      var pos22 = move_string.split('')[3]
      if(((db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%99' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%98' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%97' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%96' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%95' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%94') && db[id]['tour_de'] == 'red') 
          || 
         ((db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%9F' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%9E' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%9D' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%9C' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%9B' ||
           db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] == '%E2%99%9A') && db[id]['tour_de'] == 'blue') 
         ){
          db[id]['tbl'].push(JSON.parse(JSON.stringify(db[id]['tbl'][db[id]['tbl'].length-1])))
          db[id]['tbl'][db[id]['tbl'].length-1][pos21][pos22] = db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12]
          db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] = ''
          switch_color_player(id)
          text_construct(id, function(returnValue){
                db[id]['message'].edit(returnValue).catch()
          })  
      }
      message.delete()
  } else if(message.content.search('!ch party') >= 0 && 
            db[db_contain_id(message.author.id)] &&
            message.content.split(' ')[2] == 'move' &&
            ((message.content.split(' ')[3] == '0-0') || (message.content.split(' ')[3] == 'O-O')) &&
            ( (db[db_contain_id(message.author.id)]['user'][0].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'red') 
                || 
              (db[db_contain_id(message.author.id)]['user'][1].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'blue') 
            )
  ){
        var id = db_contain_id(message.author.id)
        db[id]['tbl'].push(JSON.parse(JSON.stringify(db[id]['tbl'][db[id]['tbl'].length-1])))
        if(db[id]['tour_de'] == 'red'){
            db[id]['tbl'][db[id]['tbl'].length-1][7][1] = db[id]['tbl'][db[id]['tbl'].length-1][5][1]
            db[id]['tbl'][db[id]['tbl'].length-1][6][1] = db[id]['tbl'][db[id]['tbl'].length-1][8][1]
            db[id]['tbl'][db[id]['tbl'].length-1][5][1] = ''
            db[id]['tbl'][db[id]['tbl'].length-1][8][1] = ''
        } else {
            db[id]['tbl'][db[id]['tbl'].length-1][7][8] = db[id]['tbl'][db[id]['tbl'].length-1][5][8]
            db[id]['tbl'][db[id]['tbl'].length-1][6][8] = db[id]['tbl'][db[id]['tbl'].length-1][8][8]
            db[id]['tbl'][db[id]['tbl'].length-1][5][8] = ''
            db[id]['tbl'][db[id]['tbl'].length-1][8][8] = ''
        }
        switch_color_player(id)
        text_construct(id, function(returnValue){
            db[id]['message'].edit(returnValue).catch()
        })
        message.delete()
  } else if(message.content.search('!ch party') >= 0 && 
            db[db_contain_id(message.author.id)] &&
            message.content.split(' ')[2] == 'move' &&
            ((message.content.split(' ')[3] == '0-0-0') || (message.content.split(' ')[3] == 'O-O-O')) &&
            ( (db[db_contain_id(message.author.id)]['user'][0].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'red') 
                || 
              (db[db_contain_id(message.author.id)]['user'][1].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'blue') 
            )
  ){
        var id = db_contain_id(message.author.id)
        db[id]['tbl'].push(JSON.parse(JSON.stringify(db[id]['tbl'][db[id]['tbl'].length-1])))
        if(db[id]['tour_de'] == 'red'){
            db[id]['tbl'][db[id]['tbl'].length-1][3][1] = db[id]['tbl'][db[id]['tbl'].length-1][5][1]
            db[id]['tbl'][db[id]['tbl'].length-1][4][1] = db[id]['tbl'][db[id]['tbl'].length-1][1][1]
            db[id]['tbl'][db[id]['tbl'].length-1][5][1] = ''
            db[id]['tbl'][db[id]['tbl'].length-1][1][1] = ''
        } else {
            db[id]['tbl'][db[id]['tbl'].length-1][3][8] = db[id]['tbl'][db[id]['tbl'].length-1][5][8]
            db[id]['tbl'][db[id]['tbl'].length-1][4][8] = db[id]['tbl'][db[id]['tbl'].length-1][1][8]
            db[id]['tbl'][db[id]['tbl'].length-1][5][8] = ''
            db[id]['tbl'][db[id]['tbl'].length-1][1][8] = ''
        }
        switch_color_player(id)
        text_construct(id, function(returnValue){
            db[id]['message'].edit(returnValue).catch()
        })
        message.delete()
  } else if(message.content.search('!ch party') >= 0 && 
            db[db_contain_id(message.author.id)] &&
            message.content.split(' ')[2] == 'add' &&
            message.content.split(' ')[3] &&
            message.content.split(' ')[3].length === 2 &&
            message.content.split(' ')[4] &&
            ( (db[db_contain_id(message.author.id)]['user'][0].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'red') 
                || 
              (db[db_contain_id(message.author.id)]['user'][1].id == message.author.id && db[db_contain_id(message.author.id)]['tour_de'] == 'blue') 
            )
  ){
            var id = db_contain_id(message.author.id)
            var pos11 = lettre_to_num(message.content.split(' ')[3].split('')[0])
            var pos12 = message.content.split(' ')[3].split('')[1]
            
            if(message.content.split(' ')[4] == 'queen' && db[id]['tour_de'] == 'red'){
                var text_chess_piece = '%E2%99%95'
            } else if (message.content.split(' ')[4] == 'queen' && db[id]['tour_de'] == 'blue'){
                var text_chess_piece = '%E2%99%9B'
            } else if (message.content.split(' ')[4] == 'rook' && db[id]['tour_de'] == 'red'){
                var text_chess_piece = '%E2%99%96'
            } else if (message.content.split(' ')[4] == 'rook' && db[id]['tour_de'] == 'blue'){
                var text_chess_piece = '%E2%99%9C'
            } else if (message.content.split(' ')[4] == 'bishop' && db[id]['tour_de'] == 'red'){
                var text_chess_piece = '%E2%99%97'
            } else if (message.content.split(' ')[4] == 'bishop' && db[id]['tour_de'] == 'blue'){
                var text_chess_piece = '%E2%99%9D'
            } else if (message.content.split(' ')[4] == 'knight' && db[id]['tour_de'] == 'red'){
                var text_chess_piece = '%E2%99%98'
            } else if (message.content.split(' ')[4] == 'knight' && db[id]['tour_de'] == 'blue'){
                var text_chess_piece = '%E2%99%9E'
            } else if (message.content.split(' ')[4] == 'pawn' && db[id]['tour_de'] == 'red'){
                var text_chess_piece = '%E2%99%99'
            } else if (message.content.split(' ')[4] == 'pawn' && db[id]['tour_de'] == 'blue'){
                var text_chess_piece = '%E2%99%9F'
            } else  {
                var text_chess_piece = undefined
            }
            
            if(text_chess_piece != undefined){
                db[id]['tbl'].push(JSON.parse(JSON.stringify(db[id]['tbl'][db[id]['tbl'].length-1])))
                db[id]['tbl'][db[id]['tbl'].length-1][pos11][pos12] = text_chess_piece
                switch_color_player(id)
                text_construct(id, function(returnValue){
                    db[id]['message'].edit(returnValue).catch()
                })
            }
            message.delete()
  } else if (message.content.search('!ch party') >= 0 &&
            message.content.split(' ')[3] == 'move'
            ){
      message.delete()
  }
 
   if(message.content.search('!ch party leave') >= 0 && message.author.id !== bot.user.id){
        for (var index in db) {
            if((message.author.id == db[index]['user'][0].id || message.author.id == db[index]['user'][1].id)){
                message.reply('*You have left your chess game!*')
                db[index]['message'].clearReactions()
                delete db[index]
            }
        }
    }  
      
  if(message.content.search('!ch help') >= 0 && message.author.id !== bot.user.id){
      connection.query('SELECT SUM(number) FROM number_party_started', function(err, rows) {
            if (err) throw err
            var text_message = {embed: {
                            color: 8872507,
                            author: {
                              name: 'Help',
                              icon_url: 'https://image.prntscr.com/image/wt8VKWhFTneGxFvT1P0LOw.png'
                            },
                            title: 'Play a chess game in any Text Channel with your friends!',
                            fields:[{
                                name:'•',
                                value:'__**Commands:**__'
                            },{
                                name:'Start a Chess game:',
                                value:'```!ch play @<player 2 name>```'
                            },{
                                name:'Make a move _(if it is your turn)_:',
                                value:'```!ch party move <position 1><position 2>\n\nPromotion:\n!ch party add <position> <queen/rook/bishop/knight/pawn>\n\nCastling move:\n!ch party move 0-0\n!ch party move 0-0-0\n\nExample:\n!ch party move a1a3\n!ch party add d1 queen```'
                            },{
                                name:'Left a Chess game:',
                                value:'```!ch party leave```'
                            },{
                                name:'Back:',
                                value:'Use :leftwards_arrow_with_hook:'
                            },{
                                name:'Skip his turn:',
                                value:'Use :x:'
                            },{
                                name:'Rotate the game board:',
                                value:'Use :repeat:'
                            },{
                                name:'Help command:',
                                value:'```!ch help```'
                            },{
                                name:'•',
                                value:'__**Informations:**__'
                            },{
                                name:'Number of parties started:',
                                value:rows[0]['SUM(number)']+' !'
                            },{
                                name:'The official server, if you have any questions or requestes to make for the bot:',
                                value:'https://discord.gg/UP8dSWb'
                            }],
                            footer: {
                              icon_url: bot.users.get('218369745664081920').displayAvatarURL,
                              text: 'Chess by '+bot.users.get('218369745664081920').tag
                            },
                            thumbnail: {
                              url: 'https://image.prntscr.com/image/wt8VKWhFTneGxFvT1P0LOw.png'
                            }
                          }
                        }
            message.reply('help is on the way :mailbox:')
            message.author.send(text_message).catch(function(){
                message.channel.send(text_message).catch()
            })
        })
  }
  }
})

bot.on('messageReactionAdd', (messageReaction, user) => {
    if(db[messageReaction.message.id] && user.id !== bot.user.id){
        messageReaction.remove(user)
        if(db[messageReaction.message.id]['user'][0].id === user.id || db[messageReaction.message.id]['user'][1].id === user.id){
        if(messageReaction.emoji.name == '↩'){
            var id = messageReaction.message.id
            if(db[id]['tbl'].length >= 2){
                db[id]['tbl'].pop()
                switch_color_player(id)
                text_construct(id, function(returnValue){
                    db[id]['message'].edit(returnValue).catch()
                })
            }
        } else if(messageReaction.emoji.name == '🔁'){
            var id = messageReaction.message.id
            db[id]['rotation'] = (db[id]['rotation']+1)%4
            text_construct(id, function(returnValue){
                db[id]['message'].edit(returnValue).catch()
            })
        } else if(messageReaction.emoji.name == '❌'){
            if
            ( (db[messageReaction.message.id]['user'][0].id == user.id && db[messageReaction.message.id]['tour_de'] == 'red') 
                || 
              (db[messageReaction.message.id]['user'][1].id == user.id && db[messageReaction.message.id]['tour_de'] == 'blue') 
            )
            {
            var id = messageReaction.message.id
            switch_color_player(id)
            text_construct(id, function(returnValue){
                db[id]['message'].edit(returnValue).catch()
            })
            }
        }
        }
    }
})