var model
var handlers

(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.aoc = 'coui://ui/mods/army_of_cards'
  config.paths.shared = 'coui://ui/main/game/galactic_war/shared/js'
  config.paths.cards = 'coui://ui/main/game/galactic_war/cards'
  config.paths['shared/gw_common'] = 'coui://ui/mods/army_of_cards/gw_common'
})()

require([
  'aoc/army_of_cards',
  'aoc/deck',
], function aoc_start(aoc, deck) {
  "use strict";

  window.army_of_cards = aoc

  $(document).ready(function() {
    var empty = [
      {
        name: 'One',
        tag: '.one',
        start_card: 'gwc_start_vehicle',
        cards: [
          'gwc_start_vehicle',
        ],
      },
      {
        name: 'Two',
        tag: '.two',
        start_card: 'gwc_start_vehicle',
        cards: [
          'gwc_start_vehicle',
        ]
      },
    ]

    var ArmyViewModel = function(name) {
      var self = this
      self.name = ko.observable(name || 'army')
      self.tag = ko.computed(function() {
        return '.'+self.name().replace(/[^\w_]/, '').toLowerCase()
      })
      self.startCard = ko.observable(deck.startCards[0])
      self.cards = ko.observableArray([])
      self.addCard = function(id) {
        if (self.cards.indexOf(id) == -1) {
          self.cards.push(id)
        }
      }
      self.removeCard = function(id) {
        var i = self.cards.indexOf(id)
        if (i >= 0) {
          self.cards.splice(i, 1)
        }
      }
      self.selected = ko.observable(false)
    }

    var StartCardViewModel = function(id) {
      var self = this
      self.id = id
      self.selected = ko.observable(false)
    }

    var CardViewModel = function(id) {
      var self = this
      self.id = id
      self.selected = ko.observable(false)
    }

    var BuilderViewModel = function() {
      var self = this

      self.title = "Army of Cards"
      self.ready = ko.observable(true)

      self.armies = ko.observableArray([])

      self.addArmy = function() {
        self.armies.push(new ArmyViewModel())
      }

      self.removeArmy = function(army) {
        var i = self.armies.indexOf(army)
        if (i >= 0) {
          self.armies.splice(i, 1)
        }
        if (army.selected()) {
          self.selectArmy(self.armies()[0])
        }
      }

      self.currentArmy = ko.observable()

      self.currentArmy.subscribe(function(army) {
        self.armies().forEach(function(it) {
          it.selected(army === it)
        })
        self.selectStartCard(army.startCard())
        self.cards().forEach(function(card) {
          card.selected(army.cards.indexOf(card.id) >= 0)
        })
      })

      self.selectArmy = function(it) {
        self.currentArmy(it)
      }

      self.startCards = ko.observableArray(deck.startCards.map(function(id) {
        return new StartCardViewModel(id)
      }))

      self.selectStartCard = function(id) {
        self.startCards().forEach(function(card) {
          card.selected(card.id === id)
        })
        self.currentArmy().startCard(id)
      }

      self.cards = ko.observableArray(deck.cards.map(function(id) {
        return new CardViewModel(id)
      }))

      self.selectCard = function(it) {
        it.selected(!it.selected())
        if (it.selected()) {
          self.currentArmy().addCard(it.id)
        } else {
          self.currentArmy().removeCard(it.id)
        }
      }

      self.createArmies = function() {
        var def = model.armies().map(function(army) {
          return {
            name: army.name(),
            tag: army.tag(),
            start_card: army.startCard(),
            cards: [army.startCard()].concat(army.cards())
          }
        })
        self.ready(false)
        aoc.write(def).always(function() {self.ready(true)})
      }

      self.loadConfig = function(factions) {
        self.armies(factions.map(function(conf) {
          var army = new ArmyViewModel(conf.name)
          army.startCard(conf.start_card)
          army.cards(conf.cards)
          army.removeCard(conf.start_card)
          return army
        }))
        self.selectArmy(self.armies()[0])
      }

      self.back = function() {
        window.location.href = 'coui://ui/main/game/start/start.html';
      };

      aoc.readConfig().then(function(config) {
        if (config) {
          self.loadConfig(config)
        } else {
          self.loadConfig(empty)
        }
      }, function(config) {
        self.loadConfig(empty)
      })
    }

    model = new BuilderViewModel();

    handlers = {};

    // inject per scene mods
    if (scene_mod_list['army_of_cards_builder'])
      loadMods(scene_mod_list['army_of_cards_builder']);

    // setup send/recv messages and signals
    app.registerWithCoherent(model, handlers);

    // Activates knockout.js
    ko.applyBindings(model);
  })
})
