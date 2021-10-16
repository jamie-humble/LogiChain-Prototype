############### CREATE ESCROW ##################

contract = xrpl.models.transactions.EscrowCreate.from_dict(value_dict)
trans = xrpl.transaction.safe_sign_and_submit_transaction(contract,_wallet,client,True,True)


self.escrow["fulfillment"] = data["conditionals"]["fulfillment"]
self.escrow["condition"] = data["conditionals"]["condition"]

############### FINNISH ESCROW ##################

# we use a class to get the dictionary values required to create a XRPL wallet instance
_wallet = wallet_json_to_object(data["sender_wallet"])
official_wallet = xrpl.models.transactions.Signer.from_dict({
  "account": data["sender_wallet"]["classic_address"],
  "signing_pub_key": data["sender_wallet"]["public_key"],
  "txn_signature": data["sender_wallet"]["private_key"]
})
# create the object to finalize the XRPL escrow
finnish = xrpl.models.transactions.EscrowFinish.from_dict({
  "account": obj["escrow"]["contract"]["account"],
  "condition": obj["escrow"]["contract"]["condition"],
  "fulfillment": obj["escrow"]["fulfillment"],
  "offer_sequence": obj["escrow"]["sequence"],
  "owner": obj["escrow"]["contract"]["account"]
})

        # self.escrow["contract"] = trans_signed.to_dict()
        # self.escrow["contract_responce"] = trans_response.to_dict()
        # self.escrow["sequence"] = trans.result["tx_json"]["Sequence"]



############### SIGN OBJECT #################
sign = xrpl.transaction.safe_sign_and_autofill_transaction(contract,_wallet,client)
responce = xrpl.transaction.send_reliable_submission(sign,client)


