var ROWS = COLUMNS = 3;

var GRID_LENGTH = ROWS * COLUMNS;

var GRID_PIXEL_UNIT_SIZE = 121; // 104
var GRID_PIXEL_WIDTH = COLUMNS * GRID_PIXEL_UNIT_SIZE;
var GRID_PIXEL_HEIGHT = ROWS * GRID_PIXEL_UNIT_SIZE;

function drawSprite(context, name, sheet, x, y, centerOnOrigin, sourceFrame, destinationSize) {
    if (sheet) {
        var data = sheet.data;

        var frame = data["frames"][name]["frame"];
        var sourceSize = data["frames"][name]["sourceSize"];

        if (sheet.image) {
            if (sourceFrame) {
                frame.x += sourceFrame.x;
                frame.y += sourceFrame.y;
                frame.w = sourceFrame.w;
                frame.h = sourceFrame.h;

                sourceSize = {
                    w: sourceFrame.w,
                    h: sourceFrame.h
                }
            }

            if (destinationSize) {
                sourceSize = destinationSize;
            }

            // in safari there's some kind of index error where sourceSize has negative or too large values..
            // ..but isn't it supposed to scale to that size?
/*
            if (sourceSize.w < 0) {
                sourceSize.w = 0;
            }

            if (sourceSize.h < 0) {
                sourceSize.h = 0;
            }
*/
            context.drawImage(
                sheet.image,
                frame.x, frame.y, 
                frame.w, frame.h, 
                centerOnOrigin ? x - (frame.w / 2) : x, 
                centerOnOrigin ? y - (frame.h / 2) : y, 
                sourceSize.w, sourceSize.h);
        }
    }
}

function drawCard(context, card, position) {
    if (!card) {
        return;
    }

    if (card.spriteAnimation && card.spriteAnimation.isAnimating()) {
        drawSprite(context, card.spriteAnimation.getSprite(), card.spriteSheet, position.x, position.y);
    } else {
        drawSprite(context, card.sprite, card.spriteSheet, position.x, position.y);
    }

    if (card.value) {
        var cardSourceSize = card.spriteSheet.data["frames"][card.sprite]["sourceSize"]

        //context.font = '64px Crystal Deco';
        context.font = '32px HeinzHeinrich';
        context.textBaseline = 'middle';
    
        context.textAlign = "center";

        var centerPosition = {
            x: position.x + (cardSourceSize.w / 2),
            y: position.y + (cardSourceSize.h / 2) + 8
        }

        var adjustedPosition = centerPosition;

        context.fillStyle = 'rgb(200, 200, 200)';
        context.fillText(card.value, adjustedPosition.x, adjustedPosition.y - 1);
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillText(card.value, adjustedPosition.x, adjustedPosition.y);
    }
}

function getGridUnitPosition(column, row) {
    return {
        x: column * GRID_PIXEL_UNIT_SIZE,
        y: row * GRID_PIXEL_UNIT_SIZE
    }
}

function getGridUnitIndex(column, row) {
    return column * ROWS + row; // row major
    //return row * COLUMNS + column; // column major ()
};

function getGridUnitIndexAtPosition(x, y) {
    return getGridUnitIndex(
        Math.floor(x / GRID_PIXEL_UNIT_SIZE), 
        Math.floor(y / GRID_PIXEL_UNIT_SIZE));
}

var PHASE_DIG = 1;
var PHASE_COMBAT = 2;
var PHASE_LOST = 3;

var activePhase = PHASE_DIG;

function beginPhase(phase) {
    activePhase = phase;

    switch (activePhase) {
        default: break;

        case PHASE_DIG: {
            console.log("initiating digging phase..");

            board.reset();

            board.hidden = false;
            board.disabled = false;

            combat.hidden = true;
            combat.disabled = true;

            enemyMeter.hidden = true;
            enemyMeter.disabled = true;
        } break;

        case PHASE_COMBAT: {
            console.log("initiating combat phase..");

            combat.reset();

            board.hidden = true;
            board.disabled = true;

            combat.hidden = false;
            combat.disabled = false;

            enemyMeter.hidden = false;
            enemyMeter.disabled = false;
        } break;

        case PHASE_LOST: {
            console.log("initiating lost phase..");

            titleBar.position.y = (PREFERRED_HEIGHT / 2) - 90;

            board.hidden = true;
            board.disabled = true;

            combat.hidden = true;
            combat.disabled = true;

            enemyMeter.hidden = true;
            enemyMeter.disabled = true;
        } break;
    }
}

