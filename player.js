/**
 * 玩家模块 - 神话·天命
 * 负责管理玩家的基本数据和功能
 */

class Player {
    constructor() {
        // 初始化玩家数据
        this.playerData = {
            name: '无名修士',
            currency: 1000, // 灵石
            cultivation: 1000, // 修为值，从练气期开始
            cultivationRank: '练气期', // 修为境界
            attributes: {
                strength: 10, // 体力
                spirit: 10, // 灵力
                willpower: 10, // 心境
                agility: 10, // 身法
                intelligence: 10 // 悟性
            },
            stats: {
                breakthroughChance: 0.1, // 基础突破几率
                cultivationRate: 1.0, // 修炼效率
                defenseRating: 10, // 防御
                attackRating: 10 // 攻击
            },
            skills: {}, // 已习得技能
            features: {}, // 已解锁功能
            buffs: [], // 当前增益效果
            reputation: {}, // 门派声望
            equipment: {}, // 装备
            lastUpdated: Date.now() // 最后更新时间
        };
        
        // 观察者列表 - 用于通知UI更新
        this.observers = {
            currency: [], // 灵石变化监听器
            cultivation: [], // 修为变化监听器
            general: [] // 综合变化监听器
        };
        
        // 加载玩家数据
        this.loadPlayerData();
    }
    
