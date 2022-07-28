function validation() {
  var img = document.getElementById("img").value;
  var category = document.getElementById("Category");
  var idx = category.selectedIndex;
  var categoryValue = category.options[idx].value;

  var qQuantity = document.getElementById("GQuantity");
  var idx = qQuantity.selectedIndex;
  var qQuantityValue = qQuantity.options[idx].value;

  var bQuantity = document.getElementById("BQuantity");
  var idx = bQuantity.selectedIndex;
  var bQuantityValue = bQuantity.options[idx].value;

  var amount = document.getElementById("Amount").value;

  if (img == "") {
    alert("Please Provide Image URL !");
    return false;
  }
  if (categoryValue == "none") {
    alert("Category cannot be empty !");
    return false;
  }
  if (qQuantityValue == "none" && bQuantityValue == "none") {
    alert("Quantity cannot be empty !");
    return false;
  }
  if (amount == "") {
    alert("Enter valid Amount !");
    return false;
  }
}
