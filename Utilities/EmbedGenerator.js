import { MessageEmbed } from 'discord.js';
/**
 * 
 * @param {Object} data - {title:String, description:String, color?:String, url?:String, imageUrl?:String, footer?:Object, fields?:Array, author?:Object}
 * @param {String} title - The title of the embed
 * @param {String} description - The description of the embed
 * @param {String} color - The color of the embed
 * @param {String} url - The url of the embed (optional)
 * @param {String} imageUrl - The url of the image (optional)
 * @param {*} footer - The footer of the embed {text: "Text", iconURL: "https://..."} (optional)
 * @param {*} fields - The fields of the embed as array [{name: "Key", value: "Value", inline: true|false}, ...] (optional)
 * @returns Object
 */

export function CreateEmbed(data)
{
    const {
        title,
        description,
        color,
        url,
        imageUrl,
        footer,
        fields,
        author
    } = data
    const embed = new MessageEmbed();
    embed.setColor('#'+Math.floor(Math.random()*16777215).toString(16))
    .setTitle(title)
    .setDescription(description)
    .setThumbnail('https://i.imgur.com/6sh6Mng.png')
    .setTimestamp();
    if (url != undefined) embed.setURL(url);
    if (imageUrl != undefined) embed.setImage(imageUrl);
    if (footer != undefined) embed.setFooter(footer);
    if (author) embed.setAuthor({ name: 'Weedeej', iconURL: 'https://cdn-icons-png.flaticon.com/512/25/25231.png', url: 'https://github.com/weedeej' })
    if (color != undefined) embed.setColor(color);
    if (fields != undefined) {
        for (let i = 0; i < fields.length; i++) {
            embed.addField(fields[i].name, fields[i].value, fields[i].inline);
        }
    }
    
    return { embeds: [ embed ] };
}