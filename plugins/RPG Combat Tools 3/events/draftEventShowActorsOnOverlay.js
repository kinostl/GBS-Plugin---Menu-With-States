const compile=(input, helpers)=>{

        const actors_on_overlay = helpers._declareLocal("actors_on_overlay", 1, true)
        const isColor = helpers.options.settings.colorMode !== "mono";
        if (isColor) {
            helpers._getMemUInt8(actors_on_overlay, "overlay_priority");
            helpers._setConstMemUInt8("overlay_priority", 0);
        } else {
            helpers._getMemUInt8(actors_on_overlay, "show_actors_on_overlay");
            helpers._setConstMemUInt8("show_actors_on_overlay", 1);
        }

}