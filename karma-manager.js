/**
 * 因果管理器 - 神话·天命
 * 负责管理玩家的因果值和监听因果变化触发事件
 */
import { KARMA_EVENTS, getEventsForKarmaRange, getEventById, eventCallbacks } from './events.js';
import PlayerModule from './player.js';

class KarmaManager {
    constructor() {
        // 系统状态变量
        this.initialized = false;
        this.triggeredEvents = new Set(); // 已触发的事件ID集合
        this.eventListeners = []; // 因果变化的监听函数
        this.pendingEvents = []; // 待处理的事件队列

        // 玩家因果数据
        this.karmaData = {
            karma: 0, // 当前因果值
            goodDeeds: 0, // 善行累计
            evilDeeds: 0, // 恶行累计
            lastUpdated: Date.now() // 最后更新时间
        };
        
        // 使用Proxy监听因果值变化
        this.karmaProxy = new Proxy(this.karmaData, {
            set: (target, property, value) => {
                // 只处理karma属性的变化
                if (property === 'karma') {
                    const oldValue = target.karma;
                    // 设置新值
                    target[property] = value;
                    // 如果已初始化且值确实发生变化，则触发回调
                    if (this.initialized && oldValue !== value) {
                        this.triggerKarmaChange(oldValue, value);
                    }
                } else {
                    // 其他属性直接设置
                    target[property] = value;
                }
                
                // 更新时间戳
                target.lastUpdated = Date.now();
                
                // 保存数据
                this.saveKarmaData();
                
                return true;
            }
        });
        
        // 初始化因果管理器
        this.initialize();
        
        // 注册事件回调函数
        this.registerEventCallbacks();
    }
    
    /**
     * 初始化因果管理器
     */
    initialize() {
        // 从本地存储加载数据
        this.loadKarmaData();
        
        // 加载已触发的事件
        this.loadTriggeredEvents();
        
        // 标记为已初始化
        this.initialized = true;
        
        console.log('因果管理器初始化完成，当前因果值:', this.karmaProxy.karma);
    }
    
