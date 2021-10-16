## Returning status of function
'tuple'
( status, message )
# Error
If a function has had an expected error, the function should return a tuple like so.
( "ERROR", "Wallet creation failed" )
# Success
When certain functions succede, they will return a tuple like so. 
( "SUCCESS", "Wallet successfuly created" )

# time
datetime.datetime().now().strftime("%x")


## Notes for deployment
# transactions
make a sindle wallet for a node type and link all accounts under it to the one account
This also implies that when you set up ur account, you chose which node you are and it cannot be changed