    /**
     * 从本地存储加载玩家数据
     */
    loadPlayerData() {
        const savedData = localStorage.getItem('playerData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // 合并保存的数据和默认数据
                this.playerData = { ...this.playerData, ...parsedData };
                console.log('加载玩家数据:', this.playerData);
            } catch (e) {
                console.error('玩家数据加载失败:', e);
            }
        }
    }
    
    /**
     * 保存玩家数据到本地存储
     */
    savePlayerData() {
        try {
            this.playerData.lastUpdated = Date.now();
            localStorage.setItem('playerData', JSON.stringify(this.playerData));
        } catch (e) {
            console.error('玩家数据保存失败:', e);
        }
    }
    
    /**
     * 添加观察者
     * @param {string} type - 观察者类型
     * @param {Function} observer - 观察者回调函数
     * @returns {Function} - 移除此观察者的函数
     */
    addObserver(type, observer) {
        if (!this.observers[type]) {
            this.observers[type] = [];
        }
        
        this.observers[type].push(observer);
        
        // 返回移除观察者的函数
        return () => {
            this.observers[type] = this.observers[type].filter(obs => obs !== observer);
        };
    }
    
    /**
     * 通知特定类型的观察者
     * @param {string} type - 观察者类型
     * @param {*} data - 传递给观察者的数据
     */
    notifyObservers(type, data) {
        if (this.observers[type]) {
            this.observers[type].forEach(observer => {
                try {
                    observer(data);
                } catch (e) {
                    console.error(`通知观察者(${type})失败:`, e);
                }
            });
        }
        
        // 同时通知通用观察者
        if (type !== 'general' && this.observers.general) {
            this.observers.general.forEach(observer => {
                try {
                    observer({ type, data });
                } catch (e) {
                    console.error(`通知通用观察者失败:`, e);
                }
            });
        }
    }
    
    /**
     * 获取玩家灵石数量
     * @returns {number} 灵石数量
     */
    getCurrency() {
        return this.playerData.currency;
    }
    
    /**
     * 更新玩家灵石数量
     * @param {number} amount - 变化量，正数为增加，负数为减少
     * @returns {boolean} 是否更新成功
     */
    updateCurrency(amount) {
        const oldValue = this.playerData.currency;
        
        // 检查是否足够减少
        if (amount < 0 && oldValue + amount < 0) {
            console.warn('灵石不足，无法扣除');
            return false;
        }
        
        // 更新灵石
        this.playerData.currency += amount;
        
        // 保存数据
        this.savePlayerData();
        
        // 通知观察者
        this.notifyObservers('currency', this.playerData.currency);
        
        console.log(`灵石更新: ${oldValue} -> ${this.playerData.currency}`);
        return true;
    }
    
    /**
     * 获取玩家修为值
     * @returns {number} 修为值
     */
    getCultivation() {
        return this.playerData.cultivation;
    }
    
    /**
     * 添加修为值
     * @param {number} amount - 增加的修为值
     */
    addCultivation(amount) {
        console.log(`[PlayerModule] 添加修为开始: ${amount}`);
        
        if (!amount || isNaN(amount) || amount <= 0) {
            console.warn(`[PlayerModule] 无效修为增加量: ${amount}`);
            return false;
        }
        
        const oldValue = this.playerData.cultivation;
        
        // 应用修炼效率
        const adjustedAmount = amount * this.playerData.stats.cultivationRate;
        console.log(`[PlayerModule] 应用修炼效率(${this.playerData.stats.cultivationRate})后: ${adjustedAmount}`);
        
        // 更新修为
        this.playerData.cultivation += adjustedAmount;
        
        // 检查境界突破
        this.checkBreakthrough();
        
        // 保存数据
        this.savePlayerData();
        
        // 通知观察者，只传递基本信息
        this.notifyObservers('cultivation', {
            value: this.playerData.cultivation,
            rank: this.playerData.cultivationRank
        });
        
        console.log(`[PlayerModule] 修为更新: ${oldValue} -> ${this.playerData.cultivation}`);
        return true;
    }
    
    /**
     * 检查是否可以突破到更高境界
     */
    checkBreakthrough() {
        // 这里应实现境界突破逻辑
        // 简单示例，实际应基于修为值和更复杂的计算
        console.log('检查境界突破');
    }
    
    /**
     * 增加突破几率提升
     * @param {number} boost - 几率提升值，如0.5代表增加50%
     * @param {number} duration - 持续时间，以秒为单位，-1表示永久
     */
    addBreakthroughBoost(boost, duration) {
        // 创建buff对象
        const buff = {
            id: `breakthrough_boost_${Date.now()}`,
            type: 'breakthrough',
            value: boost,
            startTime: Date.now(),
            duration: duration, // 秒
            expired: false
        };
        
        // 添加到buffs列表
        this.playerData.buffs.push(buff);
        
        // 应用buff效果
        this.playerData.stats.breakthroughChance += boost;
        
        // 如果非永久，设置定时器以移除
        if (duration > 0) {
            setTimeout(() => {
                this.removeBuff(buff.id);
            }, duration * 1000);
        }
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`添加突破几率提升: +${boost * 100}%，持续${duration > 0 ? duration + '秒' : '永久'}`);
    }
    
    /**
     * 移除buff
     * @param {string} buffId - Buff的ID
     */
    removeBuff(buffId) {
        const index = this.playerData.buffs.findIndex(b => b.id === buffId);
        if (index === -1) return;
        
        const buff = this.playerData.buffs[index];
        if (buff.expired) return;
        
        // 标记为已过期
        buff.expired = true;
        
        // 移除效果
        if (buff.type === 'breakthrough') {
            this.playerData.stats.breakthroughChance -= buff.value;
        }
        // 可以添加其他类型的buff处理...
        
        // 从列表移除
        this.playerData.buffs.splice(index, 1);
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`移除Buff: ${buffId}`);
    }
    
    /**
     * 解锁新功能
     * @param {string} featureId - 功能ID
     */
    unlockFeature(featureId) {
        if (this.playerData.features[featureId]) {
            console.log(`功能已解锁: ${featureId}`);
            return false;
        }
        
        // 解锁功能
        this.playerData.features[featureId] = {
            unlocked: true,
            unlockTime: Date.now()
        };
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`解锁功能: ${featureId}`);
        return true;
    }
    
    /**
     * 解锁技能
     * @param {string} skillId - 技能ID
     */
    unlockSkill(skillId) {
        if (this.playerData.skills[skillId]) {
            console.log(`技能已解锁: ${skillId}`);
            return false;
        }
        
        // 解锁技能
        this.playerData.skills[skillId] = {
            level: 1,
            experience: 0,
            unlockTime: Date.now()
        };
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`解锁技能: ${skillId}`);
        return true;
    }
    
    /**
     * 增加属性值
     * @param {string} attribute - 属性名（strength, spirit, willpower, agility, intelligence）
     * @param {number} amount - 增加量
     */
    addAttribute(attribute, amount) {
        if (!this.playerData.attributes[attribute]) {
            console.warn(`属性不存在: ${attribute}`);
            return false;
        }
        
        // 增加属性
        this.playerData.attributes[attribute] += amount;
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`增加属性 ${attribute}: +${amount}`);
        return true;
    }
    
    /**
     * 设置天劫降临时间
     * @param {number} delay - 延迟时间（秒）
     */
    scheduleTribulation(delay) {
        const tribulationTime = Date.now() + (delay * 1000);
        
        // 存储天劫信息
        this.playerData.tribulation = {
            scheduled: true,
            time: tribulationTime
        };
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`天劫已安排，将在 ${new Date(tribulationTime).toLocaleString()} 降临`);
    }
    
    /**
     * 加入门派
     * @param {string} factionId - 门派ID
     */
    joinFaction(factionId) {
        // 记录门派信息
        this.playerData.faction = {
            id: factionId,
            joinTime: Date.now(),
            rank: 'disciple' // 弟子级别
        };
        
        // 初始化声望
        if (!this.playerData.reputation[factionId]) {
            this.playerData.reputation[factionId] = 0;
        }
        
        // 增加声望
        this.playerData.reputation[factionId] += 100; // 入门声望
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`加入门派: ${factionId}`);
        return true;
    }
    
    /**
     * 增加门派声望
     * @param {string} factionId - 门派ID
     * @param {number} amount - 增加量
     */
    addReputation(factionId, amount) {
        if (!this.playerData.reputation[factionId]) {
            this.playerData.reputation[factionId] = 0;
        }
        
        // 增加声望
        this.playerData.reputation[factionId] += amount;
        
        // 保存数据
        this.savePlayerData();
        
        console.log(`增加门派声望 ${factionId}: +${amount}`);
        return true;
    }
}

// 创建单例
const PlayerModule = new Player();
export default PlayerModule; 