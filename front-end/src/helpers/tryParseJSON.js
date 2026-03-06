export default function tryParseJSON(jsonString) {
  try {
    const stringifiedJson = JSON.stringify(jsonString);
    const parseResult = JSON.parse(stringifiedJson);
    if (parseResult && typeof parseResult === "object") return parseResult;
    else return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}
