(function() {
  "use strict";

  if (model.specTags) return

  //model.canChangeSettings = ko.observable(false)

  model.specTags = ko.observableArray([])
  model.getSpecTagDescription = function(name) {
    if (!name) return ''
    return name.replace('.', '')
  };
  model.thisPlayerSpecTag = ko.observable('')
  model.thisPlayerSpecTag.subscribe(function(newTag) {
    api.game.getUnitSpecTag().then(function(oldTag) {
      if (newTag != oldTag) {
        console.log('set client spec tag', newTag)
        api.game.setUnitSpecTag(newTag)
      }
    })
  })

  // override
  model.resetArmies = function () {
    if (!model.isGameCreator())
      return;

    var spec_tag = ''
    if (model.specTags().length > 0) {
      spec_tag = model.specTags()[0]
    }

    if (model.isFFAGame()) {
      model.send_message('reset_armies', [
        { slots: 1, ai: false, alliance: false, spec_tag: spec_tag },
        { slots: 1, ai: false, alliance: false, spec_tag: spec_tag }
      ]);
    }
    else {
      model.send_message('reset_armies', [
        { slots: 2, ai: false, alliance: true, spec_tag: spec_tag },
        { slots: 2, ai: false, alliance: true, spec_tag: spec_tag }
      ]);
    }

    if (model.loadedSystemIsEmpty() && !model.updateSystemInProgress()) {
      model.loadRandomSystem();
    }
  };

  var new_game_armies = handlers.armies
  handlers.armies = function(payload, force) {
    new_game_armies(payload, force)

    var changed = false
    model.armies().forEach(function(self, i) {
      if (self.specTag) {
        self.specTagLock = true
        self.specTag(payload[i].spec_tag || '')
        self.specTagLock = false
      } else {
        if (self.armyContainsThisPlayer()) {
          model.thisPlayerSpecTag(payload[i].spec_tag || '')
        }
        self.specTag = ko.observable(payload[i].spec_tag || '')
        self.specTagLock = false
        self.specTag.subscribe(function(tag) {
          if (self.armyContainsThisPlayer()) {
            model.thisPlayerSpecTag(tag || '')
          }
          if (self.specTagLock) return
          console.log('send spec tag')
          model.send_message('modify_army', {
            army_index: self.index(),
            options: { spec_tag: tag }
          });
        })
        self.specTagDescription = ko.computed(function() {
          return model.getSpecTagDescription(self.specTag())
        })

        self.asJson = function() {
          return {
            slots: _.invoke(self.slots(), 'asJson'),
            alliance : self.alliance(),
            ai: self.aiArmy(),
            economy_factor: self.econFactor,
            spec_tag: self.specTag(),
          }
        };
        changed = true
      }
    })
    if (changed) {
      var armies = model.armies()
      model.armies([])
      model.armies(armies)
    }
  }

  var new_game_players = handlers.players
  handlers.players = function(payload, force) {
    new_game_players(payload, force)

    _.forEach(payload, function (element) {
      if (element.name !== model.displayName()) return

      if (element.army_index !== -1 && model.armies().length > element.army_index) {
        model.thisPlayerSpecTag(model.armies()[element.army_index].specTag())
      }
    });
  }

  var new_game_server_mod_info_updated = handlers.server_mod_info_updated
  handlers.server_mod_info_updated = function() {
    new_game_server_mod_info_updated()

    if (model.isGameCreator()) {
      loadScript('coui://ui/mods/army_of_cards/spec_tags.js')
    }
  }

  $('.army-tools').append('<p data-bind="visible: $root.canChangeSettings()"><select data-bind="options: $root.specTags, optionsText: $root.getSpecTagDescription, selectPicker: army.specTag" data-width="106px"></p>')
  $('.army-tools').append('<p data-bind="visible: !$root.canChangeSettings(), text: army.specTagDescription" class="static-spec-tag"></p>')
})()
