window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1400;
    canvas.height = 800;  
    ctx.imageSmoothingEnabled = false;
    let enemies = [];
    let decos = [];
    let score = 0;
    let gameover = false;
    let bestscore = 0;

    class InputHandler {
        constructor(context) {
            this.keys = [];
            window.addEventListener('keydown', e => {
                if (gameover && e.key == ' ') {
                    if (score > bestscore) {
                        bestscore = score;
                    }
                    score = 0;
                    gameover = false;
                    player.x = 0;
                    player.y = 0;
                    enemies = [];
                    context.textAlign = 'left';
                    requestAnimationFrame(animate)
                }
                if ((   e.key == 'w' ||
                        e.key == 'a' ||
                        e.key == 's' ||
                        e.key == 'd' ||
                        e.key == 'ArrowDown' ||
                        e.key == 'ArrowUp' ||
                        e.key == 'ArrowLeft' ||
                        e.key == 'ArrowRight') && this.keys.indexOf(e.key) == -1) {
                    this.keys.push(e.key);
                }
            })
            window.addEventListener('keyup', e => {
                if (    e.key == 'w' ||
                        e.key == 'a' ||
                        e.key == 's' ||
                        e.key == 'd' ||
                        e.key == 'ArrowDown' ||
                        e.key == 'ArrowUp' ||
                        e.key == 'ArrowLeft' ||
                        e.key == 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            })
        }
    }

    function collision(x1,y1,w1,h1,x2,y2,w2,h2) {
        if ((x1 > x2 + w2) ||
            (x1 + w1 < x2) || 
            (y1 > y2 + h2) ||
            (y1 + h1 < y2)) {
            return false;
        } else {
            return true;
        }
    }

    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight
            this.width = 100;
            this.height = 100;
            this.x = 0;
            this.y = 0;
            this.image = document.getElementById('playerImage');
            this.speedx = 0;
            this.speedy = 0;
            this.frame = 0;
            this.frameTime = 0;
            this.frameInterval = 500;
        }
        draw(context) {
            context.drawImage(this.image,this.frame * 64,0,64,64,this.x-14, this.y-14, 128, 128);
        }
        update(input, deltaTime) {
            enemies.forEach(enemy => {
                if (collision(this.x, this.y+35, 95, 65, enemy.x, 0, enemy.width, enemy.y) ||
                    collision(this.x, this.y+35, 95, 65, enemy.x, enemy.y+200, enemy.width, 800) ||
                    collision(this.x+60,this.y,40,35, enemy.x, 0, enemy.width, enemy.y) ||
                    collision(this.x+60,this.y,40,35, enemy.x, enemy.y+200, enemy.width, 800)) {
                    gameover = true;
                }
            });
            this.frameTime += deltaTime;
            if (this.frameTime > this.frameInterval) {
                this.frameTime = 0;
                this.frame++;
                if (this.frame > 1) {
                    this.frame = 0;
                }
            }

            if ((input.keys.indexOf('ArrowRight') > -1) || ((input.keys.indexOf('d')) > -1)) {
                this.speedx = 5;
            } else if ((input.keys.indexOf('ArrowLeft') > -1) || ((input.keys.indexOf('a')) > -1)) {
                this.speedx = -5;
            } else {
                this.speedx = 0;
            }
            if ((input.keys.indexOf('ArrowUp') > -1) || ((input.keys.indexOf('w')) > -1)) {
                this.speedy = -5;
            } else if ((input.keys.indexOf('ArrowDown') > -1) || ((input.keys.indexOf('s')) > -1)) {
                this.speedy = 5;
            } else {
                this.speedy = 0;
            }
            this.x += this.speedx;
            this.y += this.speedy;
            if (this.x < 0) {
                this.x = 0;
            } else if (this.x > this.gameWidth - this.width) {
                this.x = this.gameWidth - this.width
            }
            if (this.y < 0) {
                this.y = 0;
            } else if (this.y > this.gameHeight - this.height) {
                this.y = this.gameHeight - this.height;
            }
        }
    }   

    class Decoration {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('grass');
            this.x = this.gameWidth;
            this.speed = (score/100+4);
            if (this.speed > 10) {
                this.speed = 10;
            }
            this.y = Math.random()*(this.gameHeight-30);
            this.markedfordelete = false;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y,40,30);
        }
        update() {
            if (this.x < -40) {
                this.markedfordelete = true;
            }
            this.x -= this.speed;
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth
            this.gameHeight = gameHeight
            this.width = 150;
            this.height = 900;
            this.image = document.getElementById('waterImage');
            this.image2 = document.getElementById('woodImage');
            this.x = this.gameWidth;
            this.y = Math.random()*600;
            this.markedfordelete = false;
            this.speed = (score/100+4);
            if (this.speed > 10) {
                this.speed = 10;
            }
            this.canMove = false;
            if (Math.random()*10 > 6) {
                this.canMove = true;
            }
            this.vel = 2;
        }
        draw(context){
            context.drawImage(this.image,0,0,this.width,this.height, this.x, -5, this.width, this.height);
            context.drawImage(this.image2,0,0,this.width,200,this.x, this.y, this.width,200);
        }
        update() {
            this.x -= this.speed;
            if (this.x < -this.width) {
                this.markedfordelete = true;
            }
            if (this.canMove) {
                this.y += this.vel;
                if (this.y > this.gameHeight-200) {
                    this.vel = -2;
                    this.y = this.gameHeight-200;
                } else if (this.y < 0) {
                    this.vel = 2;
                    this.y = 0;
                }
            } 
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0; 
            randomInterval = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.update();
            enemy.draw(ctx);
        })
        enemies = enemies.filter(enemy => !enemy.markedfordelete);
    }
    
    let decoTimer = 0;
    let decoInterval = 100;
    let decoRandom = Math.random()*100; 

    function handleDecoration(deltaTime) {
        if (decoTimer > decoInterval + decoInterval) {
            decos.push(new Decoration(canvas.width, canvas.height));
            decoTimer = 0; 
            decoRandom = Math.random();
        } else {
            decoTimer += deltaTime;
        }
        decos.forEach(deco => {
            deco.update();
            deco.draw(ctx);
        })
        decos = decos.filter(deco => !deco.markedfordelete);
    }

    function displayStatusText(context, deltaTime) {
        scoreTimer += deltaTime;
        if (scoreTimer > scoreInterval) {
            score++;
            scoreTimer = 0;
        }
        context.fillStyle = 'black';
        context.font = '40px Helvetica';
        context.fillText('Score: ' + score, 20, 50);
        context.fillText('Best Score: ' + bestscore, 20, 90);
        if (gameover) {
            context.textAlign = 'center';
            context.fillstyle = 'black';
            context.fillText('Game Over, press space to restart!', canvas.width/2, 200);
        }
    }
    
    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 2000;
    let randomInterval = Math.random() * 2000;
    let scoreTimer = 0;
    let scoreInterval = 100;

    const input = new InputHandler(ctx);
    const player = new Player(canvas.width, canvas.height);

    function animate(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        handleDecoration(deltaTime);
        handleEnemies(deltaTime);
        player.update(input, deltaTime);
        player.draw(ctx);
        displayStatusText(ctx, deltaTime);
        if (!gameover) {
            requestAnimationFrame(animate);
        }
    }
    animate(0);
});