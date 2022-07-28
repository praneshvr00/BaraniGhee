function validation() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    confirmpassword = document.getElementById("confirmpassword").value;
    if (username == "" ) {
      alert("username cannot be empty !");
      return false;
    }
    if (password == "") {
      alert("password cannot be empty !");
      return false;
    }
    if(password != confirmpassword){
      alert("password is not same");
      return false;
    }

  }