var Card = function(sprite, sheet, animation) {
    this.sprite = sprite;
    this.spriteSheet = sheet;
    this.spriteAnimation = animation;

    this.init();
}

Card.prototype = {
    init: function() {

    },

    canBeApplied: function(phase) {
        return true;
    }
}

function rand(exclusiveMax) {
    return Math.floor(Math.random() * exclusiveMax);
}

function getAttackCard(value) {
    var sprite = "card_offensive_a.png";

    var card = new Card(
        sprite, 
        sheets.cards_offensive_1);

    card.value = value;
    card.offensive = true;

    card.apply = function() {
        console.log("dealing '" + card.value + "' damage!");

        enemyMeter.increase(-card.value);
    };

    return card;
}

function getHealthCard(value) {
    var sprite = "card_defensive_a.png";

    var card = new Card(
        sprite, 
        sheets.cards_defensive_1);

    card.value = value;
    card.defensive = true;

    card.apply = function() {
        console.log("healing '" + card.value + "' damage!");

        lifeMeter.increase(card.value);
    };

    return card;
}

function dig(data) {
    var type = data;

    var amount = 1;

    // todo: if player is low on either def/off, then adjust chance in favor of that type
    switch (type) {
        default:
        case 1: amount = 1; break;
        case 2: amount = 1 + rand(2); break;
        case 3: amount = 1 + rand(3); break;
    }

    for (var i = 0; i < amount; i++) {
        var cardType = rand(100);
        var card;

        if (cardType > 65) {
            card = getHealthCard(1 + rand(3)); 
        } else {
            card = getAttackCard(1 + rand(10)); 
        }

        if (card) {
            deck.add(card);
        }
    }
}

function getDirtCard() {
    var sprite = "dirt_light_1.png";

    var type = 1 + rand(3);
    var variation = 1 + rand(3);

    if (type > 0 && variation > 0 && 
        type <= 3 && variation <= 3) {
        var typeName;
        
        switch (type) {
            default:
            case 1: typeName = "light"; break;
            case 2: typeName = "medium"; break;
            case 3: typeName = "heavy"; break;
        }

        sprite = "dirt_{0}_{1}.png".format(typeName, variation);
    }

    var card = new Card(
        sprite, 
        sheets.dirt,
        new SpriteAnimation([
            { sprite: 'dirt_light_2_broken_1.png', time: 200 },
            { sprite: 'dirt_light_2_broken_2.png', time: 200 },
            { sprite: 'dirt_light_2_broken_3.png', time: 200 }
        ]));

    card.apply = function() {
        dig(type);
    };

    return card;
}












//////////////////////////
// Deck
////////////////////////

var Deck = function() {
    this.init();
}

