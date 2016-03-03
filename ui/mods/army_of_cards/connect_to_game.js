(function() {
  "use strict";

  // sadly this doesn't really work; live game still has to change it

  var connect_to_game_server_state = handlers.server_state
  handlers.server_state = function(payload) {
    //console.log(payload)
    if (payload.data
     && payload.data.client
     && payload.data.client.commander
     && payload.data.client.commander.army) {
      var newTag = payload.data.client.commander.army
      api.game.getUnitSpecTag().then(function(oldTag) {
        if (newTag != oldTag) {
          console.log('set client spec tag', newTag)
          api.game.setUnitSpecTag(newTag)
          connect_to_game_server_state(payload)
        } else {
          connect_to_game_server_state(payload)
        }
      })
    } else {
      connect_to_game_server_state(payload)
    }
  }
})()
