const compile=(input, helpers)=>{

        const actors_on_overlay = helpers._declareLocal("actors_on_overlay", 1, true)
        const isColor = helpers.options.settings.colorMode !== "mono";
        if (isColor) {
            helpers._setMemUInt8("overlay_priority", actors_on_overlay);
        } else {
            helpers._setMemUInt8("show_actors_on_overlay", actors_on_overlay);
        }


}