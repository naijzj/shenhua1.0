/**
 * 因果事件系统 - 神话·天命
 * 定义游戏中的因果事件和触发条件
 */

// 修为境界对应的因果阈值
export const CULTIVATION_TIERS = {
    "练气期": 0,
    "筑基期": 100,
    "金丹期": 300,
    "元婴期": 700,
    "化神期": 1500,
    "炼虚期": 3000,
    "合体期": 5000,
    "大乘期": 8000,
    "渡劫期": 12000
};

// 因果事件列表
export const KARMA_EVENTS = [
    {
        id: 'demonic_realm_unlock',
        karmaThreshold: 100,
        title: '魔界之门',
        description: '你的因果之力已经引起了魔界的注意，一道神秘的裂缝在虚空中浮现...',
        effect: '开启魔界副本',
        image: 'assets/events/demonic_portal.png',
        buttonText: '进入探索',
        color: '#9a3c7e',
        callback: 'openDemonicRealm' // 回调函数名，在事件处理器中实现
    },
    {
        id: 'celestial_blessing',
        karmaThreshold: 200,
        title: '天道恩赐',
        description: '积累的善缘引来天道垂青，获得一次突破的机会。',
        effect: '修为突破几率提升50%',
        image: 'assets/events/celestial_light.png',
        buttonText: '接受祝福',
        color: '#4c8dff',
        callback: 'receiveCelestialBlessing'
    },
    {
        id: 'demonic_temptation',
        karmaThreshold: 350,
        title: '魔道诱惑',
        description: '你的力量引起了魔道强者的兴趣，他向你提出了一个充满诱惑的交易...',
        effect: '可选择加入魔道或拒绝',
        image: 'assets/events/demonic_figure.png',
        buttonText: '听取提议',
        color: '#8e2941',
        callback: 'handleDemonicOffer',
        choices: [
            { text: '接受契约', value: 'accept', effect: '获得强大魔功，因果值-100' },
            { text: '拒绝诱惑', value: 'reject', effect: '保持道心，因果值+50' }
        ]
    },
    {
        id: 'ancient_scripture',
        karmaThreshold: 500,
        title: '上古秘籍现世',
        description: '因果之力引导你发现了一部尘封已久的上古功法秘籍。',
        effect: '解锁一种稀有功法',
        image: 'assets/events/ancient_book.png',
        buttonText: '研习功法',
        color: '#daa520',
        callback: 'discoverAncientScripture'
    },
    {
        id: 'tribulation_warning',
        karmaThreshold: 800,
        title: '天劫预警',
        description: '你的修为已经引起天道注意，天劫即将降临...',
        effect: '30日后将面临天劫考验',
        image: 'assets/events/tribulation_clouds.png',
        buttonText: '接受挑战',
        color: '#654ea3',
        callback: 'prepareTribulation'
    },
    {
        id: 'immortal_invitation',
        karmaThreshold: 1200,
        title: '仙门邀请',
        description: '你的道行已入仙人法眼，仙门向你发出了邀请。',
        effect: '可选择加入仙门或继续独行',
        image: 'assets/events/immortal_gate.png',
        buttonText: '考虑邀请',
        color: '#00a86b',
        callback: 'handleImmortalInvitation',
        choices: [
            { text: '加入仙门', value: 'join', effect: '获得仙门庇护与传承' },
            { text: '婉拒邀请', value: 'decline', effect: '保持独立，获得仙门好感' }
        ]
    }
];

// 获取特定因果值范围内的事件
export function getEventsForKarmaRange(minKarma, maxKarma) {
    return KARMA_EVENTS.filter(event => 
        event.karmaThreshold >= minKarma && event.karmaThreshold <= maxKarma
    );
}

// 获取下一个将要触发的事件
export function getNextEvents(currentKarma) {
    return KARMA_EVENTS
        .filter(event => event.karmaThreshold > currentKarma)
        .sort((a, b) => a.karmaThreshold - b.karmaThreshold)
        .slice(0, 3); // 返回最近的3个未触发事件
}

// 根据ID获取事件详情
export function getEventById(eventId) {
    return KARMA_EVENTS.find(event => event.id === eventId);
}

// 事件回调函数映射表
export const eventCallbacks = {
    // 这些函数将在KarmaManager中实现
    openDemonicRealm: null,
    receiveCelestialBlessing: null,
    handleDemonicOffer: null,
    discoverAncientScripture: null,
    prepareTribulation: null,
    handleImmortalInvitation: null
}; 