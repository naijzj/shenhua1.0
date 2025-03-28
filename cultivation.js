/**
 * 修炼系统状态机 - 神话·天命
 * 负责管理修炼境界和突破逻辑
 */

import PlayerModule from './player.js';

class CultivationSystem {
    constructor() {
        // 修炼境界定义
        this.cultivationRanks = [
            { 
                id: 'qi_refining', 
                name: '练气期', 
                levels: 9,
                threshold: 1000,
                description: '修道之始，通过吐纳灵气，锻炼肉身，为以后的修行奠定基础。',
                breakthrough: {
                    difficulty: 0.1,
                    tribulation: false,
                    requirements: []
                }
            },
            { 
                id: 'foundation_building', 
                name: '筑基期', 
                levels: 9,
                threshold: 10000,
                description: '稳固根基，筑建道基，凝聚真气，为金丹之道打下坚实基础。',
                breakthrough: {
                    difficulty: 0.2,
                    tribulation: false,
                    requirements: ['qi_refining_complete']
                }
            },
            { 
                id: 'core_formation', 
                name: '金丹期', 
                levels: 9,
                threshold: 50000,
                description: '凝聚金丹，气血化真，寿元大增，开始步入修道强者之列。',
                breakthrough: {
                    difficulty: 0.3,
                    tribulation: true,
                    requirements: ['foundation_building_complete', 'core_essence_sufficient']
                }
            },
            { 
                id: 'nascent_soul', 
                name: '元婴期', 
                levels: 9,
                threshold: 200000,
                description: '金丹化婴，元神初成，神通广大，寿元近千，成就一方霸主。',
                breakthrough: {
                    difficulty: 0.4,
                    tribulation: true,
                    requirements: ['core_formation_complete', 'soul_purified']
                }
            },
            { 
                id: 'soul_transformation', 
                name: '化神期', 
                levels: 9,
                threshold: 800000,
                description: '元婴化神，贯通天地，举手投足间有毁天灭地之威，寿元三千。',
                breakthrough: {
                    difficulty: 0.5,
                    tribulation: true,
                    requirements: ['nascent_soul_complete', 'enlightenment_achieved']
                }
            }
            // 更高境界可继续添加
        ];
        
        // 当前状态
        this.currentState = {
            rankIndex: 0, // 当前境界索引
            level: 1, // 当前小境界
            progress: 0 // 当前进度(0-1)
        };
        
        // 观察者列表
        this.observers = [];
        
        // 初始化状态
        this.initialize();
    }
    
    /**
     * 初始化系统状态
     */
    initialize() {
        // 从玩家数据加载当前境界
        const cultivation = PlayerModule.getCultivation();
        const rank = PlayerModule.playerData.cultivationRank;
        
        // 找到对应的境界索引
        for (let i = 0; i < this.cultivationRanks.length; i++) {
            if (this.cultivationRanks[i].name === rank) {
                this.currentState.rankIndex = i;
                break;
            }
        }
        
        // 计算当前小境界和进度
        this.calculateCurrentLevel(cultivation);
        
        console.log(`修炼系统初始化: ${this.getCurrentRankName()} ${this.currentState.level}层`);
        
        // 初始化后通知所有观察者更新UI
        this.notifyObservers();
    }
    
    /**
     * 计算当前小境界和进度
     * @param {number} cultivation - 当前修为值
     */
    calculateCurrentLevel(cultivation) {
        const currentRank = this.cultivationRanks[this.currentState.rankIndex];
        const nextRank = this.cultivationRanks[this.currentState.rankIndex + 1];
        
        // 当前境界的基础修为值
        const baseThreshold = currentRank.threshold;
        
        // 下一境界的修为要求(如果有)
        const nextThreshold = nextRank ? nextRank.threshold : currentRank.threshold * 10;
        
        // 当前境界的修为范围
        const rankRange = nextThreshold - baseThreshold;
        
        // 当前境界的每层修为范围
        const levelRange = rankRange / currentRank.levels;
        
        // 防止除以零或负数
        if (levelRange <= 0) {
            this.currentState.level = 1;
            this.currentState.progress = 0;
            return;
        }
        
        // 计算当前小境界
        const progress = Math.max(0, cultivation - baseThreshold);
        const level = Math.min(Math.floor(progress / levelRange) + 1, currentRank.levels);
        
        // 计算当前层的进度
        const levelProgress = (progress % levelRange) / levelRange;
        
        this.currentState.level = level;
        this.currentState.progress = Math.min(Math.max(levelProgress, 0), 0.999);
    }
    
