# The purpose of this document is to run a flask server and interact with the webapp using the other two modules.

import flask
from flask import jsonify, request, session, redirect, url_for
import users
from supply import supply_chain, Event
import json
import os
import hashlib
from xrpl.clients import WebsocketClient
from xrpl.account import get_balance

app = flask.Flask(__name__)
app.config["DEBUG"] = False
app.config.update(
    SECRET_KEY=b'\xe8\x87\xb7\xa3\x8c\xd6;AJOEH\x90\xf2\x11\x99'
    # SECRET_KEY = os.urandom(16)
)

@app.route("/")
def index():
    return flask.render_template("index.html")


# this function handles login and register logic
@app.route('/postlogin', methods=['POST'])
def postmethod():
    data = request.get_json()
    if data["type"] == "signin":
        # find user and sign in
        with open('users.json') as a:
            json_array = json.load(a)
        for x in json_array:
            username_bool = False
            for k,v in x.items():
                if k == "username" and data["username"] == v:
                    # the username has been found
                    username_bool = True
                # This is where we hash the given password
                if k == "password" and hashlib.sha256(data["password"].encode()).hexdigest() == v and username_bool:
                    session["username"]=data["username"]
                    return {"msg":"SUCCESS: User is signed in", "redirect": True, "redirect_url":"/dashboard"}
        return "ERROR: Incorrect username or password"
    elif data["type"] == "register":
        # if username already exists, error
        try:
            with open('users.json') as a:
                json_array = json.load(a)
            for x in json_array:
                username_bool = False
                for k,v in x.items():
                    if k == "username" and data["username"] == v:
                        return "ERROR: Username already exists"
        except:
            # I would have liked to make these try catches nested, but it would not stop spitting type errors at me,
            # so this pass to a non-nested try does the trick, its just a little ugly.
            pass
        try:
            users.User(data["username"], data["password"])
            print("SUCCESS: User Successfully created")
            return "SUCCESS: User Successfully created"
        except:
            return {"msg":"ERROR: User could not be created", "redirect": False, "redirect_url":"/dashboard"}


@app.route("/dashboard")
def check():
    # this try expression is to catch whether or not a user is signed in
    try: 
        _ = session["username"]
        return flask.render_template("landing.html")
    except:
        return flask.render_template("index.html")


@app.route("/dashboard/supply")
def supply():
    with open('events.json') as a:
        json_array = json.load(a)
    supply_chain.update_node_status()
    _data = [supply_chain.__dict__, json_array]

    try: 
        # check if user is logged in
        _ = session["username"]
        return flask.render_template("supply.html", _data = _data)
    except:
        return flask.render_template("index.html")
    

@app.route("/postnodefill", methods=['POST'])
def node_filled():
    try:
        _ = session["username"]
    except: return "ERROR, user could not be found, please log back in"
    try:
        node = request.get_json()
        supply_chain.set_node_stat(session["username"],node)
        return {"msg":"SUCCESS: Node changed to "+node, "redirect": True, "redirect_url":"/dashboard/supply"}
    except:
        return "ERROR: node could not be changed"


@app.route("/dashboard/manage")
def manage():
    # try catch will pop if session[username] is undefined -- user not logged in
    try:
        _ = session["username"]
    except:
        return flask.render_template("index.html")
    # we will append the current user, so that the webapp can figure out the relative nature of the transaction
    # i.e incoming or outgoing 
    _data = []
    with open('events.json') as a:
        json_manage = json.load(a)
    for x in json_manage:
        if x["escrow"]["bool"]:
            # print("Loading contract:"+x["escrow"]["hash"]) # Makes webapp slower 
            # we are passing _data as the contracts which the user is a signer in or participates in
            if supply_chain.get_user(session["username"])["node"] == x["escrow"]["signers"]["senders"]:
                _data.append(["incoming", x])
            elif supply_chain.get_user(session["username"])["node"] == x["escrow"]["signers"]["recipients"]:
                _data.append(["outgoing", x])
    return flask.render_template("manage.html", _data = json.dumps(_data))

# either signs or cancels a contract
@app.route("/manageescrow", methods=['POST'])
def manage_escrow():
    data = request.get_json()
    print(data)
    if data["decision"] == "Accept":
        return flask.jsonify({"msg":supply_chain.sign(session["username"], data["identifier"]), "redirect": True, "redirect_url":"/dashboard/manage#"})
    elif data["decision"] == "Delete":
        return flask.jsonify({"msg":supply_chain.cancel(session["username"], data["identifier"]), "redirect": True, "redirect_url":"/dashboard/manage#"})


@app.route("/createescrow", methods=['POST'])
# this function is built to deal with 2 different requests from the webapp:
#   - it is able to build contracts to support a user RECEIVING a product order (escrow)
#   - and its able to build contracts to support a user SENDING a product order (escrow)
# this functionality allows for a user to interact with both of its adjacent nodes in 
# the supply chain, just like a real buisness!
# 
# Since a supplier is the first node in the supply chain, its "supplies" are given to it
# by an admin with the node role of None  
def create_escrow():
    data = request.get_json()
    if data == "request":
        user = session["username"]
    elif data == "send":
        # get the first user of the node type which is ahead of our user 
        try:
            user = supply_chain.get_users_by_node(
                supply_chain.next_in_supplychain(
                    supply_chain.get_user(
                        session["username"]
                    )["node"]
                )
            )[0]["username"]
        except:
            return "ERROR: receiving user could not be established, please make sure there is a user to receive escrow"
    contract = Event(user,{"bool":True, "amount":50},"escrowCreate")
    if contract.ERROR[0]:
        return contract.ERROR[1]
    return flask.jsonify({"msg":"Smart contract created!", "redirect": True, "redirect_url":"/dashboard/manage#"})
    
# gets account data of signed in user
@app.route("/dashboard/account")
def account():
    try:
        _ = session["username"]
    except:
        return flask.render_template("index.html")
    _data = supply_chain.get_user(_)
    with WebsocketClient("wss://s.altnet.rippletest.net:51233") as client:
        _data["balance"] = get_balance(_data["wallet"]["classic_address"], client)
    return flask.render_template("account.html", _data = json.dumps(_data))

@app.route("/logout", methods=['POST'])
def logout():
    session["username"] = None
    print("Logout")
    return  flask.jsonify({"msg":"You have been logged out, come back soon!", "redirect": True, "redirect_url":"/"})

port = int(os.environ.get("PORT", 5000))

app.run(host="0.0.0.0", port=port)