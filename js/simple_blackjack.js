// Top-level namespace
var blackjack = blackjack || {};

// Nested namespace for core card game functionality
blackjack.cardBase = blackjack.cardBase || {};

// Freeze enums to emulate immutability
blackjack.cardBase.SuitEnum = Object.freeze({
        Hearts: 'Hearts', Diamonds: 'Diamonds', Clubs: 'Clubs', Spades: 'Spades'
});

blackjack.cardBase.RankEnum =  Object.freeze({
        Ace: 1, Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, 
        Nine: 9, Ten: 10, Jack: 11, Queen: 12, King: 13
});

blackjack.cardBase.NameEnum = Object.freeze({
        1: 'Ace', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 
        8: 'Eight', 9: 'Nine', 10: 'Ten', 11: 'Jack', 12: 'Queen', 13: 'King'
});


blackjack.cardBase.LinkedList = function() {
    this.length = 0;
    this.head = null;
}

blackjack.cardBase.Node = function(data) {
    this.data = data;
    this.next = null;
}

blackjack.cardBase.LinkedList.prototype = {

    add: function(data) {
        var node = new blackjack.cardBase.Node(data);

        // Base case: empty list
        if (this.head === null) {
            this.head = node;
        }
        else {
            current = this.head;

            while(current.next) {
                current = current.next;
            }

            current.next = node;
        }

        this.length++;

        return node;
    },

    forEach: function(callback) {
        var current = this.head;

        while(current != null) {
            callback(current.data);

            current = current.next;
        }
    },
};

blackjack.cardBase.Card = function(rank, suit) {
    this.rank = rank;
    this.suit = suit;
}

blackjack.cardBase.Card.prototype.toString = function() {
    return blackjack.cardBase.NameEnum[this.rank] + " of " + this.suit;
}

// A standard 52-card French deck
blackjack.cardBase.Deck = function() {
    this.cards = [];

    Object.defineProperties(this, {
        "count": {
            "get": function() { return this.cards.length; }
        }
    });

    // Populate the cards array
    this.init = function() {

        // Sibling namespace
        var ns = blackjack.cardBase;

        for(var s in ns.SuitEnum) {
            for(var r in ns.RankEnum) {
                this.cards.push(new ns.Card(ns.RankEnum[r], s));
            }
        }
    }

    // Automatically initialize new instances
    this.init();
}

blackjack.cardBase.Player = function(name) {
    this.name = name;
    this.hand = [];

    // Print the players hand to the console
    this.showHand = function() {
        console.log(this.name + '\'s hand: ');

        this.hand.forEach(function(card) {
            console.log(card.toString());
        });
    }
}

blackjack.cardBase.Dealer = function(name) {

    // Invoke parent constructor
    blackjack.cardBase.Player.call(this, name);

    this.deck = new blackjack.cardBase.Deck();

    // Fisher-Yates shuffle algorithm
    this.shuffleDeck = function() {
        var deck = this.deck.cards;

        for (var i = deck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = deck[i];

            deck[i] = deck[j];
            deck[j] = temp;
        }

        this.deck.cards = deck;;
    }

    this.deal = function(player) {
        topCard = this.deck.cards.shift();
        player.hand.push(topCard);

        return topCard;
    }

    // Automatically shuffle new instances
    this.shuffleDeck();
}

blackjack.cardBase.Dealer.prototype = Object.create(blackjack.cardBase.Player.prototype);

blackjack.cardBase.showDeck = function(deck) {
    deck.cards.forEach(function(card) {
        console.log(card.toString());
    });
}

// Nested namespace for blackjack specific extensions of the card base
blackjack.game = {};

// Returns the point value of a players hand
blackjack.game.handValue = function(hand) {
    var sum = 0, aces = 0;

    hand.forEach(function(card) {

        // If the card is an ace wait to determine if soft or hard
        if (card.rank === blackjack.cardBase.RankEnum.Ace) {
            aces++;
        }
        // Add 10 for a face card
        else if (card.rank >= blackjack.cardBase.RankEnum.Ten) {
            sum += blackjack.cardBase.RankEnum.Ten;
        }
        // Otherwise just add the rank
        else {
            sum += card.rank;
        }
    });

    // If the point value won't exceed 21
    if(aces === 1 && sum <= 10)
        // Soft ace
        return sum + blackjack.cardBase.RankEnum.Jack;

    // Otherwise hard ace(s)
    return sum + aces;
}

blackjack.game.dealCard = function(dealer, player) {
    return dealer.deal(player);
}

blackjack.game.dealCards = function(dealer, players, numberOfCards) {
        for(var i = 0; i < numberOfCards; i++) {
            players.forEach(function(player) {
                dealer.deal(player);
            });

            dealer.deal(dealer);
        }
}

// Helper function to format and print a players information
blackjack.game.printPlayer = function(player) {
    player.showHand(); 

    console.log('Total: ' + blackjack.game.handValue(player.hand));
    console.log('\n');
}

blackjack.game.printHands = function(dealer, players) {
    console.clear();

    blackjack.game.printPlayer(dealer);

    players.forEach(function(player) {
        blackjack.game.printPlayer(player);
    });
}

// Helper function to check if a hand is blackjack
blackjack.game.checkBlackjack = function(score, hand) {
    if(score === 21 && hand.count === 2) 
        return true;

    return false;
}

blackjack.game.play = function() {
    var game = blackjack.game, base = blackjack.cardBase;
    var players = new base.LinkedList(), startingCards = 2, bustLimit = 21, dealerHitLimit = 17;

    var dealer = new base.Dealer('Joe Dealer');

    players.add(new base.Player(prompt('What\'s your name?')));

    game.dealCards(dealer, players, startingCards);

    game.printHands(dealer, players);

    players.forEach(function(player) {
        while(game.handValue(player.hand) < bustLimit) {
            if(confirm('Press OK to hit, cancel to stand.')){
                game.dealCard(dealer, player);

                game.printHands(dealer, players);
            }
            else
                break;
        }
    });

    // Dealer plays after everyone else
    while(game.handValue(dealer.hand) < dealerHitLimit) {
        game.dealCard(dealer, dealer);
    }

    game.printHands(dealer, players);

    var dealerScore = game.handValue(dealer.hand)

    players.forEach(function(player) {
        var score = game.handValue(player.hand);

        // If the player busted
        if (score > bustLimit) {
            console.log(player.name + ' busts. No soup for you!');
        }
        // If players score is lower than dealers and neither busted
        else if (score < dealerScore && dealerScore < bustLimit) {
            console.log('Dealer beats ' + player.name + '. Better luck next time.');
        }
        // If the player has blackjack
        else if (game.checkBlackjack(score, player.hand)) {
            // If the dealer also has blackjack it's a tie. Bad luck amigo.
            if (dealer.checkBlackjack(dealerScore, dealer.hand)) {
                console.log('Standoff! ' + player.name + ' and dealer both have blackjack.');
            }
            // Player wins
            else {
                console.log('Blackjack! ' + player.name + ' wins.');
            }
        }
        // If the dealer busts or has a lower score
        else if (score > dealerScore || dealerScore > bustLimit) {
            console.log(player.name + ' beats dealer! Have a cookie.');
        }
        // Otherwise it's a draw
        else {
            console.log(player.name + ' and dealer push. No winners here.');
        }
    });
}