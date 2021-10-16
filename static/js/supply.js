
//   <div class="timeline-item mt-3 row text-center p-2">
  //   <div class="col font-weight-bold text-md-right">Man Utd</div>
  //   <div class="col-1">vs</div>
  //   <div class="col font-weight-bold text-md-left">Liverpool</div>
  //   <div class="col-12 text-xs text-muted">Football - English Premier League - 19:45 GMT</div>
//   </div>


class NodeRole {
  constructor(username, nodetype, nodename, time) {

    // will be set to Empty when rendering empty nodes
    this.username = username;
    this.nodetype = nodetype;
    this.nodename = nodename;
    this.time = time;
  }

  build(){
    
    const div0 = document.createElement("div");
    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    const div3 = document.createElement("div");
    const div4 = document.createElement("div");

    div0.className = "timeline-item mt-3 row text-center p-2";
    div1.className = "col font-weight-bold text-md-right";
    div2.className = "col-1";
    div3.className = "col font-weight-bold text-md-left";
    div4.className = "col-12 text-xs text-muted";

    div1.innerHTML = this.nodename;
    div2.innerHTML = " - ";
    div3.innerHTML = this.username;
    div4.innerHTML = this.time;

    if (this.username == "Empty"){
      const button = document.createElement("button");
      button.className = "btn btn-info fill_slot";
      button.type = "button";
      button.innerHTML = "Fill Slot";
      button.style = "margin: 0 0 10px 0;"
      div0.appendChild(button);
    }

    [div1,div2,div3,div4].forEach( x => {
      div0.appendChild(x);
    });

    var root = document.getElementById(this.nodetype);
    console.log(this.nodetype);
    root.appendChild(div0);

  }
}

// var delivery0 = new NodeRole("jamie","supplier","Slot 0","5/6/21");
// using JSON from flask to create node roles
console.log(roles.node_stat);
var node_stat = roles[0].node_stat;


var arr = [];
var i = 0;
for (const [key, value] of Object.entries(node_stat)) {
  console.log(key, value);
  // if (key == "None"){
  //   continue
  // }
  var slotno = 0;
  value.forEach( x => {
    arr[i] = new NodeRole(x,key,"slot "+slotno,"5/6/21");
    arr[i].build();
    
    slotno++;
    i++;

  });
  arr[i] = new NodeRole("Empty",key,"slot "+slotno,"5/6/21");
  arr[i].build();
  slotno++;
  i++;
  
}



class TimelineNode {
  constructor(username, nodetype, text, time) {
    this.username = username;
    this.nodetype = nodetype;
    this.text = text;
    this.time = time;
  }

  build(){
    // creation
    const div0 = document.createElement("div");
      const div1 = document.createElement("div");
        const span0 = document.createElement("span");
          const i = document.createElement("i");
      const div2 = document.createElement("div");
        const p0 = document.createElement("h1");
        const p1 = document.createElement("p");
          const span1 = document.createElement("span");
 
    // class assignment
    div0.className = "vertical-timeline-item vertical-timeline-element";
    span0.className = "vertical-timeline-element-icon bounce-in";
    // this i elements badge warning will need to change later
    div2.className = "vertical-timeline-element-content bounce-in";
    // this span is used to record time of upload
    span1.className = "vertical-timeline-element-date";
    p0.className = "h5";

    switch(this.nodetype){
      case("supplier"):
        i.className = "badge badge-dot badge-dot-xl badge-danger";
        break;
      case("manufacturer"):
        i.className = "badge badge-dot badge-dot-xl badge-primary";
        break;
      case("vendor"):        
        i.className = "badge badge-dot badge-dot-xl badge-warning";
        break;
      default:
        i.className = "badge badge-dot badge-dot-xl badge-success";
        break;
    }
    


    // value assignment
    p0.innerHTML = this.username +" - "+ this.nodetype;
    span1.innerHTML = this.time;
    // if we want time to appear at the start of p1, we will need to append the span early
    p1.innerHTML = this.text;

    // DOM Distribution
    div2.appendChild(p0);
    div2.appendChild(p1);
    div2.appendChild(span1);

    span0.appendChild(i);
    div1.appendChild(span0);
    div1.appendChild(div2);
    div0.appendChild(div1);

    var root = document.getElementById("js-append");

    root.appendChild(div0);
  }
}
// will be dependant on the node being used


// var jam = new TimelineNode("jamie","fuckeddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddr","hec did the sex","5//6");

// var entries = [jam];

var events = roles[1];
console.log(events);
var event_classes = [];

for (let i = 0; i < events.length; i++) {
  const element = events[i];
  console.log(element);

  if (element["escrow"]["bool"]){
    event_classes[i] = new TimelineNode(element["username"], element["node_type"],element["escrow"]["memo"],element["time"]);
  }
  else{
    event_classes[i] = new TimelineNode(element["username"], element["node_type"],element["memo"],element["time"]);
  }
  
}
for (let i = event_classes.length-1; i >= 0; i--) {
  event_classes[i].build();
}
$(document).ready(function(){

  $(".fill_slot").click(function(){
    var type = $(this).parent().parent().attr('id');
    // var type = this.parentNode.id;
    console.log(type);

    $.ajax({
      type: "POST",
      url: "/postnodefill",
      contentType: "application/json",
      data: JSON.stringify(type),
      dataType: "json",
      success: function(response) {
        // var post_responce = response.responseText;
        console.log(response);
        alert(response.msg);
        if (response.redirect){
          // redirect to same page/ reload
          window.location.href = response.redirect_url;
        }
      },
      error: function(err) {
        console.log(err);
        alert(err.responseText);
      }
    });


  })



});