Deck.prototype = {
    origin: {
        x: (PREFERRED_WIDTH / 2),
        y: PREFERRED_HEIGHT - 90
    },
    
    _cards: [],
    _cardSize: { w: 104, h: 105 },
    _cardOffset: 12,
    _cardSelectedOffset: -32,//-110,//-84,
    _cardNotSeenOffset: -14,

    _selectedCardIndex: -1,

    getBounds: function() {
        var clippedAmountOfCards = this._cards.length - 1;

        var width = clippedAmountOfCards > 0 ? (clippedAmountOfCards * this._cardOffset) + this._cardSize.w : this._cardSize.w;
        var height = this._cardSize.h + 20;

        return {
            w: width,
            h: height
        }
    },

    init: function() {
        var self = this;

        $(window).bind("mousemove", function(e) {
            if (self.disabled) {
                return;
            }

            if (canvas) {
                var position = getCursorPosition(canvas, e);
                
                var bounds = self.getBounds();

                var halfWidth = bounds.w / 2;
                var halfHeight = bounds.h / 2;

                var intersected = false;

                if (position.x >= self.origin.x - halfWidth && position.x <= self.origin.x + halfWidth) {
                    if (position.y >= self.origin.y - halfHeight && position.y <= self.origin.y + halfHeight) {
                        intersected = true;

                        var offset = {
                            x: position.x - (self.origin.x - halfWidth),
                            y: position.y - (self.origin.y - halfHeight)
                        }

                        var columns = self._cards.length > 0 ? self._cards.length - 1 : 1;
                        var columnSize = self._cardOffset;//bounds.w / self._cards.length;

                        var hoveringOverCardAtIndex = Math.floor(offset.x / columnSize);

                        if (hoveringOverCardAtIndex >= self._cards.length) {
                            hoveringOverCardAtIndex = self._cards.length - 1;
                        }

                        if (self.canSelectCardAtIndex(hoveringOverCardAtIndex)) {
                            self._selectedCardIndex = hoveringOverCardAtIndex;

                            delete self._cards[hoveringOverCardAtIndex].hasNotBeenSeenYet;
                        }
                    }
                }

                if (!intersected) {
                    self._selectedCardIndex = -1;
                }
            }
        });

        $(window).bind("mouseup", function(e) {
            if (self.disabled) {
                return;
            }

            if (canvas) {
                var position = getCursorPosition(canvas, e);

                var bounds = self.getBounds();

                var halfWidth = bounds.w / 2;
                var halfHeight = bounds.h / 2;

                var intersected = false;

                if (position.x >= self.origin.x - halfWidth && position.x <= self.origin.x + halfWidth) {
                    if (position.y >= self.origin.y - halfHeight && position.y <= self.origin.y + halfHeight) {
                        intersected = true;
                    }
                }

                if (intersected) {
                    if (self._selectedCardIndex != -1) {
                        if (self.canPickCardAtIndex(self._selectedCardIndex)) {
                            self.onCardAtIndexPicked(self._selectedCardIndex);
                        }
                    }
                }
            }
        });
    },

    step: function(dt) {
        for (var i in this._cards) {
            var card = this._cards[i];

            if (card.spriteAnimation) {
                card.spriteAnimation.advance(dt);
            }
        }
    },

    draw: function(context) {
        var bounds = this.getBounds();

        var halfWidth = bounds.w / 2;
        var halfHeight = bounds.h / 2;

        var bringSelectedCardToFront = true;

        for (var i in this._cards) {
            var card = this._cards[i];

            var cardIsCurrentlySelected = i == this._selectedCardIndex;

            if (bringSelectedCardToFront) {
                if (cardIsCurrentlySelected) {
                    continue;
                }
            }

            var position = {
                x: (this.origin.x - halfWidth) + (i * this._cardOffset),
                y: ((this.origin.y + halfHeight) - this._cardSize.h) + (cardIsCurrentlySelected ? this._cardSelectedOffset : (card.hasNotBeenSeenYet ? this._cardNotSeenOffset : 0))
            }

            drawCard(context, card, position);
        }

        if (bringSelectedCardToFront) {
            if (this._selectedCardIndex != -1) {
                var selectedCard = this._cards[this._selectedCardIndex];

                var position = {
                    x: (this.origin.x - halfWidth) + (this._selectedCardIndex * this._cardOffset),
                    y: ((this.origin.y + halfHeight) - this._cardSize.h) + this._cardSelectedOffset
                }

                drawCard(context, selectedCard, position);
            }
        }
    },

    canSelectCardAtIndex: function(index) {
        // false if card is offensive or defensive while in digging phase
        // true if card is special, and in digging phase
        // false if card is special, and it is not usable in combat phase (card specific, check card.canBeApplied(phase))
        return true;
    },

    canPickCardAtIndex: function(index) {
        console.log("determining if card at index '" + index + "' can be played");

        var card = this._cards[index];

        if (!card) {
            return false;
        }

        switch (activePhase) {
            default: break;
            
            case PHASE_LOST: {
                return false; 
            } break;

            case PHASE_DIG: {
                // except for specials!
                if (!card.special) {
                    return false;
                }
            } break;

            case PHASE_COMBAT: {
                if (combat._isExecuting || combat._isResolvingEnemy) {
                    return false;
                }

                return (
                    (card.special || 
                    (card.offensive && combat.hasAvailableOffensiveSlots()) || 
                    (card.defensive && combat.hasAvailableDefensiveSlots()))
                );
                
            } break;
        }

        return true;
    },

    onCardAtIndexPicked: function(index) {
        console.log("picked card at index '" + index + "'");
                    
        var self = this;
        var card = this._cards[index];

        if (card.special) {
            // apply it right away, no matter which phase we're in
            var applyAndRemove = function() {
                card.apply();

                self.remove(index);
            }

            if (card) {
                if (card.apply) {
                    if (card.spriteAnimation) {
                        card.spriteAnimation.begin();

                        card.spriteAnimation.onAnimationEnd = function() {
                            applyAndRemove();
                        }
                    } else {
                        applyAndRemove();
                    }
                }
            }
        } else {
            if (activePhase == PHASE_COMBAT) {
                combat.add(card);
                self.remove(index);
            }
        }
    },

    add: function(card) {
        card.hasNotBeenSeenYet = true;

        // todo: animate it
        this._cards.push(card);
    },

    remove: function(index) {
        // todo: animate it
        this._cards.splice(index, 1);
    },
}













