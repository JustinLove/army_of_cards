define(['shared/gw_specs'], function(loader) {
  "use strict";

  var titans = api.content.usingTitans();

  var aiMapLoad = $.get('spec://pa/ai/unit_maps/ai_unit_map.json');
  var aiX1MapLoad = titans ? $.get('spec://pa/ai/unit_maps/ai_unit_map_x1.json') : {};

  var loadOrderedUnitList = function loadOrderedUnitList() {
    return $.getJSON("coui://pa/units/unit_list.json").then(function(list) {
      return _.uniq(list.units)
    })
  }

  var loadUnitSpecs = function loadUnitSpecs(specIds, tag) {
    var def = $.Deferred()
    // [] is truthy but concatiates to strings as ''
    var tag = tag || []
    $.when(
      loader.genUnitSpecs(specIds, tag),
      aiMapLoad,
      aiX1MapLoad
    ).then(function(specs, aiMapGet, aiX1MapGet) {
        Object.keys(specs).forEach(function(id) {
          specs[id] = flattenBaseSpecs(specs[id], specs, '')
        })
        var tagAIUnitMap = loader.genAIUnitMap(aiMapGet[0], tag);
        var tagX1AIUnitMap = loader.genAIUnitMap(aiX1MapGet[0], tag);
        specs['/pa/ai/unit_maps/ai_unit_map.json'+tag] = tagAIUnitMap
        if (titans) {
          specs['/pa/ai/unit_maps/ai_unit_map_x1.json'+tag] = tagX1AIUnitMap
        }
        //loader.modSpecs(playerFiles, inventory.mods(), '.player');
        //console.log('specs', specs)
        def.resolve(specs)
      })

    return def.promise()
  }

  var cookFiles = function cookFiles(factions) {
    var factions = [{}].concat(factions)
    var allFiles = _.assign.apply(_, factions)
    // The player unit list needs to be the superset of units for proper UI behavior
    var allUnits = []
    _.each(allFiles, function(spec, id) {
      if (id.match('/pa/units/unit_list.json')) {
        allUnits = allUnits.concat(spec.units)
      }
    })
    allFiles['/pa/units/unit_list.json'] = {units: _.uniq(allUnits)}

    var cookedFiles = _.mapValues(allFiles, function(value) {
      if (typeof value !== 'string')
        return JSON.stringify(value);
      else
        return value;
    });
    return cookedFiles
  }

  function flattenBaseSpecs(spec, specs, tag) {
    if (!spec.hasOwnProperty('base_spec'))
      return spec;

    var base = specs[spec.base_spec];
    if (!base) {
      base = specs[spec.base_spec + tag];
      if (!base)
        return spec;
    }

    spec = _.cloneDeep(spec);
    delete spec.base_spec;

    base = flattenBaseSpecs(base, specs, tag);

    return _.merge({}, base, spec, customMerge);
  }

  var customMerge = function customMerge(objectValue, sourceValue, key, object, source) {
    if (Array.isArray(sourceValue)) {
      return sourceValue
    } else {
      return undefined // default
    }
  }

  return {
    loadOrderedUnitList: loadOrderedUnitList,
    loadUnitSpecs: loadUnitSpecs,
    modSpecs: loader.modSpecs,
    flattenBaseSpecs: flattenBaseSpecs,
    cookFiles: cookFiles,
  }
})
