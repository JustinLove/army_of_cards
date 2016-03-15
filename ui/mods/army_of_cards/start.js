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
  'aoc/army_of_cards'
], function psuedomod_start(aoc) {
  "use strict";

  window.army_of_cards = aoc

  //aoc.test()
})