    /**
     * 添加修为值并更新状态
     * @param {number} amount - 修为增加量
     */
    addCultivation(amount) {
        console.log(`[CultivationModule] 准备添加修为: ${amount}`);
        if (!amount || amount <= 0) {
            console.warn('[CultivationModule] 修为增加量无效:', amount);
            return;
        }
        
        // 获取修炼前的状态
        const beforeCultivation = PlayerModule.getCultivation();
        
        // 通过玩家模块添加修为
        PlayerModule.addCultivation(amount);
        
        // 获取修炼后的状态
        const afterCultivation = PlayerModule.getCultivation();
        console.log(`[CultivationModule] 修为变化: ${beforeCultivation} -> ${afterCultivation}`);
        
        // 更新当前状态
        this.updateState();
    }
    
    /**
     * 更新当前状态
     */
    updateState() {
        const cultivation = PlayerModule.getCultivation();
        const oldLevel = this.currentState.level;
        const oldRankIndex = this.currentState.rankIndex;
        const oldProgress = this.currentState.progress;
        
        // 检查境界突破
        this.checkBreakthrough(cultivation);
        
        // 计算当前小境界和进度
        this.calculateCurrentLevel(cultivation);
        
        // 总是通知观察者状态更新，确保UI同步
        this.notifyObservers();
    }
    
    /**
     * 检查是否可突破到更高境界
     * @param {number} cultivation - 当前修为值
     */
    checkBreakthrough(cultivation) {
        const currentRank = this.cultivationRanks[this.currentState.rankIndex];
        const nextRank = this.cultivationRanks[this.currentState.rankIndex + 1];
        
        // 如果没有下一个境界，则直接返回
        if (!nextRank) return;
        
        // 如果修为不足，则直接返回
        if (cultivation < nextRank.threshold) return;
        
        // 如果当前境界还未达到最高层，则直接返回
        if (this.currentState.level < currentRank.levels) return;
        
        // 检查突破条件
        if (this.checkBreakthroughRequirements(nextRank.breakthrough.requirements)) {
            // 如果需要渡劫
            if (nextRank.breakthrough.tribulation) {
                this.scheduleTribulation(nextRank);
            } else {
                // 直接突破
                this.performBreakthrough();
            }
        }
    }
    
    /**
     * 检查突破条件是否满足
     * @param {Array<string>} requirements - 突破条件
     * @returns {boolean} - 是否满足所有条件
     */
    checkBreakthroughRequirements(requirements) {
        // 如果没有要求，直接返回true
        if (!requirements || requirements.length === 0) return true;
        
        // 检查每一个条件
        for (const req of requirements) {
            if (req.endsWith('_complete')) {
                // 检查前一境界是否完成
                const rankId = req.replace('_complete', '');
                const rankIndex = this.cultivationRanks.findIndex(r => r.id === rankId);
                
                // 如果找不到境界或者未完成，返回false
                if (rankIndex === -1 || this.currentState.rankIndex <= rankIndex) {
                    return false;
                }
            } 
            else if (req === 'core_essence_sufficient') {
                // 检查是否有足够的金丹精华
                // 这里应该连接到物品系统检查
                // 暂时模拟
                console.log('检查金丹精华条件');
                // return PlayerModule.hasItem('core_essence', 5);
            }
            else if (req === 'soul_purified') {
                // 检查灵魂是否纯净
                // 这里应该连接到业力系统检查
                // 暂时模拟
                console.log('检查灵魂纯净条件');
                // return PlayerModule.getKarmaValue() > 0;
            }
            else if (req === 'enlightenment_achieved') {
                // 检查是否顿悟
                // 这里应该连接到悟道系统检查
                // 暂时模拟
                console.log('检查顿悟条件');
                // return PlayerModule.hasAchievedEnlightenment();
            }
            // 可添加更多条件检查...
        }
        
        // 如果都满足，返回true
        return true;
    }
    
    /**
     * 安排渡劫
     * @param {Object} nextRank - 下一个境界信息
     */
    scheduleTribulation(nextRank) {
        console.log(`准备渡劫: ${nextRank.name}天劫`);
        
        // 计算天劫到来的延迟时间(秒)
        const delay = 300 + Math.random() * 600; // 5-15分钟
        
        // 通过玩家模块安排天劫
        PlayerModule.scheduleTribulation(delay);
        
        // 触发天劫事件
        this.notifyObservers({
            type: 'tribulation_scheduled',
            rank: nextRank.name,
            delay: delay
        });
    }
    