    /**
     * 从本地存储加载因果数据
     */
    loadKarmaData() {
        const savedData = localStorage.getItem('playerKarma');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // 更新代理对象中的数据
                Object.keys(parsedData).forEach(key => {
                    this.karmaData[key] = parsedData[key];
                });
                console.log('加载因果数据:', this.karmaData);
            } catch (e) {
                console.error('因果数据加载失败:', e);
            }
        }
    }
    
    /**
     * 保存因果数据到本地存储
     */
    saveKarmaData() {
        try {
            localStorage.setItem('playerKarma', JSON.stringify(this.karmaData));
        } catch (e) {
            console.error('因果数据保存失败:', e);
        }
    }
    
    /**
     * 从本地存储加载已触发事件
     */
    loadTriggeredEvents() {
        const savedEvents = localStorage.getItem('triggeredEvents');
        if (savedEvents) {
            try {
                const parsedEvents = JSON.parse(savedEvents);
                this.triggeredEvents = new Set(parsedEvents);
                console.log('已加载触发事件:', Array.from(this.triggeredEvents));
            } catch (e) {
                console.error('触发事件加载失败:', e);
            }
        }
    }
    
    /**
     * 保存已触发事件到本地存储
     */
    saveTriggeredEvents() {
        try {
            localStorage.setItem('triggeredEvents', 
                JSON.stringify(Array.from(this.triggeredEvents)));
        } catch (e) {
            console.error('触发事件保存失败:', e);
        }
    }
    
    /**
     * 更新因果值
     * @param {number} delta - 因果值变化量，正值为善，负值为恶
     */
    updateKarma(delta) {
        if (delta > 0) {
            this.karmaProxy.goodDeeds += delta;
        } else if (delta < 0) {
            this.karmaProxy.evilDeeds += Math.abs(delta);
        }
        
        // 更新总因果值
        this.karmaProxy.karma += delta;
        
        // 限制因果值范围（可选）
        // this.karmaProxy.karma = Math.max(0, Math.min(10000, this.karmaProxy.karma));
        
        console.log(`因果值更新: ${this.karmaProxy.karma - delta} -> ${this.karmaProxy.karma}`);
    }
    
    /**
     * 获取当前因果值
     * @returns {number} 当前因果值
     */
    getKarma() {
        return this.karmaProxy.karma;
    }
    
    /**
     * 获取因果数据
     * @returns {Object} 因果数据对象
     */
    getKarmaData() {
        return { ...this.karmaData };
    }
    
    /**
     * 添加因果值变化监听器
     * @param {Function} listener - 监听函数，接收 (newValue, oldValue) 参数
     */
    onKarmaChange(listener) {
        this.eventListeners.push(listener);
        return () => {
            // 返回移除监听器的函数
            this.eventListeners = this.eventListeners.filter(l => l !== listener);
        };
    }
    
    /**
     * 触发因果值变化事件
     * @param {number} oldValue - 变化前的值
     * @param {number} newValue - 变化后的值
     */
    triggerKarmaChange(oldValue, newValue) {
        // 计算变化的方向和范围
        const increasing = newValue > oldValue;
        const min = Math.min(oldValue, newValue);
        const max = Math.max(oldValue, newValue);
        
        // 查找是否有事件应该被触发
        const potentialEvents = getEventsForKarmaRange(min, max);
        
        // 筛选未触发过的事件
        const newEvents = potentialEvents.filter(event => !this.triggeredEvents.has(event.id));
        
        // 如果是因果值上升，触发事件
        if (increasing && newEvents.length > 0) {
            this.queueEvents(newEvents);
        }
        
        // 通知所有监听器
        this.eventListeners.forEach(listener => {
            try {
                listener(newValue, oldValue);
            } catch (e) {
                console.error('监听器执行错误:', e);
            }
        });
    }
    
    /**
     * 将事件加入队列
     * @param {Array} events - 事件对象数组
     */
    queueEvents(events) {
        // 按照因果阈值排序，低阈值先触发
        const sortedEvents = [...events].sort((a, b) => a.karmaThreshold - b.karmaThreshold);
        
        // 添加到待处理队列
        this.pendingEvents.push(...sortedEvents);
        
        // 如果没有正在显示的事件，就开始处理队列
        this.processEventQueue();
    }
    
    /**
     * 处理事件队列
     */
    processEventQueue() {
        // 如果队列为空或已有事件在显示，则返回
        if (this.pendingEvents.length === 0 || document.querySelector('.karma-event-popup')) {
            return;
        }
        
        // 取出队列头部的事件
        const event = this.pendingEvents.shift();
        
        // 标记为已触发
        this.triggeredEvents.add(event.id);
        this.saveTriggeredEvents();
        
        // 显示事件弹窗
        this.showEventPopup(event);
    }
    
    /**
     * 显示事件弹窗
     * @param {Object} event - 事件对象
     */
    showEventPopup(event) {
        // 检查是否已加载CSS
        this.ensureStylesLoaded();
        
        // 创建弹窗元素
        const popup = document.createElement('div');
        popup.className = 'karma-event-popup';
        
        // 设置弹窗内容
        popup.innerHTML = `
            <div class="event-header">
                <h2 style="color: ${event.color || '#9a7bcc'};">${event.title}</h2>
                <div class="event-close">×</div>
            </div>
            ${event.image ? `<div class="event-image">
                <img src="${event.image}" alt="${event.title}" onerror="this.src='assets/icons/default.png'">
            </div>` : ''}
            <div class="event-description">
                ${event.description}
            </div>
            <div class="event-effect" style="color: ${event.color || '#9a7bcc'};">
                ${event.effect}
            </div>
            ${event.choices ? `
                <div class="event-choices">
                    ${event.choices.map(choice => `
                        <button class="event-choice" data-value="${choice.value}" style="border-color: ${event.color || '#9a7bcc'};">
                            <div class="choice-text">${choice.text}</div>
                            <div class="choice-effect">${choice.effect}</div>
                        </button>
                    `).join('')}
                </div>
            ` : `
                <button class="event-button" style="background-color: ${event.color || '#9a7bcc'};">
                    ${event.buttonText || '确认'}
                </button>
            `}
        `;
        
        // 添加弹窗到文档
        document.body.appendChild(popup);
        
        // 创建背景遮罩
        const overlay = document.createElement('div');
        overlay.className = 'karma-event-overlay';
        document.body.insertBefore(overlay, popup);
        
        // 绑定关闭按钮事件
        const closeBtn = popup.querySelector('.event-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeEventPopup(popup, overlay);
            });
        }
        
        // 绑定按钮事件
        const actionButton = popup.querySelector('.event-button');
        if (actionButton) {
            actionButton.addEventListener('click', () => {
                // 执行回调
                this.executeEventCallback(event.callback);
                this.closeEventPopup(popup, overlay);
            });
        }
        
        // 绑定选择按钮事件
        const choiceButtons = popup.querySelectorAll('.event-choice');
        if (choiceButtons.length > 0) {
            choiceButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const choiceValue = button.getAttribute('data-value');
                    // 执行回调，传入选择的值
                    this.executeEventCallback(event.callback, choiceValue);
                    this.closeEventPopup(popup, overlay);
                });
            });
        }
    }
    
    /**
     * 确保样式已加载
     */
    ensureStylesLoaded() {
        if (!document.querySelector('link[href="karma-styles.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'karma-styles.css';
            document.head.appendChild(link);
        }
    }
    
    /**
     * 关闭事件弹窗
     * @param {HTMLElement} popup - 弹窗元素
     * @param {HTMLElement} overlay - 遮罩元素
     */
    closeEventPopup(popup, overlay) {
        // 添加淡出动画
        popup.style.animation = 'fadeOut 0.3s ease-out forwards';
        overlay.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            
            // 处理下一个事件
            this.processEventQueue();
        }, 300);
    }
    
    /**
     * 执行事件回调函数
     * @param {string} callbackName - 回调函数名称
     * @param {string} param - 可选参数
     */
    executeEventCallback(callbackName, param) {
        if (!callbackName) return;
        
        const callback = eventCallbacks[callbackName];
        if (typeof callback === 'function') {
            try {
                callback(param);
            } catch (e) {
                console.error(`执行事件回调 ${callbackName} 失败:`, e);
            }
        } else {
            console.warn(`事件回调 ${callbackName} 未定义`);
        }
    }
    
    /**
     * 注册事件回调函数
     */
    registerEventCallbacks() {
        // 魔界副本开启
        eventCallbacks.openDemonicRealm = () => {
            console.log('开启魔界副本');
            // 这里添加开启副本的逻辑
            PlayerModule.unlockFeature('demonic_realm');
        };
        
        // 接受天道祝福
        eventCallbacks.receiveCelestialBlessing = () => {
            console.log('接受天道祝福');
            PlayerModule.addBreakthroughBoost(0.5, 7 * 24 * 3600); // 增加50%突破几率，持续7天
        };
        
        // 处理魔道诱惑
        eventCallbacks.handleDemonicOffer = (choice) => {
            console.log('处理魔道诱惑:', choice);
            if (choice === 'accept') {
                // 接受诱惑
                this.updateKarma(-100);
                PlayerModule.unlockFeature('demonic_cultivation');
            } else {
                // 拒绝诱惑
                this.updateKarma(50);
                PlayerModule.addAttribute('willpower', 10);
            }
        };
        
        // 发现上古秘籍
        eventCallbacks.discoverAncientScripture = () => {
            console.log('发现上古秘籍');
            PlayerModule.unlockSkill('ancient_scripture');
        };
        
        // 准备应对天劫
        eventCallbacks.prepareTribulation = () => {
            console.log('准备应对天劫');
            PlayerModule.scheduleTribulation(30 * 24 * 3600); // 30天后天劫降临
        };
        
        // 处理仙门邀请
        eventCallbacks.handleImmortalInvitation = (choice) => {
            console.log('处理仙门邀请:', choice);
            if (choice === 'join') {
                // 加入仙门
                PlayerModule.joinFaction('immortal_sect');
            } else {
                // 婉拒邀请
                PlayerModule.addReputation('immortal_sect', 50);
                PlayerModule.addAttribute('independence', 10);
            }
        };
    }
}

// 创建并导出单例实例
const KarmaManagerInstance = new KarmaManager();
export default KarmaManagerInstance; 