//////////////////////////
// Board
////////////////////////
// todo: be able to pick more than one card at a time - loot should appear once all initiated 
// animations have ended. this solution will work with any combination.

var Board = function() {
    this.init();
}

Board.prototype = {
    _selectedGridUnit: -1,
    _cardsFlipped: 0,
    _maximumFlips: 3,

    _grid: new Array(GRID_LENGTH),

    origin: {
        x: (PREFERRED_WIDTH / 2) - (GRID_PIXEL_WIDTH / 2),
        y: (PREFERRED_HEIGHT / 2) - (GRID_PIXEL_HEIGHT / 2) - 40
    },

    init: function() {
        this.reset();

        var self = this;

        $(window).bind("mouseup", function(e) {
            if (self.disabled) {
                return;
            }

            if (canvas) {
                var position = getCursorPosition(canvas, e);
        
                if (position.x >= self.origin.x && position.x <= self.origin.x + GRID_PIXEL_WIDTH) {
                    if (position.y >= self.origin.y && position.y <= self.origin.y + GRID_PIXEL_HEIGHT) {
                        var offset = {
                            x: position.x - self.origin.x,
                            y: position.y - self.origin.y
                        }

                        var unitIndex = getGridUnitIndexAtPosition(offset.x, offset.y);

                        if (self.canSelectUnitAtIndex(unitIndex)) {
                            self._selectedGridUnit = unitIndex;

                            self.onGridUnitAtIndexSelected(unitIndex);
                        }
                    }
                }       
            }   
        });
    },

    canSelectUnitAtIndex: function(index) {
        var card = this._grid[index];

        if (!card) {
            return false;
        }

        return true;
    },

    onMaximumFlipsReached: function() {
        setTimeout(function() {
            beginPhase(PHASE_COMBAT);
        }, 1000);
    },

    onGridUnitAtIndexSelected: function(index) {
        console.log("selected unit at index '" + this._selectedGridUnit + "'");

        var self = this;
        var card = this._grid[this._selectedGridUnit];
        var unitIndex = this._selectedGridUnit; // storing copy, since this index can change before animation finishes

        var applyAndRemove = function() {
            card.apply();

            delete self._grid[unitIndex];

            self._cardsFlipped++;

            if (self._cardsFlipped >= self._maximumFlips) {
                self._cardsFlipped = self._maximumFlips;

                self.onMaximumFlipsReached();
            }
        }

        if (card) {
            if (card.apply) {
                if (card.spriteAnimation) {
                    card.spriteAnimation.begin();

                    card.spriteAnimation.onAnimationEnd = function() {
                        applyAndRemove();
                    }
                } else {
                    applyAndRemove();
                }
            }
        }
    },

    reset: function() {
        this._selectedGridUnit = -1;
        this._cardsFlipped = 0;

        this.populate();
    },

    populate: function() {
        for (var i = 0; i < GRID_LENGTH; i++) {
            this._grid[i] = getDirtCard();
        }
    },

    step: function(dt) {
        for (var i = 0; i < GRID_LENGTH; i++) {
            var card = this._grid[i];

            if (!card) {
                continue;
            }

            if (card.spriteAnimation) {
                card.spriteAnimation.advance(dt);
            }
        }
    },

    draw: function(context) {
        for (var column = 0; column < COLUMNS; column++) {
            for (var row = 0; row < ROWS; row++) {
                var position = getGridUnitPosition(column, row);
                var card = this._grid[getGridUnitIndex(column, row)];

                if (!card) {
                    continue;
                }

                position.x += this.origin.x;
                position.y += this.origin.y;

                var center = {
                    x: position.x + (GRID_PIXEL_UNIT_SIZE / 2),
                    y: position.y + (GRID_PIXEL_UNIT_SIZE / 2)
                }

                if (card.spriteAnimation && card.spriteAnimation.isAnimating()) {
                    drawSprite(context, card.spriteAnimation.getSprite(), card.spriteSheet, center.x, center.y, true);
                } else {
                    drawSprite(context, card.sprite, card.spriteSheet, center.x, center.y, true);
                }
            }
        }
    }
}





