
function validation() {
    var Ghee = document.getElementById("stockGhee").value;
    var Butter = document.getElementById("stockButter").value;

    if (Ghee == "" || Butter =="") {
      alert("Enter valid Amount !");
      return false;
    }
  }
  