    /**
     * 执行突破
     */
    performBreakthrough() {
        // 获取当前和下一个境界
        const currentRank = this.cultivationRanks[this.currentState.rankIndex];
        const nextRank = this.cultivationRanks[this.currentState.rankIndex + 1];
        
        if (!nextRank) return;
        
        console.log(`突破: ${currentRank.name} -> ${nextRank.name}`);
        
        // 更新玩家数据
        PlayerModule.playerData.cultivationRank = nextRank.name;
        
        // 更新当前状态
        this.currentState.rankIndex++;
        this.currentState.level = 1;
        this.currentState.progress = 0;
        
        // 保存玩家数据
        PlayerModule.savePlayerData();
        
        // 通知突破事件
        this.notifyObservers({
            type: 'breakthrough',
            from: currentRank.name,
            to: nextRank.name
        });
    }
    
    /**
     * 尝试突破小境界
     * @returns {boolean} - 是否突破成功
     */
    attemptLevelBreakthrough() {
        const currentRank = this.cultivationRanks[this.currentState.rankIndex];
        
        // 如果已经是最高层，无法继续突破
        if (this.currentState.level >= currentRank.levels) {
            console.log(`已达到${currentRank.name}巅峰，需冲击下一大境界`);
            return false;
        }
        
        // 如果进度不足，无法突破
        if (this.currentState.progress < 0.95) {
            console.log(`修为不足，无法突破`);
            return false;
        }
        
        // 计算突破几率(基础几率 + 玩家突破加成)
        const baseChance = 0.3; // 基础突破几率
        const playerBoost = PlayerModule.playerData.stats.breakthroughChance;
        let chance = baseChance + playerBoost;
        
        // 随机决定是否突破成功
        const isSuccess = Math.random() < chance;
        
        if (isSuccess) {
            console.log(`突破小境界: ${currentRank.name}${this.currentState.level}层 -> ${currentRank.name}${this.currentState.level + 1}层`);
            
            // 更新小境界
            this.currentState.level++;
            this.currentState.progress = 0;
            
            // 通知突破事件
            this.notifyObservers({
                type: 'level_breakthrough',
                rank: currentRank.name,
                level: this.currentState.level
            });
            
            return true;
        } else {
            console.log(`突破失败，修为受损`);
            
            // 突破失败，修为倒退
            const cultivation = PlayerModule.getCultivation();
            const currentRankThreshold = currentRank.threshold;
            const nextRankThreshold = this.cultivationRanks[this.currentState.rankIndex + 1]?.threshold || currentRankThreshold * 10;
            const rankRange = nextRankThreshold - currentRankThreshold;
            const levelRange = rankRange / currentRank.levels;
            
            // 损失10-30%当前层修为
            const lossFactor = 0.1 + Math.random() * 0.2;
            const loss = levelRange * lossFactor;
            
            // 修为减少
            PlayerModule.playerData.cultivation = Math.max(cultivation - loss, currentRankThreshold);
            PlayerModule.savePlayerData();
            
            // 更新状态
            this.calculateCurrentLevel(PlayerModule.playerData.cultivation);
            
            // 通知突破失败事件
            this.notifyObservers({
                type: 'breakthrough_failed',
                rank: currentRank.name,
                level: this.currentState.level,
                loss: loss
            });
            
            return false;
        }
    }
    
    /**
     * 获取当前境界名称
     * @returns {string} - 境界名称
     */
    getCurrentRankName() {
        return this.cultivationRanks[this.currentState.rankIndex].name;
    }
    
    /**
     * 获取当前境界描述
     * @returns {string} - 境界描述
     */
    getCurrentRankDescription() {
        return this.cultivationRanks[this.currentState.rankIndex].description;
    }
    
    /**
     * 获取当前修炼详情
     * @returns {Object} - 修炼详情
     */
    getCultivationDetails() {
        const rank = this.cultivationRanks[this.currentState.rankIndex];
        const nextRank = this.cultivationRanks[this.currentState.rankIndex + 1];
        
        return {
            rank: rank.name,
            level: this.currentState.level,
            progress: this.currentState.progress,
            description: rank.description,
            nextRank: nextRank ? nextRank.name : null,
            maxLevel: rank.levels
        };
    }
    
    /**
     * 添加观察者
     * @param {Function} observer - 观察者回调函数
     * @returns {Function} - 移除观察者的函数
     */
    addObserver(observer) {
        this.observers.push(observer);
        
        return () => {
            this.observers = this.observers.filter(obs => obs !== observer);
        };
    }
    
    /**
     * 通知所有观察者
     * @param {Object} event - 可选的事件对象
     */
    notifyObservers(event) {
        const details = this.getCultivationDetails();
        
        // 如果有事件信息，合并到通知中
        const notification = event ? { ...details, event } : details;
        
        this.observers.forEach(observer => {
            try {
                observer(notification);
            } catch (e) {
                console.error('通知修炼系统观察者失败:', e);
            }
        });
    }
}

// 创建单例
const CultivationModule = new CultivationSystem();
export default CultivationModule; 