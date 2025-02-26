import { AutocompleteInteraction, CommandInteraction, Message, MessageEmbed } from "discord.js"

import Command from "../../utils/Command"
import client from "../../main"
import { Colors, findFuzzyBestCandidates, getDate, sendMessage, simplePaginator } from "../../utils/Utils"
import { AbyssSchedule, CommandSource, SendMessage } from "../../utils/Types"
import config from "../../data/config.json"

const names: Record<string, string> = {
    "1/1": "Enemies",
    "1/2": "First Half",
    "2/2": "Second Half",
}
export default class AbyssCommand extends Command {
    constructor(name: string) {
        super({
            name,
            category: "Misc",
            usage: "abyss [cycle: yyyy-mm-1/yyyy-mm-2] [floor]",
            help: `Displays abyss information. If no arguments are provided, current floors will be listed.

If only a floor is proved (like \`${config.prefix}abyss 7\`), then this floor is directly displayed.

Old abyss floors/buffs can be accessed by giving the cycle (like \`${config.prefix}abyss 2020-12-2\`)`,
            aliases: ["spiral", "spiralabyss", "floor"],
            options: [{
                name: "floor",
                description: "Directly skip to a certain floor",
                type: "INTEGER",
                required: false
            }, {
                name: "cycle",
                description: "Specify a historical time (format: 'yyyy-mm-1' or 'yyyy-mm-2'. Example: 2020-12-2)",
                type: "STRING",
                required: false,
                autocomplete: true
            }]
        })
    }

    async autocomplete(source: AutocompleteInteraction): Promise<void> {
        const targetNames = client.data.getAbyssSchedules().map(s => s.start.substring(0, 7)).flatMap((s, i, arr) => `${s}-${i - arr.indexOf(s) + 1}`).reverse()
        const search = source.options.getFocused().toString()

        await source.respond(findFuzzyBestCandidates(targetNames, search, 20).map(value => {
            return { name: value, value }
        }))
    }

    async runInteraction(source: CommandInteraction): Promise<SendMessage | undefined> {
        const { options } = source
        return this.run(source, options.getInteger("floor") ?? -1, options.getString("cycle"))

    }
    async runMessage(source: Message, args: string[]): Promise<SendMessage | undefined> {
        let floor = -1
        let abyssSchedule: string | undefined

        for (const arg of args) {
            const matchedDate = arg.match(/^(\d\d\d\d)-(\d\d?)-(\d)$/)
            if (arg.match(/^\d+$/)) {
                floor = +arg
            } else if (matchedDate) {
                abyssSchedule = arg
            } else
                return sendMessage(source, `Unknown abyss argument \`${arg}\`.`)
        }

        return this.run(source, floor, abyssSchedule)
    }

    async run(source: CommandSource, floor: number, abyssSchedule?: string | null): Promise<SendMessage | undefined> {
        const { data } = client
        const schedule = data.getAbyssSchedules()
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let abyss = schedule.filter(schedule =>
            Date.now() >= getDate(schedule.start).getTime()
        ).pop()!

        if (abyssSchedule) {
            const matchedDate = abyssSchedule.match(/^(\d\d\d\d)-(\d\d?)-(\d)$/)
            if (!matchedDate)
                return sendMessage(source, `Unknown abyss schedule \`${matchedDate}\`.`)

            const [line, year, month, cycle] = matchedDate
            abyss = schedule.filter(s => s.start.startsWith(`${year}-${month.padStart(2, "0")}-`))?.[+cycle - 1]
            if (!abyss)
                return sendMessage(source, `Couldn't find abyss \`${line}\``)
        }
        if (!abyss)
            return sendMessage(source, "Couldn't find last abyss")
        if (floor > 0 && floor <= abyss.regularFloors.length)
            return sendMessage(source, this.getSpiralFloor(abyss.regularFloors[floor - 1], floor))

        const defaultPage = floor > 0 ? floor - abyss.regularFloors.length : 0

        await simplePaginator(source, (relativePage, currentPage, maxPages) => this.getSpiralAbyss(abyss, relativePage, currentPage, maxPages), 1 + abyss.spiralAbyssFloors.length, defaultPage)
        return undefined
    }

    getSpiralAbyss(abyss: AbyssSchedule, relativePage: number, currentPage: number, maxPages: number): MessageEmbed | undefined {
        const footer = `Page ${currentPage} / ${maxPages}`
        const embed = new MessageEmbed()
            .setColor(Colors.PURPLE)
            .setFooter(footer)

        if (relativePage == 0) {
            embed.setTitle(`Spiral Abyss: ${abyss.buff}`)
                .setDescription(abyss.buffDesc)
                .addField("Starts", abyss.start, true)
                .addField("Ends", abyss.end, true)
            return embed
        }

        const floor = abyss.spiralAbyssFloors[relativePage - 1]
        if (floor)
            return this.getSpiralFloor(floor, abyss.regularFloors.length + relativePage)
                .setFooter(footer)

        return undefined
    }

    getSpiralFloor(floorId: number, num: number): MessageEmbed {
        const { data } = client
        const floor = client.data.abyssFloors[floorId]

        const embed = new MessageEmbed()
            .setColor(Colors.PURPLE)
            .setTitle(`Floor ${num}`)
            .setDescription(floor.leyline)

        if (floor.chambers) {
            const lastChamber = floor.chambers[floor.chambers.length - 1]
            for (const chamber of floor.chambers) {
                embed.addField(`Chamber ${chamber.chamber}: Conditions`, chamber.conds)

                for (const [ind, monsters] of Object.entries(chamber.monsters)) {
                    const status = `${+ind+1}/${chamber.monsters.length}`
                    embed.addField(`${names[status] ?? status}: (Lv. ${chamber.level})`, `${monsters.map(m => data.emoji(m, true)).join("\n")}${chamber == lastChamber ? "" : "\n\u200B"}`, true)
                }
            }
        }

        return embed
    }
}
