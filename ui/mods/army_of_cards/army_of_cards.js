define([
  'aoc/spec_loader',
  'aoc/file',
  'aoc/community_mods',
  'shared/gw_inventory',
], function(spec_loader, file, communityMods, GWInventory) {
  "use strict";

  var bakeUi = true

  var testData = [
    {
      tag: '.vehicles',
      cards: [
        'gwc_start_vehicle',
        'gwc_enable_vehicles_all',
        'gwc_combat_vehicles',
      ],
    },
    {
      tag: '.bots',
      cards: [
        'gwc_start_bot',
        'gwc_enable_bots_all',
        'gwc_combat_bots',
      ]
    },
  ]

  var createFaction = function(cards, tag, commanders) {
    tag = tag || []
    var promise = $.Deferred()
    var inventory = new GWInventory()
    inventory.load({cards: cards.map(function(id) {return {id: id}})})
    inventory.applyCards(function() {
      inventory.addUnits(commanders)
      //console.log(inventory.units().length)
      //console.log(inventory.mods().length)
      spec_loader.loadUnitSpecs(inventory.units(), tag).then(function(specs) {
        spec_loader.modSpecs(specs, inventory.mods(), tag)
        //console.log(specs)
        promise.resolve(specs)
      })
    })
    return promise
  }

  var modinfo = function() {
    return {
      "author": "wondible",
      "context": "server", 
      "description": "Generated files",
      "display_name": "Army of Cards - Server",
      "identifier": "com.wondible.pa.army_of_cards.server",
      "signature": "not yet implemented",
      "version": "0.0.1",
      "scenes": {
        "new_game": [
          "coui://ui/mods/army_of_cards/new_game.css",
          "coui://ui/mods/army_of_cards/new_game.js"
        ],
        "live_game": [
          "coui://ui/mods/army_of_cards/live_game.js"
        ]
      }
    }
  }

  var uiFiles = function(factions) {
    var files = {
      '/modinfo.json': modinfo(),
      '/ui/mods/army_of_cards/factions.json': factions,
    }

    var promise
    if (bakeUi) {
      promise = $.when(_.flatten(_.values(files['/modinfo.json'].scenes)).map(function(path) {
        return $.get(path, null, null, 'text').then(function(text) {
          files[path.replace('coui:/', '')] = text
          return text
        })
      }))
    } else {
      promise = $.Deferred()
      promise.resolve()
    }

    return promise.then(function() {
      return files
    })
  }

  var writeZip = function(files) {
    //console.log(files)
    var info = JSON.parse(files['/modinfo.json'])
    info.installedPath = '/download/com.wondible.pa.army_of_cards.server.zip'
    info.mountPath = '/server_mods/com.wondible.pa.army_of_cards.server/';
    files = _.mapKeys(files, function(value, path) {
      //return 'com.wondible.pa.army_of_cards'+path
      return path.slice(1)
    })
    return file.zip.create(files, 'com.wondible.pa.army_of_cards.server.zip').then(function(status) {
      info.md5 = status.md5
      communityMods.register(info)
      return status
    })
  }

  var readConfig = function() {
    return file.zip.read('coui://download/com.wondible.pa.army_of_cards.server.zip').then(function(zip) {
      //return JSON.parse(zip.file('com.wondible.pa.army_of_cards/ui/mods/army_of_cards/factions.json').asText())
      return JSON.parse(zip.file('ui/mods/army_of_cards/factions.json').asText())
    }, function(err) {
      return null
    })
  }

  var load = function(factions) {
    console.time('load data')
    return spec_loader.loadOrderedUnitList().then(function(ids) {
      var commanders = ids.filter(function(id) {return id.match('/pa/units/commanders/')})
      var stuff = [uiFiles(factions)]
      factions.forEach(function(faction) {
        stuff.push(createFaction(faction.cards, faction.tag, commanders))
      })

      return $.when.apply($, stuff).then(function() {
        console.timeEnd('load data')
        return spec_loader.cookFiles(Array.prototype.slice.call(arguments, 0))
      })
    })
  }

  var write = function(factions) {
    return load(factions).then(writeZip)
  }

  var test = function(factions) {
    return load(factions || testData).then(function(files) {console.log(files)})
  }

  return {
    write: write,
    readConfig: readConfig,
    test: test,
  }
})
