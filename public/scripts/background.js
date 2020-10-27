var counter = 0;
function changeBG(){
    var imgs = [
        "url(https://www.northeastern.edu/geo/wp-content/uploads/2019/02/birds-eye-view-of-the-hkust-campus.jpg)",
        "url(https://media.licdn.com/dms/image/C4D1BAQGCcZDRzdCLdg/company-background_10000/0?e=2159024400&v=beta&t=aoDtlgO7ijj0ScGIM_fk8ftbpILloP0NfIqluoFZJEo)",
        "url(https://stealjobs.com/wp-content/uploads/2018/05/hkust.jpg)",
        "url(https://join.ust.hk/wp-content/uploads/2019/03/fees-cover04.jpg)"
      ]
    
    if(counter === imgs.length) counter = 0;
    $("body").css("background-image", imgs[counter]);

    counter++;
}
  
  setInterval(changeBG, 2000);