var titleBar = {
    position: {
        x: (PREFERRED_WIDTH / 2),
        y: 40
    },

    draw: function(context) {
        var title;

        switch (activePhase) {
            default:
            case PHASE_DIG: {
                title = "Dig for treasure";
            } break;

            case PHASE_COMBAT: {
                title = "Fight to survive";
            } break;

            case PHASE_LOST: {
                title = "You are dead";
            } break;
        }

        if (title) {
            context.font = '28px HeinzHeinrich';
            context.textBaseline = 'middle';
            context.textAlign = "center";
            context.fillStyle = 'rgba(0, 0, 0, 0.75)';
            context.fillText(title, this.position.x, this.position.y);
        }
    }
}






//////////////////////////
// Combat
////////////////////////

var CombatResolver = function() {
    this._maxOffensiveSlots = 3;
    this._maxDefensiveSlots = 2;
    this._offensiveSlots = [];
    this._defensiveSlots = [];
    this._isExecuting = false;
    this._isResolvingEnemy = false;
    this._timeAppliedLastCard = 0;

    this.init();
}

CombatResolver.prototype = {
    reset: function() {
        this._isExecuting = false;
        this._isResolvingEnemy = false;
        this._offensiveSlots.length = 0;
        this._defensiveSlots.length = 0;
        this._timeAppliedLastCard = 0;
    },

    init: function() {
        var self = this;

        $(window).bind("mouseup", function(e) {
            if (self._isExecuting || self.disabled) {
                return;
            }

            if (canvas) {
                var position = getCursorPosition(canvas, e);

                if (position.x >= board.origin.x && position.x <= board.origin.x + GRID_PIXEL_WIDTH) {
                    if (position.y >= board.origin.y && position.y <= board.origin.y + GRID_PIXEL_HEIGHT) {
                        var offenseBottom = board.origin.y + deck._cardSize.h + 65;
                        var defenseBottom = offenseBottom + deck._cardSize.h + 65;
                        
                        if (position.y < offenseBottom) {
                            console.log("tapped offense");
                            if (self._offensiveSlots.length > 0) {
                                self.removeTopCard(self._offensiveSlots);
                            }
                        } else if (position.y < defenseBottom) {
                            console.log("tapped defense");
                            if (self._defensiveSlots.length > 0) {
                                self.removeTopCard(self._defensiveSlots);
                            }
                        } else if (position.y > defenseBottom && position.y < defenseBottom + 64 && position.x > (board.origin.x + (GRID_PIXEL_WIDTH / 2)) - 78 && position.x < (board.origin.x + (GRID_PIXEL_WIDTH / 2)) + 78) {
                            console.log("tapped execute");
                            if (self.canExecute()) {
                                self.execute();
                            }
                        }
                    }
                }
            }
        });
    },

    canExecute: function() {
        if (this._isExecuting || this._isResolvingEnemy) {
            return false;
        }

        var canExecuteTappedCards;
    
        if (this._offensiveSlots.length > 0 || this._defensiveSlots.length > 0) {
            canExecuteTappedCards = true;
        }

        return canExecuteTappedCards;
    },

    execute: function() {
        console.log("executing");

        this._isExecuting = true;
    },

    step: function(dt) {
        if (this._isExecuting) {
            var now = new Date().getTime();
            var timeSinceAppliedLastCard = now - this._timeAppliedLastCard;

            if (timeSinceAppliedLastCard > 1000) {
                this._timeAppliedLastCard = now;

                var card;
                var stack;

                if (this._defensiveSlots.length > 0) {
                    stack = this._defensiveSlots;
                    card = stack[stack.length - 1];
                } else if (this._offensiveSlots.length > 0) {
                    stack = this._offensiveSlots;
                    card = stack[stack.length - 1];
                } else {
                    this.onCombatResolved();
                }
        
                if (card) {
                    if (card.apply) {
                        card.apply();
                    }

                    if (stack) {
                        stack.pop();
                    }
                }
            }
        }
    },

    onCombatResolved: function() {
        var self = this;

        this._isExecuting = false;

        var enemyWasKilled = (enemyMeter.value == 0);

        setTimeout(function() {
            var playerWasKilled = false;

            if (!enemyWasKilled) {
                enemy.attack();

                if (lifeMeter.value == 0) {
                    playerWasKilled = true;
                }
            }

            if (lifeMeter.value > lifeMeter.maximum) {
                lifeMeter.value = lifeMeter.maximum;
            }

            if (playerWasKilled) {
                beginPhase(PHASE_LOST);
            } else {
                setTimeout(function() {
                    self._isResolvingEnemy = false;

                    if (enemyWasKilled) {
                        self.onEnemyKilled();
                    }

                    beginPhase(PHASE_DIG);
                }, 1000);
            }
        }, 1000);
    },

    onEnemyKilled: function() {
        enemy.damage = 5 + rand(10);
        enemyMeter.maximum = 20 + rand(50);
        enemyMeter.value = enemyMeter.maximum;
    },

    hasAvailableOffensiveSlots: function() {
        return this._offensiveSlots.length < this._maxOffensiveSlots;
    },

    hasAvailableDefensiveSlots: function() {
        return this._defensiveSlots.length < this._maxDefensiveSlots;
    },

    draw: function(context) {
        var position = {
            x: board.origin.x,
            y: board.origin.y - 32
        }

        context.font = '26px HeinzHeinrich';
        context.textBaseline = 'top';
        context.textAlign = "center";
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillText("offense", position.x + (GRID_PIXEL_WIDTH / 2), position.y);

        position.y += 65;

        var offset = 8;
        var margin = 4;

        context.strokeStyle = "rgba(0, 0, 0, 0.5)";
        context.lineWidth = 5;
        context.lineCap = "square";

        var slotFrame = {
            w: deck._cardSize.w + margin,
            h: deck._cardSize.h + margin
        }

        var combinedSlotsWidth = this._maxOffensiveSlots * (slotFrame.w + offset);

        var x;

        for (var i = 0; i < this._maxOffensiveSlots; i++) {
            x = (position.x + (GRID_PIXEL_WIDTH / 2)) - (combinedSlotsWidth / 2) + (i * (slotFrame.w + offset));

            context.strokeRect(x, position.y, slotFrame.w, slotFrame.h);

            if (this._offensiveSlots.length > i) {
                drawCard(context, this._offensiveSlots[i], { x: x + (margin / 2), y: position.y + (margin / 2) });
            }
        }

        position.y += slotFrame.h - 8;

        context.font = '26px HeinzHeinrich';
        context.textBaseline = 'top';
        context.textAlign = "center";
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillText("defense", position.x + (GRID_PIXEL_WIDTH / 2), position.y);

        position.y += 64;

        combinedSlotsWidth = this._maxDefensiveSlots * (slotFrame.w + offset);

        for (var i = 0; i < this._maxDefensiveSlots; i++) {
            x = (position.x + (GRID_PIXEL_WIDTH / 2)) - (combinedSlotsWidth / 2) + (i * (slotFrame.w + offset));

            context.strokeRect(x, position.y, slotFrame.w, slotFrame.h);

            if (this._defensiveSlots.length > i) {
                drawCard(context, this._defensiveSlots[i], { x: x + (margin / 2), y: position.y + (margin / 2) });
            }
        }

        position.y += slotFrame.h + 16;

        var canExecuteTappedCards = this.canExecute();

        context.fillStyle = 'rgba(255, 255, 255, ' + (canExecuteTappedCards ? '1)' : '0.5)');

        context.font = '20px HeinzHeinrich';
        context.textBaseline = 'top';
        context.textAlign = "center";
        context.fillStyle = 'rgba(0, 0, 0, ' + (canExecuteTappedCards ? '1)' : '0.5)');
        context.fillText("execute", deck.origin.x, position.y);
    },

    add: function(card) {
        if (card.offensive) {
            this._offensiveSlots.push(card);
        } else if (card.defensive) {
            this._defensiveSlots.push(card);
        }
    },

    removeTopCard: function(fromArray) {
        var removed = false;

        removed = fromArray.pop();
        
        if (removed) {
            deck.add(removed);
        }
    },
}









