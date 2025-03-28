/**
 * 修炼界面UI组件 - 神话·天命
 * 负责渲染和管理修炼相关的界面元素
 */

import CultivationModule from './cultivation.js';
import PlayerModule from './player.js';

class CultivationUI {
    constructor() {
        // UI状态
        this.state = {
            isVisible: false,
            isBreakthroughAttempting: false,
            isAnimating: false,
            selectedTechnique: null,
            notifications: []
        };
        
        // 修炼功法列表
        this.techniques = [
            {
                id: 'basic_breathing',
                name: '基础吐纳术',
                description: '调整呼吸，感应天地灵气，适合入门修士。',
                requireRank: '练气期',
                maxRank: '练气期',
                baseEfficiency: 1.0,
                spiritCost: 1
            },
            {
                id: 'five_elements',
                name: '五行导气诀',
                description: '引导五行灵气入体，增强修炼效率，适合筑基以上修士。',
                requireRank: '筑基期',
                maxRank: '金丹期',
                baseEfficiency: 1.5,
                spiritCost: 3
            },
            {
                id: 'golden_light',
                name: '金光锻体诀',
                description: '以金系灵气淬炼肉身，提高突破成功率。',
                requireRank: '练气期',
                maxRank: '元婴期',
                baseEfficiency: 1.2,
                spiritCost: 2,
                breakthroughBonus: 0.1
            }
            // 可以添加更多功法
        ];
        
        // 初始化UI
        this.initUI();
        
        // 添加观察者监听修炼系统变化
        this.unsubscribe = CultivationModule.addObserver(this.updateUI.bind(this));
    }
    
    /**
     * 初始化UI元素
     */
    initUI() {
        // 创建修炼界面主容器
        this.container = document.createElement('div');
        this.container.className = 'cultivation-container';
        this.container.style.display = 'none'; // 默认隐藏
        
        // 创建界面组件
        this.createHeader();
        this.createStatusPanel();
        this.createTechniqueSelector();
        this.createControlPanel();
        this.createNotificationArea();
        
        // 将容器添加到文档
        document.body.appendChild(this.container);
        
        // 添加全局快捷键
        document.addEventListener('keydown', e => {
            if (e.key === 'x') {
                this.toggleVisibility();
            }
        });
        
        console.log('修炼界面初始化完成');
    }
    
    /**
     * 创建头部标题
     */
    createHeader() {
        const header = document.createElement('div');
        header.className = 'cultivation-header';
        
        const title = document.createElement('h2');
        title.textContent = '修炼';
        header.appendChild(title);
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => this.hideUI());
        header.appendChild(closeBtn);
        
