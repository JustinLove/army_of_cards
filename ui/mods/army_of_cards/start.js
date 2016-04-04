(function() {
  "use strict";

  var config = require.s.contexts._.config
  config.waitSeconds = 0
  config.paths.aoc = 'coui://ui/mods/army_of_cards'
  config.paths.shared = 'coui://ui/main/game/galactic_war/shared/js'
  config.paths.cards = 'coui://ui/main/game/galactic_war/cards'
  config.paths['shared/gw_common'] = 'coui://ui/mods/army_of_cards/gw_common'

  model.navToArmyOfCards = function() {
    window.location.href = 'coui://ui/mods/army_of_cards/builder/builder.html'
  }

  var html = '<div id="nav_to_army_of_cards" class="nav_item nav_item_text btn_std_ix" data-bind="click: navToArmyOfCards, click_sound: \'default\', rollover_sound: \'default\'"> <loc desc="">Army of Cards</loc></div>'

  $('#navigation_items').append(html)
})()

require([
  'aoc/army_of_cards'
], function aoc_start(aoc) {
  "use strict";

  window.army_of_cards = aoc

  //aoc.test()
})

