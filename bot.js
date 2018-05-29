//import discord.js libraries
const Discord = require("discord.js");
const config = require("./config.json");
const dex = require("./Pokedex.json");
const my_ver = require("./package.json").version;
const Hashes = require("jshashes");
const request = require("snekfetch");
let whitelist = config.WHITELIST.split(",");

function logEnter(message, logdata)
{
  if(bot.channels.get(config.LOG_ID) && bot.channels.get(config.LOG_ID).type == "text")
          bot.channels.get(config.LOG_ID).send(logdata);
        else if(bot.users.get(config.AUTHOR_ID))
          bot.users.get(config.AUTHOR_ID).send("Log Channel Invalid! Please set a valid one...");
        else
          message.channel.send("Log channel not found!");
}

//Bot instance and Playing message
var bot = new Discord.Client();
bot.on("ready", function() {
  console.log('Logged in as '+bot.user.username);
  bot.user.setActivity('out for p.help', { type: 'WATCHING' })
});

//error
bot.on("error", function(err) {
  console.error(err);
});

//When a message is received
bot.on("message", function(message) {

if(message.author == bot.user) return;
if(message.channel.type == "dm") return ;

//help
if(message.content.toLowerCase() == "p.help")
{
  var helpembed = new Discord.RichEmbed()
    .setTitle("~PokeMama Help Menu~")
    .addField("Commands", "!ping\t\t\t\t\t- ping the Bot\n!purge <count> - delete messages in the channel. (Default value: 0)\n!version\t\t\t   - Bot Version\n!name <url> \t  - pokemon name")
    .addBlankField()
    .addField("Info", "Author: "+(bot.users.get(config.AUTHOR_ID) || "RomeoPrince"))
    .setColor("0edcba");
  message.author.send(helpembed);
  message.channel.send(message.author+ ", Please check your DMs!")
}

//version
else if(message.content.toLowerCase() == "p.version")
  message.channel.send(my_ver);

//ping
else if(message.content.toLowerCase() == "p.ping")
  message.channel.send("Pong! "+parseInt(bot.ping)+"ms");

//purge
else if(message.content.toLowerCase().startsWith("p.purge"))
{
  var count = Number(message.content.substring(8)) + 1;
  if(count < 1 || isNaN(count) || count > 50)
  {
    message.channel.send("Invalid argument! Please try again.");
    return;
  }
  if(!message.guild.member(message.author).hasPermission("MANAGE_MESSAGES"))
    message.channel.send("You are not worthy! Get **MANAGE_MESSAGES** Permission...")
  else if(!message.guild.member(bot.user).hasPermission("MANAGE_MESSAGES"))
    message.channel.send("Gimme **MANAGE_MESSAGES** permission first, Senpai!");
  else 
  {
    let messagecount = count.toString();
      message.channel
        .fetchMessages({
          limit: messagecount
        })
        .then(messages => {
          message.channel.bulkDelete(messages);
          // Logging the number of messages deleted on logs channel.
          var delembed = new Discord.RichEmbed()
            .setTitle("Messages Purged!")
            .setThumbnail(message.guild.iconURL)
            .setColor("#ff0000")
            .setFooter(message.createdAt.toString().substring(0,message.createdAt.toString().indexOf('+')))
            .addField("Server", message.guild.name)
            .addField("Channel", message.channel.name)
            .addField("User", message.author)
            .addField("MessageCount", messagecount-1);
            logEnter(message, delembed);
        })
        .catch(err => {
          console.log("Error while doing Bulk Delete");
          console.log(err);
        });
  }
}

//Goodie n Classy
else if(message.content.toLowerCase() == "p!catch classy" && message.author.id == "366568101145214978")
{
  message.reply("Congratulations! You caught a Classy!");
}

//wot ish
else if(message.content.toLowerCase().startsWith("p.name "))
{
  if(message.member.roles.find("name", "A new role"))
  {
    request.get(message.content.substring(7))
    .then(r => {
      var md5 = new Hashes.MD5().hex(r.body.toString());
      var index = dex.table.findIndex(obj => obj.md5==md5);
      if(index == -1)
      return;
      message.channel.send(dex.table[index].name);
    });
  }
}

//When a New pokemon appears
else if(message.author.id == config.PARTNER_ID && ((whitelist.indexOf(message.guild.id) != -1) || message.channel.id == "438524476309635074"))
{
  message.embeds.forEach((embed) => {
    if(embed.title){
    if(embed.title.startsWith("A wild")){
      var purl=null;
      request.get(embed.image.url)
      .then(r => {
        purl = new Hashes.MD5().hex(r.body.toString());
        var index = dex.table.findIndex(obj => obj.md5==purl);
        if(index == -1)
          return;
        purl=dex.table[index].name;
        if(message.guild.id != config.LOLI_ID || !dex.table[index].catch)
          message.channel.send(purl);
        else
          message.channel.send("@Everyone, Its a "+purl+"!");
        var newpoke = new Discord.RichEmbed()
        .setTitle("New Pokemon Spotted!")
        .setThumbnail(message.guild.iconURL)
        .setColor("#22dd22")
        .setFooter(message.createdAt.toString().substring(0,message.createdAt.toString().indexOf('+')))
        .addField("Server", message.guild.name)
        .addField("Channel", message.channel.name)
        .addField("Pokemon", purl);
        logEnter(message, newpoke);
      });  
    }
  }
  });
}

});

//login with token
bot.login(process.env.BOT_TOKEN); 