        this.container.appendChild(header);
    }
    
    /**
     * 创建状态面板
     */
    createStatusPanel() {
        const statusPanel = document.createElement('div');
        statusPanel.className = 'cultivation-status-panel';
        
        // 境界信息
        const rankInfo = document.createElement('div');
        rankInfo.className = 'rank-info';
        
        const rankTitle = document.createElement('h3');
        rankTitle.textContent = '当前境界';
        rankInfo.appendChild(rankTitle);
        
        this.rankDisplay = document.createElement('div');
        this.rankDisplay.className = 'rank-display';
        rankInfo.appendChild(this.rankDisplay);
        
        this.levelDisplay = document.createElement('div');
        this.levelDisplay.className = 'level-display';
        rankInfo.appendChild(this.levelDisplay);
        
        statusPanel.appendChild(rankInfo);
        
        // 进度条
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        const progressLabel = document.createElement('div');
        progressLabel.className = 'progress-label';
        progressLabel.textContent = '修炼进度';
        progressContainer.appendChild(progressLabel);
        
        const progressBarWrapper = document.createElement('div');
        progressBarWrapper.className = 'progress-bar-wrapper';
        
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        progressBarWrapper.appendChild(this.progressBar);
        
        this.progressText = document.createElement('span');
        this.progressText.className = 'progress-text';
        progressBarWrapper.appendChild(this.progressText);
        
        progressContainer.appendChild(progressBarWrapper);
        statusPanel.appendChild(progressContainer);
        
        // 突破按钮
        this.breakthroughBtn = document.createElement('button');
        this.breakthroughBtn.className = 'breakthrough-btn';
        this.breakthroughBtn.textContent = '尝试突破';
        this.breakthroughBtn.addEventListener('click', () => this.attemptBreakthrough());
        statusPanel.appendChild(this.breakthroughBtn);
        
        // 境界描述
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'description-container';
        
        const descriptionTitle = document.createElement('h4');
        descriptionTitle.textContent = '境界描述';
        descriptionContainer.appendChild(descriptionTitle);
        
        this.rankDescription = document.createElement('p');
        this.rankDescription.className = 'rank-description';
        descriptionContainer.appendChild(this.rankDescription);
        
        statusPanel.appendChild(descriptionContainer);
        
        this.container.appendChild(statusPanel);
    }
    
    /**
     * 创建功法选择器
     */
    createTechniqueSelector() {
        const techniqueSelector = document.createElement('div');
        techniqueSelector.className = 'technique-selector';
        
        const selectorTitle = document.createElement('h3');
        selectorTitle.textContent = '选择功法';
        techniqueSelector.appendChild(selectorTitle);
        
        const techniqueList = document.createElement('div');
        techniqueList.className = 'technique-list';
        
        // 创建功法选项
        this.techniques.forEach(technique => {
            const techniqueItem = document.createElement('div');
            techniqueItem.className = 'technique-item';
            techniqueItem.dataset.id = technique.id;
            
            const techniqueName = document.createElement('div');
            techniqueName.className = 'technique-name';
            techniqueName.textContent = technique.name;
            techniqueItem.appendChild(techniqueName);
            
            const techniqueDesc = document.createElement('div');
            techniqueDesc.className = 'technique-description';
            techniqueDesc.textContent = technique.description;
            techniqueItem.appendChild(techniqueDesc);
            
            const techniqueStats = document.createElement('div');
            techniqueStats.className = 'technique-stats';
            techniqueStats.innerHTML = `
                <span>效率: ${technique.baseEfficiency}x</span>
                <span>消耗: ${technique.spiritCost}/时</span>
                ${technique.breakthroughBonus ? `<span>突破加成: +${technique.breakthroughBonus * 100}%</span>` : ''}
            `;
            techniqueItem.appendChild(techniqueStats);
            
            // 添加点击事件
            techniqueItem.addEventListener('click', () => {
                this.selectTechnique(technique.id);
            });
            
            techniqueList.appendChild(techniqueItem);
        });
        
        techniqueSelector.appendChild(techniqueList);
        this.container.appendChild(techniqueSelector);
    }
    
    /**
     * 创建控制面板
     */
    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'control-panel';
        
        // 修炼时间选择
        const timeSelector = document.createElement('div');
        timeSelector.className = 'time-selector';
        
        const timeLabel = document.createElement('label');
        timeLabel.textContent = '修炼时间:';
        timeSelector.appendChild(timeLabel);
        
        this.timeInput = document.createElement('select');
        [1, 2, 4, 8, 12, 24].forEach(hours => {
            const option = document.createElement('option');
            option.value = hours;
            option.textContent = `${hours}小时`;
            this.timeInput.appendChild(option);
        });
        timeSelector.appendChild(this.timeInput);
        
        controlPanel.appendChild(timeSelector);
        
        // 开始修炼按钮
        this.startButton = document.createElement('button');
        this.startButton.className = 'start-cultivation-btn';
        this.startButton.textContent = '开始修炼';
        this.startButton.addEventListener('click', () => this.startCultivation());
        
        controlPanel.appendChild(this.startButton);
        
        this.container.appendChild(controlPanel);
    }
    
    /**
     * 创建通知区域
     */
    createNotificationArea() {
        this.notificationArea = document.createElement('div');
        this.notificationArea.className = 'notification-area';
        
        this.container.appendChild(this.notificationArea);
    }
    
    /**
     * 更新UI显示
     * @param {Object} data - 修炼系统数据
     */
    updateUI(data) {
        if (!this.container) return;
        
        // 确保所有需要的数据都存在
        if (!data || typeof data !== 'object') {
            console.error('修炼系统数据无效:', data);
            return;
        }
        
        const level = data.level || 1;
        const maxLevel = data.maxLevel || 9;
        const progress = data.progress || 0;
        const rank = data.rank || '练气期';
        const description = data.description || '修道之始，通过吐纳灵气，锻炼肉身。';
        
        // 更新境界显示
        this.rankDisplay.textContent = rank;
        this.levelDisplay.textContent = `${level}层 / ${maxLevel}层`;
        
        // 更新进度条
        const progressPercent = Math.round(progress * 100);
        this.progressBar.style.width = `${progressPercent}%`;
        this.progressText.textContent = `${progressPercent}%`;
        
        // 更新境界描述
        this.rankDescription.textContent = description;
        
        // 更新突破按钮状态
        if (level >= maxLevel && data.nextRank) {
            this.breakthroughBtn.textContent = `突破至${data.nextRank}`;
            this.breakthroughBtn.disabled = progress < 0.95;
        } else if (progress >= 0.95) {
            this.breakthroughBtn.textContent = `突破至${rank}${level + 1}层`;
            this.breakthroughBtn.disabled = false;
        } else {
            this.breakthroughBtn.textContent = '修为不足';
            this.breakthroughBtn.disabled = true;
        }
        
        // 更新功法可用性
        this.updateTechniqueAvailability(rank);
        
        // 如果有事件，处理事件
        if (data.event) {
            this.handleEvent(data.event);
        }
    }
    
    /**
     * 更新功法可用性
     * @param {string} currentRank - 当前境界
     */
    updateTechniqueAvailability(currentRank) {
        const rankIndex = {
            '练气期': 0,
            '筑基期': 1,
            '金丹期': 2,
            '元婴期': 3,
            '化神期': 4
        };
        
        const currentRankIndex = rankIndex[currentRank];
        
        // 更新每个功法的可用状态
        document.querySelectorAll('.technique-item').forEach(item => {
            const technique = this.techniques.find(t => t.id === item.dataset.id);
            if (!technique) return;
            
            const requiredRankIndex = rankIndex[technique.requireRank];
            const maxRankIndex = rankIndex[technique.maxRank];
            
            // 检查境界要求
            if (currentRankIndex < requiredRankIndex || currentRankIndex > maxRankIndex) {
                item.classList.add('disabled');
                item.title = `需要境界: ${technique.requireRank} ~ ${technique.maxRank}`;
            } else {
                item.classList.remove('disabled');
                item.title = '';
            }
        });
    }
    
    /**
     * 处理修炼系统事件
     * @param {Object} event - 事件对象
     */
    handleEvent(event) {
        switch (event.type) {
            case 'breakthrough':
                this.showNotification(`突破成功！成功突破至${event.to}`, 'success');
                this.playBreakthroughAnimation();
                break;
            case 'level_breakthrough':
                this.showNotification(`境界提升！成功突破至${event.rank}${event.level}层`, 'success');
                this.playLevelUpAnimation();
                break;
            case 'breakthrough_failed':
                this.showNotification(`突破失败，修为受损`, 'error');
                break;
            case 'tribulation_scheduled':
                this.showNotification(`警告：${event.rank}天劫将在${Math.round(event.delay / 60)}分钟后降临！`, 'warning');
                break;
        }
    }
    
    /**
     * 显示通知消息
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型：'info', 'success', 'warning', 'error'
     * @param {number} duration - 显示时间（毫秒），默认3000
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        this.notificationArea.appendChild(notification);
        
        // 添加到状态列表
        this.state.notifications.push({
            element: notification,
            timer: setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                    // 从列表中移除
                    const index = this.state.notifications.findIndex(n => n.element === notification);
                    if (index !== -1) {
                        this.state.notifications.splice(index, 1);
                    }
                }, 500);
            }, duration)
        });
        
        // 添加动画
        setTimeout(() => {
            notification.classList.add('fade-in');
        }, 10);
    }
    
    /**
     * 选择功法
     * @param {string} techniqueId - 功法ID
     */
    selectTechnique(techniqueId) {
        // 移除之前的选择
        document.querySelectorAll('.technique-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加新选择
        const techniqueItem = document.querySelector(`.technique-item[data-id="${techniqueId}"]`);
        if (techniqueItem && !techniqueItem.classList.contains('disabled')) {
            techniqueItem.classList.add('selected');
            this.state.selectedTechnique = this.techniques.find(t => t.id === techniqueId);
            
            // 更新按钮状态
            this.startButton.disabled = false;
        } else {
            this.state.selectedTechnique = null;
            this.startButton.disabled = true;
        }
    }
    
    /**
     * 开始修炼
     */
    startCultivation() {
        if (!this.state.selectedTechnique || this.state.isAnimating) return;
        
        const technique = this.state.selectedTechnique;
        const hours = parseInt(this.timeInput.value);
        
        // 计算消耗的灵力
        const spiritCost = technique.spiritCost * hours;
        
        // TODO: 检查灵力是否足够，当前暂时模拟
        const currentSpirit = 100; // 应从玩家系统获取
        if (spiritCost > currentSpirit) {
            this.showNotification('灵力不足，无法修炼', 'error');
            return;
        }
        
        // 计算获得的修为
        const baseGain = 10 * hours;
        const efficiencyBonus = technique.baseEfficiency;
        const totalGain = Math.round(baseGain * efficiencyBonus);
        
        // 先显示修炼过程动画，在动画完成后才添加修为
        this.playMeditationAnimation(hours, totalGain, () => {
            // 动画完成后才应用修为增益
            CultivationModule.addCultivation(totalGain);
            
            // 如果有突破加成，临时提升突破几率
            if (technique.breakthroughBonus) {
                PlayerModule.addBreakthroughBoost(technique.breakthroughBonus, hours * 3600);
                this.showNotification(`获得突破加成: +${technique.breakthroughBonus * 100}%，持续${hours}小时`, 'info');
            }
        });
    }
    
    /**
     * 播放修炼动画
     * @param {number} hours - 修炼时间（小时）
     * @param {number} gain - 获得的修为
     * @param {Function} callback - 动画完成后执行的回调函数
     */
    playMeditationAnimation(hours, gain, callback) {
        this.state.isAnimating = true;
        
        // 创建动画层
        const animationLayer = document.createElement('div');
        animationLayer.className = 'meditation-animation';
        
        // 添加动画内容
        animationLayer.innerHTML = `
            <div class="meditation-character">
                <div class="aura"></div>
                <div class="figure"></div>
            </div>
            <div class="meditation-info">
                <div class="time-counter">0小时</div>
                <div class="gain-counter">0修为</div>
            </div>
            <button class="meditation-skip">跳过</button>
        `;
        
        // 添加到容器
        this.container.appendChild(animationLayer);
        
        // 计算动画总时长（毫秒，最长10秒）
        const duration = Math.min(hours * 1000, 10000);
        const startTime = Date.now();
        
        // 动画计时器
        const timeCounter = animationLayer.querySelector('.time-counter');
        const gainCounter = animationLayer.querySelector('.gain-counter');
        const skipButton = animationLayer.querySelector('.meditation-skip');
        
        // 跳过按钮事件
        skipButton.addEventListener('click', () => {
            clearInterval(animationTimer);
            finishAnimation();
        });
        
        // 更新函数
        const updateAnimation = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // 更新计数器
            const currentHours = Math.round(progress * hours);
            const currentGain = Math.round(progress * gain);
            
            timeCounter.textContent = `${currentHours}小时`;
            gainCounter.textContent = `+${currentGain}修为`;
            
            // 检查是否完成
            if (progress >= 1) {
                clearInterval(animationTimer);
                finishAnimation();
            }
        };
        
        // 完成函数
        const finishAnimation = () => {
            // 更新最终数值
            timeCounter.textContent = `${hours}小时`;
            gainCounter.textContent = `+${gain}修为`;
            
            // 添加完成动画
            animationLayer.classList.add('completed');
            
            // 延迟移除
            setTimeout(() => {
                animationLayer.remove();
                this.state.isAnimating = false;
                
                // 显示完成通知
                this.showNotification(`修炼完成：获得${gain}修为`, 'success');
                
                // 执行回调函数
                if (typeof callback === 'function') {
                    try {
                        callback();
                        console.log(`修炼完成，增加修为: ${gain}`);
                    } catch (error) {
                        console.error('执行修炼回调时出错:', error);
                    }
                } else {
                    console.warn('修炼完成但回调函数无效');
                }
            }, 1500);
        };
        
        // 启动动画计时器
        const animationTimer = setInterval(updateAnimation, 100);
        
        // 初始更新
        updateAnimation();
    }
    
    /**
     * 尝试突破
     */
    attemptBreakthrough() {
        if (this.state.isBreakthroughAttempting || this.state.isAnimating) return;
        
        // 设置状态
        this.state.isBreakthroughAttempting = true;
        
        // 创建突破动画层
        const breakthroughLayer = document.createElement('div');
        breakthroughLayer.className = 'breakthrough-animation';
        
        // 添加动画内容
        breakthroughLayer.innerHTML = `
            <div class="breakthrough-character">
                <div class="aura"></div>
                <div class="figure"></div>
            </div>
            <div class="breakthrough-info">
                <div class="breakthrough-status">正在突破...</div>
                <div class="breakthrough-progress"></div>
            </div>
        `;
        
        // 添加到容器
        this.container.appendChild(breakthroughLayer);
        
        // 获取元素
        const statusText = breakthroughLayer.querySelector('.breakthrough-status');
        const progressBar = breakthroughLayer.querySelector('.breakthrough-progress');
        
        // 动画计时器
        let progress = 0;
        const animationTimer = setInterval(() => {
            progress += 0.01;
            progressBar.style.width = `${progress * 100}%`;
            
            if (progress >= 1) {
                clearInterval(animationTimer);
                
                // 尝试突破
                const isSuccess = CultivationModule.attemptLevelBreakthrough();
                
                // 显示结果
                if (isSuccess) {
                    statusText.textContent = '突破成功！';
                    breakthroughLayer.classList.add('success');
                } else {
                    statusText.textContent = '突破失败！';
                    breakthroughLayer.classList.add('failure');
                }
                
                // 延迟移除
                setTimeout(() => {
                    breakthroughLayer.remove();
                    this.state.isBreakthroughAttempting = false;
                }, 2000);
            }
        }, 50);
    }
    
    /**
     * 播放突破动画
     */
    playBreakthroughAnimation() {
        if (this.state.isAnimating) return;
        this.state.isAnimating = true;
        
        // 创建突破特效层
        const effectLayer = document.createElement('div');
        effectLayer.className = 'breakthrough-effect';
        document.body.appendChild(effectLayer);
        
        // 播放音效
        // const sound = new Audio('assets/sounds/breakthrough.mp3');
        // sound.play();
        
        // 添加动画元素
        const lightColumn = document.createElement('div');
        lightColumn.className = 'light-column';
        effectLayer.appendChild(lightColumn);
        
        // 添加粒子效果
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机位置、大小和延迟
            const size = 3 + Math.random() * 10;
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = 1 + Math.random() * 4;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.animationDuration = `${duration}s`;
            
            effectLayer.appendChild(particle);
        }
        
        // 延迟移除
        setTimeout(() => {
            effectLayer.classList.add('fade-out');
            setTimeout(() => {
                effectLayer.remove();
                this.state.isAnimating = false;
            }, 1000);
        }, 5000);
    }
    
    /**
     * 播放境界提升动画
     */
    playLevelUpAnimation() {
        // 简单的闪光效果
        const rankDisplay = this.rankDisplay;
        const levelDisplay = this.levelDisplay;
        
        rankDisplay.classList.add('flash');
        levelDisplay.classList.add('flash');
        
        setTimeout(() => {
            rankDisplay.classList.remove('flash');
            levelDisplay.classList.remove('flash');
        }, 1000);
    }
    
    /**
     * 显示UI
     */
    showUI() {
        this.container.style.display = 'flex';
        this.state.isVisible = true;
        
        // 更新UI显示
        this.updateUI(CultivationModule.getCultivationDetails());
        
        // 添加动画
        setTimeout(() => {
            this.container.classList.add('visible');
        }, 10);
    }
    
    /**
     * 隐藏UI
     */
    hideUI() {
        this.container.classList.remove('visible');
        
        // 延迟移除
        setTimeout(() => {
            this.container.style.display = 'none';
            this.state.isVisible = false;
        }, 300);
    }
    
    /**
     * 切换可见性
     */
    toggleVisibility() {
        if (this.state.isVisible) {
            this.hideUI();
        } else {
            this.showUI();
        }
    }
    
    /**
     * 销毁UI
     */
    destroy() {
        if (this.container) {
            this.container.remove();
        }
        
        // 移除观察者
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        
        // 清除通知定时器
        this.state.notifications.forEach(notification => {
            if (notification.timer) {
                clearTimeout(notification.timer);
            }
        });
    }
}

// 创建UI实例
const cultivationUI = new CultivationUI();
export default cultivationUI; 