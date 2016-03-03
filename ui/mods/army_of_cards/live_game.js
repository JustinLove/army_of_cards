(function() {
  "use strict";

  model.thisPlayerSpecTag = ko.observable('')
  model.thisPlayerSpecTag.subscribe(function(newTag) {
    api.game.getUnitSpecTag().then(function(oldTag) {
      if (newTag != oldTag) {
        console.log('set client spec tag', newTag)
        api.game.setUnitSpecTag(newTag)
        api.game.debug.reloadScene(api.Panel.pageId); 
      }
    })
  })

  var live_game_client_state = handlers.client_state
  handlers.client_state = function(client) {
    live_game_client_state(client)

    if (client.commander && client.commander.army) {
      model.thisPlayerSpecTag(client.commander.army.spec_tag || '')
    }
  }
})()