//////////////////////////
// Meters
////////////////////////

var METER_WIDTH = 42;
var METER_HEIGHT = 105;

function drawMeter(context, text, origin, scale, alpha) {
    if (alpha) {
        context.globalAlpha = alpha;
    } else {
        context.globalAlpha = 1;
    }

    drawSprite(context, "ui_meter_background.png", sheets.ui, origin.x, origin.y, false, null, { w: METER_WIDTH, h: METER_HEIGHT });

    var sourceFrame = { 
        x: 0, y: 0,
        w: METER_WIDTH, h: Math.floor(METER_HEIGHT * scale) 
    }

    drawSprite(context, "ui_meter_life.png", sheets.ui, origin.x, origin.y + METER_HEIGHT - (METER_HEIGHT * scale), false, sourceFrame);
    drawSprite(context, "ui_meter_frame.png", sheets.ui, origin.x, origin.y);

    var centerPosition = {
        x: origin.x + (METER_WIDTH / 2),
        y: origin.y + METER_HEIGHT + 18
    }

    var adjustedPosition = centerPosition;

    context.font = '21px HeinzHeinrich';
    context.textBaseline = 'middle';
    context.textAlign = "center";

    context.fillStyle = 'rgb(255, 255, 255)';
    context.fillText(text, adjustedPosition.x, adjustedPosition.y - 1);
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillText(text, adjustedPosition.x, adjustedPosition.y);
}

