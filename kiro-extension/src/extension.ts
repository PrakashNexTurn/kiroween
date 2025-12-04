import * as vscode from 'vscode';

let effectsPanel: vscode.WebviewPanel | undefined;
let statusBarItem: vscode.StatusBarItem;
let isEnabled = true;

export function activate(context: vscode.ExtensionContext) {
    console.log('🎃👻 Halloween Complete Extension is now active! 🎃👻');

    // Create animated status bar
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'halloween.toggleEffects';
    statusBarItem.tooltip = '🎃 Click to toggle Halloween effects';
    context.subscriptions.push(statusBarItem);
    
    // Start status bar animation
    startStatusBarAnimation();

    // Check if effects should be enabled on startup
    const config = vscode.workspace.getConfiguration('halloween.effects');
    isEnabled = config.get('enabled', true);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('halloween.enableEffects', () => {
            enableEffects(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('halloween.disableEffects', () => {
            disableEffects();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('halloween.toggleEffects', () => {
            if (isEnabled) {
                disableEffects();
            } else {
                enableEffects(context);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('halloween.openDemo', () => {
            openDemo(context);
        })
    );

    // Auto-enable on startup if configured
    if (isEnabled) {
        setTimeout(() => enableEffects(context), 1000);
    }

    // Show welcome message
    vscode.window.showInformationMessage(
        '🎃👻 Halloween activated! Theme + Icons + Effects all-in-one! 🦇',
        'Enable Effects',
        'Open Demo'
    ).then(selection => {
        if (selection === 'Enable Effects') {
            vscode.commands.executeCommand('halloween.enableEffects');
        } else if (selection === 'Open Demo') {
            vscode.commands.executeCommand('halloween.openDemo');
        }
    });
}

function startStatusBarAnimation() {
    const emojis = ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️', '⚰️'];
    let index = 0;
    
    statusBarItem.text = `${emojis[0]} Halloween`;
    statusBarItem.show();
    
    setInterval(() => {
        index = (index + 1) % emojis.length;
        statusBarItem.text = `${emojis[index]} Halloween ${isEnabled ? 'ON' : 'OFF'}`;
    }, 2000);
}

function enableEffects(context: vscode.ExtensionContext) {
    isEnabled = true;
    
    if (effectsPanel) {
        effectsPanel.reveal();
        return;
    }

    // Create webview panel
    effectsPanel = vscode.window.createWebviewPanel(
        'halloweenEffects',
        '🎃 Halloween Haunted Effects 👻',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    // Set HTML content
    effectsPanel.webview.html = getWebviewContent(context);

    // Handle panel disposal
    effectsPanel.onDidDispose(() => {
        effectsPanel = undefined;
    });

    vscode.window.showInformationMessage('🎃 Halloween effects enabled! Move your mouse and click to interact! 👻');
}

function disableEffects() {
    isEnabled = false;
    
    if (effectsPanel) {
        effectsPanel.dispose();
        effectsPanel = undefined;
    }

    vscode.window.showInformationMessage('👻 Halloween effects disabled.');
}

function openDemo(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'halloweenDemo',
        '🎃 Halloween Effects Demo 👻',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewContent(context);
}

function getWebviewContent(context: vscode.ExtensionContext): string {
    const config = vscode.workspace.getConfiguration('halloween.effects');
    const showGhosts = config.get('ghosts', true);
    const showWebs = config.get('spiderWebs', true);
    const showParticles = config.get('particles', true);
    const showPumpkins = config.get('pumpkins', true);
    const showFog = config.get('fog', true);
    const showMouseTrail = config.get('mouseTrail', true);
    const showClickExplosions = config.get('clickExplosions', true);
    const intensity = config.get('intensity', 'medium');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎃 Halloween Haunted Effects 👻</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #0d0a0f;
            pointer-events: auto;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><text y="24" font-size="24">🎃</text></svg>') 16 16, auto;
        }

        .title {
            text-align: center;
            font-size: 48px;
            margin: 40px 0;
            color: #ff8c1a;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 20px rgba(255, 140, 26, 0.8),
                         0 0 40px rgba(168, 85, 247, 0.6);
            animation: titleGlow 2s infinite ease-in-out;
        }

        @keyframes titleGlow {
            0%, 100% { 
                text-shadow: 0 0 20px rgba(255, 140, 26, 0.8),
                             0 0 40px rgba(168, 85, 247, 0.6);
            }
            50% { 
                text-shadow: 0 0 30px rgba(255, 140, 26, 1),
                             0 0 60px rgba(168, 85, 247, 0.8);
            }
        }

        .effects-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
        }

        .ghost {
            position: absolute;
            font-size: 48px;
            animation: float 15s infinite ease-in-out;
            opacity: 0.7;
            filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.8));
            pointer-events: auto;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .ghost:hover {
            transform: scale(1.3) rotate(10deg);
            filter: drop-shadow(0 0 20px rgba(168, 85, 247, 1));
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            25% { transform: translateY(-30px) translateX(20px) rotate(5deg); }
            50% { transform: translateY(-60px) translateX(-20px) rotate(-5deg); }
            75% { transform: translateY(-30px) translateX(20px) rotate(5deg); }
        }

        .scared {
            animation: scared 0.3s ease-in-out 3;
        }

        @keyframes scared {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }

        .spider-web {
            position: absolute;
            font-size: 64px;
            opacity: 0.4;
            animation: webPulse 3s infinite ease-in-out;
        }

        @keyframes webPulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
        }

        .particle {
            position: absolute;
            font-size: 24px;
            animation: fall linear infinite;
            opacity: 0.8;
        }

        @keyframes fall {
            0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }

        .pumpkin {
            position: absolute;
            font-size: 32px;
            animation: bounce 2s infinite ease-in-out;
            filter: drop-shadow(0 0 15px rgba(255, 140, 26, 0.8));
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-20px) scale(1.1); }
        }

        .fog {
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(ellipse at center, 
                rgba(168, 85, 247, 0.1) 0%, 
                transparent 70%);
            animation: fogMove 20s infinite ease-in-out;
        }

        @keyframes fogMove {
            0%, 100% { transform: translateX(0); opacity: 0.3; }
            50% { transform: translateX(50px); opacity: 0.5; }
        }

        .glow-border {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 3px solid rgba(255, 140, 26, 0.3);
            pointer-events: none;
            animation: glowPulse 3s infinite ease-in-out;
            z-index: 10000;
        }

        @keyframes glowPulse {
            0%, 100% { 
                border-color: rgba(255, 140, 26, 0.3);
                box-shadow: inset 0 0 20px rgba(255, 140, 26, 0.2);
            }
            50% { 
                border-color: rgba(168, 85, 247, 0.4);
                box-shadow: inset 0 0 30px rgba(168, 85, 247, 0.3);
            }
        }

        .cursor-glow {
            position: absolute;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 140, 26, 0.4) 0%, transparent 70%);
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        }

        .mouse-trail {
            position: absolute;
            pointer-events: none;
            animation: trailFade 1s ease-out forwards;
        }

        @keyframes trailFade {
            0% { opacity: 1; transform: scale(1) rotate(0deg); }
            100% { opacity: 0; transform: scale(0.5) rotate(360deg); }
        }

        .click-explosion {
            position: absolute;
            pointer-events: none;
            animation: explode 0.8s ease-out forwards;
        }

        @keyframes explode {
            0% { opacity: 1; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
            100% { opacity: 0; transform: scale(2) rotate(360deg); }
        }

        .info {
            text-align: center;
            padding: 20px;
            font-size: 18px;
            line-height: 1.6;
            color: #e8dfd8;
            font-family: 'Courier New', monospace;
        }

        .info p {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="glow-border"></div>
    <div class="effects-container" id="effects"></div>
    
    <div class="title">🎃 Halloween Theme 👻</div>
    
    <div class="info">
        <p>🕸️👻 using KIRO IDE 👻🕸️</p>
    </div>

    <script>
        const container = document.getElementById('effects');
        const intensity = '${intensity}';
        
        const counts = {
            low: { ghosts: 2, webs: 2, particles: 5, pumpkins: 2 },
            medium: { ghosts: 4, webs: 4, particles: 10, pumpkins: 4 },
            high: { ghosts: 6, webs: 6, particles: 20, pumpkins: 6 }
        };
        
        const config = counts[intensity] || counts.medium;

        // Cursor glow
        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        container.appendChild(cursorGlow);

        const trailEmojis = ['👻', '🎃', '🦇', '🕷️', '💀', '🕸️', '⚰️'];
        let trailIndex = 0;
        let mouseX = 0;
        let mouseY = 0;
        let lastTrailTime = 0;

        // Mouse move handler
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorGlow.style.left = mouseX + 'px';
            cursorGlow.style.top = mouseY + 'px';

            ${showMouseTrail ? `
            const now = Date.now();
            if (now - lastTrailTime > 50) {
                createMouseTrail(mouseX, mouseY);
                lastTrailTime = now;
            }
            ` : ''}

            // Ghosts run away
            document.querySelectorAll('.ghost').forEach(ghost => {
                const rect = ghost.getBoundingClientRect();
                const ghostX = rect.left + rect.width / 2;
                const ghostY = rect.top + rect.height / 2;
                const distance = Math.sqrt(Math.pow(mouseX - ghostX, 2) + Math.pow(mouseY - ghostY, 2));

                if (distance < 150) {
                    const angle = Math.atan2(ghostY - mouseY, ghostX - mouseX);
                    const moveX = Math.cos(angle) * 3;
                    const moveY = Math.sin(angle) * 3;
                    
                    const currentLeft = parseFloat(ghost.style.left) || 0;
                    const currentTop = parseFloat(ghost.style.top) || 0;
                    
                    ghost.style.left = Math.max(0, Math.min(90, currentLeft + moveX)) + '%';
                    ghost.style.top = Math.max(0, Math.min(90, currentTop + moveY)) + '%';
                    
                    if (!ghost.classList.contains('scared')) {
                        ghost.classList.add('scared');
                        setTimeout(() => ghost.classList.remove('scared'), 900);
                    }
                }
            });
        });

        // Click handler
        document.addEventListener('click', (e) => {
            ${showClickExplosions ? `
            createClickExplosion(e.clientX, e.clientY);
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createFlyingParticle(e.clientX, e.clientY);
                }, i * 50);
            }

            flashScreen();
            ` : ''}
        });

        function createMouseTrail(x, y) {
            const trail = document.createElement('div');
            trail.className = 'mouse-trail';
            trail.textContent = trailEmojis[trailIndex];
            trail.style.left = x + 'px';
            trail.style.top = y + 'px';
            trail.style.fontSize = '20px';
            container.appendChild(trail);

            trailIndex = (trailIndex + 1) % trailEmojis.length;
            setTimeout(() => trail.remove(), 1000);
        }

        function createClickExplosion(x, y) {
            const explosionEmojis = ['💥', '✨', '🎃', '👻', '🦇', '💀', '🕸️', '⚡'];
            
            explosionEmojis.forEach((emoji, index) => {
                const particle = document.createElement('div');
                particle.className = 'click-explosion';
                particle.textContent = emoji;
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.fontSize = '24px';
                container.appendChild(particle);

                setTimeout(() => particle.remove(), 800);
            });
        }

        function createFlyingParticle(x, y) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = trailEmojis[Math.floor(Math.random() * trailEmojis.length)];
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.fontSize = '24px';
            particle.style.animationDuration = (3 + Math.random() * 3) + 's';
            container.appendChild(particle);

            setTimeout(() => particle.remove(), 6000);
        }

        function flashScreen() {
            const flash = document.createElement('div');
            flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(255,140,26,0.3);pointer-events:none;animation:flashFade 0.3s ease-out';
            container.appendChild(flash);
            setTimeout(() => flash.remove(), 300);
        }

        const style = document.createElement('style');
        style.textContent = '@keyframes flashFade { 0% { opacity: 1; } 100% { opacity: 0; } }';
        document.head.appendChild(style);

        // Create ghosts
        ${showGhosts ? `
        for (let i = 0; i < config.ghosts; i++) {
            const ghost = document.createElement('div');
            ghost.className = 'ghost';
            ghost.textContent = '👻';
            ghost.style.left = Math.random() * 90 + '%';
            ghost.style.top = Math.random() * 80 + '%';
            ghost.style.animationDelay = Math.random() * 5 + 's';
            ghost.style.animationDuration = (12 + Math.random() * 8) + 's';
            
            ghost.addEventListener('click', (e) => {
                e.stopPropagation();
                ghost.textContent = ['👻', '😱', '🎃', '💀'][Math.floor(Math.random() * 4)];
                ghost.style.transform = 'scale(1.5) rotate(360deg)';
                setTimeout(() => {
                    ghost.style.transform = '';
                    ghost.textContent = '👻';
                }, 500);
                createClickExplosion(e.clientX, e.clientY);
            });
            
            container.appendChild(ghost);
        }
        ` : ''}

        // Create spider webs
        ${showWebs ? `
        const webPositions = [
            { top: '5%', left: '5%' },
            { top: '5%', right: '5%' },
            { bottom: '5%', left: '5%' },
            { bottom: '5%', right: '5%' }
        ];
        
        webPositions.slice(0, config.webs).forEach((pos, i) => {
            const web = document.createElement('div');
            web.className = 'spider-web';
            web.textContent = '🕸️';
            Object.assign(web.style, pos);
            web.style.animationDelay = i * 0.5 + 's';
            container.appendChild(web);
        });
        ` : ''}

        // Create falling particles
        ${showParticles ? `
        const particles = ['🦇', '🍂', '🍁', '🕷️'];
        for (let i = 0; i < config.particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = particles[Math.floor(Math.random() * particles.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (8 + Math.random() * 8) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(particle);
        }
        ` : ''}

        // Create pumpkins
        ${showPumpkins ? `
        for (let i = 0; i < config.pumpkins; i++) {
            const pumpkin = document.createElement('div');
            pumpkin.className = 'pumpkin';
            pumpkin.textContent = '🎃';
            pumpkin.style.left = (i * (100 / config.pumpkins)) + '%';
            pumpkin.style.bottom = '10px';
            pumpkin.style.animationDelay = i * 0.3 + 's';
            container.appendChild(pumpkin);
        }
        ` : ''}

        // Create fog
        ${showFog ? `
        const fog = document.createElement('div');
        fog.className = 'fog';
        container.appendChild(fog);
        ` : ''}
    </script>
</body>
</html>`;
}

export function deactivate() {
    if (effectsPanel) {
        effectsPanel.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
