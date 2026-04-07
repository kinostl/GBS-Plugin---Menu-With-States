const id = "EVENT_EXTEND_TEXT";
const groups = ["EVENT_GROUP_DIALOGUE"];
const name= "Extend Text"
const fields = [{
  label: "Lets you use the unused background and shared space in this scene to possibly triple the amount of text you can display."
}];

/**
 * 
 * @param {*} input
 * @param {import('/home/deck/.local/share/gb-studio/helpers.d.ts').Helpers} helpers 
 */
const compile = (input, helpers) => {
  helpers._setConstMemUInt8("text_extended", 1)
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: false,
};
