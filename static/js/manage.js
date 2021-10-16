

{/* <tr>
  <td>4</td>
  <td>username</td>
  <td>06/09/2016</td>
  <td>Reviewer</td>
  <td><span class="status text-success">&bull;</span> Active</td>
  <td>
    <a href="#" class="settings" title="Settings" data-toggle="tooltip"><i
        class="material-icons">&#xe86c;</i></a>
    <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
        class="material-icons">&#xE5C9;</i></a>
  </td>
</tr> */}


class SmartContractDisplay {
  constructor(numb, identifier, username, date, amount, role, status, relative_order_type) {
    this.numb = numb;
    this.identifier = identifier;
    this.username = username;
    this.date = date;
    this.amount = amount;
    this.role = role;
    this.status = status;

    this.build("smartcontract_append");
    this.build(relative_order_type)
    // switch(relative_order_type){
    //   case "incoming":
    //     this.build("incoming");
    //     break;
    //   case "outgoing":
    //     this.build("outgoing");
    //     break;
    // }
  }

  build(relative_order_type){
    // creation
    const tr = document.createElement("tr");
    const number = document.createElement("td");
    const uname = document.createElement("td");
    const date = document.createElement("td");
    const amount = document.createElement("td")
    const role = document.createElement("td");
    const activity = document.createElement("td");
      const activity_span = document.createElement("span");
    const identifier = document.createElement("p");

    // Buttons to manage contract
    const td = document.createElement("td");
      const a0 = document.createElement("a");
        const i0 = document.createElement("i");
      const a1 = document.createElement("a");
        const i1 = document.createElement("i");
 

    // should change dependant on status of contract
    // text-danger: red, text-warning:yellow, text-success:green
    number.innerHTML = this.numb;
    identifier.innerHTML = this.identifier;
    identifier.style = "display:none;"
    identifier.class = "identifier";
    uname.innerHTML = this.username;
    date.innerHTML = this.date;
    role.innerHTML = this.role;
    amount.innerHTML = this.amount;
    activity_span.style = "padding:0 0 10px 10px;"

    switch(this.status) {
      case "cancelled":
        activity_span.className = "status text-danger";
        activity_span.innerHTML = "&bull;";
        activity.innerHTML = "Inactive";
        break;
      case "pending":
        activity_span.className = "status text-warning";
        activity_span.innerHTML = "&bull;";
        activity.innerHTML = "Pending";
        if (relative_order_type == "incoming"){
          a0.className = "settings";
          // a0.data-toggle = "tooltip";
          i0.className = "material-icons choice";
          i0.innerHTML = "&#xe86c;";
          i0.title = "Accept";
          a1.className = "delete";
          // a1.data-toggle = "tooltip";
          i1.className = "material-icons choice";
          i1.innerHTML = "&#xE5C9;";
          i1.title = "Delete";
      
          // DOM Distribution
          a1.appendChild(i1);
          a0.appendChild(i0);
          td.appendChild(a1);
          td.appendChild(a0);
        }

        break;
      case "confirmed":
        activity_span.className = "status text-success";
        activity_span.innerHTML = "&bull;";
        activity.innerHTML = "Fulfilled";
        break;

    }

    activity.appendChild(activity_span);

    [number,uname,date,amount,role,activity,td,identifier].forEach(x => {
      tr.appendChild(x);
    });
    if (relative_order_type == "incoming" && this.status == "confirmed"){
      var rooter = document.getElementById("product");
    }
    else{
      var rooter = document.getElementById(relative_order_type);
    }
    rooter.appendChild(tr);
  }

}

console.log(loaded_contracts);


var contractDisplays = [];
var i = 0;
loaded_contracts.forEach( x => {
  contractDisplays[i] = new SmartContractDisplay(
    i,
    x[1]["escrow"]["hash"],
    x[1]["username"],
    x[1]["time"],
    x[1]["escrow"]["amount"],
    x[1]["node_type"],
    x[1]["escrow"]["status"],
    x[0])
  i++;
});



// var xhr = new XMLHttpRequest();
// xhr.open("POST", 'http://localhost:5000/contract', true);
// xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

// xhr.onreadystatechange = function() { // Call a function when the state changes.
//   if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
//     console.log(this)
//   }
//   console.log(this)
// }
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function(){
  $(".choice").click(function(){
    var jsonobject = {"decision":$(this).attr("title"), "identifier":$(this).parent().parent().siblings("p").html()}
    $.ajax({
      type: "POST",
      url: "/manageescrow",
      contentType: "application/json",
      data: JSON.stringify(jsonobject),
      dataType: "json",
      success: function(response) {
        console.log(jsonobject)
        location.reload()
        alert(response.msg);
      },
      error: function(err) {
        console.log(err);
        alert(err.responseText);
      }
    });
    if (jsonobject["decision"] == "Accept"){
      alert("Please wait a moment while the XRP ledger processes your transaction.")

    }

  });

  $("#order_request").click( function(){
    $.ajax({
      type: "POST",
      url: "/createescrow",
      contentType: "application/json",
      data: JSON.stringify("request"),
      dataType: "json",
      success: function(response) {
        location.reload()
        alert(response.msg);
      },
      error: function(err) {
        console.log(err);
        alert(err.responseText);
      }
    });

  });

  $("#order_send").click(function(){
    $.ajax({
      type: "POST",
      url: "/createescrow",
      contentType: "application/json",
      data: JSON.stringify("send"),
      dataType: "json",
      success: function(response) {
        location.reload()
        alert(response.msg);
      },
      error: function(err) {
        console.log(err);
        alert(err.responseText);
      }
    });


  });
});



