// Stored information
export interface Store {
    stats?: Stats
}

export interface Stats {
    [key: string]: CommandStats
}
export interface CommandStats {
    [key: string]: number
}

// Genshin stuff
export type Server = "America" | "Europe" | "Asia" | "TW, HK, MO"

// Following stuff
export type FollowCategory = "maint" | "news" | "twitter_en" | "twitter_jp" | "twitter_fr" | "twitter_kr" | "twitter_es" | "birthday"
export interface Follower {
    channelID: string
    category: FollowCategory
    addedOn: number
    addedBy: string
}

// News posts
export interface News {
    post:               Post
    forum:              Forum
    topics:             Topic[]
    user:               NewsUser
    self_operation:     SelfOperation
    stat:               Stat
    help_sys?:          HelpSys | null
    cover?:             Cover | null
    image_list:         Cover[]
    is_official_master: boolean
    is_user_master:     boolean
    hot_reply_exist:    boolean
    vote_count:         number
    last_modify_time:   number
}

export interface Cover {
    url:    string
    height: number
    width:  number
    format: Format
    size:   string
}

export enum Format {
    Empty = "",
    GIF = "gif",
    JPG = "jpg",
    PNG = "png",
}

export interface Forum {
    id:      number
    name:    string
    icon:    string
    game_id: number
}

export interface HelpSys {
    top_up: null
}

export interface Post {
    game_id:                 number
    post_id:                 string
    f_forum_id:              number
    uid:                     string
    subject:                 string
    content:                 string
    cover:                   string
    view_type:               number
    created_at:              number
    images:                  unknown[]
    post_status:             PostStatus
    topic_ids:               number[]
    view_status:             number
    max_floor:               number
    is_original:             number
    republish_authorization: number
    reply_time:              Date
    is_deleted:              number
    is_interactive:          boolean
    structured_content:      string
    structured_content_rows: unknown[]
    lang:                    string
    official_type:           number
    reply_forbid:            ReplyForbid | null
}

export interface PostStatus {
    is_top:      boolean
    is_good:     boolean
    is_official: boolean
}

export interface ReplyForbid {
    date_type:  number
    start_date: string
    cur_date:   string
    level:      number
}

export interface SelfOperation {
    attitude:     number
    is_collected: boolean
}

export interface Stat {
    view_num:     number
    reply_num:    number
    like_num:     number
    bookmark_num: number
    share_num:    number
}

export interface Topic {
    id:             number
    name:           string
    cover:          string
    is_top:         boolean
    is_good:        boolean
    is_interactive: boolean
    game_id:        number
}

export interface NewsUser {
    uid:           string
    nickname:      string
    introduce:     string
    avatar:        string
    gender:        number
    certification: Certification
    level_exp:     LevelExp
    is_following:  boolean
    is_followed:   boolean
    avatar_url:    string
}

export interface Certification {
    type:  number
    label: string
}

export interface LevelExp {
    level: number
    exp:   number
}

export interface StoredNews {
    post_id: string
    type: number
    subject: string
    created_at: number
    nickname: string
    image_url: string
    content: string
}

/* export interface StructuredContent {
    insert:      InsertClass | string
    attributes?: Attributes
}

export interface Attributes {
    align?: string
    bold?:  boolean
}

export interface InsertClass {
    image: string
}*/

// Table creation
export type Padding = 0 | 1
export interface NameTable {
    [key: number]: string
}

// Twitter stuff
export interface Tweet {
    created_at: string
    user: User
    extended_tweet?: Tweet
    retweeted_status?: Tweet
    entities?: Entities
    extended_entities?: Entities
    in_reply_to_user_id_str?: string
    text: string
    full_text?: string

    [key: string]: unknown
}

interface Entities {
    hashtags?: unknown[]
    media?: {
        media_url_https: string
        url: string
        type: "photo" | "video" | "animated_gif"

        [key: string]: unknown
    }[]
    user_mentions?: unknown[]
    symbols?: unknown[]
    urls?: {
        expanded_url: string
        url: string

        [key: string]: unknown
    }[]

    [key: string]: unknown
}

interface User {
    screen_name: string
    id_str: string
    profile_image_url_https: string

    [key: string]: unknown
}

// Game data
export interface Artifact {
    name:    string
    levels:  number[]
    icon:    string
    bonuses: Bonus[]
    artis:   Arti[]
}

export interface Arti {
    type: ArtifactType
    name: string
    desc: string
    icon: string
}

export enum ArtifactType {
    Flower = "Flower",
    Plume = "Plume",
    Sands = "Sands",
    Goblet = "Goblet",
    Circlet = "Circlet",
}

export interface Bonus {
    count: number
    desc:  string
}

export interface MainStatInfo {
    name:   string
    weight: number
}

export interface Character {
    name:             string
    desc:             string
    releasedOn:       string
    star:             number
    weaponType:       WeaponType
    icon:             string
    iconBig:          string
    hpBase:           number
    attackBase:       number
    defenseBase:      number
    criticalBase:     number
    criticalHurtBase: number
    curves:           CurveElement[]
    meta:             Meta
    skills:           Skills[]
}

export interface CurveElement {
    name:  CureveStatTypeEnum
    curve: CurveEnum
}

export enum CurveEnum {
    RegularAtk4 = "Regular atk 4*",
    RegularAtk5 = "Regular atk 5*",
    RegularHpdef4 = "Regular hpdef 4*",
    RegularHpdef5 = "Regular hpdef 5*",
}

export enum CureveStatTypeEnum {
    BaseATK = "Base ATK",
    BaseDEF = "Base DEF",
    BaseHP = "Base HP",
}

export interface Meta {
    birthMonth?:   number
    birthDay?:     number
    association:   string
    title:         string
    detail:        string
    affiliation:   string
    element:       string
    constellation: string
    cvChinese:     string
    cvJapanese:    string
    cvEnglish:     string
    cvKorean:      string
}

export interface Skills {
    talents:        Skill[]
    ult:            Skill
    passive:        Passive[]
    constellations: Constellation[]
}

export interface Constellation {
    name: string
    desc: string
    icon: string
}

export interface Passive {
    name:         string
    desc:         string
    minAscension: number
}

export interface Skill {
    name:    string
    desc:    string
    charges: number
    table:   TalentTable[]
    type?:   string
}

export interface TalentTable {
    name:   string
    values: string[]
}

export enum WeaponType {
    Bow = "Bow",
    Catalyst = "Catalyst",
    Claymore = "Claymore",
    Polearm = "Polearm",
    Sword = "Sword",
}

// Emojis
export type BotEmoji =
    "Electric" | "Fire" | "Grass" | "Ice" | "Rock" | "Water" | "Wind" |
    "Bow" | "Catalyst" | "Claymore" | "Polearm" | "Sword"
