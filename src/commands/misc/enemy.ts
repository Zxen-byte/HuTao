import { AutocompleteInteraction, CommandInteraction, Message, MessageEmbed } from "discord.js"
import config from "../../data/config.json"
import client from "../../main"
import Command from "../../utils/Command"
import { CommandSource, Enemy, SendMessage } from "../../utils/Types"
import { Bookmarkable, Colors, createTable, findFuzzyBestCandidates, getLink, getLinkToGuide, PAD_END, PAD_START, paginator, sendMessage, simplePaginator, urlify } from "../../utils/Utils"

export default class EnemyCommand extends Command {
    constructor(name: string) {
        super({
            name,
            category: "Misc",
            usage: "enemy [name]",
            help: `Displays enemy information. If no name is provided, a list of all enemies will be displayed.

Note: this command supports fuzzy search.`,
            aliases: ["en", "enemies"],
            options: [{
                name: "name",
                description: "Enemy name",
                type: "STRING",
                autocomplete: true,
                required: false
            }]
        })
    }

    async autocomplete(source: AutocompleteInteraction): Promise<void> {
        const targetNames = Object.keys(client.data.enemies)
        const search = source.options.getFocused().toString()

        if (search == "") {
            return await source.respond([
                { name: "List all enemies", value: "" },
                ...targetNames.filter((_, i) => i < 19).map(value => {
                    return { name: value, value }
                })
            ])
        }

        await source.respond(findFuzzyBestCandidates(targetNames, search, 20).map(value => {
            return { name: value, value }
        }))
    }

    async runInteraction(source: CommandInteraction): Promise<SendMessage | undefined> {
        return this.run(source, (source.options.getString("name") ?? "").split(/ +/g))

    }
    async runMessage(source: Message, args: string[]): Promise<SendMessage | undefined> {
        return this.run(source, args)
    }

    async run(source: CommandSource, args: string[]): Promise<SendMessage | undefined> {
        const { data } = client

        const name = args.join(" ")
        if (name.length == 0) {
            const pages = this.getEnemiesPages()
            if (pages.length == 0) return sendMessage(source, "No enemy data loaded")

            await simplePaginator(source, (relativePage, currentPage, maxPages) => this.getEnemiesPage(pages, relativePage, currentPage, maxPages), pages.length)
            return undefined
        }

        const enemy = data.getEnemyByName(name)
        if (enemy == undefined)
            return sendMessage(source, "Unable to find enemy")

        const pages: Bookmarkable[] = [{
            bookmarkEmoji: "📝",
            bookmarkName: "General",
            maxPages: 1,
            pages: (rp, cp, mp) => this.getMainEnemyPage(enemy, rp, cp, mp)
        }]
        if (enemy.desc)
            pages.push({
                bookmarkEmoji: "-",
                bookmarkName: "Lore",
                maxPages: 1,
                pages: (rp, cp, mp) => this.getLoreEnemyPage(enemy, rp, cp, mp),
                invisible: true
            })

        await paginator(source, pages)
        return undefined
    }


    getEnemiesPages(): string[] {
        const { data } = client
        const enemies = Object.entries(data.enemies)
            .map(([name, info]) => `${data.emoji(name, true)}${info.placeholder ? " [Not yet available]" : ""}`)

        const pages: string[] = []
        let paging = "", c = 0
        for (const enemy of enemies) {
            if (paging.length + enemy.length > 1800 || ++c > 15) {
                pages.push(paging.trim())
                paging = enemy
                c = 1
            } else
                paging += "\n" + enemy
        }
        if (paging.trim().length > 0) pages.push(paging)
        return pages
    }

    getEnemiesPage(pages: string[], relativePage: number, currentPage: number, maxPages: number): MessageEmbed | undefined {
        if (relativePage >= pages.length)
            return undefined

        const embed = new MessageEmbed()
            .setTitle("Enemies")
            .setURL(`${client.data.baseURL}enemies`)
            .setDescription(pages[relativePage])
            .setFooter(`Page ${currentPage} / ${maxPages} - See '${config.prefix}help enemy' for more info about what you can do`)
            .setColor(Colors.GREEN)

        return embed
    }

    getMainEnemyPage(enemy: Enemy, relativePage: number, currentPage: number, maxPages: number): MessageEmbed | undefined {
        const { data } = client
        const guides = data.getGuides("enemy", enemy.name).map(({ guide, page }) => getLinkToGuide(guide, page)).join("\n")
        const embed = new MessageEmbed()
            .setTitle(`${enemy.name}: Basic info`)
            .setURL(`${data.baseURL}enemies/${urlify(enemy.name, false)}`)
            .setColor(Colors.AQUA)
            .setFooter(`Page ${currentPage} / ${maxPages}`)
            .setDescription(`**Type**: ${enemy.type ?? "Unknown"}${enemy.kind ? ` (${enemy.kind})` : ""}${enemy.notes ? `\n\n${enemy.notes}` : ""}`)

        if (guides)
            embed.addField("Guides", guides)

        if (enemy.icon)
            embed.setThumbnail(getLink(enemy.icon))

        if (enemy.resistance)
            embed.addField("Resistances", `\`\`\`\n${createTable(["Pyro", "Elec", "Cryo", "Hydro", "Anemo", "Geo", "Phys", "Notes"], enemy.resistance, [PAD_START, PAD_START, PAD_START, PAD_START, PAD_START, PAD_START, PAD_START, PAD_END])}\n\`\`\``)

        return embed
    }

    getLoreEnemyPage(enemy: Enemy, relativePage: number, currentPage: number, maxPages: number): MessageEmbed | undefined {
        const embed = new MessageEmbed()
            .setColor(Colors.AQUA)
            .setFooter(`Page ${currentPage} / ${maxPages}`)
            .setTitle(`${enemy.name}: Description`)
            .setURL(`${client.data.baseURL}enemies/${urlify(enemy.name, false)}`)
            .setDescription(enemy.desc ?? "Unavailable")

        if (enemy.icon)
            embed.setThumbnail(getLink(enemy.icon))

        return embed
    }
}
