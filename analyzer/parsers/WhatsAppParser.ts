import { Parser } from "../Parser";
import { Author, Database, ID, Message } from "../Types";

/*
    There is a convenient parser already out there
*/
import { parseStringSync } from "whatsapp-chat-parser";

export class WhatsAppParser extends Parser {

    parse(files: string[]): Database {
        let messages: Message[] = [];
        let authors = new Map<ID, Author>();
        for(let file_content of files) {
            let parsed = parseStringSync(file_content);
            for(let msg of parsed) {
                authors.set(msg.author, {
                    id: msg.author,
                    name: msg.author,
                    bot: false
                });
                if(msg.author !== "System") {
                    messages.push({
                        type: "message",
                        author: msg.author,
                        date: msg.date,
                        content: msg.message
                    });
                } else {
                    // TODO: parse system messages
                }
            }
        }

        return {
            platform: "whatsapp",
            title: "WhatsApp chat", // TODO: chat or group
            channels: [{
                id: "",
                messages,
                name: "Default"
            }],
            authors
        };
    }

}
