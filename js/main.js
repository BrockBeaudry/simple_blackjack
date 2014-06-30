$(document).ready(function() {

    $('#hit').on("click", function() {
        var newCard = game.dealCard(dealer, player);

        UI.displayCard(newCard, 'player');
        game.printHands(dealer, players);

        if(game.handValue(player.hand) > bustLimit) {
            $(this).prop("disabled", true);
            $('#stand').trigger('click');
        }
    });

    $('#stand').on("click", function() {
        while(game.handValue(dealer.hand) < dealerHitLimit) {
            var newCard = game.dealCard(dealer, dealer); 

            UI.displayCard(newCard, 'dealer'); 
        }

        game.printHands(dealer, players);

        var dealerScore = game.handValue(dealer.hand)

        var score = game.handValue(player.hand);

        var result;

        // If the player busted
        if (score > bustLimit) {
            result = player.name + ' busts. No soup for you!' 
        }
        // If players score is lower than dealers and neither busted
        else if (score < dealerScore && dealerScore < bustLimit) {
            result = 'Dealer beats ' + player.name + '. Better luck next time.';
        }
        // If the player has blackjack
        else if (game.checkBlackjack(score, player.hand)) {
            // If the dealer also has blackjack it's a tie. Bad luck amigo.
            if (dealer.checkBlackjack(dealerScore, dealer.hand)) {
                result = 'Standoff! ' + player.name + ' and dealer both have blackjack.';
            }
            // Player wins
            else {
                result = 'Blackjack! ' + player.name + ' wins.';
            }
        }
        // If the dealer busts or has a lower score
        else if (score > dealerScore || dealerScore > bustLimit) {
            result = player.name + ' beats dealer! Have a cookie.';
        }
        // Otherwise it's a draw
        else {
            result = player.name + ' and dealer push. No winners here.';
        }

        console.log(result);
        $('#results').text(result);

        setTimeout(function(){
            window.location.reload();
        }, 2000);

    });

    var game = blackjack.game, base = blackjack.cardBase;
    var players = new base.LinkedList(), startingCards = 2, bustLimit = 21, dealerHitLimit = 17;

    var dealer = new base.Dealer('Dealer');

    var player = players.add(new base.Player("Player")).data;

    UI.initCardDisplays(players);

    game.dealCards(dealer, players, startingCards);

    game.printHands(dealer, players);
    UI.displayAllHands(dealer, players);
});


var UI = UI || {};

UI.CardSuit = {
    Hearts: '&hearts;', Diamonds: '&diams;', Clubs: '&clubs;', Spades: '&spades;'
};

UI.CardRank = {
     1: 'A', 11: 'J', 12: 'Q', 13: 'K'
}

UI.CardColor = {
    Hearts: 'red', Diamonds: 'red', Clubs: 'black', Spades: 'black'
}

UI.initCardDisplays = function (players) {
    players.forEach(function(player) {
        $('#players').append(
            $('<section/>')
                .attr('id',player.name.toLowerCase())
                .addClass('player')
        );
    });
    
}

UI.displayCard = function(card, id) {
    var rank = (UI.CardRank[card.rank] || card.rank);
    var suit = UI.CardSuit[card.suit];
    var color = UI.CardColor[card.suit];

    $('<div/>')
        .addClass("wrapper-hack")
        .append(

           $('<div/>')
                .addClass("card")
                .append("<p>" + rank + "<br>" + suit + "</p><p>" + suit + "</p><p>" + 
                    rank + "<br>" + suit + "</p>")
                .css({ 'color' : color })
                .hide()
                .fadeIn("slow") 
            )
        .appendTo('#' + id.toLowerCase())
}

UI.displayHand = function(player) {
    player.hand.forEach(function(card) {
        UI.displayCard(card, player.name);
    });
}

UI.displayAllHands = function(dealer, players) {
    UI.displayHand(dealer);

    players.forEach(function (player) {
        UI.displayHand(player);
    });
}
