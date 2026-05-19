function loginUser(){

  const email = prompt("Enter your email");

  if(email){
    alert("Verification email sent to: " + email);

    const buttons = document.querySelectorAll(".login-btn");

    buttons.forEach(btn=>{
      btn.innerHTML = "Logged In";
    });
  }
}

function submitComplaint(){

  alert("Complaint submitted successfully!");

}