var lifeMeter = {
    minimum: 0,
    maximum: 20,
    value: 20,

    draw: function(context) {
        var scale = this.value / (this.maximum + this.minimum);

        if (scale > 1) {
            scale = 1;
        } else if (scale < 0) {
            scale = 0;
        }

        var offset = 32;

        var origin = {
            x: deck.origin.x - (deck.getBounds().w / 2) - offset - METER_WIDTH,
            y: deck.origin.y - (METER_HEIGHT / 2) - 6
        }

        var meterText = this.value;

        if (this.value > this.maximum) {
            meterText = "{0} (+{1})".format(this.maximum, this.value - this.maximum);
        }

        drawMeter(context, meterText, origin, scale);

        context.font = '13px HeinzHeinrich';
        context.textBaseline = 'middle';
        context.textAlign = "center";
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillText("player", origin.x + (METER_WIDTH / 2), origin.y - 20);
    },

    increase: function(amount) {
        this.value += amount;
/*
        if (this.value > this.maximum) {
            this.value = this.maximum;
        } else*/ if (this.value < this.minimum) {
            this.value = this.minimum;
        }
    },
}

var enemy = {
    damage: 4,

    attack: function() {
        lifeMeter.increase(-this.damage);
    },
}

var enemyMeter = {
    minimum: 0,
    maximum: 20,
    value: 20,

    draw: function(context) {
        var scale = this.value / (this.maximum + this.minimum);

        if (scale > 1) {
            scale = 1;
        } else if (scale < 0) {
            scale = 0;
        }

        var offset = 32;

        var origin = {
            x: deck.origin.x + (deck.getBounds().w / 2) + offset,
            y: deck.origin.y - (METER_HEIGHT / 2) - 6
        }

        drawMeter(context, "{0}/{1}".format(enemy.damage, this.value), origin, scale);

        context.font = '13px HeinzHeinrich';
        context.textBaseline = 'middle';
        context.textAlign = "center";
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillText("enemy", origin.x + (METER_WIDTH / 2), origin.y - 20);
    },

    increase: function(amount) {
        this.value += amount;

        if (this.value > this.maximum) {
            this.value = this.maximum;
        } else if (this.value < this.minimum) {
            this.value = this.minimum;
        }
    },
}

// initialize with random enemy
//combat.onEnemyKilled();

loop.drawables.push(titleBar);

var board = new Board();

loop.updateables.push(board);
loop.drawables.push(board);

var deck = new Deck();

deck.add(getAttackCard(4));
deck.add(getHealthCard(4));

loop.updateables.push(deck);
loop.drawables.push(deck);

loop.drawables.push(lifeMeter);
loop.drawables.push(enemyMeter);

var combat = new CombatResolver();

loop.updateables.push(combat);
loop.drawables.push(combat);

beginPhase(PHASE_DIG);
//beginPhase(PHASE_COMBAT);