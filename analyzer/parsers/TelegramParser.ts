import { Parser } from "../Parser";
import { Author, Database, ID, Message } from "../Types";

export class TelegramParser extends Parser {

    parse(files: string[]): Database {
        let messages: Message[] = [];
        let authors = new Map<ID, Author>();
        let titles: string[] = [];
        for(let file_content of files) {
            let data = JSON.parse(file_content);
            titles.push(data.name);
            console.log(data);

            for(let msg of data.messages) {
                if(msg.type === "message") {
                    messages.push({
                        type: "message",
                        author: msg.from_id+'',
                        content: this.parseTextArray(msg.text),
                        date: new Date(msg.date),
                    });
                }
                if(!authors.has(msg.from_id)) {
                    let author: Author = {
                        id: msg.from_id,
                        name: msg.from,
                        bot: false
                    };
                    authors.set(msg.from_id, author);
                }
            }
        }

        return {
            platform: "telegram",
            title: titles.length === 1 ? titles[0] : `${titles.length} Telegram chats`,
            // TODO: fix
            channels: [{
                id: "",
                messages,
                name: titles[0]
            }],
            authors
        };
    }

    parseTextArray(text: any): string {
        if(typeof text === "string") {
            return text;
        } else {
            // TODO: parse text array correctly
            return text.map((t: any) => t.text).join(" ");
        }
    }

}
