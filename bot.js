//import discord.js libraries
const Discord = require("discord.js");
const config = require("./config.json");
const dex = require("./Pokedex.json");

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
  bot.user.setActivity('out for !help', { type: 'WATCHING' })
});

//When a message is received
bot.on("message", function(message) {

if(message.author == bot.user) return;
if(message.channel.type == "dm") return ;

//help
if(message.content.toLowerCase() == "!help")
{
  var helpembed = new Discord.RichEmbed()
    .setTitle("~PokeMama Help Menu~")
    .addField("Commands", "!ping\t\t\t\t\t- ping the Bot\n!purge <count> - delete messages in the channel. (Default value: 0)")
    .addBlankField()
    .addField("Info", "Author: "+(bot.users.get(config.AUTHOR_ID) || "RomeoPrince"))
    .setColor("0edcba");
  message.author.send(helpembed);
  message.channel.send(message.author+ ", Please check your DMs!")
}

//ping
else if(message.content.toLowerCase() == "!ping")
  message.channel.send("Pong! "+parseInt(bot.ping)+"ms");

//purge
else if(message.content.toLowerCase().startsWith("!purge"))
{
  var count = Number(message.content.substring(7)) + 1;
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

//wot ish
else if(message.content.toLowerCase().startsWith("was ist "))
{
  message.channel.send(dex.table[dex.table.findIndex(obj => obj.url==message.content.substring(8))].name);
}

//When a New pokemon appears
else if(message.author.id == config.PARTNER_ID)
{
  message.embeds.forEach((embed) => {
    if(embed.title){
    if(embed.title.startsWith("A wild")){
      var purl=embed.image.url;
      purl=dex.table[dex.table.findIndex(obj => obj.url==purl)].name;
      message.channel.send(purl);
      var newpoke = new Discord.RichEmbed()
        .setTitle("New Pokemon Spotted!")
        .setThumbnail(message.guild.iconURL)
        .setColor("#22dd22")
        .setFooter(message.createdAt.toString().substring(0,message.createdAt.toString().indexOf('+')))
        .addField("Server", message.guild.name)
        .addField("Channel", message.channel.name)
        .addField("Pokemon", purl);
        logEnter(message, newpoke);
    }
  }
  });
}

});

//login with token
bot.login(process.env.BOT_TOKEN);