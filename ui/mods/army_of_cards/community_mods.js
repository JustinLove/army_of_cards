define([], function() {
  var register = function(modinfo) {
    require(['coui://download/community-mods-manager.js'], function() {
      modinfo = CommunityModsManager.processMod(modinfo)

      modinfo.installed = Date.now();
      modinfo.enabled = true;
      modinfo.download = '';

      var m = CommunityModsManager.installedModsIndex()[modinfo.identifier]
      if (m) {
        //console.log('found', m)
        _.assign(m, modinfo)
        CommunityModsManager.installedMods.valueHasMutated()
      } else {
        //console.log('adding new')
        CommunityModsManager.installedMods.push( modinfo );
      }
      CommunityModsManager.downloadServerModZip()
    })
  }

  return {
    register: register,
  }
})
