exports.decimal_to_int = (value) => {
  var decimals = value.toString().replace(",", ".").split(".");

  if (decimals.length > 1) {
    var initial = decimals[0];
    var end = decimals[1];
    if (decimals[0].length == 1) {
      initial = "0" + decimals[0];
    }
    if (decimals[1].length == 1) {
      end = decimals[1] + "0";
    }

    return `${initial}${end}`;
  } else {
    return value;
  }
};

exports.string_to_int = (value) => {
  if (value) {
    var decimals = value.toString().replace(",", ".").split(".");

    if (decimals.length > 1) {
      var initial = decimals[0];
      var end = decimals[1];
      if (decimals[0].length == 1) {
        initial = decimals[0];
      }
      if (decimals[1].length == 1) {
        end = decimals[1] + "0";
      }

      return `${initial}${end}`;
    }
  }

  return value;
};
